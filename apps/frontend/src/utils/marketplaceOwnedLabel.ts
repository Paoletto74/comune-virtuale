import type { MarketplaceItem } from '@/api/client';
import { formatShiftRemaining } from '@/utils/formatWork';

export function marketplaceOwnedLabel(item: Pick<MarketplaceItem, 'ownedCount' | 'owned' | 'possessionStatus' | 'remainingRentMs'>): string {
  if (item.possessionStatus === 'rented') {
    const remaining =
      item.remainingRentMs != null ? formatShiftRemaining(item.remainingRentMs) : '—';
    return `IN AFFITTO · Scade tra: ${remaining}`;
  }
  const count = item.ownedCount ?? (item.owned ? 1 : 0);
  return `POSSEDI: ${count}`;
}
