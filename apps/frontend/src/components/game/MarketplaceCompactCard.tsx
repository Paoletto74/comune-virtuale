import { MarketplaceItemImage } from '@/components/game/MarketplaceItemImage';
import type { MarketplaceItem } from '@/api/client';
import { formatEuro } from '@/utils/formatCash';
import { marketplaceOwnedLabel } from '@/utils/marketplaceOwnedLabel';

export function MarketplaceCompactCard({
  item,
  acting,
  onBuy,
  variant = 'new',
}: {
  item: MarketplaceItem;
  acting: string | null;
  onBuy: (
    itemId: string,
    mode: 'purchase' | 'rent',
    priceMinor?: string,
    listingId?: string,
  ) => void;
  variant?: 'new' | 'used';
}) {
  const isUsed = variant === 'used' || item.isShowcase || item.isPlayerListing;
  const actionKey = item.listingId ?? item.itemId;
  const purchaseBlocked = Boolean(item.purchaseBlocked) && !isUsed;

  return (
    <article
      className={`marketplaceCompactCard${isUsed ? ' marketplaceCompactCard--showcase' : ''}${purchaseBlocked ? ' marketplaceCompactCard--locked' : ''}`}
    >
      <MarketplaceItemImage imageKey={item.imageKey} imagePath={item.imagePath} />
      <div className="marketplaceCompactBody">
        {isUsed && (
          <span className="marketplaceShowcaseBadge">
            Usato{item.sellerName ? ` · ${item.sellerName}` : ''}
            {item.listingType === 'rent' ? ' · Affitto' : ''}
          </span>
        )}
        <h3 className="marketplaceCompactTitle">{item.name}</h3>
        <p className="marketplaceCompactPrice">{formatEuro(item.priceMinor)}</p>
        {purchaseBlocked && item.purchaseBlockReason && (
          <p className="marketplacePurchaseLock" aria-label="Requisito acquisto">
            🔒 {item.purchaseBlockReason}
          </p>
        )}
        <p className="marketplaceCompactOwned">{marketplaceOwnedLabel(item)}</p>
        {item.essential && !isUsed && (
          <p className="marketplaceCompactEssential">{item.essential}</p>
        )}
        {item.possessionStatus === 'rented' ? null : item.listingType === 'rent' ||
          (item.categoryId === 'housing' && isUsed) ? (
          <button
            type="button"
            className="feedButton feedButtonPrimary marketplaceCompactBuy"
            disabled={acting === actionKey}
            onClick={() => onBuy(item.itemId, 'rent', item.priceMinor, item.listingId)}
          >
            {acting === actionKey ? '…' : 'Affitta'}
          </button>
        ) : (
          <button
            type="button"
            className="feedButton feedButtonPrimary marketplaceCompactBuy"
            disabled={acting === actionKey || purchaseBlocked}
            onClick={() => onBuy(item.itemId, 'purchase', item.priceMinor, item.listingId)}
          >
            {acting === actionKey ? '…' : purchaseBlocked ? 'Bloccato' : 'Acquista'}
          </button>
        )}
      </div>
    </article>
  );
}
