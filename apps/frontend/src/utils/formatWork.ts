import { formatEuro } from '@/utils/formatCash';

/** Formats monthly salary hint from backend minor units. */
export function formatMonthlySalary(amountMinor: string): string {
  return `${formatEuro(amountMinor)} / mese`;
}

/** Formats remaining shift duration from game milliseconds. */
export function formatShiftRemaining(remainingMs: number): string {
  const totalMinutes = Math.ceil(remainingMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  return `${hours} h ${String(minutes).padStart(2, '0')} min`;
}
