import { eq } from 'drizzle-orm';
import { createWorldTimeSnapshot } from '@comune-virtuale/shared';
import type { Database } from '../client.js';
import { worldClock } from '../schema/index.js';
import type { WorldClockRepository } from '../../../domain/ports/repositories.js';

const WORLD_CLOCK_SCHEMA_VERSION_LOCAL = 1;

export class DrizzleWorldClockRepository implements WorldClockRepository {
  constructor(private readonly db: Database) {}

  async getSnapshot() {
    const rows = await this.db.select().from(worldClock).where(eq(worldClock.id, 1)).limit(1);
    const row = rows[0];
    if (!row) {
      throw new Error('World clock not initialized');
    }
    return createWorldTimeSnapshot(
      Number(row.worldTimeMs),
      row.timeScale,
      row.realUpdatedAt.getTime(),
      row.isPaused ?? false,
      row.schemaVersion ?? WORLD_CLOCK_SCHEMA_VERSION_LOCAL,
    );
  }

  async update(input: {
    worldTimeMs: bigint;
    timeScale: number;
    isPaused: boolean;
    schemaVersion: number;
  }) {
    const now = new Date();
    await this.db
      .update(worldClock)
      .set({
        worldTimeMs: input.worldTimeMs,
        timeScale: input.timeScale,
        isPaused: input.isPaused,
        schemaVersion: input.schemaVersion,
        realUpdatedAt: now,
      })
      .where(eq(worldClock.id, 1));
    return createWorldTimeSnapshot(
      Number(input.worldTimeMs),
      input.timeScale,
      now.getTime(),
      input.isPaused,
      input.schemaVersion,
    );
  }
}
