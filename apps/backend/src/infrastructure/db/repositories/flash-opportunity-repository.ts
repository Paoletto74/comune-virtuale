import { and, eq, gt, lte, sql } from 'drizzle-orm';
import type { Database } from '../client.js';
import { citizenFlashSpawnState, flashOpportunities } from '../schema/index.js';
import type {
  CitizenFlashSpawnStateRecord,
  CitizenFlashSpawnStateRepository,
  FlashOpportunityRecord,
  FlashOpportunityRepository,
} from '../../../domain/ports/repositories.js';
import type { FlashOpportunityStatus } from '../schema/index.js';

function mapOpportunity(row: typeof flashOpportunities.$inferSelect): FlashOpportunityRecord {
  return {
    opportunityId: row.opportunityId,
    citizenId: row.citizenId,
    type: row.type,
    templateId: row.templateId,
    title: row.title,
    body: row.body,
    sourceContext: (row.sourceContext ?? {}) as Record<string, unknown>,
    reward: (row.reward ?? {}) as Record<string, unknown>,
    risk: (row.risk ?? null) as Record<string, unknown> | null,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    status: row.status,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    idempotencyKey: row.idempotencyKey,
  };
}

function mapSpawnState(row: typeof citizenFlashSpawnState.$inferSelect): CitizenFlashSpawnStateRecord {
  return {
    citizenId: row.citizenId,
    spawnCycle: row.spawnCycle,
    anticipationStartedAt: row.anticipationStartedAt,
    anticipationDurationMs: row.anticipationDurationMs,
    anticipationLabel: row.anticipationLabel,
    nextSpawnEligibleAt: row.nextSpawnEligibleAt,
    lastOpportunityAt: row.lastOpportunityAt,
    lastExpiredNotice: row.lastExpiredNotice,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleFlashOpportunityRepository implements FlashOpportunityRepository {
  constructor(private readonly db: Database) {}

  async findById(opportunityId: string) {
    const rows = await this.db
      .select()
      .from(flashOpportunities)
      .where(eq(flashOpportunities.opportunityId, opportunityId))
      .limit(1);
    const row = rows[0];
    return row ? mapOpportunity(row) : null;
  }

  async findByIdempotencyKey(citizenId: string, idempotencyKey: string) {
    const rows = await this.db
      .select()
      .from(flashOpportunities)
      .where(
        and(
          eq(flashOpportunities.citizenId, citizenId),
          eq(flashOpportunities.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapOpportunity(row) : null;
  }

  async findPendingByCitizenId(citizenId: string, now: Date) {
    const rows = await this.db
      .select()
      .from(flashOpportunities)
      .where(
        and(
          eq(flashOpportunities.citizenId, citizenId),
          eq(flashOpportunities.status, 'pending'),
          gt(flashOpportunities.expiresAt, now),
        ),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapOpportunity(row) : null;
  }

  async countPendingByCitizenId(citizenId: string) {
    const rows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(flashOpportunities)
      .where(
        and(eq(flashOpportunities.citizenId, citizenId), eq(flashOpportunities.status, 'pending')),
      );
    return rows[0]?.count ?? 0;
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
    if (existing) {
      return { record: existing, created: false };
    }

    const rows = await this.db
      .insert(flashOpportunities)
      .values({
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
        idempotencyKey: input.idempotencyKey,
        metadata: input.metadata ?? {},
        status: 'pending',
      })
      .returning();

    return { record: mapOpportunity(rows[0]!), created: true };
  }

  async updateStatus(opportunityId: string, status: string, metadata?: Record<string, unknown>) {
    const rows = await this.db
      .update(flashOpportunities)
      .set({
        status: status as FlashOpportunityStatus,
        ...(metadata ? { metadata } : {}),
      })
      .where(eq(flashOpportunities.opportunityId, opportunityId))
      .returning();
    return mapOpportunity(rows[0]!);
  }

  async expirePendingBefore(citizenId: string, now: Date) {
    const rows = await this.db
      .update(flashOpportunities)
      .set({ status: 'expired' })
      .where(
        and(
          eq(flashOpportunities.citizenId, citizenId),
          eq(flashOpportunities.status, 'pending'),
          lte(flashOpportunities.expiresAt, now),
        ),
      )
      .returning();
    return rows.map(mapOpportunity);
  }
}

export class DrizzleCitizenFlashSpawnStateRepository implements CitizenFlashSpawnStateRepository {
  constructor(private readonly db: Database) {}

  async findByCitizenId(citizenId: string) {
    const rows = await this.db
      .select()
      .from(citizenFlashSpawnState)
      .where(eq(citizenFlashSpawnState.citizenId, citizenId))
      .limit(1);
    const row = rows[0];
    return row ? mapSpawnState(row) : null;
  }

  async ensureState(citizenId: string) {
    const existing = await this.findByCitizenId(citizenId);
    if (existing) return existing;

    const rows = await this.db
      .insert(citizenFlashSpawnState)
      .values({ citizenId })
      .onConflictDoNothing()
      .returning();

    if (rows[0]) return mapSpawnState(rows[0]);

    const fallback = await this.findByCitizenId(citizenId);
    if (!fallback) throw new Error(`Failed to ensure flash spawn state for ${citizenId}`);
    return fallback;
  }

  async save(input: CitizenFlashSpawnStateRecord) {
    const rows = await this.db
      .insert(citizenFlashSpawnState)
      .values({
        citizenId: input.citizenId,
        spawnCycle: input.spawnCycle,
        anticipationStartedAt: input.anticipationStartedAt,
        anticipationDurationMs: input.anticipationDurationMs,
        anticipationLabel: input.anticipationLabel,
        nextSpawnEligibleAt: input.nextSpawnEligibleAt,
        lastOpportunityAt: input.lastOpportunityAt,
        lastExpiredNotice: input.lastExpiredNotice,
        metadata: input.metadata,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: citizenFlashSpawnState.citizenId,
        set: {
          spawnCycle: input.spawnCycle,
          anticipationStartedAt: input.anticipationStartedAt,
          anticipationDurationMs: input.anticipationDurationMs,
          anticipationLabel: input.anticipationLabel,
          nextSpawnEligibleAt: input.nextSpawnEligibleAt,
          lastOpportunityAt: input.lastOpportunityAt,
          lastExpiredNotice: input.lastExpiredNotice,
          metadata: input.metadata,
          updatedAt: new Date(),
        },
      })
      .returning();
    return mapSpawnState(rows[0]!);
  }
}
