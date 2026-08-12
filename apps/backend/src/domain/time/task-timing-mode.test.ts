import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TASK_TIMING_MODE,
  isTaskReady,
  resolveTaskReadyAt,
} from './task-timing-mode.js';

describe('task timing mode', () => {
  it('defaults to real time', () => {
    expect(DEFAULT_TASK_TIMING_MODE).toBe('real_time');
  });

  it('resolves real-time readyAt from wall clock', () => {
    const resolution = resolveTaskReadyAt({
      mode: 'real_time',
      durationMs: 5000,
      nowRealMs: 1_000_000,
      nowGameMs: 0,
    });
    expect(resolution.timingMode).toBe('real_time');
    expect(resolution.readyAt).toBe(new Date(1_005_000).toISOString());
    expect(resolution.readyAtWorldMs).toBeUndefined();
  });

  it('resolves game-time readyAt with world ms', () => {
    const resolution = resolveTaskReadyAt({
      mode: 'game_time',
      durationMs: 5000,
      nowRealMs: 1_000_000,
      nowGameMs: 10_000,
    });
    expect(resolution.timingMode).toBe('game_time');
    expect(resolution.readyAtWorldMs).toBe(15_000);
  });

  it('checks real-time readiness from readyAt', () => {
    const readyAt = new Date(2_000).toISOString();
    expect(
      isTaskReady({
        mode: 'real_time',
        readyAt,
        nowRealMs: 1_999,
        nowGameMs: 0,
      }),
    ).toBe(false);
    expect(
      isTaskReady({
        mode: 'real_time',
        readyAt,
        nowRealMs: 2_000,
        nowGameMs: 0,
      }),
    ).toBe(true);
  });

  it('checks game-time readiness from world ms', () => {
    expect(
      isTaskReady({
        mode: 'game_time',
        readyAtWorldMs: 9000,
        nowRealMs: 0,
        nowGameMs: 8999,
      }),
    ).toBe(false);
    expect(
      isTaskReady({
        mode: 'game_time',
        readyAtWorldMs: 9000,
        nowRealMs: 0,
        nowGameMs: 9000,
      }),
    ).toBe(true);
  });
});
