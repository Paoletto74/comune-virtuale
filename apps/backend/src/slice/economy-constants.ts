/**
 * Slice B — economy runtime decisions (NOT content pack modifications).
 * See docs/phase2/economy-slice-b-decisions.md
 */

/** Approved slice decision — pack STARTER_CASH is TBD in content. */
export const SLICE_STARTER_CASH_MINOR = 100n;

/** From economy_main_v1/currency.yaml — default currency id. */
export const SLICE_GAME_CURRENCY_ID = 'game_currency';

export const SLICE_STARTER_CASH_REASON = 'STARTER_CASH';
export const SLICE_STARTER_CASH_TRANSACTION_TYPE = 'systemGrant';
export const SLICE_STARTER_CASH_TRANSACTION_CLASS = 'money_creation';

export function starterCashSourceActionId(citizenId: string): string {
  return `starter:${citizenId}`;
}

export function starterCashIdempotencyKey(citizenId: string): string {
  return `starter-cash:${citizenId}`;
}

export function economicAccountId(ownerType: string, ownerRef: string): string {
  return `${ownerType}:${ownerRef}`;
}

export function citizenAccountId(citizenId: string): string {
  return economicAccountId('citizen', citizenId);
}

export function npcAccountId(npcId: string): string {
  return economicAccountId('npc', npcId);
}

export const SLICE_SYSTEM_ACCOUNT_ID = 'system:game_currency';

export const SLICE_TRANSFER_TRANSACTION_CLASS = 'money_transfer';

export function transferIdempotencyKey(sourceActionId: string): string {
  return `transfer:${sourceActionId}`;
}

/** Slice B.1 — help cash reward (runtime; pack magnitudes TBD). */
export const SLICE_DEMO_HELP_CASH_DELTA_MINOR = 0n;

export const SLICE_DEMO_HELP_CASH_REASON = 'DEMO_HELP_ELDERLY_CASH';
export const SLICE_DEMO_HELP_CASH_TRANSACTION_TYPE = 'taskReward';
export const SLICE_DEMO_HELP_CASH_TRANSACTION_CLASS = 'money_creation';

export function taskCashSourceActionId(taskInstanceId: string, optionId: string): string {
  return `task:${taskInstanceId}:complete:${optionId}`;
}

export function taskCashIdempotencyKey(taskInstanceId: string, optionId: string): string {
  return `task-cash:${taskInstanceId}:${optionId}`;
}

export const SLICE_STEAL_WALLET_REASON = 'STEAL_WALLET';
export const SLICE_STEAL_WALLET_TRANSACTION_TYPE = 'theft';
export const SLICE_NPC_WALLET_SEED_REASON = 'NPC_WALLET_SEED';
export const SLICE_NPC_WALLET_SEED_TRANSACTION_TYPE = 'npcWalletSeed';

export function npcWalletSeedSourceActionId(taskInstanceId: string, npcId: string): string {
  return `npc-seed:${taskInstanceId}:${npcId}`;
}

export function npcWalletSeedIdempotencyKey(taskInstanceId: string, npcId: string): string {
  return `npc-wallet-seed:${taskInstanceId}:${npcId}`;
}

/** Zero cash delta — ignore and options without economic effect. */
export const SLICE_ZERO_CASH_DELTA = 0n;
