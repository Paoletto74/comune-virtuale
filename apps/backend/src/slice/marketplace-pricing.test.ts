import { describe, expect, it } from 'vitest';
import {
  MARKETPLACE_RENT_DURATION_MS,
  monthlyRentPriceMinor,
  npcPriorityWaitGameMs,
  rentedPropertySaleRefundMinor,
  usedListingPriceMinor,
} from './marketplace-pricing.js';
import { GAME_MS_PER_DAY } from './game-surface-constants.js';

describe('marketplace pricing automation', () => {
  it('computes automatic used listing price from catalog value', () => {
    expect(usedListingPriceMinor(1000n, 'MEDIO')).toBe(580n);
    expect(usedListingPriceMinor(1000n, 'ECONOMICO')).toBe(550n);
  });

  it('computes automatic monthly rent', () => {
    expect(monthlyRentPriceMinor(10000n, 'MEDIO')).toBe(350n);
  });

  it('creates random but deterministic NPC wait window', () => {
    const listedAt = 1_000_000;
    const resolveAt = npcPriorityWaitGameMs('listing-abc', listedAt);
    expect(resolveAt).toBeGreaterThan(listedAt + GAME_MS_PER_DAY);
    expect(resolveAt).toBeLessThanOrEqual(listedAt + 5 * GAME_MS_PER_DAY);
    expect(npcPriorityWaitGameMs('listing-abc', listedAt)).toBe(resolveAt);
  });

  it('uses 30 game-days as monthly rent duration', () => {
    expect(MARKETPLACE_RENT_DURATION_MS).toBe(30 * GAME_MS_PER_DAY);
  });

  it('refunds exactly 3 months of rent on early property sale', () => {
    expect(rentedPropertySaleRefundMinor(400n)).toBe(1200n);
  });
});
