import { describe, expect, it } from 'vitest';
import { GAME_MS_PER_DAY } from './game-surface-constants.js';
import {
  buildSimulatedPlayerListings,
  pickAllDailyMarketplaceItems,
  pickDailyCategoryItems,
} from './marketplace-rotation.js';
import { MARKETPLACE_CATEGORY_ORDER } from './marketplace-catalog-constants.js';

describe('marketplace rotation', () => {
  it('returns about 10 items per category', () => {
    for (const categoryId of MARKETPLACE_CATEGORY_ORDER) {
      const items = pickDailyCategoryItems(categoryId, 0);
      expect(items.length).toBeGreaterThanOrEqual(10);
    }
  });

  it('rotates roughly 2 items per day per category', () => {
    const day0 = pickDailyCategoryItems('consumables', 0).map((item) => item.itemId);
    const day1 = pickDailyCategoryItems('consumables', GAME_MS_PER_DAY).map((item) => item.itemId);
    expect(day0).not.toEqual(day1);
  });

  it('builds player showcase listings per category', () => {
    const listings = buildSimulatedPlayerListings(GAME_MS_PER_DAY * 3);
    expect(listings.length).toBeGreaterThanOrEqual(8);
    expect(listings.some((entry) => entry.listingType === 'rent')).toBe(true);
  });

  it('pickAllDailyMarketplaceItems covers all categories', () => {
    const items = pickAllDailyMarketplaceItems(0);
    expect(items.length).toBeGreaterThanOrEqual(40);
  });
});
