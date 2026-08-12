import { describe, expect, it, vi } from 'vitest';
import { NpcRelationshipService } from './npc-relationship-service.js';
import type {
  CitizenNpcRelationshipRepository,
  NpcRecord,
  NpcRepository,
} from '../../domain/ports/repositories.js';
import { NPC_TEMPLATES } from '../../slice/npc-relationship-constants.js';
import { DEFAULT_RELATIONSHIP_METRICS } from '../../test/social-gameplay-test-helpers.js';

function createNpc(overrides: Partial<NpcRecord> = {}): NpcRecord {
  return {
    npcId: 'npc-1',
    displayName: 'Marco',
    ageCategory: 'adult',
    zoneId: 'residential',
    npcTemplateId: 'neighbor_marco',
    category: 'neighbor',
    narrativeRole: 'vicino di casa',
    occupation: null,
    isActive: true,
    metadata: {},
    createdAt: new Date(),
    ...overrides,
  };
}

describe('NpcRelationshipService', () => {
  it('creates presentation for first meeting', async () => {
    const npcs: NpcRepository = {
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue(createNpc()),
    };
    const relationships: CitizenNpcRelationshipRepository = {
      findByCitizenAndNpc: vi.fn(),
      findKnownByCitizen: vi.fn(),
      findKnownByTemplate: vi.fn().mockResolvedValue(null),
      upsertRelationship: vi.fn(),
      recordInteraction: vi.fn(),
      listInteractions: vi.fn(),
      applyRelationshipMetrics: vi.fn(),
    };

    const service = new NpcRelationshipService(npcs, relationships);
    const result = await service.materializePersistentNpc({
      definitionId: 'DEMO_NEIGHBOR_FAVOR',
      taskInstanceId: 'task-1',
      citizenId: 'cit-1',
      binding: {
        templateId: 'neighbor_marco',
        targetRuleRef: 'persistent_npc_neighbor_marco',
        reuseKnown: true,
        optionOutcomes: {},
      },
    });

    expect(result.presentation.isFirstMeeting).toBe(true);
    expect(result.presentation.recognitionLine).toBe(NPC_TEMPLATES.neighbor_marco!.introductionLine);
    expect(npcs.create).toHaveBeenCalledOnce();
  });

  it('reuses known NPC and builds recognition for positive sentiment', async () => {
    const npc = createNpc();
    const npcs: NpcRepository = {
      findById: vi.fn(),
      create: vi.fn(),
    };
    const relationships: CitizenNpcRelationshipRepository = {
      findByCitizenAndNpc: vi.fn(),
      findKnownByCitizen: vi.fn(),
      findKnownByTemplate: vi.fn().mockResolvedValue({
        citizenId: 'cit-1',
        npcId: npc.npcId,
        relationshipLevel: 2,
        interactionCount: 1,
        lastInteractionAt: new Date(),
        lastOutcomeKey: 'helped',
        lastOutcomeSummary: 'Lo hai aiutato',
        sentiment: 'positive',
        firstMetAt: new Date(),
        metadata: {},
        ...DEFAULT_RELATIONSHIP_METRICS,
        npc,
      }),
      upsertRelationship: vi.fn(),
      recordInteraction: vi.fn(),
      listInteractions: vi.fn(),
      applyRelationshipMetrics: vi.fn(),
    };

    const service = new NpcRelationshipService(npcs, relationships);
    const result = await service.materializePersistentNpc({
      definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE',
      taskInstanceId: 'task-2',
      citizenId: 'cit-1',
      binding: {
        templateId: 'neighbor_marco',
        targetRuleRef: 'persistent_npc_neighbor_marco_return',
        reuseKnown: true,
        optionOutcomes: {},
      },
    });

    expect(result.npc.npcId).toBe('npc-1');
    expect(result.presentation.isKnown).toBe(true);
    expect(result.presentation.recognitionLine).toContain('Marco');
    expect(result.presentation.toneLine).toContain('fidarsi');
    expect(npcs.create).not.toHaveBeenCalled();
  });

  it('builds neutral recognition and tone on repeat meeting', () => {
    const npc = createNpc({
      displayName: 'Giulia',
      npcTemplateId: 'acquaintance_giulia',
      narrativeRole: 'conoscente di paese',
    });
    const service = new NpcRelationshipService({ findById: vi.fn(), create: vi.fn() }, {
      findByCitizenAndNpc: vi.fn(),
      findKnownByCitizen: vi.fn(),
      findKnownByTemplate: vi.fn(),
      upsertRelationship: vi.fn(),
      recordInteraction: vi.fn(),
      listInteractions: vi.fn(),
      applyRelationshipMetrics: vi.fn(),
    });

    const presentation = service.buildPresentation(
      npc,
      {
        citizenId: 'cit-1',
        npcId: npc.npcId,
        relationshipLevel: 0,
        interactionCount: 1,
        lastInteractionAt: new Date(),
        lastOutcomeKey: 'polite_refusal',
        lastOutcomeSummary: 'Hai rifiutato con gentilezza',
        sentiment: 'neutral',
        firstMetAt: new Date(),
        metadata: {},
        ...DEFAULT_RELATIONSHIP_METRICS,
      },
      false,
    );

    expect(presentation.isKnown).toBe(true);
    expect(presentation.recognitionLine).toContain('Giulia');
    expect(presentation.toneLine).toContain('salutarvi');
  });

  it('increments interaction count on second meeting', async () => {
    const upsert = vi.fn().mockResolvedValue({
      citizenId: 'cit-1',
      npcId: 'npc-1',
      relationshipLevel: 4,
      interactionCount: 2,
      lastInteractionAt: new Date(),
      lastOutcomeKey: 'helped',
      lastOutcomeSummary: 'Lo hai aiutato',
      sentiment: 'positive',
      firstMetAt: new Date(),
      metadata: {},
    });

    const relationships: CitizenNpcRelationshipRepository = {
      findByCitizenAndNpc: vi.fn().mockResolvedValue({
        citizenId: 'cit-1',
        npcId: 'npc-1',
        relationshipLevel: 2,
        interactionCount: 1,
        lastInteractionAt: new Date(),
        lastOutcomeKey: 'helped',
        lastOutcomeSummary: 'Lo hai aiutato',
        sentiment: 'positive',
        firstMetAt: new Date(),
        metadata: {},
      }),
      findKnownByCitizen: vi.fn(),
      findKnownByTemplate: vi.fn(),
      upsertRelationship: upsert,
      recordInteraction: vi.fn(),
      listInteractions: vi.fn(),
      applyRelationshipMetrics: vi.fn(),
    };

    const service = new NpcRelationshipService({ findById: vi.fn(), create: vi.fn() }, relationships);
    await service.recordTaskInteraction({
      citizenId: 'cit-1',
      npcId: 'npc-1',
      taskInstanceId: 'task-2',
      definitionId: 'DEMO_NEIGHBOR_FAVOR',
      optionId: 'help',
      occurredAt: new Date(),
    });

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ interactionCount: 2 }));
  });

  it('records interaction and updates relationship sentiment', async () => {
    const upsert = vi.fn().mockResolvedValue({
      citizenId: 'cit-1',
      npcId: 'npc-1',
      relationshipLevel: -2,
      interactionCount: 1,
      lastInteractionAt: new Date(),
      lastOutcomeKey: 'ignored',
      lastOutcomeSummary: 'Hai ignorato la richiesta',
      sentiment: 'negative',
      firstMetAt: new Date(),
      metadata: {},
    });

    const relationships: CitizenNpcRelationshipRepository = {
      findByCitizenAndNpc: vi.fn().mockResolvedValue(null),
      findKnownByCitizen: vi.fn(),
      findKnownByTemplate: vi.fn(),
      upsertRelationship: upsert,
      recordInteraction: vi.fn().mockResolvedValue({
        interactionId: 'int-1',
        citizenId: 'cit-1',
        npcId: 'npc-1',
        taskInstanceId: 'task-1',
        definitionId: 'DEMO_NEIGHBOR_FAVOR',
        optionId: 'ignore',
        outcomeKey: 'ignored',
        outcomeSummary: 'Hai ignorato la richiesta',
        occurredAt: new Date(),
      }),
      listInteractions: vi.fn(),
      applyRelationshipMetrics: vi.fn(),
    };

    const service = new NpcRelationshipService({ findById: vi.fn(), create: vi.fn() }, relationships);
    const updated = await service.recordTaskInteraction({
      citizenId: 'cit-1',
      npcId: 'npc-1',
      taskInstanceId: 'task-1',
      definitionId: 'DEMO_NEIGHBOR_FAVOR',
      optionId: 'ignore',
      occurredAt: new Date(),
    });

    expect(updated.sentiment).toBe('negative');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        lastOutcomeSummary: 'Hai ignorato la richiesta',
        interactionCount: 1,
      }),
    );
  });

  it('includes assigned portraitId in known NPC summaries', async () => {
    const relationships: CitizenNpcRelationshipRepository = {
      findByCitizenAndNpc: vi.fn(),
      findKnownByCitizen: vi.fn().mockResolvedValue([
        {
          citizenId: 'cit-1',
          npcId: 'npc-1',
          relationshipLevel: 1,
          interactionCount: 2,
          lastInteractionAt: new Date('2026-01-01T12:00:00.000Z'),
          lastOutcomeKey: 'helped',
          lastOutcomeSummary: 'Hai aiutato Marco',
          sentiment: 'positive',
          firstMetAt: new Date('2025-12-01T12:00:00.000Z'),
          metadata: {},
          npc: createNpc({ npcTemplateId: 'neighbor_marco' }),
        },
      ]),
      findKnownByTemplate: vi.fn(),
      upsertRelationship: vi.fn(),
      recordInteraction: vi.fn(),
      listInteractions: vi.fn(),
      applyRelationshipMetrics: vi.fn(),
    };
    const npcPortraitAssignments = {
      listAll: vi.fn().mockResolvedValue([
        {
          templateId: 'neighbor_marco',
          portraitId: 'npc_015',
          updatedByAccountId: 'admin-1',
          updatedAt: new Date(),
        },
      ]),
      findByTemplateId: vi.fn(),
      upsert: vi.fn(),
    };

    const service = new NpcRelationshipService(
      { findById: vi.fn(), create: vi.fn() },
      relationships,
      npcPortraitAssignments as never,
    );

    const known = await service.getKnownNpcs('cit-1');
    expect(known).toHaveLength(1);
    expect(known[0]?.templateId).toBe('neighbor_marco');
    expect(known[0]?.portraitId).toBe('npc_015');
  });
});
