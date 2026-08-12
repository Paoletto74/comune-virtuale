import type { DayNightPhase } from '@comune-virtuale/shared';

/** Task availability bucket used by phase pools (DAY / EVENING / NIGHT / ALL_DAY). */
export type TaskPhaseAffinity = 'DAY' | 'EVENING' | 'NIGHT' | 'ALL_DAY';

const NIGHT_PATTERNS =
  /SHADY|STEAL|GANG|CRIMINAL|BRIBE|SCAM|SUITCASE|RISKY|OFF_BOOK|SHOPLIFT|CHEAT|DARE|FENCE|FAKE_TICKET|COLLECT|SHADY_DEAL/i;

const EVENING_PATTERNS =
  /PARTY|NETWORKING|GROUP_TRIP|SPORT_BET|WEDDING|OLD_RIVAL|STREET_PERFORMER|PARADE|BAR|LOCALE|DATE_NIGHT/i;

const DAY_PATTERNS =
  /(?:^|_)WORK(?:_|$)|BOSS|CLIENT|MEETING|SUPPLIER|COLLEAGUE|DEADLINE|SHIFT|INTERN|EMAIL|COPY_MACHINE|TEAM_LUNCH|SECURITY|OVERTIME|PROJECT|LANDLORD_GREETING|SIDE_GIG|REPAIR|SUBSCRIPTION|DISCOUNT|ATM|BUILDING_MEETING|GARAGE_SALE|SUPERVISOR|ERROR_FOUND|CRITICISM|LOTTERY/i;

export function getTaskPhaseAffinity(definitionId: string): TaskPhaseAffinity {
  if (NIGHT_PATTERNS.test(definitionId)) {
    return 'NIGHT';
  }
  if (EVENING_PATTERNS.test(definitionId)) {
    return 'EVENING';
  }
  if (DAY_PATTERNS.test(definitionId)) {
    return 'DAY';
  }
  return 'ALL_DAY';
}

export function isTaskInPhasePool(
  affinity: TaskPhaseAffinity,
  poolBucket: Exclude<TaskPhaseAffinity, 'ALL_DAY'>,
): boolean {
  return affinity === 'ALL_DAY' || affinity === poolBucket;
}

export function dayPhaseToPoolBucket(
  phase: DayNightPhase,
): Exclude<TaskPhaseAffinity, 'ALL_DAY'> {
  if (phase === 'sunset') {
    return 'EVENING';
  }
  if (phase === 'night') {
    return 'NIGHT';
  }
  return 'DAY';
}

export function activePhaseAffinitiesForDayPhase(phase: DayNightPhase): ReadonlySet<TaskPhaseAffinity> {
  const bucket = dayPhaseToPoolBucket(phase);
  return new Set<TaskPhaseAffinity>(['ALL_DAY', bucket]);
}

export function isTaskCompatibleWithDayPhase(
  definitionId: string,
  phase: DayNightPhase,
): boolean {
  return activePhaseAffinitiesForDayPhase(phase).has(getTaskPhaseAffinity(definitionId));
}

export function resolvePhasePoolId(phase: DayNightPhase): string {
  const bucket = dayPhaseToPoolBucket(phase);
  if (bucket === 'EVENING') {
    return 'POOL_PHASE_EVENING';
  }
  if (bucket === 'NIGHT') {
    return 'POOL_PHASE_NIGHT';
  }
  return 'POOL_PHASE_DAY';
}
