/** Demo-only steal policy: requested loot = 50% of NPC wallet at spawn. */
export const DEMO_STEAL_WALLET_FRACTION_NUMERATOR = 1n;
export const DEMO_STEAL_WALLET_FRACTION_DENOMINATOR = 2n;

export function resolveDemoStealRequestedAmountMinor(walletMinor: bigint): bigint {
  return (walletMinor * DEMO_STEAL_WALLET_FRACTION_NUMERATOR) / DEMO_STEAL_WALLET_FRACTION_DENOMINATOR;
}
