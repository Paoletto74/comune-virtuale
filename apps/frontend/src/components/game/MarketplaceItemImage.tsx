import { type ReactNode } from 'react';
import { VisualAssetImage } from '@/components/visual/VisualAssetImage';

/** SVG fallback icons when marketplace image path is absent. */
const ICONS: Record<string, ReactNode> = {
  food: (
    <svg viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="20" fill="currentColor" opacity="0.15" />
      <path d="M16 28c2-8 6-12 8-12s6 4 8 12" stroke="currentColor" strokeWidth="2" fill="none" />
      <ellipse cx="24" cy="30" rx="10" ry="4" fill="currentColor" opacity="0.35" />
    </svg>
  ),
  drink: (
    <svg viewBox="0 0 48 48" aria-hidden>
      <path d="M14 10h20l-4 28H18L14 10z" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  vehicle: (
    <svg viewBox="0 0 48 48" aria-hidden>
      <rect x="8" y="20" width="32" height="12" rx="3" fill="currentColor" opacity="0.25" />
      <circle cx="16" cy="34" r="4" fill="currentColor" />
      <circle cx="32" cy="34" r="4" fill="currentColor" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 48 48" aria-hidden>
      <path d="M8 22 L24 8 L40 22 V38 H8 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="18" y="28" width="12" height="10" fill="currentColor" opacity="0.35" />
    </svg>
  ),
  luxury: (
    <svg viewBox="0 0 48 48" aria-hidden>
      <path d="M24 8l4 12h12l-10 8 4 12-10-7-10 7 4-12-10-8h12z" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  tech: (
    <svg viewBox="0 0 48 48" aria-hidden>
      <rect x="12" y="8" width="24" height="32" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="36" r="2" fill="currentColor" />
    </svg>
  ),
  sport: (
    <svg viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M24 10v28M10 24h28" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 48 48" aria-hidden>
      <path d="M12 10h12v28H12a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" fill="currentColor" opacity="0.25" />
      <path d="M36 10H24v28h12a4 4 0 0 0 4-4V14a4 4 0 0 0-4-4z" fill="currentColor" opacity="0.35" />
    </svg>
  ),
};

export function MarketplaceItemImage({
  imageKey,
  imagePath,
}: {
  imageKey: string;
  imagePath?: string;
}) {
  if (!imagePath) {
    return (
      <div className="marketplaceItemImage marketplaceItemImage--missing" aria-hidden>
        {ICONS[imageKey] ?? ICONS.luxury}
      </div>
    );
  }

  return (
    <div className="marketplaceItemImage" aria-hidden>
      <VisualAssetImage
        src={imagePath}
        aspect="1:1"
        label={`Item ${imageKey}`}
        className="marketplaceItemImageAssetWrap"
        lazy
      />
    </div>
  );
}
