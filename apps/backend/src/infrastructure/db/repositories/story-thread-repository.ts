import { and, desc, eq, lte, or, sql } from 'drizzle-orm';
import type { Database } from '../client.js';
import { storyThreads } from '../schema/index.js';
import type { StoryThreadRepository } from '../../../domain/ports/repositories.js';
import type {
  StoryThreadContext,
  StoryThreadRecord,
  StoryThreadStatus,
  StoryThreadType,
} from '../../../application/story/story-thread-types.js';

function mapThread(row: typeof storyThreads.$inferSelect): StoryThreadRecord {
  return {
    threadId: row.threadId,
    citizenId: row.citizenId,
    type: row.type as StoryThreadType,
    status: row.status as StoryThreadStatus,
    origin: row.origin,
    stage: row.stage,
    priority: row.priority,
    createdAtGameMs: Number(row.createdAtGameMs),
    lastActivityGameMs: Number(row.lastActivityGameMs),
    dormantUntilGameMs: row.dormantUntilGameMs === null ? null : Number(row.dormantUntilGameMs),
    expiresAtGameMs: row.expiresAtGameMs === null ? null : Number(row.expiresAtGameMs),
    context: (row.context ?? {}) as unknown as StoryThreadContext,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    idempotencyKey: row.idempotencyKey,
  };
}

export class DrizzleStoryThreadRepository implements StoryThreadRepository {
  constructor(private readonly db: Database) {}

  async findById(threadId: string) {
    const rows = await this.db
      .select()
      .from(storyThreads)
      .where(eq(storyThreads.threadId, threadId))
      .limit(1);
    return rows[0] ? mapThread(rows[0]) : null;
  }

  async findByIdempotencyKey(idempotencyKey: string) {
    const rows = await this.db
      .select()
      .from(storyThreads)
      .where(eq(storyThreads.idempotencyKey, idempotencyKey))
      .limit(1);
    return rows[0] ? mapThread(rows[0]) : null;
  }

  async listByCitizenId(citizenId: string) {
    const rows = await this.db
      .select()
      .from(storyThreads)
      .where(eq(storyThreads.citizenId, citizenId))
      .orderBy(desc(storyThreads.lastActivityGameMs));
    return rows.map(mapThread);
  }

  async listActiveForSelection(citizenId: string, gameTimeMs: number) {
    const rows = await this.db
      .select()
      .from(storyThreads)
      .where(
        and(
          eq(storyThreads.citizenId, citizenId),
          eq(storyThreads.status, 'active'),
          or(
            sql`${storyThreads.expiresAtGameMs} IS NULL`,
            sql`${storyThreads.expiresAtGameMs} > ${BigInt(gameTimeMs)}`,
          ),
        ),
      )
      .orderBy(desc(storyThreads.priority), desc(storyThreads.lastActivityGameMs));
    return rows.map(mapThread);
  }

  async countActiveByCitizenId(citizenId: string, gameTimeMs: number) {
    const rows = await this.listActiveForSelection(citizenId, gameTimeMs);
    return rows.length;
  }

  async createThread(input: Parameters<StoryThreadRepository['createThread']>[0]) {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { record: existing, created: false };

    const rows = await this.db
      .insert(storyThreads)
      .values({
        threadId: input.threadId,
        citizenId: input.citizenId,
        type: input.type,
        status: input.status,
        origin: input.origin,
        stage: input.stage,
        priority: input.priority,
        createdAtGameMs: BigInt(input.createdAtGameMs),
        lastActivityGameMs: BigInt(input.lastActivityGameMs),
        dormantUntilGameMs:
          input.dormantUntilGameMs === undefined || input.dormantUntilGameMs === null
            ? null
            : BigInt(input.dormantUntilGameMs),
        expiresAtGameMs:
          input.expiresAtGameMs === undefined || input.expiresAtGameMs === null
            ? null
            : BigInt(input.expiresAtGameMs),
        context: input.context,
        metadata: input.metadata ?? {},
        idempotencyKey: input.idempotencyKey,
      })
      .returning();

    return { record: mapThread(rows[0]!), created: true };
  }

  async updateThread(threadId: string, patch: Parameters<StoryThreadRepository['updateThread']>[1]) {
    const rows = await this.db
      .update(storyThreads)
      .set({
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.stage !== undefined ? { stage: patch.stage } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.lastActivityGameMs !== undefined
          ? { lastActivityGameMs: BigInt(patch.lastActivityGameMs) }
          : {}),
        ...(patch.dormantUntilGameMs !== undefined
          ? {
              dormantUntilGameMs:
                patch.dormantUntilGameMs === null ? null : BigInt(patch.dormantUntilGameMs),
            }
          : {}),
        ...(patch.expiresAtGameMs !== undefined
          ? {
              expiresAtGameMs:
                patch.expiresAtGameMs === null ? null : BigInt(patch.expiresAtGameMs),
            }
          : {}),
        ...(patch.context !== undefined ? { context: patch.context } : {}),
        ...(patch.metadata !== undefined ? { metadata: patch.metadata } : {}),
      })
      .where(eq(storyThreads.threadId, threadId))
      .returning();
    return mapThread(rows[0]!);
  }

  async expireThreadsBefore(citizenId: string, gameTimeMs: number) {
    const rows = await this.db
      .update(storyThreads)
      .set({ status: 'abandoned' })
      .where(
        and(
          eq(storyThreads.citizenId, citizenId),
          or(eq(storyThreads.status, 'active'), eq(storyThreads.status, 'dormant')),
          sql`${storyThreads.expiresAtGameMs} IS NOT NULL`,
          lte(storyThreads.expiresAtGameMs, BigInt(gameTimeMs)),
        ),
      )
      .returning();
    return rows.map(mapThread);
  }

  async reactivateDormantThreads(citizenId: string, gameTimeMs: number) {
    const rows = await this.db
      .update(storyThreads)
      .set({ status: 'active', lastActivityGameMs: BigInt(gameTimeMs) })
      .where(
        and(
          eq(storyThreads.citizenId, citizenId),
          eq(storyThreads.status, 'dormant'),
          lte(storyThreads.dormantUntilGameMs, BigInt(gameTimeMs)),
          or(
            sql`${storyThreads.expiresAtGameMs} IS NULL`,
            sql`${storyThreads.expiresAtGameMs} > ${BigInt(gameTimeMs)}`,
          ),
        ),
      )
      .returning();
    return rows.map(mapThread);
  }
}
