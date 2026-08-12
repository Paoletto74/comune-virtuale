import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type {
  CitizenRepository,
  CitizenTemporalEventRepository,
  GameSurfaceRepository,
  ReferendumRecord,
  WorldEventRepository,
} from '../../domain/ports/repositories.js';
import type { EconomyService } from '../economy/economy-service.js';
import { SLICE_GAME_CURRENCY_ID } from '../../slice/economy-constants.js';
import { GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS } from '../../slice/game-surface-constants.js';
import { GameSurfaceService } from './game-surface-service.js';

class InMemoryGameSurfaceRepository implements GameSurfaceRepository {
  private referendums = new Map<string, ReferendumRecord>();
  private votes = new Map<string, { referendumId: string; citizenId: string; optionId: string; idempotencyKey: string }>();
  private inventory = new Map<
    string,
    {
      inventoryId: string;
      citizenId: string;
      itemId: string;
      idempotencyKey: string;
      purchasePriceMinor?: bigint;
      purchasePriceIndexBps?: number;
    }
  >();
  private marketplace = [
    {
      itemId: 'cv_cons_001',
      name: 'Moka del vicinato',
      description: 'Non risolve i problemi, ma li rende più sopportabili.',
      category: 'living',
      priceMinor: 1200n,
      effectKey: null,
      enabled: true,
    },
  ];

  isStorageAvailable() {
    return true;
  }

  async getMunicipalityState() {
    return null;
  }

  async upsertMunicipalityState() {
    return null;
  }

  async listReferendums() {
    return [...this.referendums.values()];
  }

  async findReferendumById(referendumId: string) {
    return this.referendums.get(referendumId) ?? null;
  }

  async findActiveReferendum(gameTimeMs: number) {
    for (const referendum of this.referendums.values()) {
      if (
        referendum.status === 'active' &&
        gameTimeMs >= referendum.startsAtGameMs &&
        gameTimeMs <= referendum.endsAtGameMs
      ) {
        return referendum;
      }
    }
    return null;
  }

  async createReferendum(input: {
    referendumId: string;
    question: string;
    context: string;
    status: string;
    optionALabel: string;
    optionBLabel: string;
    startsAtGameMs: number;
    endsAtGameMs: number;
    idempotencyKey: string;
  }) {
    const existing = [...this.referendums.values()].find(
      (record) => record.idempotencyKey === input.idempotencyKey,
    );
    if (existing) return { record: existing, created: false };

    const record: ReferendumRecord = {
      referendumId: input.referendumId,
      question: input.question,
      context: input.context,
      status: input.status,
      optionALabel: input.optionALabel,
      optionBLabel: input.optionBLabel,
      optionAVotes: 0,
      optionBVotes: 0,
      startsAtGameMs: input.startsAtGameMs,
      endsAtGameMs: input.endsAtGameMs,
      closedAtGameMs: null,
      winningOption: null,
      consequenceSummary: null,
      idempotencyKey: input.idempotencyKey,
      metadata: {},
    };
    this.referendums.set(record.referendumId, record);
    return { record, created: true };
  }

  async findVoteByCitizen(referendumId: string, citizenId: string) {
    for (const vote of this.votes.values()) {
      if (vote.referendumId === referendumId && vote.citizenId === citizenId) {
        return {
          voteId: 'vote-1',
          referendumId,
          citizenId,
          optionId: vote.optionId,
          votedAtGameMs: 1000,
          idempotencyKey: vote.idempotencyKey,
        };
      }
    }
    return null;
  }

  async findVoteByIdempotencyKey(idempotencyKey: string) {
    for (const vote of this.votes.values()) {
      if (vote.idempotencyKey === idempotencyKey) {
        return {
          voteId: 'vote-1',
          referendumId: vote.referendumId,
          citizenId: vote.citizenId,
          optionId: vote.optionId,
          votedAtGameMs: 1000,
          idempotencyKey,
        };
      }
    }
    return null;
  }

  async recordReferendumVote(input: {
    voteId: string;
    referendumId: string;
    citizenId: string;
    optionId: string;
    idempotencyKey: string;
  }) {
    const existing = await this.findVoteByIdempotencyKey(input.idempotencyKey);
    if (existing) return { record: existing, created: false };
    const byCitizen = await this.findVoteByCitizen(input.referendumId, input.citizenId);
    if (byCitizen) return { record: byCitizen, created: false };

    this.votes.set(input.voteId, {
      referendumId: input.referendumId,
      citizenId: input.citizenId,
      optionId: input.optionId,
      idempotencyKey: input.idempotencyKey,
    });
    return {
      record: {
        voteId: input.voteId,
        referendumId: input.referendumId,
        citizenId: input.citizenId,
        optionId: input.optionId,
        votedAtGameMs: 1000,
        idempotencyKey: input.idempotencyKey,
      },
      created: true,
    };
  }

  async incrementReferendumVote(referendumId: string, optionId: 'a' | 'b') {
    const referendum = this.referendums.get(referendumId);
    if (!referendum) return;
    if (optionId === 'a') referendum.optionAVotes += 1;
    else referendum.optionBVotes += 1;
  }

  async closeReferendum() {
    return null;
  }

  async listClosedReferendums() {
    return [];
  }

  async listMarketplaceItems() {
    return this.marketplace;
  }

  async findMarketplaceItem(itemId: string) {
    return this.marketplace.find((item) => item.itemId === itemId) ?? null;
  }

  async findInventoryByIdempotencyKey(idempotencyKey: string) {
    for (const entry of this.inventory.values()) {
      if (entry.idempotencyKey === idempotencyKey) {
        return {
          inventoryId: entry.inventoryId,
          citizenId: entry.citizenId,
          itemId: entry.itemId,
          acquiredAtGameMs: 1000,
          idempotencyKey,
          purchasePriceMinor: entry.purchasePriceMinor ?? null,
          purchasePriceIndexBps: entry.purchasePriceIndexBps ?? null,
        };
      }
    }
    return null;
  }

  async listInventoryByCitizen(citizenId: string) {
    return [...this.inventory.values()]
      .filter((entry) => entry.citizenId === citizenId)
      .map((entry) => ({
        inventoryId: entry.inventoryId,
        citizenId: entry.citizenId,
        itemId: entry.itemId,
        acquiredAtGameMs: 1000,
        idempotencyKey: entry.idempotencyKey,
        purchasePriceMinor: entry.purchasePriceMinor ?? null,
        purchasePriceIndexBps: entry.purchasePriceIndexBps ?? null,
      }));
  }

  async addInventoryItem(input: {
    inventoryId: string;
    citizenId: string;
    itemId: string;
    acquiredAtGameMs?: number;
    idempotencyKey: string;
    purchasePriceMinor?: bigint | null;
    purchasePriceIndexBps?: number | null;
  }) {
    const existing = await this.findInventoryByIdempotencyKey(input.idempotencyKey);
    if (existing) return { record: existing, created: false };
    this.inventory.set(input.inventoryId, input);
    return {
      record: {
        inventoryId: input.inventoryId,
        citizenId: input.citizenId,
        itemId: input.itemId,
        acquiredAtGameMs: 1000,
        idempotencyKey: input.idempotencyKey,
        purchasePriceMinor: input.purchasePriceMinor ?? null,
        purchasePriceIndexBps: input.purchasePriceIndexBps ?? null,
      },
      created: true,
    };
  }

  async listJobOffers() {
    return [];
  }

  async findJobOffer() {
    return null;
  }

  async getEmployment() {
    return null;
  }

  async upsertEmployment() {
    return null;
  }

  async findEmploymentByIdempotencyKey() {
    return null;
  }

  async createJobApplication() {
    return null;
  }

  async findJobApplicationByIdempotencyKey() {
    return null;
  }

  async listJobEngagements() {
    return [];
  }

  async getJobEngagement() {
    return null;
  }

  async upsertJobEngagement() {
    return null;
  }

  async createMessage() {
    return null;
  }

  async findMessageByIdempotencyKey() {
    return null;
  }

  async recordEconomicSnapshot() {
    return null;
  }

  async listEconomicSnapshots() {
    return [];
  }

  async recordInflationSnapshot() {
    return null;
  }

  async listInflationHistory() {
    return [];
  }

  async recordChronicleEntry(input: {
    entryId: string;
    recordedAtGameMs: number;
    category: string;
    title: string;
    body: string;
    idempotencyKey: string;
  }) {
    return {
      record: {
        entryId: input.entryId,
        recordedAtGameMs: input.recordedAtGameMs,
        category: input.category,
        title: input.title,
        body: input.body,
        idempotencyKey: input.idempotencyKey,
      },
      created: true,
    };
  }

  async listChronicleEntries() {
    return [];
  }

  async removeInventoryItem() {
    return true;
  }

  async listActivePlayerListings() {
    return [];
  }

  async findPlayerListing() {
    return null;
  }

  async createPlayerListing() {
    return { record: {}, created: true };
  }

  async completePlayerListing() {
    return {};
  }

  async completePlayerListingWithNpc() {
    return {};
  }

  async listListingsReadyForNpcResolution() {
    return [];
  }

  async transferInventoryOwnership() {
    return {};
  }

  async createCitizenRental() {
    return { record: {}, created: true };
  }

  async listActiveRentalsByTenant() {
    return [];
  }

  async listActiveRentalsByOwner() {
    return [];
  }

  async terminateRental() {
    return null;
  }

  async expireRentalsBefore() {
    return undefined;
  }
}

describe('GameSurfaceService', () => {
  it('spawns demo referendum when none active', async () => {
    const repo = new InMemoryGameSurfaceRepository();
    const service = new GameSurfaceService(
      repo,
      { listRecentByCitizen: vi.fn().mockResolvedValue([]) } as unknown as CitizenTemporalEventRepository,
      {} as EconomyService,
      {} as CitizenRepository,
      { listActiveAtGameTime: vi.fn().mockResolvedValue([]) } as unknown as WorldEventRepository,
    );

    await service.ensureActiveReferendum(5000);
    const feed = await service.getReferendums('citizen-1', 5000);

    expect(feed.enabled).toBe(true);
    expect(feed.referendums.some((referendum) => referendum.status === 'active')).toBe(true);
    const active = feed.referendums.find((referendum) => referendum.status === 'active');
    expect(active?.remainingMs).toBeGreaterThan(0);
    expect(active?.remainingMs).toBeLessThanOrEqual(GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS);
  });

  it('votes idempotently on referendum', async () => {
    const repo = new InMemoryGameSurfaceRepository();
    const referendumId = randomUUID();
    await repo.createReferendum({
      referendumId,
      question: 'Test?',
      context: 'Contexto',
      status: 'active',
      optionALabel: 'Sì',
      optionBLabel: 'No',
      startsAtGameMs: 0,
      endsAtGameMs: 10_000,
      idempotencyKey: 'demo-referendum:0',
    });

    const service = new GameSurfaceService(
      repo,
      { listRecentByCitizen: vi.fn().mockResolvedValue([]) } as unknown as CitizenTemporalEventRepository,
      {} as EconomyService,
      {} as CitizenRepository,
      { listActiveAtGameTime: vi.fn().mockResolvedValue([]) } as unknown as WorldEventRepository,
    );

    const first = await service.voteReferendum({
      citizenId: 'citizen-1',
      referendumId,
      optionId: 'a',
      gameTimeMs: 1000,
    });
    const second = await service.voteReferendum({
      citizenId: 'citizen-1',
      referendumId,
      optionId: 'a',
      gameTimeMs: 1000,
    });

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(first.referendums.find((item) => item.referendumId === referendumId)?.userVote).toBe('a');
  });

  it('purchases marketplace item idempotently', async () => {
    const repo = new InMemoryGameSurfaceRepository();
    const economy = {
      applyCashDelta: vi.fn().mockResolvedValue({
        availableCash: { amountMinor: '8800', currency: SLICE_GAME_CURRENCY_ID },
        asOf: '2026-01-01T00:00:00.000Z',
      }),
      getBalance: vi.fn().mockResolvedValue({
        availableCash: { amountMinor: '8800', currency: SLICE_GAME_CURRENCY_ID },
        asOf: '2026-01-01T00:00:00.000Z',
      }),
    } as unknown as EconomyService;

    const citizens = {
      getProgression: vi.fn().mockResolvedValue({ mainLevel: 4 }),
    } as unknown as CitizenRepository;

    const service = new GameSurfaceService(
      repo,
      { listRecentByCitizen: vi.fn().mockResolvedValue([]) } as unknown as CitizenTemporalEventRepository,
      economy,
      citizens,
      { listActiveAtGameTime: vi.fn().mockResolvedValue([]) } as unknown as WorldEventRepository,
    );

    const first = await service.purchaseItem({
      citizenId: 'citizen-1',
      itemId: 'cv_cons_001',
      gameTimeMs: 1000,
    });
    const second = await service.purchaseItem({
      citizenId: 'citizen-1',
      itemId: 'cv_cons_001',
      gameTimeMs: 1000,
    });

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(economy.applyCashDelta).toHaveBeenCalledTimes(1);
    expect(first.marketplace.items.find((item) => item.itemId === 'cv_cons_001')?.ownedCount).toBe(1);
  });

  it('deduplicates gazzetta world events by worldEventId', async () => {
    const worldEventId = randomUUID();
    const temporalEvents = {
      listRecentByCitizen: vi.fn().mockResolvedValue([
        {
          eventId: 'evt-1',
          eventType: 'city_update',
          title: 'Ondata di caldo',
          body: 'Caldo',
          worldTimeMs: 1000,
          idempotencyKey: `city_update:c1:${worldEventId}`,
          payload: { worldEventId, type: 'weather' },
        },
        {
          eventId: 'evt-2',
          eventType: 'city_update',
          title: 'Ondata di caldo',
          body: 'Caldo duplicato',
          worldTimeMs: 900,
          idempotencyKey: `city_update:c1:${worldEventId}:retry`,
          payload: { worldEventId, type: 'weather' },
        },
      ]),
    };

    const service = new GameSurfaceService(
      new InMemoryGameSurfaceRepository(),
      temporalEvents as unknown as CitizenTemporalEventRepository,
      {} as EconomyService,
      {} as CitizenRepository,
      { listActiveAtGameTime: vi.fn().mockResolvedValue([]) } as unknown as WorldEventRepository,
    );

    const feed = await service.getGazzettaArticles('citizen-1', 1000);
    expect(feed.articles.filter((article) => article.title === 'Ondata di caldo')).toHaveLength(1);
    expect(feed.articles[0]?.articleId).toBe(worldEventId);
  });

  it('deduplicates global notifications by worldEventId', async () => {
    const worldEventId = randomUUID();
    const temporalEvents = {
      listRecentByCitizen: vi.fn().mockResolvedValue([
        {
          eventId: 'evt-1',
          eventType: 'city_update',
          title: 'Ondata di caldo',
          body: 'Caldo',
          worldTimeMs: 1000,
          idempotencyKey: `city_update:c1:${worldEventId}`,
          payload: { worldEventId, type: 'weather' },
        },
        {
          eventId: 'evt-2',
          eventType: 'city_update',
          title: 'Ondata di caldo',
          body: 'Caldo duplicato',
          worldTimeMs: 900,
          idempotencyKey: `city_update:c1:${worldEventId}:retry`,
          payload: { worldEventId, type: 'weather' },
        },
      ]),
    };

    const service = new GameSurfaceService(
      new InMemoryGameSurfaceRepository(),
      temporalEvents as unknown as CitizenTemporalEventRepository,
      {} as EconomyService,
      {} as CitizenRepository,
      { listActiveAtGameTime: vi.fn().mockResolvedValue([]) } as unknown as WorldEventRepository,
    );

    const feed = await service.getNotifications('citizen-1', 'global', 1000);
    expect(feed.notifications).toHaveLength(1);
    expect(feed.notifications[0]?.notificationId).toBe(worldEventId);
  });
});
