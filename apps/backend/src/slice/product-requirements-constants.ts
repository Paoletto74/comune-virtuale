import type { MarketplaceCategoryId, MarketplaceEconomicTier } from './marketplace-catalog-constants.js';

/** Requirement checked against player inventory at task start only. */
export type ProductRequirementSpec =
  | { kind: 'category'; categoryId: MarketplaceCategoryId; label: string }
  | {
      kind: 'economicTier';
      categoryId: MarketplaceCategoryId;
      minTier: MarketplaceEconomicTier;
      label: string;
    }
  | { kind: 'item'; itemId: string; label: string }
  | { kind: 'anyOf'; options: ProductRequirementSpec[]; label: string }
  | { kind: 'consumableFood'; label: string };

export interface TaskProductRequirementDef {
  requirement: ProductRequirementSpec;
  /** When true, removes one matching consumable inventory row on task start. */
  consumeOnStart?: boolean;
}

export interface ProductRequirementEvaluation {
  satisfied: boolean;
  label: string;
  detail: string;
}

export interface PurchaseRequirementEvaluation {
  blocked: boolean;
  minMainLevel?: number;
  blockReason?: string;
}

const TIER_RANK: Record<MarketplaceEconomicTier, number> = {
  ECONOMICO: 1,
  MEDIO: 2,
  ALTO: 3,
  PREMIUM: 4,
  LUSSO: 5,
  'SUPER-LUSSO': 6,
};

export function economicTierRank(tier: MarketplaceEconomicTier): number {
  return TIER_RANK[tier] ?? 0;
}

/** Prestige gate for catalog purchases — derived from economic tier. */
export function minMainLevelForPurchaseTier(tier: MarketplaceEconomicTier): number | null {
  if (tier === 'ECONOMICO' || tier === 'MEDIO') return null;
  if (tier === 'ALTO') return 2;
  if (tier === 'PREMIUM') return 3;
  return 4;
}

export function purchaseRequirementLabel(minMainLevel: number): string {
  return `Prestigio ${minMainLevel} richiesto`;
}
