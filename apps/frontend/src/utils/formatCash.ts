/** Formats amountMinor from API as a human-readable whole number (it-IT). */
export function formatCash(amountMinor: string): string {
  try {
    const value = BigInt(amountMinor);
    return new Intl.NumberFormat('it-IT').format(value);
  } catch {
    const n = Number(amountMinor);
    if (Number.isFinite(n)) {
      return new Intl.NumberFormat('it-IT').format(n);
    }
    return amountMinor;
  }
}

/** Formats balance as euro (1 credito = 1 euro). */
export function formatEuro(amountMinor: string): string {
  return `€ ${formatCash(amountMinor)}`;
}
