import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, api, type MarketplaceCategoryFeed } from '@/api/client';
import { randomUUID } from '@/api/uuid';
import { MarketplaceCompactCard } from '@/components/game/MarketplaceCompactCard';
import { useMarketplace } from '@/hooks/useGameApi';
import { resolveErrorMessage } from '@/utils/errorCopy';

const CATEGORY_CLASS: Record<string, string> = {
  consumables: 'marketplaceSection--consumables',
  vehicles: 'marketplaceSection--vehicles',
  housing: 'marketplaceSection--housing',
  luxury: 'marketplaceSection--luxury',
};

function MarketplaceCategorySection({
  category,
  acting,
  onBuy,
}: {
  category: MarketplaceCategoryFeed;
  acting: string | null;
  onBuy: (
    itemId: string,
    mode: 'purchase' | 'rent',
    priceMinor?: string,
    listingId?: string,
  ) => void;
}) {
  return (
    <section
      className={`marketplaceSection ${CATEGORY_CLASS[category.categoryId] ?? ''}`}
      aria-label={category.label}
    >
      <header className="marketplaceSectionHeader">
        <h2 className="marketplaceSectionTitle">{category.label}</h2>
      </header>
      <div className="marketplaceGrid">
        {category.items.map((item) => (
          <MarketplaceCompactCard
            key={item.itemId}
            item={item}
            acting={acting}
            onBuy={onBuy}
            variant="new"
          />
        ))}
      </div>
    </section>
  );
}

export function MarketplacePanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useMarketplace();
  const [acting, setActing] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleBuy(
    itemId: string,
    mode: 'purchase' | 'rent' = 'purchase',
    priceMinor?: string,
    listingId?: string,
  ) {
    setActing(itemId);
    setActionError(null);
    try {
      if (mode === 'rent') {
        await api.marketplaceRent(itemId, listingId, randomUUID());
      } else {
        await api.marketplacePurchase(itemId, randomUUID());
      }
      await queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      await queryClient.invalidateQueries({ queryKey: ['home'] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Errore acquisto',
      );
    } finally {
      setActing(null);
    }
  }

  if (isLoading) return <p className="loading">Caricamento marketplace…</p>;
  if (error) return <p className="error">Impossibile caricare il marketplace.</p>;
  if (data && !data.enabled) {
    return (
      <p className="emptyState">
        Marketplace non disponibile. Applica la migration del database per abilitarlo.
      </p>
    );
  }

  const categories = data?.categories ?? [];

  if (categories.length === 0 && (data?.items?.length ?? 0) === 0) {
    return <p className="emptyState">Nessun bene in vendita.</p>;
  }

  return (
    <>
      {categories.map((category) => (
        <MarketplaceCategorySection
          key={category.categoryId}
          category={category}
          acting={acting}
          onBuy={handleBuy}
        />
      ))}
      {actionError && <p className="error">{actionError}</p>}
    </>
  );
}
