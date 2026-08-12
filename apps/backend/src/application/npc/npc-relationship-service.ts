import { randomUUID } from 'node:crypto';
import type {
  CitizenNpcRelationshipRecord,
  CitizenNpcRelationshipRepository,
  NpcRecord,
  NpcRepository,
} from '../../domain/ports/repositories.js';
import {
  getNpcTaskBinding,
  getNpcTemplate,
  resolveNpcInteractionOutcome,
  type NpcTaskBinding,
} from '../../slice/npc-relationship-constants.js';
import { getNpcSocialProfile } from '../../slice/npc-social-profiles.js';
import { getNpcTaskConsequence } from '../../slice/npc-relationship-consequences-constants.js';
import { buildNpcConsequencePresentation } from './npc-consequence-presentation.js';
import type { KnownRelationshipSnapshot } from './npc-relationship-query.js';
import type { DrizzleNpcPortraitAssignmentRepository } from '../../infrastructure/db/repositories/npc-portrait-assignment-repository.js';

export interface NpcPresentationDto {
  npcId: string;
  displayName: string;
  category: string;
  narrativeRole: string;
  isKnown: boolean;
  isFirstMeeting: boolean;
  recognitionLine?: string;
  toneLine?: string;
  memoryLine?: string;
  consequenceLine?: string;
  lastOutcomeSummary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  interactionCount?: number;
}

export interface KnownNpcSummaryDto {
  npcId: string;
  templateId: string | null;
  displayName: string;
  category: string;
  narrativeRole: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relationshipLevel: number;
  interactionCount: number;
  lastOutcomeSummary: string | null;
  lastInteractionAt: string | null;
  portraitId: string | null;
}

function clampRelationshipLevel(level: number): number {
  return Math.max(-5, Math.min(5, level));
}

function buildRecognitionLine(
  npc: NpcRecord,
  relationship: CitizenNpcRelationshipRecord | null,
): string | undefined {
  const name = npc.displayName ?? 'Qualcuno';
  if (!relationship || relationship.interactionCount === 0) {
    return undefined;
  }

  const role = npc.narrativeRole ?? 'persona che conosci';

  if (relationship.sentiment === 'positive') {
    return `È ${name}, ${role === 'vicino di casa' ? 'il vicino' : role} che avevi aiutato in passato.`;
  }
  if (relationship.sentiment === 'negative') {
    return `È ${name}. Vi siete già incontrati. Diciamo che la prima impressione non era stata memorabile.`;
  }
  return `È ${name}, ${role}. Vi conoscete abbastanza da salutarvi, non abbastanza da sapere perché.`;
}

function buildToneLine(sentiment: 'positive' | 'negative' | 'neutral', displayName: string): string {
  if (sentiment === 'positive') {
    return `${displayName} sembra fidarsi di te. Una scelta coraggiosa da parte sua.`;
  }
  if (sentiment === 'negative') {
    return `${displayName} ti ha riconosciuto. Non sembra entusiasta. Il passato, a quanto pare, ha una memoria migliore della tua.`;
  }
  return `${displayName}. Vi conoscete abbastanza da salutarvi, non abbastanza da sapere perché.`;
}

export class NpcRelationshipService {
  constructor(
    private readonly npcs: NpcRepository,
    private readonly relationships: CitizenNpcRelationshipRepository,
    private readonly npcPortraitAssignments?: DrizzleNpcPortraitAssignmentRepository,
  ) {}

  async materializePersistentNpc(input: {
    definitionId: string;
    taskInstanceId: string;
    citizenId: string;
    binding: NpcTaskBinding;
  }): Promise<{ npc: NpcRecord; presentation: NpcPresentationDto }> {
    const template = getNpcTemplate(input.binding.templateId);
    if (!template) {
      throw new Error(`Unknown NPC template: ${input.binding.templateId}`);
    }

    const known = await this.relationships.findKnownByTemplate(
      input.citizenId,
      input.binding.templateId,
    );

    let npc: NpcRecord;
    let relationship = known;
    let isFirstMeeting = false;

    if (known?.npc) {
      npc = known.npc;
    } else {
      const socialProfile = getNpcSocialProfile(template.templateId);
      npc = await this.npcs.create({
        npcId: randomUUID(),
        displayName: template.displayName,
        ageCategory: template.ageCategory,
        zoneId: template.zoneId,
        npcTemplateId: template.templateId,
        category: template.category,
        narrativeRole: template.narrativeRole,
        occupation: template.occupation,
        isActive: true,
        metadata: {
          seededFromTaskInstanceId: input.taskInstanceId,
          ...(socialProfile
            ? {
                character: socialProfile.character,
                linguisticStyle: socialProfile.linguisticStyle,
                interests: socialProfile.interests,
                situation: socialProfile.situation,
              }
            : {}),
        },
      });
      isFirstMeeting = true;
      relationship = null;
    }

    const presentation = this.buildPresentation(
      npc,
      relationship,
      isFirstMeeting,
      input.definitionId,
      known ? toRelationshipSnapshot(known) : null,
    );
    return { npc, presentation };
  }

  buildPresentation(
    npc: NpcRecord,
    relationship: (CitizenNpcRelationshipRecord & { npc?: NpcRecord }) | null,
    isFirstMeeting: boolean,
    definitionId?: string,
    relationshipSnapshot?: KnownRelationshipSnapshot | null,
  ): NpcPresentationDto {
    const displayName = npc.displayName ?? 'Qualcuno';
    const isKnown = !isFirstMeeting && (relationship?.interactionCount ?? 0) > 0;
    const sentiment = relationship?.sentiment ?? 'neutral';
    const consequence = definitionId ? getNpcTaskConsequence(definitionId) : null;
    const snapshot =
      relationshipSnapshot ??
      (relationship && npc.npcTemplateId
        ? {
            templateId: npc.npcTemplateId,
            npcId: npc.npcId,
            category: npc.category ?? 'unknown',
            sentiment,
            relationshipLevel: relationship.relationshipLevel,
            interactionCount: relationship.interactionCount,
            lastOutcomeSummary: relationship.lastOutcomeSummary,
            appliedConsequenceKeys: readAppliedConsequenceKeys(relationship.metadata),
          }
        : null);
    const consequencePresentation = buildNpcConsequencePresentation({
      npc,
      relationship: snapshot,
      consequenceType: consequence?.consequenceType,
    });

    return {
      npcId: npc.npcId,
      displayName,
      category: npc.category ?? 'unknown',
      narrativeRole: npc.narrativeRole ?? 'persona',
      isKnown,
      isFirstMeeting: !isKnown,
      recognitionLine: isKnown
        ? buildRecognitionLine(npc, relationship)
        : getNpcTemplate(npc.npcTemplateId ?? '')?.introductionLine,
      toneLine: isKnown ? buildToneLine(sentiment, displayName) : undefined,
      memoryLine: isKnown ? consequencePresentation.memoryLine : undefined,
      consequenceLine: isKnown ? consequencePresentation.consequenceLine : undefined,
      lastOutcomeSummary: relationship?.lastOutcomeSummary ?? undefined,
      sentiment: isKnown ? sentiment : undefined,
      interactionCount: relationship?.interactionCount ?? 0,
    };
  }

  async recordTaskInteraction(input: {
    citizenId: string;
    npcId: string;
    taskInstanceId: string;
    definitionId: string;
    optionId: string;
    occurredAt: Date;
  }): Promise<CitizenNpcRelationshipRecord> {
    const binding = getNpcTaskBinding(input.definitionId);
    if (!binding) {
      throw new Error(`No NPC binding for task ${input.definitionId}`);
    }

    const outcome = resolveNpcInteractionOutcome(binding, input.optionId);
    const existing = await this.relationships.findByCitizenAndNpc(input.citizenId, input.npcId);
    const nextLevel = clampRelationshipLevel(
      (existing?.relationshipLevel ?? 0) + outcome.relationshipDelta,
    );
    const nextCount = (existing?.interactionCount ?? 0) + 1;

    await this.relationships.recordInteraction({
      interactionId: randomUUID(),
      citizenId: input.citizenId,
      npcId: input.npcId,
      taskInstanceId: input.taskInstanceId,
      definitionId: input.definitionId,
      optionId: input.optionId,
      outcomeKey: outcome.outcomeKey,
      outcomeSummary: outcome.outcomeSummary,
      occurredAt: input.occurredAt,
    });

    return this.relationships.upsertRelationship({
      citizenId: input.citizenId,
      npcId: input.npcId,
      relationshipLevel: nextLevel,
      interactionCount: nextCount,
      lastInteractionAt: input.occurredAt,
      lastOutcomeKey: outcome.outcomeKey,
      lastOutcomeSummary: outcome.outcomeSummary,
      sentiment: outcome.sentiment,
      firstMetAt: existing?.firstMetAt,
    });
  }

  async getKnownNpcs(citizenId: string): Promise<KnownNpcSummaryDto[]> {
    const known = await this.relationships.findKnownByCitizen(citizenId);
    const assignmentRows = this.npcPortraitAssignments
      ? await this.npcPortraitAssignments.listAll()
      : [];
    const assignments = new Map(assignmentRows.map((row) => [row.templateId, row.portraitId]));

    return known.map((entry) => {
      const templateId = entry.npc.npcTemplateId ?? null;
      return {
        npcId: entry.npcId,
        templateId,
        displayName: entry.npc.displayName ?? 'Sconosciuto',
        category: entry.npc.category ?? 'unknown',
        narrativeRole: entry.npc.narrativeRole ?? 'persona',
        sentiment: entry.sentiment,
        relationshipLevel: entry.relationshipLevel,
        interactionCount: entry.interactionCount,
        lastOutcomeSummary: entry.lastOutcomeSummary,
        lastInteractionAt: entry.lastInteractionAt?.toISOString() ?? null,
        portraitId: templateId ? assignments.get(templateId) ?? null : null,
      };
    });
  }

  hasBinding(definitionId: string): boolean {
    return getNpcTaskBinding(definitionId) !== null;
  }

  async recordConsequenceApplied(input: {
    citizenId: string;
    npcId: string;
    consequenceKey: string;
  }): Promise<void> {
    const existing = await this.relationships.findByCitizenAndNpc(input.citizenId, input.npcId);
    if (!existing) return;

    const applied = readAppliedConsequenceKeys(existing.metadata);
    if (applied.has(input.consequenceKey)) return;

    applied.add(input.consequenceKey);
    await this.relationships.upsertRelationship({
      citizenId: input.citizenId,
      npcId: input.npcId,
      relationshipLevel: existing.relationshipLevel,
      interactionCount: existing.interactionCount,
      lastInteractionAt: existing.lastInteractionAt ?? new Date(),
      lastOutcomeKey: existing.lastOutcomeKey ?? 'consequence_applied',
      lastOutcomeSummary: existing.lastOutcomeSummary ?? 'Conseguenza registrata',
      sentiment: existing.sentiment,
      firstMetAt: existing.firstMetAt,
      metadata: {
        ...existing.metadata,
        appliedConsequenceKeys: [...applied],
      },
    });
  }
}

function readAppliedConsequenceKeys(metadata: Record<string, unknown>): Set<string> {
  const raw = metadata.appliedConsequenceKeys;
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.filter((entry): entry is string => typeof entry === 'string'));
}

function toRelationshipSnapshot(
  relationship: CitizenNpcRelationshipRecord & { npc?: NpcRecord },
): KnownRelationshipSnapshot {
  return {
    templateId: relationship.npc?.npcTemplateId ?? 'unknown',
    npcId: relationship.npcId,
    category: relationship.npc?.category ?? 'unknown',
    sentiment: relationship.sentiment,
    relationshipLevel: relationship.relationshipLevel,
    interactionCount: relationship.interactionCount,
    lastOutcomeSummary: relationship.lastOutcomeSummary,
    appliedConsequenceKeys: readAppliedConsequenceKeys(relationship.metadata),
  };
}
