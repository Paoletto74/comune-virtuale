import type { CitizenJobEngagementRecord } from '../../domain/ports/repositories.js';
import { endOfGameDayMs, GAME_MS_PER_DAY } from '../../slice/game-surface-constants.js';

export type JobOfferUiStatus =
  | 'available'
  | 'hired'
  | 'shift_active'
  | 'blocked_today';

export function gameDayStartMs(gameTimeMs: number): number {
  return Math.floor(gameTimeMs / GAME_MS_PER_DAY) * GAME_MS_PER_DAY;
}

export function resolveJobOfferUiStatus(
  engagement: CitizenJobEngagementRecord | null,
  gameTimeMs: number,
): JobOfferUiStatus {
  const synced = syncJobEngagementState(engagement, gameTimeMs);
  if (!synced) return 'available';
  return synced.status === 'shift_active' || synced.status === 'blocked_today'
    ? synced.status
    : 'hired';
}

export function syncJobEngagementState(
  engagement: CitizenJobEngagementRecord | null,
  gameTimeMs: number,
): CitizenJobEngagementRecord | null {
  if (!engagement) return null;

  if (
    engagement.status === 'shift_active' &&
    engagement.shiftEndsAtGameMs !== null &&
    gameTimeMs >= engagement.shiftEndsAtGameMs
  ) {
    return {
      ...engagement,
      status: 'blocked_today',
      shiftStartedAtGameMs: engagement.shiftStartedAtGameMs,
      shiftEndsAtGameMs: engagement.shiftEndsAtGameMs,
      blockedUntilGameMs: endOfGameDayMs(gameTimeMs),
      updatedAtGameMs: gameTimeMs,
    };
  }

  if (
    engagement.status === 'blocked_today' &&
    engagement.blockedUntilGameMs !== null &&
    gameTimeMs >= engagement.blockedUntilGameMs
  ) {
    return {
      ...engagement,
      status: 'hired',
      shiftStartedAtGameMs: null,
      shiftEndsAtGameMs: null,
      blockedUntilGameMs: null,
      updatedAtGameMs: gameTimeMs,
    };
  }

  return engagement;
}

export function remainingShiftMs(
  engagement: CitizenJobEngagementRecord | null,
  gameTimeMs: number,
): number | null {
  const synced = syncJobEngagementState(engagement, gameTimeMs);
  if (!synced || synced.status !== 'shift_active' || synced.shiftEndsAtGameMs === null) {
    return null;
  }
  return Math.max(0, synced.shiftEndsAtGameMs - gameTimeMs);
}

export function canApplyToJob(
  engagement: CitizenJobEngagementRecord | null,
  gameTimeMs: number,
): boolean {
  const status = resolveJobOfferUiStatus(engagement, gameTimeMs);
  return status === 'available';
}

export function canClockInToJob(
  engagement: CitizenJobEngagementRecord | null,
  gameTimeMs: number,
): boolean {
  return resolveJobOfferUiStatus(engagement, gameTimeMs) === 'hired';
}
