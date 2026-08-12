import type { MarketplaceEconomicTier } from './marketplace-catalog-constants.js';
import { BASE_PRICE_INDEX_BPS } from './world-inflation-engine.js';

/** Apply world price index to a catalog base price. Salaries stay fixed. */
export function dynamicCatalogPriceMinor(basePriceMinor: bigint, priceIndexBps: number): bigint {
  if (priceIndexBps === BASE_PRICE_INDEX_BPS) return basePriceMinor;
  const adjusted = (basePriceMinor * BigInt(priceIndexBps)) / BigInt(BASE_PRICE_INDEX_BPS);
  return adjusted > 0n ? adjusted : 1n;
}

const TIER_VALUE_HOLD_BPS: Record<MarketplaceEconomicTier, number> = {
  ECONOMICO: 8200,
  MEDIO: 8800,
  ALTO: 9200,
  PREMIUM: 9500,
  LUSSO: 9800,
  'SUPER-LUSSO': 9900,
};

/** Current asset value from purchase cost + market movement. */
export function assetCurrentValueMinor(input: {
  purchasePriceMinor: bigint | null;
  purchasePriceIndexBps: number | null;
  catalogBasePriceMinor: bigint;
  currentPriceIndexBps: number;
  economicTier?: MarketplaceEconomicTier;
}): bigint {
  const tier = input.economicTier ?? 'MEDIO';
  const marketValue = dynamicCatalogPriceMinor(input.catalogBasePriceMinor, input.currentPriceIndexBps);
  const holdBps = BigInt(TIER_VALUE_HOLD_BPS[tier] ?? 8800);

  if (input.purchasePriceMinor == null || input.purchasePriceMinor <= 0n) {
    return (marketValue * holdBps) / 10_000n;
  }

  const purchaseIndex = input.purchasePriceIndexBps ?? BASE_PRICE_INDEX_BPS;
  const indexRatio =
    purchaseIndex > 0 ? input.currentPriceIndexBps / purchaseIndex : 1;
  const fromPurchase =
    (input.purchasePriceMinor * BigInt(Math.round(indexRatio * 10_000))) / 10_000n;
  const blended = (fromPurchase * 7_000n + marketValue * 3_000n) / 10_000n;
  return (blended * holdBps) / 10_000n > 0n ? (blended * holdBps) / 10_000n : 1n;
}

export type AssetSaleOutcome = 'loss' | 'break_even' | 'gain';

export function classifyAssetSale(
  purchasePriceMinor: bigint,
  salePriceMinor: bigint,
): { outcome: AssetSaleOutcome; deltaMinor: bigint } {
  const delta = salePriceMinor - purchasePriceMinor;
  const tolerance = purchasePriceMinor / 20n;
  if (delta > tolerance) return { outcome: 'gain', deltaMinor: delta };
  if (delta < -tolerance) return { outcome: 'loss', deltaMinor: delta };
  return { outcome: 'break_even', deltaMinor: delta };
}
