import { ASSET_CATEGORY_DIRS, DEFAULT_ASPECT_BY_CATEGORY, findCatalogEntry, findCatalogEntryByCategoryId } from './asset-catalog.js';
import type { AssetAspect, AssetCatalogEntry, AssetCategory, ResolvedAsset } from './asset-types.js';
import { phaseVariantUrl } from './time-phased-asset.js';
import type { VisualTimePhase } from './visual-time-phase.js';

const TIME_PHASED_CATEGORIES = new Set<AssetCategory>([
  'hero',
  'news',
  'referendum',
  'section_background',
]);

function stripExtension(filename: string): string {
  return filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
}

function isTimePhasedCategory(category: AssetCategory): boolean {
  return TIME_PHASED_CATEGORIES.has(category);
}

function resolveTimePhased(entry: AssetCatalogEntry | { category: AssetCategory; timePhased?: boolean }): boolean {
  if (entry.timePhased !== undefined) return entry.timePhased;
  return isTimePhasedCategory(entry.category);
}

export function primaryAssetUrl(category: AssetCategory, filename: string): string {
  const base = ASSET_CATEGORY_DIRS[category];
  return `${base}/${filename}`;
}

export function resolveCatalogEntry(entry: AssetCatalogEntry): ResolvedAsset {
  const primaryUrl = primaryAssetUrl(entry.category, entry.filename);
  const fallbackUrls = [...(entry.legacyPaths ?? [])];
  return {
    assetKey: entry.assetKey,
    category: entry.category,
    primaryUrl,
    fallbackUrls,
    aspect: entry.aspect,
    label: entry.label ?? stripExtension(entry.filename),
    filename: entry.filename,
    timePhased: resolveTimePhased(entry),
  };
}

export function resolveAssetKey(assetKey: string): ResolvedAsset | null {
  const entry = findCatalogEntry(assetKey);
  if (!entry) return null;
  return resolveCatalogEntry(entry);
}

export function resolveAsset(category: AssetCategory, assetId: string): ResolvedAsset {
  const entry = findCatalogEntryByCategoryId(category, assetId);
  if (entry) return resolveCatalogEntry(entry);

  const filename = assetId.endsWith('.webp') ? assetId : `${assetId}.webp`;
  const aspect: AssetAspect = DEFAULT_ASPECT_BY_CATEGORY[category] ?? '2:1';
  return {
    assetKey: `${category}:${assetId}`,
    category,
    primaryUrl: primaryAssetUrl(category, filename),
    fallbackUrls: [],
    aspect,
    label: assetId,
    filename,
    timePhased: isTimePhasedCategory(category),
  };
}

/**
 * Maps semantic imageKey from gameplay (heroImageKey, section keys) to catalog category + id.
 * Does not hardcode URLs — only category routing.
 */
export function resolveSemanticImageKey(imageKey: string): ResolvedAsset {
  const key = imageKey.trim();
  if (!key || key === 'placeholder') {
    return resolveAsset('hero', 'placeholder');
  }

  if (key.startsWith('gazzetta-')) {
    return resolveAsset('news', key);
  }
  if (key.startsWith('referendum-') || key === 'referendum') {
    return resolveAsset('referendum', key);
  }
  if (key.endsWith('-hero')) {
    return resolveAsset('hero', key);
  }
  if (key.endsWith('-bg')) {
    return resolveAsset('section_background', key);
  }
  if (/^profile_\d{3}$/.test(key) || /^npc_\d{3}$/.test(key)) {
    return resolveAsset('characters', key);
  }
  if (key.startsWith('character_')) {
    return resolveAsset('characters', key);
  }

  return resolveAsset('hero', key);
}

/** Character portrait — unified library with legacy folder fallback. */
export function resolveCharacterPortraitAsset(portraitId: string): ResolvedAsset {
  if (portraitId.startsWith('profile_')) {
    const resolved = resolveAsset('characters', portraitId);
    return {
      ...resolved,
      fallbackUrls: [`/profiles/${portraitId}.webp`, ...resolved.fallbackUrls],
    };
  }
  if (portraitId.startsWith('npc_')) {
    const resolved = resolveAsset('characters', portraitId);
    return {
      ...resolved,
      fallbackUrls: [`/npc-portraits/${portraitId}.webp`, ...resolved.fallbackUrls],
    };
  }
  return resolveAsset('characters', portraitId);
}

export interface CandidateUrlOptions {
  timePhase?: VisualTimePhase;
}

export function allCandidateUrls(resolved: ResolvedAsset, options?: CandidateUrlOptions): string[] {
  const urls: string[] = [];
  if (resolved.timePhased && options?.timePhase) {
    urls.push(phaseVariantUrl(resolved.category, resolved.filename, options.timePhase));
  }
  urls.push(resolved.primaryUrl, ...resolved.fallbackUrls);
  return urls;
}
