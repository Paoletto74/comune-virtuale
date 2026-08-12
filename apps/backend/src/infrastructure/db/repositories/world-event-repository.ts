import { and, desc, eq, lte, sql } from 'drizzle-orm';
import type { Database } from '../client.js';
import {
  citizenWorldEventNotices,
  worldEventSchedulerState,
  worldEvents,
} from '../schema/index.js';
import type { WorldEventRepository } from '../../../domain/ports/repositories.js';
import type {
  WorldEventEffects,
  WorldEventRecord,
  WorldEventScope,
  WorldEventSeverity,
  WorldEventStatus,
  WorldEventType,
} from '../../../application/world/world-event-types.js';

function mapEvent(row: typeof worldEvents.$inferSelect): WorldEventRecord {
  return {
    eventId: row.eventId,
    templateId: row.templateId,
    scope: row.scope as WorldEventScope,
    type: row.type as WorldEventType,
    status: row.status as WorldEventStatus,
    severity: row.severity as WorldEventSeverity,
    title: row.title,
    body: row.body,
    comuneLine: row.comuneLine,
    source: row.source,
    startedAtGameMs: Number(row.startedAtGameMs),
    endsAtGameMs: Number(row.endsAtGameMs),
    effects: (row.effects ?? {}) as WorldEventEffects,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    idempotencyKey: row.idempotencyKey,
    zoneId: row.zoneId,
    createdAt: row.createdAt,
  };
}

export class DrizzleWorldEventRepository implements WorldEventRepository {
  constructor(private readonly db: Database) {}

  async findById(eventId: string) {
    const rows = await this.db.select().from(worldEvents).where(eq(worldEvents.eventId, eventId)).limit(1);
    return rows[0] ? mapEvent(rows[0]) : null;
  }

  async findByIdempotencyKey(idempotencyKey: string) {
    const rows = await this.db
      .select()
      .from(worldEvents)
      .where(eq(worldEvents.idempotencyKey, idempotencyKey))
      .limit(1);
    return rows[0] ? mapEvent(rows[0]) : null;
  }

  async listActiveAtGameTime(gameTimeMs: number) {
    const rows = await this.db
      .select()
      .from(worldEvents)
      .where(
        and(
          eq(worldEvents.status, 'active'),
          lte(worldEvents.startedAtGameMs, BigInt(gameTimeMs)),
          sql`${worldEvents.endsAtGameMs} > ${BigInt(gameTimeMs)}`,
        ),
      )
      .orderBy(desc(worldEvents.startedAtGameMs));
    return rows.map(mapEvent);
  }

  async listByStatus(status: string) {
    const rows = await this.db
      .select()
      .from(worldEvents)
      .where(eq(worldEvents.status, status))
      .orderBy(desc(worldEvents.startedAtGameMs));
    return rows.map(mapEvent);
  }

  async createEvent(input: {
    eventId: string;
    templateId: string;
    scope: string;
    type: string;
    status: string;
    severity: string;
    title: string;
    body: string;
    comuneLine?: string;
    source?: string;
    startedAtGameMs: number;
    endsAtGameMs: number;
    effects: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    idempotencyKey: string;
    zoneId?: string;
  }) {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return { record: existing, created: false };
    }

    const rows = await this.db
      .insert(worldEvents)
      .values({
        eventId: input.eventId,
        templateId: input.templateId,
        scope: input.scope,
        type: input.type,
        status: input.status,
        severity: input.severity,
        title: input.title,
        body: input.body,
        comuneLine: input.comuneLine ?? null,
        source: input.source ?? 'system',
        startedAtGameMs: BigInt(input.startedAtGameMs),
        endsAtGameMs: BigInt(input.endsAtGameMs),
        effects: input.effects,
        metadata: input.metadata ?? {},
        idempotencyKey: input.idempotencyKey,
        zoneId: input.zoneId ?? null,
      })
      .returning();

    return { record: mapEvent(rows[0]!), created: true };
  }

  async updateStatus(eventId: string, status: string) {
    const rows = await this.db
      .update(worldEvents)
      .set({ status })
      .where(eq(worldEvents.eventId, eventId))
      .returning();
    return mapEvent(rows[0]!);
  }

  async endEventsBefore(gameTimeMs: number) {
    const rows = await this.db
      .update(worldEvents)
      .set({ status: 'ended' })
      .where(
        and(
          eq(worldEvents.status, 'active'),
          lte(worldEvents.endsAtGameMs, BigInt(gameTimeMs)),
        ),
      )
      .returning();
    return rows.map(mapEvent);
  }

  async getSchedulerState() {
    const rows = await this.db.select().from(worldEventSchedulerState).where(eq(worldEventSchedulerState.id, 1)).limit(1);
    const row = rows[0];
    if (!row) {
      return { lastEvaluatedGameMs: 0, spawnCycle: 0, lastSpawnedGameMs: null };
    }
    return {
      lastEvaluatedGameMs: Number(row.lastEvaluatedGameMs),
      spawnCycle: row.spawnCycle,
      lastSpawnedGameMs: row.lastSpawnedGameMs === null ? null : Number(row.lastSpawnedGameMs),
    };
  }

  async saveSchedulerState(input: {
    lastEvaluatedGameMs: number;
    spawnCycle: number;
    lastSpawnedGameMs?: number | null;
  }) {
    await this.db
      .insert(worldEventSchedulerState)
      .values({
        id: 1,
        lastEvaluatedGameMs: BigInt(input.lastEvaluatedGameMs),
        spawnCycle: input.spawnCycle,
        lastSpawnedGameMs:
          input.lastSpawnedGameMs === undefined || input.lastSpawnedGameMs === null
            ? null
            : BigInt(input.lastSpawnedGameMs),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: worldEventSchedulerState.id,
        set: {
          lastEvaluatedGameMs: BigInt(input.lastEvaluatedGameMs),
          spawnCycle: input.spawnCycle,
          lastSpawnedGameMs:
            input.lastSpawnedGameMs === undefined || input.lastSpawnedGameMs === null
              ? null
              : BigInt(input.lastSpawnedGameMs),
          updatedAt: new Date(),
        },
      });
  }

  async findLastEndedByTemplate(templateId: string) {
    const rows = await this.db
      .select()
      .from(worldEvents)
      .where(and(eq(worldEvents.templateId, templateId), eq(worldEvents.status, 'ended')))
      .orderBy(desc(worldEvents.endsAtGameMs))
      .limit(1);
    return rows[0] ? mapEvent(rows[0]) : null;
  }

  async recordCitizenNotice(input: {
    citizenId: string;
    worldEventId: string;
    idempotencyKey: string;
  }) {
    const existing = await this.hasCitizenNotice(input.citizenId, input.worldEventId);
    if (existing) return { created: false };

    await this.db.insert(citizenWorldEventNotices).values({
      citizenId: input.citizenId,
      worldEventId: input.worldEventId,
      idempotencyKey: input.idempotencyKey,
    });
    return { created: true };
  }

  async hasCitizenNotice(citizenId: string, worldEventId: string) {
    const rows = await this.db
      .select()
      .from(citizenWorldEventNotices)
      .where(
        and(
          eq(citizenWorldEventNotices.citizenId, citizenId),
          eq(citizenWorldEventNotices.worldEventId, worldEventId),
        ),
      )
      .limit(1);
    return Boolean(rows[0]);
  }

  async isPopupDismissed(citizenId: string, worldEventId: string) {
    const rows = await this.db
      .select({ popupDismissedAt: citizenWorldEventNotices.popupDismissedAt })
      .from(citizenWorldEventNotices)
      .where(
        and(
          eq(citizenWorldEventNotices.citizenId, citizenId),
          eq(citizenWorldEventNotices.worldEventId, worldEventId),
        ),
      )
      .limit(1);
    return Boolean(rows[0]?.popupDismissedAt);
  }

  async markPopupDismissed(citizenId: string, worldEventId: string) {
    const rows = await this.db
      .update(citizenWorldEventNotices)
      .set({ popupDismissedAt: new Date() })
      .where(
        and(
          eq(citizenWorldEventNotices.citizenId, citizenId),
          eq(citizenWorldEventNotices.worldEventId, worldEventId),
        ),
      )
      .returning({ popupDismissedAt: citizenWorldEventNotices.popupDismissedAt });
    return Boolean(rows[0]?.popupDismissedAt);
  }

  async activateScheduledEvents(gameTimeMs: number) {
    const rows = await this.db
      .update(worldEvents)
      .set({ status: 'active' })
      .where(
        and(
          eq(worldEvents.status, 'scheduled'),
          lte(worldEvents.startedAtGameMs, BigInt(gameTimeMs)),
          sql`${worldEvents.endsAtGameMs} > ${BigInt(gameTimeMs)}`,
        ),
      )
      .returning();
    return rows.map(mapEvent);
  }
}
