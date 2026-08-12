/** C.2 RUNTIME — Task Pool v1 identifiers (not content pack changes). */
export const POOL_START = 'POOL_START';
export const POOL_AFTER_ELDERLY = 'POOL_AFTER_ELDERLY';
/** V1-LOOP-1 — remaining once tasks after any non-elderly completion or boss completion. */
export const POOL_AFTER_TASK = 'POOL_AFTER_TASK';

/** MEGA 1/4 — repeatable tasks when the main pool has no eligible candidates. */
export const POOL_ANTI_STALL = 'POOL_ANTI_STALL';

/** Phase-aware pools — refreshed when day/night phase changes. */
export const POOL_PHASE_DAY = 'POOL_PHASE_DAY';
export const POOL_PHASE_EVENING = 'POOL_PHASE_EVENING';
export const POOL_PHASE_NIGHT = 'POOL_PHASE_NIGHT';

export const TASK_SELECTION_VERSION = 2;
