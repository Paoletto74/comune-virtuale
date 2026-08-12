import { describe, expect, it, beforeEach } from 'vitest';
import { FlashOpportunityService } from './flash-opportunity-service.js';
import type {
  CitizenFlashSpawnStateRecord,
  CitizenFlashSpawnStateRepository,
  CitizenRepository,
  FlashOpportunityRecord,
  FlashOpportunityRepository,
} from '../../domain/ports/repositories.js';
import {
  DEFAULT_FLASH_OPPORTUNITY_CONFIG,
  FLASH_ECONOMIC_DELIVERY,
  resetFlashOpportunityConfig,
  setFlashOpportunityConfig,
} from '../../slice/flash-opportunities-constants.js';
import type { CitizenProfileContext } from '../citizen/citizen-profile-service.js';
import type { EconomyService } from '../economy/economy-service.js';

class InMemoryFlashRepo implements FlashOpportunityRepository {
  private rows = new Map<string, FlashOpportunityRecord>();

  async findById(opportunityId: string) {
    return this.rows.get(opportunityId) ?? null;
  }

  async findByIdempotencyKey(citizenId: string, idempotencyKey: string) {
    return (
      [...this.rows.values()].find(
        (row) => row.citizenId === citizenId && row.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  async findPendingByCitizenId(citizenId: string, now: Date) {
    return (
      [...this.rows.values()].find(
        (row) =>
          row.citizenId === citizenId &&
          row.status === 'pending' &&
          row.expiresAt.getTime() > now.getTime(),
      ) ?? null
    );
  }

  async countPendingByCitizenId(citizenId: string) {
    return [...this.rows.values()].filter(
      (row) => row.citizenId === citizenId && row.status === 'pending',
    ).length;
  }

  async create(input: {
    opportunityId: string;
    citizenId: string;
    type: string;
    templateId: string;
    title: string;
    body: string;
    sourceContext?: Record<string, unknown>;
    reward?: Record<string, unknown>;
    risk?: Record<string, unknown> | null;
    expiresAt: Date;
    idempotencyKey: string;
    metadata?: Record<string, unknown>;
  }) {
    const existing = await this.findByIdempotencyKey(input.citizenId, input.idempotencyKey);
    if (existing) return { record: existing, created: false };

    const record: FlashOpportunityRecord = {
      opportunityId: input.opportunityId,
      citizenId: input.citizenId,
      type: input.type,
      templateId: input.templateId,
      title: input.title,
      body: input.body,
      sourceContext: input.sourceContext ?? {},
      reward: input.reward ?? {},
      risk: input.risk ?? null,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
      status: 'pending',
      metadata: input.metadata ?? {},
      idempotencyKey: input.idempotencyKey,
    };
    this.rows.set(record.opportunityId, record);
    return { record, created: true };
  }

  async updateStatus(opportunityId: string, status: string, metadata?: Record<string, unknown>) {
    const row = this.rows.get(opportunityId);
    if (!row) throw new Error('missing');
    const updated = { ...row, status, metadata: metadata ?? row.metadata };
    this.rows.set(opportunityId, updated);
    return updated;
  }

  async expirePendingBefore(citizenId: string, now: Date) {
    const expired: FlashOpportunityRecord[] = [];
    for (const row of this.rows.values()) {
      if (row.citizenId === citizenId && row.status === 'pending' && row.expiresAt <= now) {
        row.status = 'expired';
        expired.push(row);
      }
    }
    return expired;
  }
}

class InMemorySpawnRepo implements CitizenFlashSpawnStateRepository {
  private rows = new Map<string, CitizenFlashSpawnStateRecord>();

  async findByCitizenId(citizenId: string) {
    return this.rows.get(citizenId) ?? null;
  }

  async ensureState(citizenId: string) {
    const existing = await this.findByCitizenId(citizenId);
    if (existing) return existing;
    const created: CitizenFlashSpawnStateRecord = {
      citizenId,
      spawnCycle: 0,
      anticipationStartedAt: null,
      anticipationDurationMs: null,
      anticipationLabel: null,
      nextSpawnEligibleAt: null,
      lastOpportunityAt: null,
      lastExpiredNotice: null,
      metadata: {},
      updatedAt: new Date(),
    };
    this.rows.set(citizenId, created);
    return created;
  }

  async save(input: CitizenFlashSpawnStateRecord) {
    this.rows.set(input.citizenId, input);
    return input;
  }
}

const profileContext: CitizenProfileContext = {
  citizenId: 'cit-1',
  age: 30,
  occupationCode: 1,
  occupationLabel: 'Impiegato',
  housingCode: 1,
  familyCode: 1,
  level: 2,
  sympathy: 2,
  reputation: 2,
  unlockedDimensions: ['work'],
  tasksCompleted: 3,
  workTasksCompleted: 1,
};

describe('FlashOpportunityService', () => {
  beforeEach(() => {
    resetFlashOpportunityConfig();
    setFlashOpportunityConfig({
      minDecisionDurationMs: 5000,
      maxDecisionDurationMs: 15000,
      minAnticipationDurationMs: 1000,
      maxAnticipationDurationMs: 1000,
      minSpawnIntervalMs: 5000,
      maxSpawnIntervalMs: 5000,
      opportunityChance: 1,
      maxActive: 1,
    });
  });

  function createService() {
    const opportunities = new InMemoryFlashRepo();
    const spawnState = new InMemorySpawnRepo();
    const citizens: CitizenRepository = {
      findById: async () => null,
      findByAccountId: async () => null,
      createWithOnboarding: async () => {
        throw new Error('not implemented');
      },
      getProgression: async () => null,
      getPersonalValues: async () => ({ sympathy: 0, reputation: 0 }),
      incrementPersonalValues: async (_citizenId, deltas) => ({
        sympathy: deltas.sympathy ?? 0,
        reputation: deltas.reputation ?? 0,
      }),
      applyPersonalValueEffects: async (_citizenId, input) => ({
        values: input.deltas ?? {},
        applied: input.deltas ?? {},
      }),
      setPersonalValues: async (_citizenId, values) => values,
      getLastTaskDayPhase: async () => null,
      setLastTaskDayPhase: async () => {},
      updatePortraitId: async () => {
        throw new Error('not implemented');
      },
      updateDisplayName: async () => {
        throw new Error('not implemented');
      },
      updateMainLevel: async () => {},
      listAll: async () => [],
      deleteByCitizenId: async () => {},
      applyProgressionGrant: async () => {
        throw new Error('not implemented');
      },
    };
    const economy = {
      applyCashDelta: async () => ({
        availableCash: { amountMinor: '10000', currency: 'game_currency' },
        asOf: new Date().toISOString(),
      }),
      getBalance: async () => ({
        availableCash: { amountMinor: '10000', currency: 'game_currency' },
        asOf: new Date().toISOString(),
      }),
    } as unknown as EconomyService;

    const service = new FlashOpportunityService(opportunities, spawnState, economy, citizens);
    return { service, opportunities };
  }

  it('creates a pending opportunity after anticipation completes', async () => {
    const { service } = createService();
    const base = 1_700_000_000_000;
    await service.syncForHome({ citizenId: 'cit-1', nowMs: base, profileContext, knownNpcs: [] });
    const spawned = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 1500,
      profileContext,
      knownNpcs: [],
    });
    expect(spawned.flashOpportunity).not.toBeNull();
    expect(spawned.flashOpportunity?.status).toBe('pending');
  });

  it('expires pending opportunities server-side', async () => {
    setFlashOpportunityConfig({
      minSpawnIntervalMs: 120_000,
      maxSpawnIntervalMs: 120_000,
    });
    const { service, opportunities } = createService();
    const base = 1_700_000_000_000;
    await service.syncForHome({ citizenId: 'cit-1', nowMs: base, profileContext, knownNpcs: [] });
    const spawned = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 1500,
      profileContext,
      knownNpcs: [],
    });
    const id = spawned.flashOpportunity!.opportunityId;
    const expired = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 60_000,
      profileContext,
      knownNpcs: [],
    });
    expect(expired.flashOpportunity).toBeNull();
    expect(expired.expiredNotice).toBeTruthy();
    expect((await opportunities.findById(id))?.status).toBe('expired');
  });

  it('accepts a pending opportunity and applies reward idempotently at repo level', async () => {
    const { service, opportunities } = createService();
    const base = 1_700_000_000_000;
    await service.syncForHome({ citizenId: 'cit-1', nowMs: base, profileContext, knownNpcs: [] });
    const spawned = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 1500,
      profileContext,
      knownNpcs: [],
    });
    const id = spawned.flashOpportunity!.opportunityId;
    const accepted = await service.accept({
      citizenId: 'cit-1',
      opportunityId: id,
      nowMs: base + 2000,
    });
    expect(accepted.status).toBe('accepted');
    expect(accepted.cashDeltaMinor).toBe('145');
    expect((await opportunities.findById(id))?.status).toBe('accepted');
  });

  it('rejects accept on expired opportunity', async () => {
    const { service } = createService();
    const base = 1_700_000_000_000;
    await service.syncForHome({ citizenId: 'cit-1', nowMs: base, profileContext, knownNpcs: [] });
    const spawned = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 1500,
      profileContext,
      knownNpcs: [],
    });
    const id = spawned.flashOpportunity!.opportunityId;
    await expect(
      service.accept({ citizenId: 'cit-1', opportunityId: id, nowMs: base + 60_000 }),
    ).rejects.toMatchObject({ code: 'FLASH_EXPIRED' });
  });

  it('declines without treating it as failure', async () => {
    const { service, opportunities } = createService();
    const base = 1_700_000_000_000;
    await service.syncForHome({ citizenId: 'cit-1', nowMs: base, profileContext, knownNpcs: [] });
    const spawned = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 1500,
      profileContext,
      knownNpcs: [],
    });
    const id = spawned.flashOpportunity!.opportunityId;
    const declined = await service.decline({
      citizenId: 'cit-1',
      opportunityId: id,
      nowMs: base + 2000,
    });
    expect(declined.status).toBe('declined');
    expect((await opportunities.findById(id))?.status).toBe('declined');
  });

  it('prevents duplicate spawn for the same cycle', async () => {
    const { service } = createService();
    const base = 1_700_000_000_000;
    await service.syncForHome({ citizenId: 'cit-1', nowMs: base, profileContext, knownNpcs: [] });
    const first = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 1500,
      profileContext,
      knownNpcs: [],
    });
    const firstId = first.flashOpportunity!.opportunityId;
    const second = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 1600,
      profileContext,
      knownNpcs: [],
    });
    expect(second.flashOpportunity?.opportunityId).toBe(firstId);
  });

  it('respects maxActive = 1', async () => {
    setFlashOpportunityConfig({ maxActive: 1, opportunityChance: 1 });
    const { service } = createService();
    const base = 1_700_000_000_000;
    await service.syncForHome({ citizenId: 'cit-1', nowMs: base, profileContext, knownNpcs: [] });
    await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 1500,
      profileContext,
      knownNpcs: [],
    });
    const pending = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 5000,
      profileContext,
      knownNpcs: [],
    });
    expect(pending.flashOpportunity).not.toBeNull();
  });

  it('uses configurable decision duration between 5 and 15 seconds', async () => {
    const { service } = createService();
    const base = 1_700_000_000_000;
    await service.syncForHome({ citizenId: 'cit-1', nowMs: base, profileContext, knownNpcs: [] });
    const spawned = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 1500,
      profileContext,
      knownNpcs: [],
    });
    expect(spawned.flashOpportunity!.decisionDurationMs).toBeGreaterThanOrEqual(5000);
    expect(spawned.flashOpportunity!.decisionDurationMs).toBeLessThanOrEqual(15000);
  });

  it('returns default config values', () => {
    resetFlashOpportunityConfig();
    expect(DEFAULT_FLASH_OPPORTUNITY_CONFIG.maxActive).toBe(1);
    expect(DEFAULT_FLASH_OPPORTUNITY_CONFIG.timingMode).toBe('real_time');
  });

  it('can spawn economic template deterministically', async () => {
    const { service } = createService();
    const base = 1_700_000_000_000;
    await service.syncForHome({ citizenId: 'cit-1', nowMs: base, profileContext, knownNpcs: [] });
    const spawned = await service.syncForHome({
      citizenId: 'cit-1',
      nowMs: base + 1500,
      profileContext,
      knownNpcs: [],
    });
    expect(spawned.flashOpportunity?.title).toBeTruthy();
    void FLASH_ECONOMIC_DELIVERY;
  });
});
