import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, api } from '@/api/client';
import { randomUUID } from '@/api/uuid';
import { MarketplaceCompactCard } from '@/components/game/MarketplaceCompactCard';
import { useMarketplace, useProfileDetail } from '@/hooks/useGameApi';
import { resolveErrorMessage } from '@/utils/errorCopy';
import { isConsumableCategory } from '@/utils/marketplaceHelpers';

export function OccasioniPanel() {
  const { data, isLoading, error } = useMarketplace();
  const { data: profile } = useProfileDetail();
  const queryClient = useQueryClient();
  const [acting, setActing] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [listingItemId, setListingItemId] = useState('');

  const occasioniItems =
    data?.categories.flatMap((category) => category.showcase) ?? [];

  const resellableInventory =
    profile?.inventory.filter((item) => !isConsumableCategory(item.category)) ?? [];

  async function handleBuy(
    itemId: string,
    mode: 'purchase' | 'rent' = 'purchase',
    priceMinor?: string,
    listingId?: string,
  ) {
    const key = listingId ?? itemId;
    setActing(key);
    setActionError(null);
    try {
      if (mode === 'rent') {
        if (listingId) {
          await api.marketplaceBuyListing(listingId, randomUUID());
        } else {
          await api.marketplaceRent(itemId, listingId, randomUUID());
        }
      } else if (listingId) {
        await api.marketplaceBuyListing(listingId, randomUUID());
      } else {
        await api.marketplacePurchase(itemId, randomUUID());
      }
      await queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['home'] });
    } catch (err) {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Acquisto non riuscito',
      );
    } finally {
      setActing(null);
    }
  }

  async function handleListForSale(listingType: 'sale' | 'rent') {
    if (!listingItemId) return;
    setActionError(null);
    try {
      await api.marketplaceCreateListing(listingItemId, listingType, randomUUID());
      setListingItemId('');
      await queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Impossibile pubblicare',
      );
    }
  }

  if (isLoading) return <p className="loading">Caricamento occasioni…</p>;
  if (error) return <p className="error">Impossibile caricare le occasioni.</p>;

  return (
    <>
      <section className="profileSection card" aria-label="Metti in vendita">
        <h2 className="cardTitle">Vendi o affitta un tuo oggetto</h2>
        <p className="muted">Il Comune calcola automaticamente prezzo e tempi. Tu decidi solo cosa fare.</p>
        {resellableInventory.length === 0 ? (
          <p className="emptyState">Niente da rivendere. Compra qualcosa che non sia cibo.</p>
        ) : (
          <div className="occasioniSellForm">
            <select
              className="occasioniSellSelect"
              value={listingItemId}
              onChange={(e) => setListingItemId(e.target.value)}
              aria-label="Oggetto da vendere o affittare"
            >
              <option value="">Seleziona oggetto</option>
              {resellableInventory.map((item) => (
                <option key={item.itemId} value={item.itemId}>
                  {item.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="feedButton feedButtonPrimary"
              onClick={() => void handleListForSale('sale')}
            >
              Metti in vendita
            </button>
            <button
              type="button"
              className="feedButton feedButtonOption"
              onClick={() => void handleListForSale('rent')}
            >
              Metti in affitto
            </button>
          </div>
        )}
      </section>

      <section aria-label="Occasioni disponibili">
        {occasioniItems.length === 0 ? (
          <p className="emptyState">Nessuna occasione al momento. Torna dopo. O non tornare.</p>
        ) : (
          <div className="marketplaceGrid">
            {occasioniItems.map((item) => (
              <MarketplaceCompactCard
                key={item.listingId ?? item.itemId}
                item={item}
                acting={acting}
                onBuy={handleBuy}
                variant="used"
              />
            ))}
          </div>
        )}
      </section>

      {actionError && <p className="error">{actionError}</p>}
    </>
  );
}
