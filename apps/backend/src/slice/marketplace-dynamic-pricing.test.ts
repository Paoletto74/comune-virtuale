import { describe, expect, it } from 'vitest';
import {
  assetCurrentValueMinor,
  classifyAssetSale,
  dynamicCatalogPriceMinor,
} from './marketplace-dynamic-pricing.js';
import { BASE_PRICE_INDEX_BPS } from './world-inflation-engine.js';

describe('marketplace dynamic pricing', () => {
  it('scales catalog prices with price index', () => {
    expect(dynamicCatalogPriceMinor(100_000n, BASE_PRICE_INDEX_BPS)).toBe(100_000n);
    expect(dynamicCatalogPriceMinor(100_000n, 11_000)).toBe(110_000n);
  });

  it('values owned assets from purchase cost and market movement', () => {
    const value = assetCurrentValueMinor({
      purchasePriceMinor: 100_000n,
      purchasePriceIndexBps: 10_000,
      catalogBasePriceMinor: 90_000n,
      currentPriceIndexBps: 11_000,
      economicTier: 'MEDIO',
    });
    expect(value).toBeGreaterThan(0n);
  });

  it('classifies sale outcomes with tolerance band', () => {
    expect(classifyAssetSale(100_000n, 110_000n).outcome).toBe('gain');
    expect(classifyAssetSale(100_000n, 99_000n).outcome).toBe('break_even');
    expect(classifyAssetSale(100_000n, 80_000n).outcome).toBe('loss');
  });
});
