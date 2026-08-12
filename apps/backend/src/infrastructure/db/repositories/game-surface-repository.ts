import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';
import type { Database } from '../client.js';
import {
  citizenEconomicSnapshots,
  citizenEmployment,
  citizenInventory,
  citizenJobApplications,
  citizenJobEngagements,
  citizenMessages,
  citizenRentals,
  jobOffers,
  marketplaceCatalog,
  marketplacePlayerListings,
  municipalityInflationHistory,
  municipalityChronicle,
  municipalityState,
  referendumVotes,
  referendums,
} from '../schema/index.js';
import type {
  CitizenEconomicSnapshotRecord,
  CitizenEmploymentRecord,
  CitizenInventoryRecord,
  CitizenJobApplicationRecord,
  CitizenJobEngagementRecord,
  CitizenMessageRecord,
  GameSurfaceRepository,
  JobOfferRecord,
  MarketplaceItemRecord,
  MunicipalityChronicleRecord,
  MunicipalityInflationSnapshotRecord,
  MunicipalityStateRecord,
  ReferendumRecord,
  ReferendumVoteRecord,
} from '../../../domain/ports/repositories.js';

const GAME_SURFACE_TABLE_HINTS = [
  'municipality_state',
  'referendums',
  'referendum_votes',
  'marketplace_catalog',
  'citizen_inventory',
  'job_offers',
  'citizen_employment',
  'citizen_messages',
  'citizen_economic_snapshots',
  'municipality_inflation_history',
  'municipality_chronicle',
  'businesses',
  'citizen_job_engagements',
] as const;

export function isGameSurfaceStorageUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { message?: string; code?: string };
  if (candidate.code === '42P01') return true;
  const message = (candidate.message ?? String(error)).toLowerCase();
  return GAME_SURFACE_TABLE_HINTS.some(
    (table) => message.includes(table) && message.includes('does not exist'),
  );
}

function mapMunicipality(row: typeof municipalityState.$inferSelect): MunicipalityStateRecord {
  return {
    treasuryMinor: row.treasuryMinor,
    inflationRateBps: row.inflationRateBps,
    priceIndexBps: row.priceIndexBps ?? 10_000,
    lastInflationTickGameMs: Number(row.lastInflationTickGameMs ?? 0n),
    citizenCount: row.citizenCount,
    updatedAtGameMs: Number(row.updatedAtGameMs),
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  };
}

function mapReferendum(row: typeof referendums.$inferSelect): ReferendumRecord {
  return {
    referendumId: row.referendumId,
    question: row.question,
    context: row.context,
    status: row.status,
    optionALabel: row.optionALabel,
    optionBLabel: row.optionBLabel,
    optionAVotes: row.optionAVotes,
    optionBVotes: row.optionBVotes,
    startsAtGameMs: Number(row.startsAtGameMs),
    endsAtGameMs: Number(row.endsAtGameMs),
    closedAtGameMs: row.closedAtGameMs === null ? null : Number(row.closedAtGameMs),
    winningOption: row.winningOption,
    consequenceSummary: row.consequenceSummary,
    idempotencyKey: row.idempotencyKey,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  };
}

function mapVote(row: typeof referendumVotes.$inferSelect): ReferendumVoteRecord {
  return {
    voteId: row.voteId,
    referendumId: row.referendumId,
    citizenId: row.citizenId,
    optionId: row.optionId,
    votedAtGameMs: Number(row.votedAtGameMs),
    idempotencyKey: row.idempotencyKey,
  };
}

function mapMarketplaceItem(row: typeof marketplaceCatalog.$inferSelect): MarketplaceItemRecord {
  return {
    itemId: row.itemId,
    name: row.name,
    description: row.description,
    category: row.category,
    priceMinor: row.priceMinor,
    effectKey: row.effectKey,
    enabled: row.enabled,
  };
}

function mapInventory(row: typeof citizenInventory.$inferSelect): CitizenInventoryRecord {
  return {
    inventoryId: row.inventoryId,
    citizenId: row.citizenId,
    itemId: row.itemId,
    acquiredAtGameMs: Number(row.acquiredAtGameMs),
    purchasePriceMinor: row.purchasePriceMinor ?? null,
    purchasePriceIndexBps: row.purchasePriceIndexBps ?? null,
    idempotencyKey: row.idempotencyKey,
  };
}

function mapJobOffer(row: typeof jobOffers.$inferSelect): JobOfferRecord {
  return {
    offerId: row.offerId,
    title: row.title,
    employer: row.employer,
    description: row.description,
    occupationCode: row.occupationCode,
    salaryHintMinor: row.salaryHintMinor,
    enabled: row.enabled,
  };
}

function mapEmployment(row: typeof citizenEmployment.$inferSelect): CitizenEmploymentRecord {
  return {
    citizenId: row.citizenId,
    employmentState: row.employmentState,
    currentOfferId: row.currentOfferId,
    hiredAtGameMs: row.hiredAtGameMs === null ? null : Number(row.hiredAtGameMs),
    updatedAtGameMs: Number(row.updatedAtGameMs),
  };
}

function mapJobApplication(
  row: typeof citizenJobApplications.$inferSelect,
): CitizenJobApplicationRecord {
  return {
    applicationId: row.applicationId,
    citizenId: row.citizenId,
    offerId: row.offerId,
    decision: row.decision as 'accepted' | 'rejected',
    decidedAtGameMs: Number(row.decidedAtGameMs),
    idempotencyKey: row.idempotencyKey,
  };
}

function mapJobEngagement(
  row: typeof citizenJobEngagements.$inferSelect,
): CitizenJobEngagementRecord {
  return {
    citizenId: row.citizenId,
    offerId: row.offerId,
    status: row.status as CitizenJobEngagementRecord['status'],
    hiredAtGameMs: row.hiredAtGameMs === null ? null : Number(row.hiredAtGameMs),
    shiftStartedAtGameMs:
      row.shiftStartedAtGameMs === null ? null : Number(row.shiftStartedAtGameMs),
    shiftEndsAtGameMs: row.shiftEndsAtGameMs === null ? null : Number(row.shiftEndsAtGameMs),
    blockedUntilGameMs: row.blockedUntilGameMs === null ? null : Number(row.blockedUntilGameMs),
    lastApplicationId: row.lastApplicationId,
    updatedAtGameMs: Number(row.updatedAtGameMs),
  };
}

function mapMessage(row: typeof citizenMessages.$inferSelect): CitizenMessageRecord {
  return {
    messageId: row.messageId,
    fromCitizenId: row.fromCitizenId,
    toCitizenId: row.toCitizenId,
    body: row.body,
    sentAtGameMs: Number(row.sentAtGameMs),
    idempotencyKey: row.idempotencyKey,
  };
}

function mapSnapshot(row: typeof citizenEconomicSnapshots.$inferSelect): CitizenEconomicSnapshotRecord {
  return {
    snapshotId: row.snapshotId,
    citizenId: row.citizenId,
    recordedAtGameMs: Number(row.recordedAtGameMs),
    cashMinor: row.cashMinor,
    inventoryValueMinor: row.inventoryValueMinor,
    netWorthMinor: row.netWorthMinor,
    idempotencyKey: row.idempotencyKey,
  };
}

function mapInflationSnapshot(
  row: typeof municipalityInflationHistory.$inferSelect,
): MunicipalityInflationSnapshotRecord {
  return {
    snapshotId: row.snapshotId,
    recordedAtGameMs: Number(row.recordedAtGameMs),
    inflationRateBps: row.inflationRateBps,
    priceIndexBps: row.priceIndexBps ?? 10_000,
    treasuryMinor: row.treasuryMinor,
    idempotencyKey: row.idempotencyKey,
  };
}

function mapChronicle(row: typeof municipalityChronicle.$inferSelect): MunicipalityChronicleRecord {
  return {
    entryId: row.entryId,
    recordedAtGameMs: Number(row.recordedAtGameMs),
    category: row.category,
    title: row.title,
    body: row.body,
    idempotencyKey: row.idempotencyKey,
  };
}

export class DrizzleGameSurfaceRepository implements GameSurfaceRepository {
  private storageUnavailable = false;

  constructor(private readonly db: Database) {}

  isStorageAvailable(): boolean {
    return !this.storageUnavailable;
  }

  private async run<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    if (this.storageUnavailable) return fallback;
    try {
      return await fn();
    } catch (error) {
      if (isGameSurfaceStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return fallback;
      }
      throw error;
    }
  }

  async getMunicipalityState() {
    return this.run(async () => {
      const rows = await this.db.select().from(municipalityState).limit(1);
      return rows[0] ? mapMunicipality(rows[0]) : null;
    }, null);
  }

  async upsertMunicipalityState(input: {
    treasuryMinor?: bigint;
    inflationRateBps?: number;
    priceIndexBps?: number;
    lastInflationTickGameMs?: number;
    citizenCount: number;
    updatedAtGameMs: number;
  }) {
    return this.run(async () => {
      const rows = await this.db
        .insert(municipalityState)
        .values({
          id: 1,
          treasuryMinor: input.treasuryMinor ?? 0n,
          inflationRateBps: input.inflationRateBps ?? 200,
          priceIndexBps: input.priceIndexBps ?? 10_000,
          lastInflationTickGameMs: BigInt(input.lastInflationTickGameMs ?? 0),
          citizenCount: input.citizenCount,
          updatedAtGameMs: BigInt(input.updatedAtGameMs),
        })
        .onConflictDoUpdate({
          target: municipalityState.id,
          set: {
            citizenCount: input.citizenCount,
            updatedAtGameMs: BigInt(input.updatedAtGameMs),
            ...(input.treasuryMinor !== undefined ? { treasuryMinor: input.treasuryMinor } : {}),
            ...(input.inflationRateBps !== undefined
              ? { inflationRateBps: input.inflationRateBps }
              : {}),
            ...(input.priceIndexBps !== undefined ? { priceIndexBps: input.priceIndexBps } : {}),
            ...(input.lastInflationTickGameMs !== undefined
              ? { lastInflationTickGameMs: BigInt(input.lastInflationTickGameMs) }
              : {}),
          },
        })
        .returning();
      return mapMunicipality(rows[0]!);
    }, null);
  }

  async listReferendums() {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(referendums)
        .orderBy(desc(referendums.startsAtGameMs));
      return rows.map(mapReferendum);
    }, []);
  }

  async findReferendumById(referendumId: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(referendums)
        .where(eq(referendums.referendumId, referendumId))
        .limit(1);
      return rows[0] ? mapReferendum(rows[0]) : null;
    }, null);
  }

  async findActiveReferendum(gameTimeMs: number) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(referendums)
        .where(
          and(
            eq(referendums.status, 'active'),
            lte(referendums.startsAtGameMs, BigInt(gameTimeMs)),
            gte(referendums.endsAtGameMs, BigInt(gameTimeMs)),
          ),
        )
        .orderBy(desc(referendums.startsAtGameMs))
        .limit(1);
      return rows[0] ? mapReferendum(rows[0]) : null;
    }, null);
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
    metadata?: Record<string, unknown>;
  }) {
    return this.run(async () => {
      const existing = await this.db
        .select()
        .from(referendums)
        .where(eq(referendums.idempotencyKey, input.idempotencyKey))
        .limit(1);
      if (existing[0]) {
        return { record: mapReferendum(existing[0]), created: false };
      }

      const rows = await this.db
        .insert(referendums)
        .values({
          referendumId: input.referendumId,
          question: input.question,
          context: input.context,
          status: input.status,
          optionALabel: input.optionALabel,
          optionBLabel: input.optionBLabel,
          startsAtGameMs: BigInt(input.startsAtGameMs),
          endsAtGameMs: BigInt(input.endsAtGameMs),
          idempotencyKey: input.idempotencyKey,
          metadata: input.metadata ?? {},
        })
        .returning();
      return { record: mapReferendum(rows[0]!), created: true };
    }, null);
  }

  async findVoteByCitizen(referendumId: string, citizenId: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(referendumVotes)
        .where(
          and(
            eq(referendumVotes.referendumId, referendumId),
            eq(referendumVotes.citizenId, citizenId),
          ),
        )
        .limit(1);
      return rows[0] ? mapVote(rows[0]) : null;
    }, null);
  }

  async findVoteByIdempotencyKey(idempotencyKey: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(referendumVotes)
        .where(eq(referendumVotes.idempotencyKey, idempotencyKey))
        .limit(1);
      return rows[0] ? mapVote(rows[0]) : null;
    }, null);
  }

  async recordReferendumVote(input: {
    voteId: string;
    referendumId: string;
    citizenId: string;
    optionId: string;
    votedAtGameMs: number;
    idempotencyKey: string;
  }) {
    return this.run(async () => {
      const existing = await this.findVoteByIdempotencyKey(input.idempotencyKey);
      if (existing) return { record: existing, created: false };

      const byCitizen = await this.findVoteByCitizen(input.referendumId, input.citizenId);
      if (byCitizen) return { record: byCitizen, created: false };

      const rows = await this.db
        .insert(referendumVotes)
        .values({
          voteId: input.voteId,
          referendumId: input.referendumId,
          citizenId: input.citizenId,
          optionId: input.optionId,
          votedAtGameMs: BigInt(input.votedAtGameMs),
          idempotencyKey: input.idempotencyKey,
        })
        .returning();
      return { record: mapVote(rows[0]!), created: true };
    }, null);
  }

  async incrementReferendumVote(referendumId: string, optionId: 'a' | 'b') {
    await this.run(async () => {
      if (optionId === 'a') {
        await this.db
          .update(referendums)
          .set({ optionAVotes: sql`${referendums.optionAVotes} + 1` })
          .where(eq(referendums.referendumId, referendumId));
      } else {
        await this.db
          .update(referendums)
          .set({ optionBVotes: sql`${referendums.optionBVotes} + 1` })
          .where(eq(referendums.referendumId, referendumId));
      }
    }, undefined);
  }

  async closeReferendum(input: {
    referendumId: string;
    closedAtGameMs: number;
    winningOption: 'a' | 'b';
    consequenceSummary: string;
  }) {
    return this.run(async () => {
      const rows = await this.db
        .update(referendums)
        .set({
          status: 'closed',
          closedAtGameMs: BigInt(input.closedAtGameMs),
          winningOption: input.winningOption,
          consequenceSummary: input.consequenceSummary,
        })
        .where(eq(referendums.referendumId, input.referendumId))
        .returning();
      return rows[0] ? mapReferendum(rows[0]) : null;
    }, null);
  }

  async listClosedReferendums(limit = 10) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(referendums)
        .where(eq(referendums.status, 'closed'))
        .orderBy(desc(referendums.closedAtGameMs))
        .limit(limit);
      return rows.map(mapReferendum);
    }, []);
  }

  async listMarketplaceItems() {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(marketplaceCatalog)
        .where(eq(marketplaceCatalog.enabled, true))
        .orderBy(asc(marketplaceCatalog.name));
      return rows.map(mapMarketplaceItem);
    }, []);
  }

  async findMarketplaceItem(itemId: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(marketplaceCatalog)
        .where(eq(marketplaceCatalog.itemId, itemId))
        .limit(1);
      return rows[0] ? mapMarketplaceItem(rows[0]) : null;
    }, null);
  }

  async findInventoryByIdempotencyKey(idempotencyKey: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(citizenInventory)
        .where(eq(citizenInventory.idempotencyKey, idempotencyKey))
        .limit(1);
      return rows[0] ? mapInventory(rows[0]) : null;
    }, null);
  }

  async listInventoryByCitizen(citizenId: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(citizenInventory)
        .where(eq(citizenInventory.citizenId, citizenId))
        .orderBy(desc(citizenInventory.acquiredAtGameMs));
      return rows.map(mapInventory);
    }, []);
  }

  async addInventoryItem(input: {
    inventoryId: string;
    citizenId: string;
    itemId: string;
    acquiredAtGameMs: number;
    purchasePriceMinor?: bigint | null;
    purchasePriceIndexBps?: number | null;
    idempotencyKey: string;
  }) {
    return this.run(async () => {
      const existing = await this.findInventoryByIdempotencyKey(input.idempotencyKey);
      if (existing) return { record: existing, created: false };

      const rows = await this.db
        .insert(citizenInventory)
        .values({
          inventoryId: input.inventoryId,
          citizenId: input.citizenId,
          itemId: input.itemId,
          acquiredAtGameMs: BigInt(input.acquiredAtGameMs),
          purchasePriceMinor: input.purchasePriceMinor ?? null,
          purchasePriceIndexBps: input.purchasePriceIndexBps ?? null,
          idempotencyKey: input.idempotencyKey,
        })
        .returning();
      return { record: mapInventory(rows[0]!), created: true };
    }, null);
  }

  async removeInventoryItem(inventoryId: string, citizenId: string) {
    return this.run(async () => {
      const rows = await this.db
        .delete(citizenInventory)
        .where(
          and(eq(citizenInventory.inventoryId, inventoryId), eq(citizenInventory.citizenId, citizenId)),
        )
        .returning();
      return rows.length > 0;
    }, false);
  }

  async listJobOffers() {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(jobOffers)
        .where(eq(jobOffers.enabled, true))
        .orderBy(asc(jobOffers.title));
      return rows.map(mapJobOffer);
    }, []);
  }

  async findJobOffer(offerId: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(jobOffers)
        .where(eq(jobOffers.offerId, offerId))
        .limit(1);
      return rows[0] ? mapJobOffer(rows[0]) : null;
    }, null);
  }

  async getEmployment(citizenId: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(citizenEmployment)
        .where(eq(citizenEmployment.citizenId, citizenId))
        .limit(1);
      return rows[0] ? mapEmployment(rows[0]) : null;
    }, null);
  }

  async upsertEmployment(input: {
    citizenId: string;
    employmentState: string;
    currentOfferId?: string | null;
    hiredAtGameMs?: number | null;
    updatedAtGameMs: number;
    idempotencyKey: string;
  }) {
    return this.run(async () => {
      const existingByKey = await this.db
        .select()
        .from(citizenEmployment)
        .where(sql`${citizenEmployment.citizenId} = ${input.citizenId}`)
        .limit(1);

      const rows = await this.db
        .insert(citizenEmployment)
        .values({
          citizenId: input.citizenId,
          employmentState: input.employmentState,
          currentOfferId: input.currentOfferId ?? null,
          hiredAtGameMs:
            input.hiredAtGameMs === undefined || input.hiredAtGameMs === null
              ? null
              : BigInt(input.hiredAtGameMs),
          updatedAtGameMs: BigInt(input.updatedAtGameMs),
        })
        .onConflictDoUpdate({
          target: citizenEmployment.citizenId,
          set: {
            employmentState: input.employmentState,
            currentOfferId: input.currentOfferId ?? null,
            hiredAtGameMs:
              input.hiredAtGameMs === undefined || input.hiredAtGameMs === null
                ? null
                : BigInt(input.hiredAtGameMs),
            updatedAtGameMs: BigInt(input.updatedAtGameMs),
          },
        })
        .returning();

      return {
        record: mapEmployment(rows[0]!),
        created: existingByKey.length === 0,
      };
    }, null);
  }

  async findEmploymentByIdempotencyKey(idempotencyKey: string) {
    void idempotencyKey;
    return null;
  }

  async createJobApplication(input: {
    applicationId: string;
    citizenId: string;
    offerId: string;
    decision: 'accepted' | 'rejected';
    decidedAtGameMs: number;
    idempotencyKey: string;
  }) {
    return this.run(async () => {
      const existing = await this.db
        .select()
        .from(citizenJobApplications)
        .where(eq(citizenJobApplications.idempotencyKey, input.idempotencyKey))
        .limit(1);
      if (existing[0]) {
        return { record: mapJobApplication(existing[0]), created: false };
      }

      const rows = await this.db
        .insert(citizenJobApplications)
        .values({
          applicationId: input.applicationId,
          citizenId: input.citizenId,
          offerId: input.offerId,
          decision: input.decision,
          decidedAtGameMs: BigInt(input.decidedAtGameMs),
          idempotencyKey: input.idempotencyKey,
        })
        .returning();
      return { record: mapJobApplication(rows[0]!), created: true };
    }, null);
  }

  async findJobApplicationByIdempotencyKey(idempotencyKey: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(citizenJobApplications)
        .where(eq(citizenJobApplications.idempotencyKey, idempotencyKey))
        .limit(1);
      return rows[0] ? mapJobApplication(rows[0]) : null;
    }, null);
  }

  async listJobEngagements(citizenId: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(citizenJobEngagements)
        .where(eq(citizenJobEngagements.citizenId, citizenId));
      return rows.map(mapJobEngagement);
    }, []);
  }

  async getJobEngagement(citizenId: string, offerId: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(citizenJobEngagements)
        .where(
          and(
            eq(citizenJobEngagements.citizenId, citizenId),
            eq(citizenJobEngagements.offerId, offerId),
          ),
        )
        .limit(1);
      return rows[0] ? mapJobEngagement(rows[0]) : null;
    }, null);
  }

  async upsertJobEngagement(input: {
    citizenId: string;
    offerId: string;
    status: CitizenJobEngagementRecord['status'];
    hiredAtGameMs?: number | null;
    shiftStartedAtGameMs?: number | null;
    shiftEndsAtGameMs?: number | null;
    blockedUntilGameMs?: number | null;
    lastApplicationId?: string | null;
    updatedAtGameMs: number;
  }) {
    return this.run(async () => {
      const rows = await this.db
        .insert(citizenJobEngagements)
        .values({
          citizenId: input.citizenId,
          offerId: input.offerId,
          status: input.status,
          hiredAtGameMs:
            input.hiredAtGameMs === undefined || input.hiredAtGameMs === null
              ? null
              : BigInt(input.hiredAtGameMs),
          shiftStartedAtGameMs:
            input.shiftStartedAtGameMs === undefined || input.shiftStartedAtGameMs === null
              ? null
              : BigInt(input.shiftStartedAtGameMs),
          shiftEndsAtGameMs:
            input.shiftEndsAtGameMs === undefined || input.shiftEndsAtGameMs === null
              ? null
              : BigInt(input.shiftEndsAtGameMs),
          blockedUntilGameMs:
            input.blockedUntilGameMs === undefined || input.blockedUntilGameMs === null
              ? null
              : BigInt(input.blockedUntilGameMs),
          lastApplicationId: input.lastApplicationId ?? null,
          updatedAtGameMs: BigInt(input.updatedAtGameMs),
        })
        .onConflictDoUpdate({
          target: [citizenJobEngagements.citizenId, citizenJobEngagements.offerId],
          set: {
            status: input.status,
            hiredAtGameMs:
              input.hiredAtGameMs === undefined || input.hiredAtGameMs === null
                ? null
                : BigInt(input.hiredAtGameMs),
            shiftStartedAtGameMs:
              input.shiftStartedAtGameMs === undefined || input.shiftStartedAtGameMs === null
                ? null
                : BigInt(input.shiftStartedAtGameMs),
            shiftEndsAtGameMs:
              input.shiftEndsAtGameMs === undefined || input.shiftEndsAtGameMs === null
                ? null
                : BigInt(input.shiftEndsAtGameMs),
            blockedUntilGameMs:
              input.blockedUntilGameMs === undefined || input.blockedUntilGameMs === null
                ? null
                : BigInt(input.blockedUntilGameMs),
            lastApplicationId: input.lastApplicationId ?? null,
            updatedAtGameMs: BigInt(input.updatedAtGameMs),
          },
        })
        .returning();
      return mapJobEngagement(rows[0]!);
    }, null);
  }

  async createMessage(input: {
    messageId: string;
    fromCitizenId: string;
    toCitizenId: string;
    body: string;
    sentAtGameMs: number;
    idempotencyKey: string;
  }) {
    return this.run(async () => {
      const existing = await this.findMessageByIdempotencyKey(input.idempotencyKey);
      if (existing) return { record: existing, created: false };

      const rows = await this.db
        .insert(citizenMessages)
        .values({
          messageId: input.messageId,
          fromCitizenId: input.fromCitizenId,
          toCitizenId: input.toCitizenId,
          body: input.body,
          sentAtGameMs: BigInt(input.sentAtGameMs),
          idempotencyKey: input.idempotencyKey,
        })
        .returning();
      return { record: mapMessage(rows[0]!), created: true };
    }, null);
  }

  async findMessageByIdempotencyKey(idempotencyKey: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(citizenMessages)
        .where(eq(citizenMessages.idempotencyKey, idempotencyKey))
        .limit(1);
      return rows[0] ? mapMessage(rows[0]) : null;
    }, null);
  }

  async recordEconomicSnapshot(input: {
    snapshotId: string;
    citizenId: string;
    recordedAtGameMs: number;
    cashMinor: bigint;
    inventoryValueMinor: bigint;
    netWorthMinor: bigint;
    idempotencyKey: string;
  }) {
    return this.run(async () => {
      const existing = await this.db
        .select()
        .from(citizenEconomicSnapshots)
        .where(eq(citizenEconomicSnapshots.idempotencyKey, input.idempotencyKey))
        .limit(1);
      if (existing[0]) {
        return { record: mapSnapshot(existing[0]), created: false };
      }

      const rows = await this.db
        .insert(citizenEconomicSnapshots)
        .values({
          snapshotId: input.snapshotId,
          citizenId: input.citizenId,
          recordedAtGameMs: BigInt(input.recordedAtGameMs),
          cashMinor: input.cashMinor,
          inventoryValueMinor: input.inventoryValueMinor,
          netWorthMinor: input.netWorthMinor,
          idempotencyKey: input.idempotencyKey,
        })
        .returning();
      return { record: mapSnapshot(rows[0]!), created: true };
    }, null);
  }

  async listEconomicSnapshots(citizenId: string, limit = 30) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(citizenEconomicSnapshots)
        .where(eq(citizenEconomicSnapshots.citizenId, citizenId))
        .orderBy(desc(citizenEconomicSnapshots.recordedAtGameMs))
        .limit(limit);
      return rows.map(mapSnapshot);
    }, []);
  }

  async recordInflationSnapshot(input: {
    snapshotId: string;
    recordedAtGameMs: number;
    inflationRateBps: number;
    priceIndexBps: number;
    treasuryMinor: bigint;
    idempotencyKey: string;
  }) {
    return this.run(async () => {
      const existing = await this.db
        .select()
        .from(municipalityInflationHistory)
        .where(eq(municipalityInflationHistory.idempotencyKey, input.idempotencyKey))
        .limit(1);
      if (existing[0]) {
        return { record: mapInflationSnapshot(existing[0]), created: false };
      }

      const rows = await this.db
        .insert(municipalityInflationHistory)
        .values({
          snapshotId: input.snapshotId,
          recordedAtGameMs: BigInt(input.recordedAtGameMs),
          inflationRateBps: input.inflationRateBps,
          priceIndexBps: input.priceIndexBps,
          treasuryMinor: input.treasuryMinor,
          idempotencyKey: input.idempotencyKey,
        })
        .returning();
      return { record: mapInflationSnapshot(rows[0]!), created: true };
    }, null);
  }

  async listInflationHistory(limit = 500) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(municipalityInflationHistory)
        .orderBy(desc(municipalityInflationHistory.recordedAtGameMs))
        .limit(limit);
      return rows.map(mapInflationSnapshot);
    }, []);
  }

  async recordChronicleEntry(input: {
    entryId: string;
    recordedAtGameMs: number;
    category: string;
    title: string;
    body: string;
    idempotencyKey: string;
  }) {
    return this.run(async () => {
      const existing = await this.db
        .select()
        .from(municipalityChronicle)
        .where(eq(municipalityChronicle.idempotencyKey, input.idempotencyKey))
        .limit(1);
      if (existing[0]) {
        return { record: mapChronicle(existing[0]), created: false };
      }

      const rows = await this.db
        .insert(municipalityChronicle)
        .values({
          entryId: input.entryId,
          recordedAtGameMs: BigInt(input.recordedAtGameMs),
          category: input.category,
          title: input.title,
          body: input.body,
          idempotencyKey: input.idempotencyKey,
        })
        .returning();
      return { record: mapChronicle(rows[0]!), created: true };
    }, null);
  }

  async listChronicleEntries(limit = 20) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(municipalityChronicle)
        .orderBy(desc(municipalityChronicle.recordedAtGameMs))
        .limit(limit);
      return rows.map(mapChronicle);
    }, []);
  }

  async listActivePlayerListings(limit = 50) {
    return this.run(async () => {
      try {
        const rows = await this.db
          .select()
          .from(marketplacePlayerListings)
          .where(eq(marketplacePlayerListings.status, 'active'))
          .orderBy(desc(marketplacePlayerListings.listedAtGameMs))
          .limit(limit);
        return rows.map((row) => ({
          listingId: row.listingId,
          sellerCitizenId: row.sellerCitizenId,
          inventoryId: row.inventoryId,
          itemId: row.itemId,
          listingType: row.listingType as 'sale' | 'rent',
          priceMinor: row.priceMinor,
          listedAtGameMs: Number(row.listedAtGameMs),
          expiresAtGameMs: row.expiresAtGameMs != null ? Number(row.expiresAtGameMs) : null,
          npcResolveAfterGameMs:
            row.npcResolveAfterGameMs != null ? Number(row.npcResolveAfterGameMs) : null,
          status: row.status,
          idempotencyKey: row.idempotencyKey,
        }));
      } catch {
        return [];
      }
    }, []);
  }

  async findPlayerListing(listingId: string) {
    return this.run(async () => {
      const rows = await this.db
        .select()
        .from(marketplacePlayerListings)
        .where(eq(marketplacePlayerListings.listingId, listingId))
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      return {
        listingId: row.listingId,
        sellerCitizenId: row.sellerCitizenId,
        inventoryId: row.inventoryId,
        itemId: row.itemId,
        listingType: row.listingType as 'sale' | 'rent',
        priceMinor: row.priceMinor,
        listedAtGameMs: Number(row.listedAtGameMs),
        expiresAtGameMs: row.expiresAtGameMs != null ? Number(row.expiresAtGameMs) : null,
        npcResolveAfterGameMs:
          row.npcResolveAfterGameMs != null ? Number(row.npcResolveAfterGameMs) : null,
        status: row.status,
        idempotencyKey: row.idempotencyKey,
      };
    }, null);
  }

  async createPlayerListing(input: {
    listingId: string;
    sellerCitizenId: string;
    inventoryId: string;
    itemId: string;
    priceMinor: bigint;
    listedAtGameMs: number;
    idempotencyKey: string;
    listingType?: 'sale' | 'rent';
    npcResolveAfterGameMs?: number;
  }) {
    return this.run(async () => {
      const existing = await this.db
        .select()
        .from(marketplacePlayerListings)
        .where(eq(marketplacePlayerListings.idempotencyKey, input.idempotencyKey))
        .limit(1);
      if (existing[0]) {
        return { record: existing[0], created: false };
      }

      const rows = await this.db
        .insert(marketplacePlayerListings)
        .values({
          listingId: input.listingId,
          sellerCitizenId: input.sellerCitizenId,
          inventoryId: input.inventoryId,
          itemId: input.itemId,
          listingType: input.listingType ?? 'sale',
          priceMinor: input.priceMinor,
          listedAtGameMs: BigInt(input.listedAtGameMs),
          npcResolveAfterGameMs:
            input.npcResolveAfterGameMs != null
              ? BigInt(input.npcResolveAfterGameMs)
              : null,
          status: 'active',
          idempotencyKey: input.idempotencyKey,
        })
        .returning();
      return { record: rows[0]!, created: true };
    }, null);
  }

  async completePlayerListingWithNpc(input: {
    listingId: string;
    buyerNpcId: string;
    soldAtGameMs: number;
  }) {
    return this.run(async () => {
      const rows = await this.db
        .update(marketplacePlayerListings)
        .set({
          status: 'sold',
          buyerNpcId: input.buyerNpcId,
          soldAtGameMs: BigInt(input.soldAtGameMs),
        })
        .where(
          and(
            eq(marketplacePlayerListings.listingId, input.listingId),
            eq(marketplacePlayerListings.status, 'active'),
          ),
        )
        .returning();
      return rows[0] ?? null;
    }, null);
  }

  async listListingsReadyForNpcResolution(gameTimeMs: number) {
    return this.run(async () => {
      try {
        const rows = await this.db
          .select()
          .from(marketplacePlayerListings)
          .where(
            and(
              eq(marketplacePlayerListings.status, 'active'),
              lte(marketplacePlayerListings.npcResolveAfterGameMs, BigInt(gameTimeMs)),
            ),
          )
          .limit(50);
        return rows.map((row) => ({
          listingId: row.listingId,
          sellerCitizenId: row.sellerCitizenId,
          inventoryId: row.inventoryId,
          itemId: row.itemId,
          listingType: row.listingType as 'sale' | 'rent',
          priceMinor: row.priceMinor,
          listedAtGameMs: Number(row.listedAtGameMs),
          npcResolveAfterGameMs:
            row.npcResolveAfterGameMs != null ? Number(row.npcResolveAfterGameMs) : null,
          status: row.status,
          idempotencyKey: row.idempotencyKey,
        }));
      } catch {
        return [];
      }
    }, []);
  }

  async completePlayerListing(input: {
    listingId: string;
    buyerCitizenId: string;
    soldAtGameMs: number;
  }) {
    return this.run(async () => {
      const rows = await this.db
        .update(marketplacePlayerListings)
        .set({
          status: 'sold',
          buyerCitizenId: input.buyerCitizenId,
          soldAtGameMs: BigInt(input.soldAtGameMs),
        })
        .where(
          and(
            eq(marketplacePlayerListings.listingId, input.listingId),
            eq(marketplacePlayerListings.status, 'active'),
          ),
        )
        .returning();
      return rows[0] ?? null;
    }, null);
  }

  async transferInventoryOwnership(inventoryId: string, newCitizenId: string) {
    return this.run(async () => {
      const rows = await this.db
        .update(citizenInventory)
        .set({ citizenId: newCitizenId })
        .where(eq(citizenInventory.inventoryId, inventoryId))
        .returning();
      return rows[0] ?? null;
    }, null);
  }

  async createCitizenRental(input: {
    rentalId: string;
    tenantCitizenId?: string | null;
    tenantNpcId?: string | null;
    ownerCitizenId: string | null;
    itemId: string;
    listingId?: string | null;
    startedAtGameMs: number;
    expiresAtGameMs: number;
    monthlyRentMinor?: bigint;
    idempotencyKey: string;
  }) {
    return this.run(async () => {
      try {
        const existing = await this.db
          .select()
          .from(citizenRentals)
          .where(eq(citizenRentals.idempotencyKey, input.idempotencyKey))
          .limit(1);
        if (existing[0]) {
          return { record: existing[0], created: false };
        }

        const rows = await this.db
          .insert(citizenRentals)
          .values({
            rentalId: input.rentalId,
            tenantCitizenId: input.tenantCitizenId ?? null,
            tenantNpcId: input.tenantNpcId ?? null,
            ownerCitizenId: input.ownerCitizenId,
            itemId: input.itemId,
            listingId: input.listingId ?? null,
            startedAtGameMs: BigInt(input.startedAtGameMs),
            expiresAtGameMs: BigInt(input.expiresAtGameMs),
            monthlyRentMinor: input.monthlyRentMinor ?? null,
            status: 'active',
            idempotencyKey: input.idempotencyKey,
          })
          .returning();
        return { record: rows[0]!, created: true };
      } catch {
        return null;
      }
    }, null);
  }

  async listActiveRentalsByOwner(ownerCitizenId: string) {
    return this.run(async () => {
      try {
        const rows = await this.db
          .select()
          .from(citizenRentals)
          .where(
            and(
              eq(citizenRentals.ownerCitizenId, ownerCitizenId),
              eq(citizenRentals.status, 'active'),
            ),
          );
        return rows.map((row) => ({
          rentalId: row.rentalId,
          tenantCitizenId: row.tenantCitizenId,
          tenantNpcId: row.tenantNpcId,
          ownerCitizenId: row.ownerCitizenId,
          itemId: row.itemId,
          listingId: row.listingId,
          startedAtGameMs: Number(row.startedAtGameMs),
          expiresAtGameMs: Number(row.expiresAtGameMs),
          monthlyRentMinor: row.monthlyRentMinor,
          status: row.status,
          idempotencyKey: row.idempotencyKey,
        }));
      } catch {
        return [];
      }
    }, []);
  }

  async terminateRental(rentalId: string, status: string) {
    return this.run(async () => {
      try {
        const rows = await this.db
          .update(citizenRentals)
          .set({ status })
          .where(eq(citizenRentals.rentalId, rentalId))
          .returning();
        return rows[0] ?? null;
      } catch {
        return null;
      }
    }, null);
  }

  async listActiveRentalsByTenant(tenantCitizenId: string) {
    return this.run(async () => {
      try {
        const rows = await this.db
          .select()
          .from(citizenRentals)
          .where(
            and(
              eq(citizenRentals.tenantCitizenId, tenantCitizenId),
              eq(citizenRentals.status, 'active'),
            ),
          );
        return rows.map((row) => ({
          rentalId: row.rentalId,
          tenantCitizenId: row.tenantCitizenId,
          tenantNpcId: row.tenantNpcId,
          ownerCitizenId: row.ownerCitizenId,
          itemId: row.itemId,
          listingId: row.listingId,
          startedAtGameMs: Number(row.startedAtGameMs),
          expiresAtGameMs: Number(row.expiresAtGameMs),
          monthlyRentMinor: row.monthlyRentMinor,
          status: row.status,
          idempotencyKey: row.idempotencyKey,
        }));
      } catch {
        return [];
      }
    }, []);
  }

  async expireRentalsBefore(gameTimeMs: number) {
    return this.run(async () => {
      try {
        await this.db
          .update(citizenRentals)
          .set({ status: 'expired' })
          .where(
            and(
              eq(citizenRentals.status, 'active'),
              lte(citizenRentals.expiresAtGameMs, BigInt(gameTimeMs)),
            ),
          );
      } catch {
        // table may not exist yet
      }
    }, undefined);
  }
}
