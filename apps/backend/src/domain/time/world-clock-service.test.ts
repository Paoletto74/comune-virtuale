import { describe, expect, it } from 'vitest';
import { WorldClockService } from '../../domain/time/world-clock-service.js';
import { createWorldTimeSnapshot } from '@comune-virtuale/shared';
import type { WorldClockRepository } from '../../domain/ports/repositories.js';

class InMemoryWorldClockRepo implements WorldClockRepository {
  private worldTimeMs = 0n;
  private timeScale = 1.0;
  private isPaused = false;
  private schemaVersion = 1;
  private realTimestampMs = 1_700_000_000_000;

  async getSnapshot() {
    return createWorldTimeSnapshot(
      Number(this.worldTimeMs),
      this.timeScale,
      this.realTimestampMs,
      this.isPaused,
      this.schemaVersion,
    );
  }

  async update(input: {
    worldTimeMs: bigint;
    timeScale: number;
    isPaused: boolean;
    schemaVersion: number;
  }) {
    this.worldTimeMs = input.worldTimeMs;
    this.timeScale = input.timeScale;
    this.isPaused = input.isPaused;
    this.schemaVersion = input.schemaVersion;
    this.realTimestampMs += 1000;
    return createWorldTimeSnapshot(
      Number(input.worldTimeMs),
      input.timeScale,
      this.realTimestampMs,
      input.isPaused,
      input.schemaVersion,
    );
  }
}

describe('WorldClockService', () => {
  it('creates a game clock snapshot', async () => {
    const service = new WorldClockService(new InMemoryWorldClockRepo());
    const snapshot = await service.now();
    expect(snapshot.worldTimeMs).toBe(0);
    expect(snapshot.timeScale).toBe(1);
    expect(snapshot.isPaused).toBe(false);
    expect(snapshot.schemaVersion).toBe(1);
  });

  it('ticks forward when not paused', async () => {
    const service = new WorldClockService(new InMemoryWorldClockRepo());
    const before = await service.now();
    const after = await service.tick(1000);
    expect(after.worldTimeMs).toBe(before.worldTimeMs + 1000);
  });

  it('persists advanced game time across reads', async () => {
    const repo = new InMemoryWorldClockRepo();
    const service = new WorldClockService(repo);
    await service.advanceGameTime(5000);
    const snapshot = await service.now();
    expect(snapshot.worldTimeMs).toBe(5000);
  });

  it('updates time multiplier', async () => {
    const service = new WorldClockService(new InMemoryWorldClockRepo());
    const scaled = await service.setTimeScale(5);
    expect(scaled.timeScale).toBe(5);
    expect((await service.now()).timeScale).toBe(5);
  });

  it('freezes game time when paused', async () => {
    const service = new WorldClockService(new InMemoryWorldClockRepo());
    await service.advanceGameTime(2000);
    await service.setPaused(true);
    const paused = await service.now();
    expect(paused.isPaused).toBe(true);
    const afterTick = await service.tick(3000);
    expect(afterTick.worldTimeMs).toBe(2000);
  });

  it('resumes ticking after unpause', async () => {
    const service = new WorldClockService(new InMemoryWorldClockRepo());
    await service.setPaused(true);
    await service.setPaused(false);
    const after = await service.tick(1500);
    expect(after.worldTimeMs).toBe(1500);
    expect(after.isPaused).toBe(false);
  });

  it('admin advance bypasses pause', async () => {
    const service = new WorldClockService(new InMemoryWorldClockRepo());
    await service.setPaused(true);
    const after = await service.advanceGameTime(2500);
    expect(after.worldTimeMs).toBe(2500);
    expect(after.isPaused).toBe(true);
  });
});
