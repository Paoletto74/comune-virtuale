import { randomUUID } from 'node:crypto';
import type { CitizenNpcRelationshipRepository, CitizenRepository, NpcRepository } from '../../domain/ports/repositories.js';
import type { DrizzleNpcPortraitAssignmentRepository } from '../../infrastructure/db/repositories/npc-portrait-assignment-repository.js';
import { DrizzleSocialGameplayRepository } from '../../infrastructure/db/repositories/social-gameplay-repository.js';
import { CareerProgressionService } from '../citizen/career-progression-service.js';
import { CitizenProgressionService } from '../citizen/citizen-progression-service.js';
import { getNpcTemplate, NPC_TEMPLATES } from '../../slice/npc-relationship-constants.js';
import { resolveNpcPortraitImagePath } from '../../slice/npc-profile-portraits.js';
import { RELATIONSHIP_STATE_LABELS, type RelationshipStateLabel } from '../../slice/relationship-state-resolver.js';
import {
  isNpcAvailableNow,
  type ChatScenarioDefinition,
} from '../../slice/social-chat-scenarios.js';
import {
  defaultChatScenarioProvider,
  type ChatScenarioProvider,
} from './chat-scenario-provider.js';
import {
  defaultSocialBrainService,
  type SocialBrainService,
} from './social-brain-service.js';
import type { SocialBrainMemory } from './social-brain-types.js';
import { SOCIAL_BRAIN_FREE_SCENARIO_ID } from './social-brain-types.js';
import { mergeAttributeMaps } from '../../slice/attribute-gameplay-constants.js';
import { mergeGroupTaskEffects, type GroupTaskEffect } from '../../slice/group-relationship-constants.js';
import { getNpcSocialProfile } from '../../slice/npc-social-profiles.js';
import {
  computeRelationshipScore,
  resolveRelationshipState,
} from '../../slice/relationship-state-resolver.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';

export interface RelazioniPersonDto {
  npcId: string;
  templateId: string | null;
  displayName: string;
  narrativeRole: string;
  occupation: string | null;
  relationshipState: string;
  relationshipStateLabel: string;
  contactUnlocked: boolean;
  chatEnabled: boolean;
  trust: number;
  affection: number;
  conflict: number;
  familiarity: number;
  portraitId: string | null;
  portraitImagePath: string | null;
  portraitStatus: 'present' | 'missing' | 'error';
  availableActions: string[];
}

export interface RelazioniGroupDto {
  groupId: string;
  name: string;
  description: string;
  groupType: string;
  memberCount: number;
  relationshipState: string;
  relationshipStateLabel: string;
  contactUnlocked: boolean;
}

export interface NpcProfileDto extends RelazioniPersonDto {
  character: string | null;
  linguisticStyle: string | null;
  interests: string[];
  situation: string | null;
  interactionCount: number;
  lastOutcomeSummary: string | null;
}

export interface ChatStateDto {
  threadId: string;
  scenarioId: string;
  status: string;
  messages: Array<{ speaker: string; body: string; recordedAt: string }>;
  options: Array<{ optionId: string; label: string }>;
  ended: boolean;
  endReason?: string;
  /** Free-text Social Brain mode — player types messages instead of picking options. */
  freeTextEnabled?: boolean;
  lastEvaluation?: {
    intent: string;
    tone: string;
    confidence: number;
  };
}

const CHAT_ACTIONS = [
  'chiacchiera',
  'chiedi_aiuto',
  'chiedi_informazioni',
  'fai_domanda',
  'dai_consiglio',
  'fai_complimento',
  'contatta',
] as const;

export class SocialGameplayService {
  constructor(
    private readonly relationships: CitizenNpcRelationshipRepository,
    private readonly npcs: NpcRepository,
    private readonly social: DrizzleSocialGameplayRepository,
    private readonly citizens: CitizenRepository,
    private readonly portraitAssignments?: DrizzleNpcPortraitAssignmentRepository,
    private readonly careerProgression?: CareerProgressionService,
    private readonly progression?: CitizenProgressionService,
    private readonly chatScenarios: ChatScenarioProvider = defaultChatScenarioProvider,
    private readonly socialBrain: SocialBrainService = defaultSocialBrainService,
  ) {}

  async getRelazioniOverview(citizenId: string): Promise<{
    people: RelazioniPersonDto[];
    groups: RelazioniGroupDto[];
    spontaneousInbox: Array<{ inboxId: string; npcId: string; title: string; preview: string; scenarioId: string }>;
  }> {
    const known = await this.relationships.findKnownByCitizen(citizenId);
    const assignments = this.portraitAssignments
      ? new Map((await this.portraitAssignments.listAll()).map((r) => [r.templateId, r.portraitId]))
      : new Map<string, string>();

    const people: RelazioniPersonDto[] = known.map((entry) => {
      const templateId = entry.npc.npcTemplateId ?? null;
      const template = templateId ? getNpcTemplate(templateId) : null;
      const portraitId = templateId ? assignments.get(templateId) ?? null : null;
      const portrait = this.resolvePortrait(templateId, portraitId);
      const stateLabel = RELATIONSHIP_STATE_LABELS[entry.relationshipState as RelationshipStateLabel] ?? entry.relationshipState;

      return {
        npcId: entry.npcId,
        templateId,
        displayName: entry.npc.displayName ?? template?.displayName ?? 'Sconosciuto',
        narrativeRole: entry.npc.narrativeRole ?? template?.narrativeRole ?? 'persona',
        occupation: entry.npc.occupation ?? template?.occupation ?? null,
        relationshipState: entry.relationshipState,
        relationshipStateLabel: stateLabel,
        contactUnlocked: entry.contactUnlocked,
        chatEnabled: entry.chatEnabled,
        trust: entry.trust,
        affection: entry.affection,
        conflict: entry.conflict,
        familiarity: entry.familiarity,
        portraitId,
        portraitImagePath: portrait.imagePath,
        portraitStatus: portrait.status,
        availableActions: this.resolveAvailableActions(entry),
      };
    });

    const allGroups = await this.social.listGroups();
    const citizenGroups = await this.social.listGroupRelationships(citizenId);
    const groupMap = new Map(citizenGroups.map((g) => [g.groupId, g]));

    const groups: RelazioniGroupDto[] = allGroups.map((group) => {
      const rel = groupMap.get(group.groupId);
      const state = rel?.relationshipState ?? 'conoscenza';
      return {
        groupId: group.groupId,
        name: group.name,
        description: group.description,
        groupType: group.groupType,
        memberCount: group.memberNpcTemplateIds.length,
        relationshipState: state,
        relationshipStateLabel: RELATIONSHIP_STATE_LABELS[state as RelationshipStateLabel] ?? state,
        contactUnlocked: rel?.contactUnlocked ?? false,
      };
    });

    const spontaneousInbox = (await this.social.listPendingSpontaneous(citizenId)).map((item) => ({
      inboxId: item.inboxId,
      npcId: item.npcId,
      title: item.title,
      preview: item.preview,
      scenarioId: item.scenarioId,
    }));

    return { people, groups, spontaneousInbox };
  }

  async getNpcProfile(citizenId: string, npcId: string): Promise<NpcProfileDto> {
    const known = await this.relationships.findKnownByCitizen(citizenId);
    const entry = known.find((k) => k.npcId === npcId);
    if (!entry) {
      throw new AppError('NOT_FOUND', 'NPC_NOT_KNOWN', 'error.social.npc_not_known');
    }

    const templateId = entry.npc.npcTemplateId ?? null;
    const template = templateId ? getNpcTemplate(templateId) : null;
    const meta = (entry.npc.metadata ?? {}) as Record<string, unknown>;
    const assignments = this.portraitAssignments
      ? new Map((await this.portraitAssignments.listAll()).map((r) => [r.templateId, r.portraitId]))
      : new Map<string, string>();
    const portraitId = templateId ? assignments.get(templateId) ?? null : null;
    const portrait = this.resolvePortrait(templateId, portraitId);
    const stateLabel = RELATIONSHIP_STATE_LABELS[entry.relationshipState as RelationshipStateLabel] ?? entry.relationshipState;

    return {
      npcId: entry.npcId,
      templateId,
      displayName: entry.npc.displayName ?? template?.displayName ?? 'Sconosciuto',
      narrativeRole: entry.npc.narrativeRole ?? template?.narrativeRole ?? 'persona',
      occupation: entry.npc.occupation ?? template?.occupation ?? null,
      relationshipState: entry.relationshipState,
      relationshipStateLabel: stateLabel,
      contactUnlocked: entry.contactUnlocked,
      chatEnabled: entry.chatEnabled,
      trust: entry.trust,
      affection: entry.affection,
      conflict: entry.conflict,
      familiarity: entry.familiarity,
      portraitId,
      portraitImagePath: portrait.imagePath,
      portraitStatus: portrait.status,
      availableActions: this.resolveAvailableActions(entry),
      character:
        (meta.character as string) ??
        (meta.carattere as string) ??
        getNpcSocialProfile(templateId)?.character ??
        null,
      linguisticStyle:
        (meta.linguisticStyle as string) ??
        (meta.stileLinguistico as string) ??
        getNpcSocialProfile(templateId)?.linguisticStyle ??
        null,
      interests:
        Array.isArray(meta.interests) && (meta.interests as string[]).length > 0
          ? (meta.interests as string[])
          : (getNpcSocialProfile(templateId)?.interests ?? []),
      situation:
        (meta.situation as string) ?? getNpcSocialProfile(templateId)?.situation ?? null,
      interactionCount: entry.interactionCount,
      lastOutcomeSummary: entry.lastOutcomeSummary,
    };
  }

  async startChat(input: {
    citizenId: string;
    npcId: string;
    scenarioId: string;
    idempotencyKey: string;
    localHour?: number;
  }): Promise<ChatStateDto> {
    const relationship = await this.relationships.findByCitizenAndNpc(input.citizenId, input.npcId);
    if (!relationship?.chatEnabled && !relationship?.contactUnlocked) {
      throw new AppError('PERMISSION', 'CONTACT_LOCKED', 'error.social.contact_locked');
    }

    const scenario = this.chatScenarios.getChatScenario(input.scenarioId);
    if (!scenario) {
      throw new AppError('NOT_FOUND', 'CHAT_SCENARIO_NOT_FOUND', 'error.social.scenario_not_found');
    }

    this.assertScenarioEligible(scenario, relationship, input.localHour ?? new Date().getHours());

    const { thread, created } = await this.social.createThread({
      citizenId: input.citizenId,
      counterpartId: input.npcId,
      scenarioId: input.scenarioId,
      idempotencyKey: input.idempotencyKey,
      context: { currentStepId: scenario.initialStepId },
    });

    if (created) {
      const step = scenario.steps[scenario.initialStepId];
      if (step) {
        await this.social.appendMessage({
          threadId: thread.threadId,
          speaker: 'npc',
          body: step.npcMessage,
        });
        await this.social.updateThread({
          threadId: thread.threadId,
          messageCount: 1,
          context: { currentStepId: scenario.initialStepId },
        });
      }
    }

    return this.buildChatState(thread.threadId, scenario);
  }

  /** Start a free-text chat powered by the offline Social Brain. */
  async startFreeChat(input: {
    citizenId: string;
    npcId: string;
    idempotencyKey: string;
    localHour?: number;
  }): Promise<ChatStateDto> {
    const relationship = await this.relationships.findByCitizenAndNpc(input.citizenId, input.npcId);
    if (!relationship?.chatEnabled && !relationship?.contactUnlocked) {
      throw new AppError('PERMISSION', 'CONTACT_LOCKED', 'error.social.contact_locked');
    }

    const npc = await this.npcs.findById(input.npcId);
    const templateId = npc?.npcTemplateId ?? null;
    const citizen = await this.citizens.findById(input.citizenId);
    const profile = await this.getNpcProfile(input.citizenId, input.npcId);

    const { thread, created } = await this.social.createThread({
      citizenId: input.citizenId,
      counterpartId: input.npcId,
      scenarioId: SOCIAL_BRAIN_FREE_SCENARIO_ID,
      idempotencyKey: input.idempotencyKey,
      context: {
        mode: 'free',
        socialMemory: {} satisfies SocialBrainMemory,
        lastEvaluation: null,
      },
    });

    if (created) {
      const traits = this.socialBrain.resolveTraitsFromProfile({
        character: profile.character,
        linguisticStyle: profile.linguisticStyle,
      });
      const brainOut = this.socialBrain.processMessage({
        citizenMessage: '',
        citizenDisplayName: citizen?.displayName,
        npcDisplayName: profile.displayName,
        npcTemplateId: templateId,
        traits,
        relationship: {
          trust: relationship.trust,
          affection: relationship.affection,
          conflict: relationship.conflict,
          familiarity: relationship.familiarity,
          relationshipState: relationship.relationshipState,
        },
        memory: {},
        localHour: input.localHour ?? new Date().getHours(),
        isOpening: true,
      });

      await this.social.appendMessage({
        threadId: thread.threadId,
        speaker: 'npc',
        body: brainOut.response,
      });
      await this.social.updateThread({
        threadId: thread.threadId,
        messageCount: 1,
        context: {
          mode: 'free',
          socialMemory: brainOut.memoryUpdate,
          lastEvaluation: {
            intent: brainOut.evaluation.intent,
            tone: brainOut.evaluation.tone,
            confidence: brainOut.evaluation.confidence,
          },
        },
      });
    }

    return this.buildFreeChatState(thread.threadId);
  }

  /** Process a free-text player message through Social Brain; Game Engine applies effects. */
  async sendFreeMessage(input: {
    citizenId: string;
    threadId: string;
    message: string;
    idempotencyKey: string;
    localHour?: number;
  }): Promise<ChatStateDto> {
    const thread = await this.social.findThreadById(input.threadId);
    if (!thread || thread.citizenId !== input.citizenId) {
      throw new AppError('NOT_FOUND', 'CHAT_THREAD_NOT_FOUND', 'error.social.thread_not_found');
    }
    if (thread.status !== 'active') {
      throw new AppError('CONFLICT', 'CHAT_ENDED', 'error.social.chat_ended');
    }
    if (thread.scenarioId !== SOCIAL_BRAIN_FREE_SCENARIO_ID) {
      throw new AppError('VALIDATION', 'CHAT_NOT_FREE_MODE', 'error.social.not_free_chat');
    }

    const trimmed = input.message.trim();
    if (!trimmed || trimmed.length > 500) {
      throw new AppError('VALIDATION', 'CHAT_MESSAGE_INVALID', 'error.social.message_invalid');
    }

    const relationship = await this.relationships.findByCitizenAndNpc(input.citizenId, thread.counterpartId);
    if (!relationship) {
      throw new AppError('NOT_FOUND', 'NPC_NOT_KNOWN', 'error.social.npc_not_known');
    }

    const npc = await this.npcs.findById(thread.counterpartId);
    const citizen = await this.citizens.findById(input.citizenId);
    const profile = await this.getNpcProfile(input.citizenId, thread.counterpartId);
    const memory = (thread.context.socialMemory ?? {}) as SocialBrainMemory;

    await this.social.appendMessage({
      threadId: thread.threadId,
      speaker: 'citizen',
      body: trimmed,
    });

    const traits = this.socialBrain.resolveTraitsFromProfile({
      character: profile.character,
      linguisticStyle: profile.linguisticStyle,
    });

    const brainOut = this.socialBrain.processMessage({
      citizenMessage: trimmed,
      citizenDisplayName: citizen?.displayName,
      npcDisplayName: profile.displayName,
      npcTemplateId: npc?.npcTemplateId ?? null,
      traits,
      relationship: {
        trust: relationship.trust,
        affection: relationship.affection,
        conflict: relationship.conflict,
        familiarity: relationship.familiarity,
        relationshipState: relationship.relationshipState,
      },
      memory,
      localHour: input.localHour ?? new Date().getHours(),
    });

    const effects = brainOut.evaluation.relationshipEffects;
    if (Object.keys(effects).length > 0) {
      await this.applyChatEffects(input.citizenId, thread.counterpartId, effects, input.idempotencyKey);
    }

    await this.social.appendMessage({
      threadId: thread.threadId,
      speaker: 'npc',
      body: brainOut.response,
    });

    const mergedMemory: SocialBrainMemory = { ...memory, ...brainOut.memoryUpdate };
    let ended = false;
    let endReason: string | undefined;

    if (brainOut.evaluation.intent === 'FAREWELL') {
      ended = true;
      endReason = brainOut.response;
    }

    await this.social.updateThread({
      threadId: thread.threadId,
      status: ended ? 'ended' : thread.status,
      endedAt: ended ? new Date() : undefined,
      messageCount: thread.messageCount + 2,
      context: {
        ...thread.context,
        mode: 'free',
        socialMemory: mergedMemory,
        lastEvaluation: {
          intent: brainOut.evaluation.intent,
          tone: brainOut.evaluation.tone,
          confidence: brainOut.evaluation.confidence,
          possibleEvent: brainOut.evaluation.possibleEvent,
          possibleTaskTrigger: brainOut.evaluation.possibleTaskTrigger,
        },
        ended,
      },
    });

    if (ended && this.progression) {
      await this.progression.grantProgression({
        citizenId: input.citizenId,
        idempotencyKey: `progression:chat:${thread.threadId}:end`,
        points: 15,
        sourceType: 'npc_chat',
        sourceRef: thread.scenarioId,
        worldTimeMs: Date.now(),
      });
    }

    return this.buildFreeChatState(thread.threadId, ended, endReason);
  }

  async replyChat(input: {
    citizenId: string;
    threadId: string;
    optionId: string;
    idempotencyKey: string;
  }): Promise<ChatStateDto> {
    const thread = await this.social.findThreadById(input.threadId);
    if (!thread || thread.citizenId !== input.citizenId) {
      throw new AppError('NOT_FOUND', 'CHAT_THREAD_NOT_FOUND', 'error.social.thread_not_found');
    }
    if (thread.status !== 'active') {
      throw new AppError('CONFLICT', 'CHAT_ENDED', 'error.social.chat_ended');
    }

    const scenario = this.chatScenarios.getChatScenario(thread.scenarioId);
    if (!scenario) {
      throw new AppError('NOT_FOUND', 'CHAT_SCENARIO_NOT_FOUND', 'error.social.scenario_not_found');
    }

    const currentStepId = (thread.context.currentStepId as string) ?? scenario.initialStepId;
    const step = scenario.steps[currentStepId];
    if (!step) {
      throw new AppError('TECHNICAL', 'CHAT_STEP_MISSING', 'error.technical.internal');
    }

    const option = step.options.find((o) => o.optionId === input.optionId);
    if (!option) {
      throw new AppError('VALIDATION', 'CHAT_OPTION_INVALID', 'error.social.option_invalid');
    }

    await this.social.appendMessage({
      threadId: thread.threadId,
      speaker: 'citizen',
      body: option.label,
      selectedOptionId: option.optionId,
      optionSnapshot: { stepId: currentStepId },
    });

    if (option.effects) {
      await this.applyChatEffects(input.citizenId, thread.counterpartId, option.effects, input.idempotencyKey);
    }

    let endReason: string | undefined;
    if (option.endConversation) {
      endReason = option.endReason;
      if (endReason) {
        await this.social.appendMessage({
          threadId: thread.threadId,
          speaker: 'npc',
          body: endReason,
        });
      }
      await this.social.updateThread({
        threadId: thread.threadId,
        status: 'ended',
        endedAt: new Date(),
        messageCount: thread.messageCount + (endReason ? 2 : 1),
        context: { ...thread.context, ended: true },
      });

      if (this.progression) {
        await this.progression.grantProgression({
          citizenId: input.citizenId,
          idempotencyKey: `progression:chat:${thread.threadId}:end`,
          points: 15,
          sourceType: 'npc_chat',
          sourceRef: thread.scenarioId,
          worldTimeMs: Date.now(),
        });
      }

      return this.buildChatState(thread.threadId, scenario, true, endReason);
    }

    const nextStepId = option.nextStepId;
    if (!nextStepId || !scenario.steps[nextStepId]) {
      throw new AppError('TECHNICAL', 'CHAT_NEXT_STEP_MISSING', 'error.technical.internal');
    }

    const nextStep = scenario.steps[nextStepId]!;
    await this.social.appendMessage({
      threadId: thread.threadId,
      speaker: 'npc',
      body: nextStep.npcMessage,
    });

    await this.social.updateThread({
      threadId: thread.threadId,
      stepIndex: thread.stepIndex + 1,
      messageCount: thread.messageCount + 2,
      context: { ...thread.context, currentStepId: nextStepId },
    });

    return this.buildChatState(thread.threadId, scenario);
  }

  async syncSpontaneousMessages(citizenId: string, localHour: number): Promise<number> {
    const known = await this.relationships.findKnownByCitizen(citizenId);
    let created = 0;

    for (const scenario of this.chatScenarios.listSpontaneousScenarios()) {
      const entry = known.find((k) => k.npc.npcTemplateId === scenario.npcTemplateId);
      if (!entry) continue;
      if (!entry.contactUnlocked && scenario.requiresContact) continue;
      if (scenario.minAffection != null && entry.affection < scenario.minAffection) continue;
      if (!isNpcAvailableNow(scenario, localHour)) continue;

      const idempotencyKey = `spontaneous:${citizenId}:${scenario.scenarioId}:${new Date().toISOString().slice(0, 10)}`;
      const step = scenario.steps[scenario.initialStepId];
      if (!step) continue;

      const result = await this.social.createSpontaneousInbox({
        citizenId,
        npcId: entry.npcId,
        scenarioId: scenario.scenarioId,
        title: scenario.title,
        preview: step.npcMessage.slice(0, 120),
        idempotencyKey,
      });
      if (result.created) created += 1;
    }

    return created;
  }

  async openSpontaneousChat(input: {
    citizenId: string;
    inboxId: string;
    idempotencyKey: string;
    localHour?: number;
  }): Promise<ChatStateDto> {
    const inboxItems = await this.social.listPendingSpontaneous(input.citizenId);
    const item = inboxItems.find((i) => i.inboxId === input.inboxId);
    if (!item) {
      throw new AppError('NOT_FOUND', 'SPONTANEOUS_NOT_FOUND', 'error.social.spontaneous_not_found');
    }

    await this.social.markSpontaneousStatus(item.inboxId, 'opened');
    return this.startChat({
      citizenId: input.citizenId,
      npcId: item.npcId,
      scenarioId: item.scenarioId,
      idempotencyKey: input.idempotencyKey,
      localHour: input.localHour,
    });
  }

  listScenariosForNpc(npcTemplateId: string): ChatScenarioDefinition[] {
    return this.chatScenarios.listChatScenariosForNpc(npcTemplateId).filter((s) => s.actionType !== 'spontaneous');
  }

  /** Preset scenarios remain available as fallback; primary UX uses free chat. */
  listChatModesForNpc(npcTemplateId: string): Array<{ mode: 'free' | 'preset'; scenarioId: string; title: string; actionType?: string }> {
    return [
      { mode: 'free', scenarioId: SOCIAL_BRAIN_FREE_SCENARIO_ID, title: 'Chiacchiera libera' },
      ...this.listScenariosForNpc(npcTemplateId).map((s) => ({
        mode: 'preset' as const,
        scenarioId: s.scenarioId,
        title: s.title,
        actionType: s.actionType,
      })),
    ];
  }

  async applyGroupEffectsFromTask(input: {
    citizenId: string;
    npcId: string;
    explicitGroup?: GroupTaskEffect;
  }): Promise<void> {
    const npc = await this.npcs.findById(input.npcId);
    const effects = mergeGroupTaskEffects(input.explicitGroup, npc?.npcTemplateId ?? null);
    if (effects.length === 0) return;

    const existing = await this.social.listGroupRelationships(input.citizenId);
    const byGroup = new Map(existing.map((g) => [g.groupId, g]));

    for (const effect of effects) {
      const current = byGroup.get(effect.groupId);
      const familiarity = (current?.familiarity ?? 0) + (effect.familiarity ?? 0);
      const relationshipLevel = (current?.relationshipLevel ?? 0) + (effect.relationshipLevel ?? 0);
      const relationshipScore = computeRelationshipScore({
        trust: 0,
        affection: 0,
        familiarity,
        conflict: 0,
        relationshipLevel,
      });
      const relationshipState = resolveRelationshipState({
        trust: 0,
        affection: 0,
        conflict: 0,
        familiarity,
        relationshipLevel,
        contactUnlocked: current?.contactUnlocked ?? false,
      });
      await this.social.upsertGroupRelationship({
        citizenId: input.citizenId,
        groupId: effect.groupId,
        familiarity,
        relationshipLevel,
        relationshipScore,
        relationshipState,
        contactUnlocked: current?.contactUnlocked,
      });
    }
  }

  private async applyChatEffects(
    citizenId: string,
    npcId: string,
    effects: NonNullable<import('../../slice/social-chat-scenarios.js').ChatOptionEffect>,
    sourceRef: string,
  ): Promise<void> {
    if (effects.personalValues && Object.keys(effects.personalValues).length > 0) {
      await this.citizens.applyPersonalValueEffects(citizenId, {
        deltas: mergeAttributeMaps(effects.personalValues),
      });
    }

    await this.relationships.applyRelationshipMetrics({
      citizenId,
      npcId,
      trust: effects.trust,
      affection: effects.affection,
      conflict: effects.conflict,
      familiarity: effects.familiarity,
    });

    if (effects.careerAffinity && this.careerProgression) {
      await this.careerProgression.applyAffinityDeltas({
        citizenId,
        deltas: effects.careerAffinity,
        source: `chat:${sourceRef}`,
      });
    }
  }

  private assertScenarioEligible(
    scenario: ChatScenarioDefinition,
    relationship: NonNullable<Awaited<ReturnType<CitizenNpcRelationshipRepository['findByCitizenAndNpc']>>>,
    localHour: number,
  ): void {
    if (scenario.requiresContact && !relationship.contactUnlocked && !relationship.chatEnabled) {
      throw new AppError('PERMISSION', 'CONTACT_LOCKED', 'error.social.contact_locked');
    }
    if (scenario.minAffection != null && relationship.affection < scenario.minAffection) {
      throw new AppError('PERMISSION', 'RELATIONSHIP_TOO_LOW', 'error.social.relationship_too_low');
    }
    if (scenario.minFamiliarity != null && relationship.familiarity < scenario.minFamiliarity) {
      throw new AppError('PERMISSION', 'RELATIONSHIP_TOO_LOW', 'error.social.relationship_too_low');
    }
    if (scenario.minTrust != null && relationship.trust < scenario.minTrust) {
      throw new AppError('PERMISSION', 'RELATIONSHIP_TOO_LOW', 'error.social.relationship_too_low');
    }
    if (!isNpcAvailableNow(scenario, localHour)) {
      throw new AppError('PERMISSION', 'NPC_UNAVAILABLE', 'error.social.npc_unavailable');
    }
  }

  private resolveAvailableActions(
    entry: Awaited<ReturnType<CitizenNpcRelationshipRepository['findKnownByCitizen']>>[number],
  ): string[] {
    if (!entry.contactUnlocked && !entry.chatEnabled) return [];
    const actions: string[] = [];
    if (entry.chatEnabled || entry.contactUnlocked) {
      actions.push('chiacchiera', 'contatta');
    }
    if (entry.trust >= 40) actions.push('chiedi_aiuto', 'dai_consiglio');
    if (entry.affection >= 20) actions.push('fai_complimento');
    if (entry.familiarity >= 15) actions.push('chiedi_informazioni', 'fai_domanda');
    return [...new Set(actions.filter((a) => CHAT_ACTIONS.includes(a as (typeof CHAT_ACTIONS)[number])))];
  }

  private resolvePortrait(
    templateId: string | null,
    portraitId: string | null,
  ): { imagePath: string | null; status: 'present' | 'missing' | 'error' } {
    if (!templateId) return { imagePath: null, status: 'missing' };
    const path = resolveNpcPortraitImagePath(templateId, portraitId);
    if (portraitId) return { imagePath: path, status: 'present' };
    if (templateId && NPC_TEMPLATES[templateId]) {
      return { imagePath: path, status: 'missing' };
    }
    return { imagePath: null, status: 'error' };
  }

  private async buildChatState(
    threadId: string,
    scenario: ChatScenarioDefinition,
    ended = false,
    endReason?: string,
  ): Promise<ChatStateDto> {
    const thread = await this.social.findThreadById(threadId);
    if (!thread) {
      throw new AppError('NOT_FOUND', 'CHAT_THREAD_NOT_FOUND', 'error.social.thread_not_found');
    }

    const messages = (await this.social.listMessages(threadId)).map((m) => ({
      speaker: m.speaker,
      body: m.body,
      recordedAt: m.recordedAt.toISOString(),
    }));

    const isEnded = ended || thread.status !== 'active';
    let options: Array<{ optionId: string; label: string }> = [];

    if (!isEnded) {
      const currentStepId = (thread.context.currentStepId as string) ?? scenario.initialStepId;
      const step = scenario.steps[currentStepId];
      options = step?.options.map((o) => ({ optionId: o.optionId, label: o.label })) ?? [];
    }

    return {
      threadId,
      scenarioId: scenario.scenarioId,
      status: isEnded ? 'ended' : thread.status,
      messages,
      options,
      ended: isEnded,
      endReason,
    };
  }

  private async buildFreeChatState(
    threadId: string,
    ended = false,
    endReason?: string,
  ): Promise<ChatStateDto> {
    const thread = await this.social.findThreadById(threadId);
    if (!thread) {
      throw new AppError('NOT_FOUND', 'CHAT_THREAD_NOT_FOUND', 'error.social.thread_not_found');
    }

    const messages = (await this.social.listMessages(threadId)).map((m) => ({
      speaker: m.speaker,
      body: m.body,
      recordedAt: m.recordedAt.toISOString(),
    }));

    const isEnded = ended || thread.status !== 'active';
    const lastEval = thread.context.lastEvaluation as
      | { intent: string; tone: string; confidence: number }
      | null
      | undefined;

    return {
      threadId,
      scenarioId: SOCIAL_BRAIN_FREE_SCENARIO_ID,
      status: isEnded ? 'ended' : thread.status,
      messages,
      options: [],
      ended: isEnded,
      endReason,
      freeTextEnabled: !isEnded,
      ...(lastEval
        ? {
            lastEvaluation: {
              intent: lastEval.intent,
              tone: lastEval.tone,
              confidence: lastEval.confidence,
            },
          }
        : {}),
    };
  }
}
