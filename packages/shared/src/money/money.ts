/** Money value object — integer minor units, contracts_v1/money.yaml */

export interface Money {
  amountMinor: bigint;
  currency: string;
}

export function createMoney(amountMinor: bigint, currency: string): Money {
  if (amountMinor < 0n) {
    throw new Error('Money amountMinor must be non-negative');
  }
  if (!currency || currency.length === 0) {
    throw new Error('Money currency is required');
  }
  return { amountMinor, currency };
}

export function moneyFromMinorString(amount: string, currency: string): Money {
  return createMoney(BigInt(amount), currency);
}

/** Serialize for JSON API transport (avoid Number precision loss). */
export function serializeMoney(money: Money): { amountMinor: string; currency: string } {
  return {
    amountMinor: money.amountMinor.toString(),
    currency: money.currency,
  };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error('Cannot add money with different currencies');
  }
  return createMoney(a.amountMinor + b.amountMinor, a.currency);
}
