import type { VisualTimePhase } from './visual-time-phase.js';

/** MEGA 4/4 — unified visual asset taxonomy (asset-driven, no runtime generation). */

export type AssetCategory =
  | 'characters'
  | 'news'
  | 'referendum'
  | 'task'
  | 'group'
  | 'car'
  | 'house'
  | 'boat'
  | 'item'
  | 'job'
  | 'career'
  | 'location'
  | 'event'
  | 'section_background'
  | 'hero'
  | 'thumbnail'
  | 'avatar'
  | 'badge'
  | 'icon'
  | 'illustration';

export type AssetAspect = '1:1' | '2:1' | '3:1' | '4:1' | '4:5' | '9:16';

export type AssetPresence = 'present' | 'missing' | 'error';

export interface AssetMetadata {
  gender?: 'f' | 'm' | 'other';
  ageGroup?: string;
  character?: string;
  occupation?: string;
  style?: string;
  tags?: string[];
  personality?: string;
  visualTraits?: string[];
  colorProfile?: string;
  assetVariant?: string;
}

export interface AssetCatalogEntry {
  /** Unique key: `{category}:{assetId}` */
  assetKey: string;
  category: AssetCategory;
  /** Filename without directory (e.g. `gazzetta-economy.webp`) */
  filename: string;
  aspect: AssetAspect;
  label?: string;
  /** Suggested export dimensions for asset producers (native ratio, no crop). */
  recommendedPx?: { width: number; height: number };
  /** Optional metadata — filename stays simple */
  metadata?: AssetMetadata;
  /** Legacy static paths checked before marking missing (drop-in migration). */
  legacyPaths?: string[];
  /** When true, resolver tries `{base}.{phase}.webp` before the default file. */
  timePhased?: boolean;
}

export type { VisualTimePhase };

export interface ResolvedAsset {
  assetKey: string;
  category: AssetCategory;
  /** Primary URL under `/assets/{category}/` */
  primaryUrl: string;
  /** Additional URLs to try (legacy folders, aliases). */
  fallbackUrls: string[];
  aspect: AssetAspect;
  label: string;
  filename: string;
  /** Present when asset supports real-time phase variants. */
  timePhased?: boolean;
}

export interface AssetStatusRow extends AssetCatalogEntry {
  resolved: ResolvedAsset;
  /** Filesystem / probe result */
  presence: AssetPresence;
  /** URL that resolved when present */
  resolvedUrl?: string;
  /** Per-phase file probe for time-phased ambient assets */
  phaseVariants?: Partial<
    Record<
      VisualTimePhase,
      {
        presence: AssetPresence;
        url?: string;
      }
    >
  >;
}
