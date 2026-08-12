import { describe, expect, it } from 'vitest';
import { deterministicChance } from '../../domain/flash/deterministic-flash-random.js';
import { jobApplicationIdempotencyKey, JOB_APPLICATION_ACCEPT_PROBABILITY } from '../../slice/game-surface-constants.js';

describe('job application decision probability', () => {
  it('uses deterministic 50/50 chance keyed by application idempotency', () => {
    const citizenId = 'citizen-test';
    const offerId = 'job_comune_clerk_v1';
    const samples = Array.from({ length: 200 }, (_, index) => {
      const clientKey = `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
      const idempotencyKey = jobApplicationIdempotencyKey(citizenId, offerId, clientKey);
      const seed = `job-application-decision:${idempotencyKey}`;
      return deterministicChance(seed, JOB_APPLICATION_ACCEPT_PROBABILITY);
    });

    const accepts = samples.filter(Boolean).length;
    expect(accepts).toBeGreaterThan(60);
    expect(accepts).toBeLessThan(140);
  });
});
