/** Default in-progress duration for standard tasks (wall clock, not game time). */
export const DEFAULT_TASK_DURATION_MS = 20_000;

export function getDefaultTaskDurationMs(): number {
  if (process.env.TASK_DURATION_MS !== undefined) {
    const parsed = Number(process.env.TASK_DURATION_MS);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  if (
    process.env.VITEST === 'true' ||
    process.env.NODE_ENV === 'test' ||
    process.env.PLAYWRIGHT === '1'
  ) {
    return 0;
  }
  return DEFAULT_TASK_DURATION_MS;
}
