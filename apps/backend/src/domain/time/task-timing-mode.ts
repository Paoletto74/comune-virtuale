/** Task timer mode — standard tasks remain on real time in this slice. */
export type TaskTimingMode = 'real_time' | 'game_time';

export const DEFAULT_TASK_TIMING_MODE: TaskTimingMode = 'real_time';

export interface TaskReadyAtResolution {
  readyAt: string;
  readyAtWorldMs?: number;
  timingMode: TaskTimingMode;
}

/** Resolves when a standard task becomes ready — abstraction for future game-time timers. */
export function resolveTaskReadyAt(input: {
  mode: TaskTimingMode;
  durationMs: number;
  nowRealMs: number;
  nowGameMs: number;
}): TaskReadyAtResolution {
  if (input.mode === 'game_time') {
    const readyAtWorldMs = input.nowGameMs + input.durationMs;
    return {
      readyAt: new Date(input.nowRealMs + input.durationMs).toISOString(),
      readyAtWorldMs,
      timingMode: 'game_time',
    };
  }

  return {
    readyAt: new Date(input.nowRealMs + input.durationMs).toISOString(),
    timingMode: 'real_time',
  };
}

export function isTaskReady(input: {
  mode: TaskTimingMode;
  readyAt?: string;
  readyAtWorldMs?: number;
  nowRealMs: number;
  nowGameMs: number;
}): boolean {
  if (input.mode === 'game_time' && input.readyAtWorldMs !== undefined) {
    return input.nowGameMs >= input.readyAtWorldMs;
  }
  if (!input.readyAt) return false;
  const readyMs = Date.parse(input.readyAt);
  return Number.isFinite(readyMs) && input.nowRealMs >= readyMs;
}
