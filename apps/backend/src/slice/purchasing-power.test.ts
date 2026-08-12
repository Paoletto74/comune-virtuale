import { describe, expect, it } from 'vitest';
import { computePurchasingPower } from './purchasing-power.js';
import { BASE_PRICE_INDEX_BPS } from './world-inflation-engine.js';

describe('computePurchasingPower', () => {
  it('returns higher index when prices are lower than baseline', () => {
    const baseline = computePurchasingPower({
      cashMinor: 500_000n,
      monthlySalaryMinor: 200_000n,
      netWorthMinor: 800_000n,
      priceIndexBps: BASE_PRICE_INDEX_BPS,
      inflationRateBps: 200,
    });
    const expensive = computePurchasingPower({
      cashMinor: 500_000n,
      monthlySalaryMinor: 200_000n,
      netWorthMinor: 800_000n,
      priceIndexBps: 12_000,
      inflationRateBps: 200,
    });
    expect(baseline.index).toBeGreaterThan(expensive.index);
  });

  it('labels critical purchasing power for low liquidity and high prices', () => {
    const result = computePurchasingPower({
      cashMinor: 10_000n,
      monthlySalaryMinor: 0n,
      netWorthMinor: 10_000n,
      priceIndexBps: 15_000,
      inflationRateBps: 800,
    });
    expect(result.label).toBe('Critico');
    expect(result.index).toBeLessThan(35);
  });
});
