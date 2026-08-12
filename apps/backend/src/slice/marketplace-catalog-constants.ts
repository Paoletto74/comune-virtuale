/** Canonical marketplace categories — 4 main sections. */
export type MarketplaceCategoryId = 'consumables' | 'vehicles' | 'housing' | 'luxury';

export type MarketplaceEconomicTier =
  | 'ECONOMICO'
  | 'MEDIO'
  | 'ALTO'
  | 'PREMIUM'
  | 'LUSSO'
  | 'SUPER-LUSSO';

export const MARKETPLACE_CATEGORY_ORDER: readonly MarketplaceCategoryId[] = [
  'consumables',
  'vehicles',
  'housing',
  'luxury',
] as const;

export const MARKETPLACE_CATEGORY_LABELS: Record<MarketplaceCategoryId, string> = {
  consumables: 'Beni di consumo',
  vehicles: 'Veicoli',
  housing: 'Abitazioni',
  luxury: 'Beni di lusso',
};

export const MARKETPLACE_ITEMS_PER_CATEGORY = 10;
export const MARKETPLACE_DAILY_ROTATION_COUNT = 2;

export interface MarketplaceCatalogItemDef {
  itemId: string;
  slug: string;
  name: string;
  description: string;
  categoryId: MarketplaceCategoryId;
  subcategory: string;
  economicTier: MarketplaceEconomicTier;
  imagePath: string;
  priceMinor: bigint;
  imageKey: string;
  essential?: string;
  /** Alimentare — preparato per futuro sistema fame. */
  isFood?: boolean;
  /** Consumabile — non rivendibile, scadenza futura. */
  isConsumable?: boolean;
  /** Affittabile — abitazioni economiche/medie. */
  isRentable?: boolean;
}

/** Maps legacy DB category strings to canonical category. */
export function mapLegacyCategoryToCanonical(category: string, itemId: string): MarketplaceCategoryId {
  const fromPool = getCatalogItemDef(itemId);
  if (fromPool) return fromPool.categoryId;

  const legacy: Record<string, MarketplaceCategoryId> = {
    food: 'consumables',
    personal: 'consumables',
    mobility: 'vehicles',
    home: 'housing',
    living: 'housing',
    technology: 'luxury',
    leisure: 'luxury',
    valuables: 'luxury',
    services: 'luxury',
  };
  return legacy[category] ?? 'luxury';
}

export const MARKETPLACE_IMAGE_KEYS: Record<string, string> = {
  food: 'food',
  drink: 'drink',
  vehicle: 'vehicle',
  home: 'home',
  luxury: 'luxury',
  tech: 'tech',
  sport: 'sport',
  book: 'book',
};

export {
  MARKETPLACE_CATALOG_POOL,
  MARKETPLACE_CATALOG_PRODUCT_COUNT,
} from './marketplace-catalog-pool.generated.js';

import { MARKETPLACE_CATALOG_POOL } from './marketplace-catalog-pool.generated.js';

export function getCatalogItemDef(itemId: string): MarketplaceCatalogItemDef | null {
  return MARKETPLACE_CATALOG_POOL.find((item) => item.itemId === itemId) ?? null;
}

export function listCatalogItemsByCategory(
  categoryId: MarketplaceCategoryId,
): readonly MarketplaceCatalogItemDef[] {
  return MARKETPLACE_CATALOG_POOL.filter((item) => item.categoryId === categoryId);
}
