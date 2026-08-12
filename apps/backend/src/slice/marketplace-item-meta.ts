import { MARKETPLACE_CATALOG_POOL } from './marketplace-catalog-constants.js';
import { GAME_MS_PER_DAY } from './game-surface-constants.js';
import {
  MARKETPLACE_RENT_DURATION_MS,
  monthlyRentPriceMinor,
  usedListingPriceMinor,
} from './marketplace-pricing.js';

export { MARKETPLACE_RENT_DURATION_MS, monthlyRentPriceMinor, usedListingPriceMinor };

/** Consumable marketplace items — derived from master catalog metadata. */
export const CONSUMABLE_ITEM_IDS = new Set(
  MARKETPLACE_CATALOG_POOL.filter((item) => item.isConsumable).map((item) => item.itemId),
);

/** Food-related items — prepared for future hunger system. */
export const FOOD_ITEM_IDS = new Set(
  MARKETPLACE_CATALOG_POOL.filter((item) => item.isFood).map((item) => item.itemId),
);

const DEFAULT_CONSUMABLE_DURATION_MS = 3 * GAME_MS_PER_DAY;

/** Game-ms duration before consumable expires (approx game-days). */
export const CONSUMABLE_DURATION_GAME_MS: Record<string, number> = Object.fromEntries(
  [...CONSUMABLE_ITEM_IDS].map((itemId) => {
    const def = MARKETPLACE_CATALOG_POOL.find((item) => item.itemId === itemId);
    if (def?.subcategory === 'alimentari') return [itemId, 5 * GAME_MS_PER_DAY];
    if (def?.subcategory === 'bevande') return [itemId, 3 * GAME_MS_PER_DAY];
    if (def?.subcategory === 'pasti') return [itemId, 1 * GAME_MS_PER_DAY];
    return [itemId, DEFAULT_CONSUMABLE_DURATION_MS];
  }),
);

/** Happiness delta applied when consuming (future slice hook). */
export const CONSUMABLE_HAPPINESS_DELTA: Record<string, number> = Object.fromEntries(
  [...CONSUMABLE_ITEM_IDS].map((itemId) => {
    const def = MARKETPLACE_CATALOG_POOL.find((item) => item.itemId === itemId);
    if (def?.economicTier === 'SUPER-LUSSO' || def?.economicTier === 'LUSSO') return [itemId, 12];
    if (def?.economicTier === 'PREMIUM' || def?.economicTier === 'ALTO') return [itemId, 6];
    if (def?.subcategory === 'pasti') return [itemId, 5];
    if (def?.subcategory === 'bevande') return [itemId, 3];
    return [itemId, 2];
  }),
);

export function isConsumableItem(itemId: string): boolean {
  return CONSUMABLE_ITEM_IDS.has(itemId);
}

export function isFoodItem(itemId: string): boolean {
  return FOOD_ITEM_IDS.has(itemId);
}

/** Housing and similar items support temporary rent. */
export function isRentableCategory(categoryId: string): boolean {
  return categoryId === 'housing';
}

export function isRentableCatalogItem(itemId: string): boolean {
  const def = MARKETPLACE_CATALOG_POOL.find((item) => item.itemId === itemId);
  return def?.isRentable === true || def?.categoryId === 'housing';
}

export function resalePriceMinor(purchasePriceMinor: bigint): bigint {
  return usedListingPriceMinor(purchasePriceMinor);
}
