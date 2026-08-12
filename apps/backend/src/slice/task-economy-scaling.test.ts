import { describe, expect, it } from 'vitest';
import { scaleTaskCashReward, TASK_ECONOMY_STARTER_CASH_CAP_MINOR } from './task-economy-scaling.js';

describe('task economy scaling', () => {
  it('caps rewards for brand-new players', () => {
    const scaled = scaleTaskCashReward(1000n, 1, 0);
    expect(scaled).toBeLessThanOrEqual(TASK_ECONOMY_STARTER_CASH_CAP_MINOR);
  });

  it('leaves zero or negative rewards unchanged', () => {
    expect(scaleTaskCashReward(0n, 1, 0)).toBe(0n);
    expect(scaleTaskCashReward(-50n, 1, 0)).toBe(-50n);
  });

  it('does not scale down experienced players as aggressively', () => {
    const scaled = scaleTaskCashReward(1000n, 4, 500);
    expect(scaled).toBe(20n);
  });

  it('caps extremely high rewards for all players', () => {
    const scaled = scaleTaskCashReward(30000n, 4, 500);
    expect(scaled).toBe(20n);
  });
});
