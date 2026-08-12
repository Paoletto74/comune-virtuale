import { and, desc, eq, sql } from 'drizzle-orm';
import type { Database } from '../client.js';
import { citizenLifeEvolutionState, citizenTemporalEvents, taskInstances } from '../schema/index.js';
import type {
  CitizenLifeEvolutionRepository,
  CitizenLifeEvolutionStateRecord,
  CitizenTemporalEventRecord,
  CitizenTemporalEventRepository,
} from '../../../domain/ports/repositories.js';

function mapLifeState(row: typeof citizenLifeEvolutionState.$inferSelect): CitizenLifeEvolutionStateRecord {
  return {
    citizenId: row.citizenId,
    lastLifeReviewWorldMs: row.lastLifeReviewWorldMs ? Number(row.lastLifeReviewWorldMs) : null,
    completedTasksAtLastReview: row.completedTasksAtLastReview,
    lifeReviewCount: row.lifeReviewCount,
    employmentState: row.employmentState,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    updatedAt: row.updatedAt,
  };
}

function mapEvent(row: typeof citizenTemporalEvents.$inferSelect): CitizenTemporalEventRecord {
  return {
    eventId: row.eventId,
    citizenId: row.citizenId,
    eventType: row.eventType,
    idempotencyKey: row.idempotencyKey,
    worldTimeMs: Number(row.worldTimeMs),
    realAt: row.realAt,
    status: row.status,
    title: row.title,
    body: row.body,
    payload: (row.payload ?? {}) as Record<string, unknown>,
  };
}

export class DrizzleCitizenLifeEvolutionRepository implements CitizenLifeEvolutionRepository {
  constructor(private readonly db: Database) {}

  async findByCitizenId(citizenId: string) {
    const rows = await this.db
      .select()
      .from(citizenLifeEvolutionState)
      .where(eq(citizenLifeEvolutionState.citizenId, citizenId))
      .limit(1);
    const row = rows[0];
    return row ? mapLifeState(row) : null;
  }

  async ensureState(citizenId: string) {
    const existing = await this.findByCitizenId(citizenId);
    if (existing) return existing;

    const rows = await this.db
      .insert(citizenLifeEvolutionState)
      .values({ citizenId })
      .onConflictDoNothing()
      .returning();

    if (rows[0]) return mapLifeState(rows[0]);

    const fallback = await this.findByCitizenId(citizenId);
    if (!fallback) throw new Error(`Failed to ensure life state for ${citizenId}`);
    return fallback;
  }

  async updateAfterLifeReview(input: {
    citizenId: string;
    worldTimeMs: number;
    completedTasksCount: number;
  }) {
    await this.ensureState(input.citizenId);
    const rows = await this.db
      .update(citizenLifeEvolutionState)
      .set({
        lastLifeReviewWorldMs: BigInt(input.worldTimeMs),
        completedTasksAtLastReview: input.completedTasksCount,
        lifeReviewCount: sql`${citizenLifeEvolutionState.lifeReviewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(citizenLifeEvolutionState.citizenId, input.citizenId))
      .returning();
    return mapLifeState(rows[0]!);
  }

  async setEmploymentState(citizenId: string, employmentState: string) {
    await this.ensureState(citizenId);
    const rows = await this.db
      .update(citizenLifeEvolutionState)
      .set({ employmentState, updatedAt: new Date() })
      .where(eq(citizenLifeEvolutionState.citizenId, citizenId))
      .returning();
    return mapLifeState(rows[0]!);
  }
}

export class DrizzleCitizenTemporalEventRepository implements CitizenTemporalEventRepository {
  constructor(private readonly db: Database) {}

  async findByIdempotencyKey(citizenId: string, idempotencyKey: string) {
    const rows = await this.db
      .select()
      .from(citizenTemporalEvents)
      .where(
        and(
          eq(citizenTemporalEvents.citizenId, citizenId),
          eq(citizenTemporalEvents.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapEvent(row) : null;
  }

  async recordEvent(input: {
    eventId: string;
    citizenId: string;
    eventType: string;
    idempotencyKey: string;
    worldTimeMs: number;
    realAt?: Date;
    status?: string;
    title?: string;
    body?: string;
    payload?: Record<string, unknown>;
  }) {
    const existing = await this.findByIdempotencyKey(input.citizenId, input.idempotencyKey);
    if (existing) {
      return { record: existing, created: false };
    }

    const rows = await this.db
      .insert(citizenTemporalEvents)
      .values({
        eventId: input.eventId,
        citizenId: input.citizenId,
        eventType: input.eventType,
        idempotencyKey: input.idempotencyKey,
        worldTimeMs: BigInt(input.worldTimeMs),
        realAt: input.realAt ?? new Date(),
        status: input.status ?? 'applied',
        title: input.title ?? null,
        body: input.body ?? null,
        payload: input.payload ?? {},
      })
      .returning();

    return { record: mapEvent(rows[0]!), created: true };
  }

  async listRecentByCitizen(citizenId: string, limit = 5) {
    const rows = await this.db
      .select()
      .from(citizenTemporalEvents)
      .where(eq(citizenTemporalEvents.citizenId, citizenId))
      .orderBy(desc(citizenTemporalEvents.worldTimeMs))
      .limit(limit);
    return rows.map(mapEvent);
  }

  async countCompletedTasks(citizenId: string) {
    const rows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(taskInstances)
      .where(and(eq(taskInstances.citizenId, citizenId), eq(taskInstances.status, 'completed')));
    return rows[0]?.count ?? 0;
  }
}
