import { describe, expect, it } from 'vitest';
import {
  PERSONALITY_POINT_POOL,
  validatePersonalityAllocation,
} from './personality-constants.js';

describe('personality-constants', () => {
  it('validates trade-off pool of 90 points', () => {
    expect(() =>
      validatePersonalityAllocation({ sympathy: 30, reputation: 30, happiness: 30 }),
    ).not.toThrow();
  });

  it('rejects allocations that do not sum to pool', () => {
    expect(() =>
      validatePersonalityAllocation({ sympathy: 30, reputation: 30, happiness: 20 }),
    ).toThrow();
  });

  it('uses ninety total points', () => {
    expect(PERSONALITY_POINT_POOL).toBe(90);
  });
});
