import { describe, expect, it } from 'vitest';
import { GAME_MS_PER_DAY } from './game-surface-constants.js';
import {
  JOB_CATALOG_POOL,
  JOB_OFFERS_VISIBLE_COUNT,
  pickDailyJobOffers,
} from './job-catalog-constants.js';

describe('job catalog rotation', () => {
  it('has at least 10 jobs in pool', () => {
    expect(JOB_CATALOG_POOL.length).toBeGreaterThanOrEqual(10);
  });

  it('shows 10 offers per day', () => {
    const offers = pickDailyJobOffers(0);
    expect(offers).toHaveLength(JOB_OFFERS_VISIBLE_COUNT);
  });

  it('rotates 2 jobs between days', () => {
    const day0 = pickDailyJobOffers(0).map((job) => job.offerId);
    const day1 = pickDailyJobOffers(GAME_MS_PER_DAY).map((job) => job.offerId);
    expect(day0).not.toEqual(day1);
  });

  it('gates elite jobs for low-level citizens', () => {
    const lowLevel = pickDailyJobOffers(0, 1).map((job) => job.offerId);
    const highLevel = pickDailyJobOffers(0, 4).map((job) => job.offerId);
    expect(lowLevel).not.toContain('job_engineer_v1');
    expect(lowLevel).not.toContain('job_lawyer_v1');
    expect(highLevel).toContain('job_engineer_v1');
  });

  it('always includes entry jobs', () => {
    const offers = pickDailyJobOffers(0, 1);
    const entryIds = JOB_CATALOG_POOL.filter((job) => job.tier === 'entry').map((job) => job.offerId);
    for (const offerId of entryIds) {
      expect(offers.some((job) => job.offerId === offerId)).toBe(true);
    }
  });
});
