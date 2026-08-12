import { describe, expect, it } from 'vitest';
import {
  BASE_PRICE_INDEX_BPS,
  evolveWorldInflation,
  INFLATION_TICK_INTERVAL_MS,
} from './world-inflation-engine.js';

describe('evolveWorldInflation', () => {
  it('returns null before one game day elapses', () => {
    const result = evolveWorldInflation({
      currentInflationBps: 200,
      currentPriceIndexBps: BASE_PRICE_INDEX_BPS,
      lastInflationTickGameMs: 0,
      gameTimeMs: INFLATION_TICK_INTERVAL_MS - 1,
    });
    expect(result).toBeNull();
  });

  it('evolves inflation and price index autonomously over game days', () => {
    const result = evolveWorldInflation({
      currentInflationBps: 200,
      currentPriceIndexBps: BASE_PRICE_INDEX_BPS,
      lastInflationTickGameMs: 0,
      gameTimeMs: INFLATION_TICK_INTERVAL_MS * 3,
    });
    expect(result).not.toBeNull();
    expect(result!.lastInflationTickGameMs).toBe(INFLATION_TICK_INTERVAL_MS * 3);
    expect(result!.inflationRateBps).toBeGreaterThanOrEqual(-300);
    expect(result!.inflationRateBps).toBeLessThanOrEqual(1200);
    expect(result!.priceIndexBps).toBeGreaterThan(0);
  });
});
