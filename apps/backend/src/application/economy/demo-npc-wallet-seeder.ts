import { createHash } from 'node:crypto';

/** Demo-only wallet band (runtime — not a universal rule). */
export const DEMO_ELDERLY_WALLET_VALUES_MINOR = [20n, 30n, 40n, 50n] as const;

/**
 * Deterministic variable wallet for demo elderly NPCs.
 * Same taskInstanceId always yields the same wallet (audit/retry friendly).
 */
export function resolveDemoElderlyNpcWalletMinor(taskInstanceId: string): bigint {
  const digest = createHash('sha256').update(taskInstanceId).digest();
  const index = digest[0]! % DEMO_ELDERLY_WALLET_VALUES_MINOR.length;
  return DEMO_ELDERLY_WALLET_VALUES_MINOR[index]!;
}
