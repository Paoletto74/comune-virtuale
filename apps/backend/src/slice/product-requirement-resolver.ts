import { getCatalogItemDef } from './marketplace-catalog-constants.js';
import {
  economicTierRank,
  minMainLevelForPurchaseTier,
  purchaseRequirementLabel,
  type ProductRequirementEvaluation,
  type ProductRequirementSpec,
  type PurchaseRequirementEvaluation,
} from './product-requirements-constants.js';
import type { MarketplaceCatalogItemDef } from './marketplace-catalog-constants.js';

type InventoryRow = { itemId: string; inventoryId?: string };

function ownedDefs(inventory: readonly InventoryRow[]): MarketplaceCatalogItemDef[] {
  const defs: MarketplaceCatalogItemDef[] = [];
  for (const row of inventory) {
    const def = getCatalogItemDef(row.itemId);
    if (def) defs.push(def);
  }
  return defs;
}

function matchesSpec(spec: ProductRequirementSpec, defs: readonly MarketplaceCatalogItemDef[]): boolean {
  switch (spec.kind) {
    case 'category':
      return defs.some((def) => def.categoryId === spec.categoryId);
    case 'economicTier':
      return defs.some(
        (def) =>
          def.categoryId === spec.categoryId &&
          economicTierRank(def.economicTier) >= economicTierRank(spec.minTier),
      );
    case 'item':
      return defs.some((def) => def.itemId === spec.itemId);
    case 'consumableFood':
      return defs.some((def) => def.isFood === true || def.isConsumable === true);
    case 'anyOf':
      return spec.options.some((option) => matchesSpec(option, defs));
    default:
      return false;
  }
}

export function evaluateProductRequirement(
  spec: ProductRequirementSpec,
  inventory: readonly InventoryRow[],
): ProductRequirementEvaluation {
  const defs = ownedDefs(inventory);
  const satisfied = matchesSpec(spec, defs);
  return {
    satisfied,
    label: spec.label,
    detail: satisfied ? 'Requisito soddisfatto' : 'Requisito non soddisfatto',
  };
}

export function findConsumableInventoryMatch(
  inventory: readonly InventoryRow[],
): InventoryRow | null {
  for (const row of inventory) {
    const def = getCatalogItemDef(row.itemId);
    if (def?.isFood || def?.isConsumable) {
      return row;
    }
  }
  return null;
}

export function evaluatePurchaseRequirement(
  item: Pick<MarketplaceCatalogItemDef, 'economicTier'>,
  mainLevel: number,
): PurchaseRequirementEvaluation {
  const minMainLevel = minMainLevelForPurchaseTier(item.economicTier);
  if (minMainLevel == null || mainLevel >= minMainLevel) {
    return { blocked: false };
  }
  return {
    blocked: true,
    minMainLevel,
    blockReason: purchaseRequirementLabel(minMainLevel),
  };
}
