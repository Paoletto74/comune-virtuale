import { GAME_MS_PER_DAY } from './game-surface-constants.js';
import {
  MARKETPLACE_CATALOG_POOL,
  MARKETPLACE_DAILY_ROTATION_COUNT,
  MARKETPLACE_ITEMS_PER_CATEGORY,
  type MarketplaceCatalogItemDef,
  type MarketplaceCategoryId,
} from './marketplace-catalog-constants.js';

function hashDayCategory(day: number, categoryId: string, slot: number): number {
  let h = day * 31 + categoryId.charCodeAt(0) * 17 + slot * 13;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  return Math.abs(h);
}

/**
 * Picks ~10 items per category: 8 stable core + 2 rotated daily.
 * Rotation replaces 2 slots deterministically each game day.
 */
export function pickDailyCategoryItems(
  categoryId: MarketplaceCategoryId,
  gameTimeMs: number,
  pool: readonly MarketplaceCatalogItemDef[] = MARKETPLACE_CATALOG_POOL,
): MarketplaceCatalogItemDef[] {
  const categoryPool = pool.filter((item) => item.categoryId === categoryId);
  if (categoryPool.length === 0) return [];

  const targetCount = Math.min(MARKETPLACE_ITEMS_PER_CATEGORY, categoryPool.length);
  const stableCount = Math.max(0, targetCount - MARKETPLACE_DAILY_ROTATION_COUNT);
  const day = Math.floor(gameTimeMs / GAME_MS_PER_DAY);

  const core = categoryPool.slice(0, stableCount);
  const rotatable = categoryPool.slice(stableCount);

  if (rotatable.length === 0) {
    return core.slice(0, targetCount);
  }

  const rotated: MarketplaceCatalogItemDef[] = [];
  for (let i = 0; i < MARKETPLACE_DAILY_ROTATION_COUNT; i++) {
    const idx = (day * MARKETPLACE_DAILY_ROTATION_COUNT + i) % rotatable.length;
    const candidate = rotatable[idx]!;
    if (!core.some((item) => item.itemId === candidate.itemId) && !rotated.some((item) => item.itemId === candidate.itemId)) {
      rotated.push(candidate);
    } else {
      const fallbackIdx = (idx + 1 + i) % rotatable.length;
      rotated.push(rotatable[fallbackIdx]!);
    }
  }

  return [...core, ...rotated].slice(0, targetCount);
}

export function pickAllDailyMarketplaceItems(
  gameTimeMs: number,
  pool: readonly MarketplaceCatalogItemDef[] = MARKETPLACE_CATALOG_POOL,
): MarketplaceCatalogItemDef[] {
  const categories: MarketplaceCategoryId[] = ['consumables', 'vehicles', 'housing', 'luxury'];
  return categories.flatMap((categoryId) => pickDailyCategoryItems(categoryId, gameTimeMs, pool));
}

export function marketplaceRotationDayKey(gameTimeMs: number): number {
  return Math.floor(gameTimeMs / GAME_MS_PER_DAY) * GAME_MS_PER_DAY;
}

/** Simulated player listings for vetrina — deterministic per day/category. */
export interface SimulatedPlayerListing {
  listingId: string;
  sellerName: string;
  itemId: string;
  categoryId: MarketplaceCategoryId;
  priceMinor: bigint;
  listingType: 'sale' | 'rent';
}

const SHOWCASE_SELLERS = [
  'Marco B.',
  'Laura R.',
  'Giulia F.',
  'Paolo V.',
  'Elena M.',
  'Luca T.',
  'Sara N.',
  'Andrea C.',
] as const;

export function buildSimulatedPlayerListings(
  gameTimeMs: number,
  pool: readonly MarketplaceCatalogItemDef[] = MARKETPLACE_CATALOG_POOL,
): SimulatedPlayerListing[] {
  const day = Math.floor(gameTimeMs / GAME_MS_PER_DAY);
  const listings: SimulatedPlayerListing[] = [];

  for (const categoryId of ['consumables', 'vehicles', 'housing', 'luxury'] as const) {
    const categoryPool = pool.filter((item) => item.categoryId === categoryId);
    if (categoryPool.length < 2) continue;

    for (let slot = 0; slot < 2; slot++) {
      const itemIdx = hashDayCategory(day + 7, categoryId, slot + 10) % categoryPool.length;
      const sellerIdx = hashDayCategory(day + 3, categoryId, slot) % SHOWCASE_SELLERS.length;
      const item = categoryPool[itemIdx]!;
      const markup = slot === 0 ? 90n : 110n;
      listings.push({
        listingId: `showcase:${categoryId}:${day}:${slot}`,
        sellerName: SHOWCASE_SELLERS[sellerIdx]!,
        itemId: item.itemId,
        categoryId,
        priceMinor: (item.priceMinor * markup) / 100n,
        listingType: categoryId === 'housing' && slot === 1 ? 'rent' : 'sale',
      });
    }
  }

  return listings;
}
