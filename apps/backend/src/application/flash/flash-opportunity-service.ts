import { randomUUID } from 'node:crypto';
import type { CitizenProfileContext } from '../citizen/citizen-profile-service.js';
import type { CitizenProfileService } from '../citizen/citizen-profile-service.js';
import type { CitizenProgressionService } from '../citizen/citizen-progression-service.js';
import type { WorldEventService } from '../world/world-event-service.js';
import { resolveFlashTemplateWorldEventMultiplier } from '../world/world-event-effect-resolver.js';
import type { StoryThreadService } from '../story/story-thread-service.js';
import { resolveFlashTemplateStoryThreadMultiplier } from '../story/story-thread-effect-resolver.js';
import type { WorldClockService } from '../../domain/time/world-clock-service.js';
import type { EconomyService } from '../economy/economy-service.js';
import type {
  CitizenFlashSpawnStateRepository,
  CitizenRepository,
  FlashOpportunityRecord,
  FlashOpportunityRepository,
} from '../../domain/ports/repositories.js';
import {
  ANTICIPATION_LABELS,
  FLASH_OPPORTUNITY_TEMPLATES,
  type FlashOpportunityTemplate,
  getFlashOpportunityConfig,
  getFlashOpportunityTemplate,
  flashSpawnIdempotencyKey,
} from '../../slice/flash-opportunities-constants.js';
import {
  deterministicChance,
  deterministicInt,
  deterministicPick,
  deterministicUnit,
} from '../../domain/flash/deterministic-flash-random.js';
import { deterministicBranchRoll } from '../risk/deterministic-roll.js';
import {
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
  DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
} from '../../slice/risk-constants.js';
import {
  FLASH_CRIMINAL_DOOR_RISK_REF,
  FLASH_RISK_BRANCHES,
  FLASH_RISK_MESSAGE_KEYS,
  FLASH_RISKY_DEAL_RISK_REF,
} from '../../slice/flash-opportunities-constants.js';
import {
  SLICE_DEMO_HELP_CASH_TRANSACTION_CLASS,
  SLICE_DEMO_HELP_CASH_TRANSACTION_TYPE,
} from '../../slice/economy-constants.js';
import type { KnownNpcSummaryDto } from '../npc/npc-relationship-service.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';

export interface FlashOpportunityDto {
  opportunityId: string;
  type: string;
  title: string;
  body: string;
  comuneLine?: string;
  rewardPreview: string;
  decisionDurationMs: number;
  expiresAt: string;
  remainingMs: number;
  npcDisplayName?: string;
  status: string;
}

export interface FlashAnticipationDto {
  active: boolean;
  progress: number;
  label: string | null;
}

export interface FlashHomeStateDto {
  enabled: boolean;
  flashOpportunity: FlashOpportunityDto | null;
  anticipation: FlashAnticipationDto | null;
  expiredNotice: string | null;
}

export interface FlashAcceptResultDto {
  opportunityId: string;
  status: 'accepted';
  cashDeltaMinor?: string;
  sympathyDelta?: number;
  reputationDelta?: number;
  riskMessage?: string;
  comuneLine?: string;
}

export interface FlashDeclineResultDto {
  opportunityId: string;
  status: 'declined';
  sympathyDelta?: number;
  reputationDelta?: number;
}

export class FlashOpportunityService {
  constructor(
    private readonly opportunities: FlashOpportunityRepository,
    private readonly spawnState: CitizenFlashSpawnStateRepository,
    private readonly economy: EconomyService,
    private readonly citizens: CitizenRepository,
    private readonly profile?: CitizenProfileService,
    private readonly progression?: CitizenProgressionService,
    private readonly worldEvents?: WorldEventService,
    private readonly storyThreads?: StoryThreadService,
    private readonly worldClock?: WorldClockService,
  ) {}

  async evaluateForDev(input: { citizenId: string; nowMs: number }): Promise<FlashHomeStateDto> {
    const profileContext = this.profile
      ? await this.profile.getProfileContextForSelection(input.citizenId)
      : undefined;
    return this.syncForHome({
      citizenId: input.citizenId,
      nowMs: input.nowMs,
      profileContext: profileContext ?? undefined,
      knownNpcs: [],
    });
  }

  async syncForHome(input: {
    citizenId: string;
    nowMs: number;
    gameTimeMs?: number;
    profileContext?: CitizenProfileContext;
    knownNpcs?: KnownNpcSummaryDto[];
  }): Promise<FlashHomeStateDto> {
    const config = getFlashOpportunityConfig();
    if (!config.enabled) {
      return { enabled: false, flashOpportunity: null, anticipation: null, expiredNotice: null };
    }

    const now = new Date(input.nowMs);
    let state = await this.spawnState.ensureState(input.citizenId);
    let expiredNotice = state.lastExpiredNotice;

    const expired = await this.opportunities.expirePendingBefore(input.citizenId, now);
    if (expired.length > 0) {
      const template = getFlashOpportunityTemplate(expired[0]!.templateId);
      expiredNotice =
        template?.expiredNotice ??
        'Sei arrivato troppo tardi. La città è andata avanti senza aspettarti.';
      state = await this.spawnState.save({
        ...state,
        lastExpiredNotice: expiredNotice,
        updatedAt: new Date(),
      });

      const anticipation = this.buildAnticipationDto(state, input.nowMs, config.enabled);
      if (expiredNotice) {
        state = await this.spawnState.save({ ...state, lastExpiredNotice: null, updatedAt: new Date() });
      }
      return {
        enabled: true,
        flashOpportunity: null,
        anticipation,
        expiredNotice,
      };
    }

    let pending = await this.opportunities.findPendingByCitizenId(input.citizenId, now);

    const worldEventModifiers =
      this.worldEvents && input.gameTimeMs !== undefined
        ? await this.worldEvents.getCombinedModifiers(input.gameTimeMs)
        : null;
    const storyThreadModifiers =
      this.storyThreads && input.gameTimeMs !== undefined
        ? await this.storyThreads.getCombinedModifiers(input.citizenId, input.gameTimeMs)
        : null;

    if (!pending) {
      state = await this.advanceAnticipationAndMaybeSpawn({
        citizenId: input.citizenId,
        nowMs: input.nowMs,
        gameTimeMs: input.gameTimeMs,
        worldEventModifiers,
        storyThreadModifiers,
        state,
        profileContext: input.profileContext,
        knownNpcs: input.knownNpcs ?? [],
      });
      pending = await this.opportunities.findPendingByCitizenId(input.citizenId, now);
    }

    const anticipation = this.buildAnticipationDto(state, input.nowMs, config.enabled);
    const flashOpportunity = pending ? this.toDto(pending, input.nowMs) : null;

    if (expiredNotice) {
      state = await this.spawnState.save({ ...state, lastExpiredNotice: null, updatedAt: new Date() });
    }

    return {
      enabled: true,
      flashOpportunity,
      anticipation,
      expiredNotice,
    };
  }

  async accept(input: {
    citizenId: string;
    opportunityId: string;
    nowMs: number;
    correlationId?: string;
  }): Promise<FlashAcceptResultDto> {
    const record = await this.requirePendingOpportunity(input.opportunityId, input.citizenId, input.nowMs);
    const template = getFlashOpportunityTemplate(record.templateId);
    if (!template) {
      throw new AppError('TECHNICAL', 'FLASH_TEMPLATE_MISSING', 'error.flash.template_missing');
    }

    let cashDeltaMinor: bigint | undefined;
    let sympathyDelta = 0;
    let reputationDelta = 0;
    let riskMessage: string | undefined;

    if (template.acceptEffects.cashDeltaMinor && template.acceptEffects.cashDeltaMinor !== 0n) {
      await this.economy.applyCashDelta({
        citizenId: input.citizenId,
        deltaMinor: template.acceptEffects.cashDeltaMinor,
        transactionType: SLICE_DEMO_HELP_CASH_TRANSACTION_TYPE,
        transactionClass: SLICE_DEMO_HELP_CASH_TRANSACTION_CLASS,
        reasonCode: template.acceptEffects.cashReason ?? template.templateId,
        sourceActionId: `flash:${record.opportunityId}:accept`,
        idempotencyKey: `flash-cash:${record.opportunityId}:accept`,
        correlationId: input.correlationId,
      });
      cashDeltaMinor = template.acceptEffects.cashDeltaMinor;
    }

    const personalDeltas: Record<string, number> = {};
    if (template.acceptEffects.sympathy) personalDeltas.sympathy = template.acceptEffects.sympathy;
    if (template.acceptEffects.reputation) personalDeltas.reputation = template.acceptEffects.reputation;
    if (Object.keys(personalDeltas).length > 0) {
      await this.citizens.incrementPersonalValues(input.citizenId, personalDeltas);
      sympathyDelta = personalDeltas.sympathy ?? 0;
      reputationDelta = personalDeltas.reputation ?? 0;
    }

    if (record.risk) {
      riskMessage = this.evaluateStoredRisk(record, input.citizenId);
    }

    if (this.progression) {
      await this.progression.grantForFlashAccept({
        citizenId: input.citizenId,
        opportunityId: record.opportunityId,
        worldTimeMs: input.nowMs,
      });
    }

    await this.opportunities.updateStatus(record.opportunityId, 'accepted', {
      ...record.metadata,
      acceptedAtMs: input.nowMs,
      riskMessage,
    });

    if (this.storyThreads) {
      const gameTimeMs = this.worldClock
        ? Number((await this.worldClock.now()).worldTimeMs)
        : input.nowMs;
      await this.storyThreads.onFlashOutcome({
        citizenId: input.citizenId,
        templateId: record.templateId,
        outcome: 'accepted',
        opportunityId: record.opportunityId,
        worldTimeMs: gameTimeMs,
      });
    }

    return {
      opportunityId: record.opportunityId,
      status: 'accepted',
      ...(cashDeltaMinor !== undefined
        ? { cashDeltaMinor: cashDeltaMinor.toString() }
        : {}),
      ...(sympathyDelta !== 0 ? { sympathyDelta } : {}),
      ...(reputationDelta !== 0 ? { reputationDelta } : {}),
      ...(riskMessage ? { riskMessage } : {}),
      ...(template.comuneLine ? { comuneLine: template.comuneLine } : {}),
    };
  }

  async decline(input: {
    citizenId: string;
    opportunityId: string;
    nowMs: number;
  }): Promise<FlashDeclineResultDto> {
    const record = await this.requirePendingOpportunity(input.opportunityId, input.citizenId, input.nowMs);
    const template = getFlashOpportunityTemplate(record.templateId);

    const personalDeltas: Record<string, number> = {};
    if (template?.declineEffects?.sympathy) personalDeltas.sympathy = template.declineEffects.sympathy;
    if (template?.declineEffects?.reputation) {
      personalDeltas.reputation = template.declineEffects.reputation;
    }
    if (Object.keys(personalDeltas).length > 0) {
      await this.citizens.incrementPersonalValues(input.citizenId, personalDeltas);
    }

    await this.opportunities.updateStatus(record.opportunityId, 'declined', {
      ...record.metadata,
      declinedAtMs: input.nowMs,
    });

    return {
      opportunityId: record.opportunityId,
      status: 'declined',
      ...(template?.declineEffects?.sympathy ? { sympathyDelta: template.declineEffects.sympathy } : {}),
      ...(template?.declineEffects?.reputation
        ? { reputationDelta: template.declineEffects.reputation }
        : {}),
    };
  }

  private async requirePendingOpportunity(opportunityId: string, citizenId: string, nowMs: number) {
    const record = await this.opportunities.findById(opportunityId);
    if (!record || record.citizenId !== citizenId) {
      throw new AppError('NOT_FOUND', 'FLASH_NOT_FOUND', 'error.flash.not_found');
    }
    if (record.status !== 'pending') {
      throw new AppError('CONFLICT', 'FLASH_NOT_PENDING', 'error.flash.not_pending');
    }
    if (record.expiresAt.getTime() <= nowMs) {
      await this.opportunities.updateStatus(opportunityId, 'expired');
      throw new AppError('CONFLICT', 'FLASH_EXPIRED', 'error.flash.expired');
    }
    return record;
  }

  private async advanceAnticipationAndMaybeSpawn(input: {
    citizenId: string;
    nowMs: number;
    gameTimeMs?: number;
    worldEventModifiers?: Awaited<ReturnType<WorldEventService['getCombinedModifiers']>> | null;
    storyThreadModifiers?: Awaited<ReturnType<StoryThreadService['getCombinedModifiers']>> | null;
    state: Awaited<ReturnType<CitizenFlashSpawnStateRepository['ensureState']>>;
    profileContext?: CitizenProfileContext;
    knownNpcs: KnownNpcSummaryDto[];
  }) {
    const config = getFlashOpportunityConfig();
    let state = input.state;

    if (!state.anticipationStartedAt || state.anticipationDurationMs === null) {
      state = this.startAnticipationCycle(state, input.citizenId, input.nowMs);
      return this.spawnState.save(state);
    }

    const elapsed = input.nowMs - state.anticipationStartedAt.getTime();
    if (elapsed < state.anticipationDurationMs) {
      return state;
    }

    if (
      state.nextSpawnEligibleAt &&
      input.nowMs < state.nextSpawnEligibleAt.getTime()
    ) {
      state = this.startAnticipationCycle(state, input.citizenId, input.nowMs);
      return this.spawnState.save(state);
    }

    const pendingCount = await this.opportunities.countPendingByCitizenId(input.citizenId);
    if (pendingCount >= config.maxActive) {
      state = this.startAnticipationCycle(state, input.citizenId, input.nowMs);
      return this.spawnState.save(state);
    }

    const spawnSeed = `flash-spawn:${input.citizenId}:${state.spawnCycle}`;
    const shouldSpawn = deterministicChance(spawnSeed, config.opportunityChance);

    if (shouldSpawn && input.profileContext) {
      await this.createSpawnedOpportunity({
        citizenId: input.citizenId,
        nowMs: input.nowMs,
        spawnCycle: state.spawnCycle,
        profileContext: input.profileContext,
        knownNpcs: input.knownNpcs,
        worldEventModifiers: input.worldEventModifiers ?? null,
        storyThreadModifiers: input.storyThreadModifiers ?? null,
      });
      const cooldownMs = deterministicInt(
        `${spawnSeed}:cooldown`,
        config.minSpawnIntervalMs,
        config.maxSpawnIntervalMs,
      );
      state = {
        ...state,
        spawnCycle: state.spawnCycle + 1,
        lastOpportunityAt: new Date(input.nowMs),
        nextSpawnEligibleAt: new Date(input.nowMs + cooldownMs),
      };
    } else {
      state = { ...state, spawnCycle: state.spawnCycle + 1 };
    }

    state = this.startAnticipationCycle(state, input.citizenId, input.nowMs);
    return this.spawnState.save(state);
  }

  private startAnticipationCycle(
    state: Awaited<ReturnType<CitizenFlashSpawnStateRepository['ensureState']>>,
    citizenId: string,
    nowMs: number,
  ) {
    const config = getFlashOpportunityConfig();
    const durationMs = deterministicInt(
      `flash-anticipation:${citizenId}:${state.spawnCycle}`,
      config.minAnticipationDurationMs,
      config.maxAnticipationDurationMs,
    );
    const showLabel = deterministicUnit(`flash-label:${citizenId}:${state.spawnCycle}`) < 0.35;
    const label = showLabel
      ? deterministicPick(`flash-label-text:${citizenId}:${state.spawnCycle}`, ANTICIPATION_LABELS)
      : null;

    return {
      ...state,
      anticipationStartedAt: new Date(nowMs),
      anticipationDurationMs: durationMs,
      anticipationLabel: label,
      updatedAt: new Date(),
    };
  }

  private async createSpawnedOpportunity(input: {
    citizenId: string;
    nowMs: number;
    spawnCycle: number;
    profileContext: CitizenProfileContext;
    knownNpcs: KnownNpcSummaryDto[];
    worldEventModifiers: Awaited<ReturnType<WorldEventService['getCombinedModifiers']>> | null;
    storyThreadModifiers: Awaited<ReturnType<StoryThreadService['getCombinedModifiers']>> | null;
  }) {
    const config = getFlashOpportunityConfig();
    const template = this.selectTemplate(input);
    if (!template) return;

    const decisionDurationMs = deterministicInt(
      `flash-decision:${input.citizenId}:${input.spawnCycle}`,
      config.minDecisionDurationMs,
      config.maxDecisionDurationMs,
    );
    const expiresAt = new Date(input.nowMs + decisionDurationMs);
    const idempotencyKey = flashSpawnIdempotencyKey(input.citizenId, input.spawnCycle);

    const npcMeta = input.knownNpcs.find((npc) => {
      if (!template.npcTemplateId) return false;
      return resolveNpcTemplateKey(npc) === template.npcTemplateId;
    });

    const risk = template.riskSpecRef
      ? {
          riskSpecRef: template.riskSpecRef,
          exposureLevel: template.riskExposureLevel ?? 'medium',
          branches: FLASH_RISK_BRANCHES,
          resolutionSeed: `flash-risk:${input.citizenId}:${input.spawnCycle}:${template.templateId}`,
          resolutionVersion: 1,
        }
      : null;

    await this.opportunities.create({
      opportunityId: randomUUID(),
      citizenId: input.citizenId,
      type: template.type,
      templateId: template.templateId,
      title: template.title,
      body: template.body,
      sourceContext: {
        spawnCycle: input.spawnCycle,
        profileLevel: input.profileContext.level,
        occupationCode: input.profileContext.occupationCode,
      },
      reward: {
        preview: template.rewardPreview,
        acceptEffects: {
          sympathy: template.acceptEffects.sympathy ?? 0,
          reputation: template.acceptEffects.reputation ?? 0,
          cashDeltaMinor: template.acceptEffects.cashDeltaMinor?.toString() ?? '0',
        },
      },
      risk,
      expiresAt,
      idempotencyKey,
      metadata: {
        comuneLine: template.comuneLine,
        decisionDurationMs,
        npcDisplayName: npcMeta?.displayName,
        timingMode: config.timingMode,
      },
    });
  }

  private selectTemplate(input: {
    citizenId: string;
    spawnCycle: number;
    profileContext: CitizenProfileContext;
    knownNpcs: KnownNpcSummaryDto[];
    worldEventModifiers: Awaited<ReturnType<WorldEventService['getCombinedModifiers']>> | null;
    storyThreadModifiers: Awaited<ReturnType<StoryThreadService['getCombinedModifiers']>> | null;
  }): FlashOpportunityTemplate | null {
    const knownNpcTemplateIds = new Set<string>();
    const relationshipLevels = new Map<string, number>();
    for (const npc of input.knownNpcs) {
      const templateKey = resolveNpcTemplateKey(npc);
      if (templateKey) {
        knownNpcTemplateIds.add(templateKey);
        relationshipLevels.set(templateKey, npc.relationshipLevel);
      }
    }

    const scored = FLASH_OPPORTUNITY_TEMPLATES.map((template) => {
      const contextScore = template.score
        ? template.score({
            profile: input.profileContext,
            knownNpcTemplateIds,
            relationshipLevels,
          })
        : 1;
      const worldEventMultiplier =
        input.worldEventModifiers && input.worldEventModifiers.activeEventIds.length > 0
          ? resolveFlashTemplateWorldEventMultiplier(
              template.templateId,
              template.type,
              input.worldEventModifiers,
            )
          : 1;
      const storyThreadMultiplier =
        input.storyThreadModifiers && input.storyThreadModifiers.activeThreadIds.length > 0
          ? resolveFlashTemplateStoryThreadMultiplier(
              template.templateId,
              template.type,
              input.storyThreadModifiers,
            )
          : 1;
      const weight = template.baseWeight * contextScore * worldEventMultiplier * storyThreadMultiplier;
      return { template, weight: Math.max(0.05, weight) };
    }).filter((entry) => entry.weight > 0);

    if (scored.length === 0) return null;

    const total = scored.reduce((sum, entry) => sum + entry.weight, 0);
    let cursor = deterministicUnit(`flash-template:${input.citizenId}:${input.spawnCycle}`) * total;

    for (const entry of scored) {
      cursor -= entry.weight;
      if (cursor <= 0) {
        return entry.template;
      }
    }

    return scored[scored.length - 1]!.template;
  }

  private evaluateStoredRisk(record: FlashOpportunityRecord, citizenId: string): string | undefined {
    const risk = record.risk;
    if (!risk || typeof risk.resolutionSeed !== 'string' || !Array.isArray(risk.branches)) {
      return undefined;
    }

    const roll = deterministicBranchRoll(
      risk.resolutionSeed as string,
      risk.branches as Array<{ branchId: string; weight: number }>,
    );

    if (roll.branchId === DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN) {
      return undefined;
    }

    const specRef = risk.riskSpecRef as string;
    const messages = FLASH_RISK_MESSAGE_KEYS[specRef];
    const key =
      roll.branchId === DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED
        ? messages?.witnessed
        : roll.branchId === DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED
          ? messages?.identified
          : undefined;

    void citizenId;
    void FLASH_RISKY_DEAL_RISK_REF;
    void FLASH_CRIMINAL_DOOR_RISK_REF;
    return key;
  }

  private buildAnticipationDto(
    state: Awaited<ReturnType<CitizenFlashSpawnStateRepository['ensureState']>>,
    nowMs: number,
    enabled: boolean,
  ): FlashAnticipationDto | null {
    if (!enabled || !state.anticipationStartedAt || state.anticipationDurationMs === null) {
      return null;
    }

    const elapsed = Math.max(0, nowMs - state.anticipationStartedAt.getTime());
    const progress = Math.min(1, elapsed / state.anticipationDurationMs);

    return {
      active: true,
      progress,
      label: state.anticipationLabel,
    };
  }

  private toDto(record: FlashOpportunityRecord, nowMs: number): FlashOpportunityDto {
    const remainingMs = Math.max(0, record.expiresAt.getTime() - nowMs);
    const metadata = record.metadata;
    const rewardPreview =
      typeof record.reward.preview === 'string'
        ? record.reward.preview
        : typeof metadata.rewardPreview === 'string'
          ? metadata.rewardPreview
          : '+?';

    return {
      opportunityId: record.opportunityId,
      type: record.type,
      title: record.title,
      body: record.body,
      comuneLine: typeof metadata.comuneLine === 'string' ? metadata.comuneLine : undefined,
      rewardPreview,
      decisionDurationMs:
        typeof metadata.decisionDurationMs === 'number' ? metadata.decisionDurationMs : remainingMs,
      expiresAt: record.expiresAt.toISOString(),
      remainingMs,
      npcDisplayName:
        typeof metadata.npcDisplayName === 'string' ? metadata.npcDisplayName : undefined,
      status: record.status,
    };
  }
}

function resolveNpcTemplateKey(npc: KnownNpcSummaryDto): string | null {
  const name = npc.displayName.trim().toLowerCase();
  if (name === 'marco') return 'neighbor_marco';
  if (name === 'laura') return 'colleague_laura';
  if (name === 'giulia') return 'acquaintance_giulia';
  return null;
}
