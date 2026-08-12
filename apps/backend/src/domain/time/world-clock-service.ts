import type { WorldTimeSnapshot } from '@comune-virtuale/shared';
import type { WorldClockRepository } from '../ports/repositories.js';
import { WORLD_CLOCK_SCHEMA_VERSION } from '../../slice/time-life-constants.js';

export class WorldClockService {
  constructor(private readonly repo: WorldClockRepository) {}

  async now(): Promise<WorldTimeSnapshot> {
    return this.repo.getSnapshot();
  }

  async tick(deltaMs: number): Promise<WorldTimeSnapshot> {
    const current = await this.repo.getSnapshot();
    if (current.isPaused || deltaMs <= 0) {
      return current;
    }
    const next = BigInt(current.worldTimeMs) + BigInt(deltaMs);
    return this.repo.update({
      worldTimeMs: next,
      timeScale: current.timeScale,
      isPaused: current.isPaused,
      schemaVersion: current.schemaVersion,
    });
  }

  async setTimeScale(timeScale: number): Promise<WorldTimeSnapshot> {
    const current = await this.repo.getSnapshot();
    return this.repo.update({
      worldTimeMs: BigInt(current.worldTimeMs),
      timeScale,
      isPaused: current.isPaused,
      schemaVersion: current.schemaVersion,
    });
  }

  async setPaused(isPaused: boolean): Promise<WorldTimeSnapshot> {
    const current = await this.repo.getSnapshot();
    return this.repo.update({
      worldTimeMs: BigInt(current.worldTimeMs),
      timeScale: current.timeScale,
      isPaused,
      schemaVersion: current.schemaVersion,
    });
  }

  async advanceGameTime(deltaMs: number): Promise<WorldTimeSnapshot> {
    const current = await this.repo.getSnapshot();
    if (deltaMs <= 0) {
      return current;
    }
    const next = BigInt(current.worldTimeMs) + BigInt(deltaMs);
    return this.repo.update({
      worldTimeMs: next,
      timeScale: current.timeScale,
      isPaused: current.isPaused,
      schemaVersion: current.schemaVersion,
    });
  }

  async setWorldTimeMs(worldTimeMs: number): Promise<WorldTimeSnapshot> {
    const current = await this.repo.getSnapshot();
    return this.repo.update({
      worldTimeMs: BigInt(Math.max(0, worldTimeMs)),
      timeScale: current.timeScale,
      isPaused: current.isPaused,
      schemaVersion: current.schemaVersion,
    });
  }

  async getAdminState(): Promise<WorldTimeSnapshot> {
    return this.now();
  }
}

export { WORLD_CLOCK_SCHEMA_VERSION };
