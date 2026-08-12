import { createHash } from 'node:crypto';
import type { MarketplaceEconomicTier } from './marketplace-catalog-constants.js';
import { GAME_MS_PER_DAY } from './game-surface-constants.js';

const TIER_RESALE_BPS: Record<MarketplaceEconomicTier, number> = {
  ECONOMICO: 5500,
  MEDIO: 5800,
  ALTO: 6000,
  PREMIUM: 6200,
  LUSSO: 6500,
  'SUPER-LUSSO': 6800,
};

const TIER_RENT_BPS: Record<MarketplaceEconomicTier, number> = {
  ECONOMICO: 400,
  MEDIO: 350,
  ALTO: 300,
  PREMIUM: 250,
  LUSSO: 200,
  'SUPER-LUSSO': 150,
};

/** Prezzo automatico usato — percentuale del prezzo catalogo per fascia. */
export function usedListingPriceMinor(
  catalogPriceMinor: bigint,
  economicTier: MarketplaceEconomicTier = 'MEDIO',
): bigint {
  const bps = BigInt(TIER_RESALE_BPS[economicTier] ?? 6000);
  const price = (catalogPriceMinor * bps) / 10000n;
  return price > 0n ? price : 1n;
}

/** Canone mensile automatico — percentuale del valore immobile. */
export function monthlyRentPriceMinor(
  catalogPriceMinor: bigint,
  economicTier: MarketplaceEconomicTier = 'MEDIO',
): bigint {
  const bps = BigInt(TIER_RENT_BPS[economicTier] ?? 300);
  const rent = (catalogPriceMinor * bps) / 10000n;
  return rent > 50n ? rent : 50n;
}

export const MARKETPLACE_RENT_DURATION_MS = 30 * GAME_MS_PER_DAY;

const MIN_NPC_WAIT_MS = 1 * GAME_MS_PER_DAY;
const MAX_NPC_WAIT_MS = 5 * GAME_MS_PER_DAY;

/** Attesa casuale deterministica prima che un NPC possa intervenire. */
export function npcPriorityWaitGameMs(seed: string, listedAtGameMs: number): number {
  const hash = createHash('sha256').update(seed).digest();
  const span = MAX_NPC_WAIT_MS - MIN_NPC_WAIT_MS;
  const offset = (hash[0]! * 256 + hash[1]!) % (span + 1);
  return listedAtGameMs + MIN_NPC_WAIT_MS + offset;
}

export function isNpcPriorityWindowActive(
  npcResolveAfterGameMs: number | null,
  gameTimeMs: number,
): boolean {
  if (npcResolveAfterGameMs == null) return false;
  return gameTimeMs < npcResolveAfterGameMs;
}

export const RENTED_PROPERTY_SALE_REFUND_MONTHS = 3;

export function rentedPropertySaleRefundMinor(monthlyRentMinor: bigint): bigint {
  return monthlyRentMinor * BigInt(RENTED_PROPERTY_SALE_REFUND_MONTHS);
}
