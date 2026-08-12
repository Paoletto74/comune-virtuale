import { describe, expect, it } from 'vitest';
import type { CitizenJobEngagementRecord } from '../../domain/ports/repositories.js';
import {
  GAME_MS_PER_DAY,
  GAME_SURFACE_WORK_SHIFT_DURATION_MS,
} from '../../slice/game-surface-constants.js';
import {
  canApplyToJob,
  canClockInToJob,
  gameDayStartMs,
  remainingShiftMs,
  resolveJobOfferUiStatus,
  syncJobEngagementState,
} from './job-engagement-sync.js';

function engagement(
  partial: Partial<CitizenJobEngagementRecord> & Pick<CitizenJobEngagementRecord, 'status'>,
): CitizenJobEngagementRecord {
  return {
    citizenId: 'citizen-1',
    offerId: 'job-1',
    hiredAtGameMs: 1000,
    shiftStartedAtGameMs: null,
    shiftEndsAtGameMs: null,
    blockedUntilGameMs: null,
    lastApplicationId: 'app-1',
    updatedAtGameMs: 1000,
    ...partial,
  };
}

describe('job-engagement-sync', () => {
  it('transitions active shift to blocked for rest of game day', () => {
    const start = GAME_MS_PER_DAY + 10_000;
    const end = start + GAME_SURFACE_WORK_SHIFT_DURATION_MS;
    const synced = syncJobEngagementState(
      engagement({
        status: 'shift_active',
        shiftStartedAtGameMs: start,
        shiftEndsAtGameMs: end,
      }),
      end,
    );

    expect(synced?.status).toBe('blocked_today');
    expect(synced?.blockedUntilGameMs).toBe(2 * GAME_MS_PER_DAY);
  });

  it('unblocks hired status on next game day', () => {
    const blockedUntil = 2 * GAME_MS_PER_DAY;
    const synced = syncJobEngagementState(
      engagement({
        status: 'blocked_today',
        blockedUntilGameMs: blockedUntil,
      }),
      blockedUntil,
    );

    expect(synced?.status).toBe('hired');
    expect(synced?.shiftEndsAtGameMs).toBeNull();
  });

  it('allows clock-in only when hired', () => {
    expect(canClockInToJob(engagement({ status: 'hired' }), 5000)).toBe(true);
    expect(canClockInToJob(engagement({ status: 'shift_active' }), 5000)).toBe(false);
    expect(canApplyToJob(null, 5000)).toBe(true);
  });

  it('computes remaining shift time from game clock', () => {
    const start = 1000;
    const end = start + GAME_SURFACE_WORK_SHIFT_DURATION_MS;
    const remaining = remainingShiftMs(
      engagement({
        status: 'shift_active',
        shiftStartedAtGameMs: start,
        shiftEndsAtGameMs: end,
      }),
      start + 60_000,
    );
    expect(remaining).toBe(end - (start + 60_000));
  });

  it('resolves UI status for available offers without engagement', () => {
    expect(resolveJobOfferUiStatus(null, 1000)).toBe('available');
    expect(gameDayStartMs(GAME_MS_PER_DAY + 500)).toBe(GAME_MS_PER_DAY);
  });
});
