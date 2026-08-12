import { ASPECT_RECOMMENDED_PX } from './aspect-ratio.js';
import type { AssetAspect, AssetCatalogEntry, AssetCategory } from './asset-types.js';

const ASSET_BASE = '/assets';

/** Canonical folder per category — drop `.webp` files here without code changes. */
export const ASSET_CATEGORY_DIRS: Record<AssetCategory, string> = {
  characters: `${ASSET_BASE}/characters`,
  news: `${ASSET_BASE}/news`,
  referendum: `${ASSET_BASE}/referendum`,
  task: `${ASSET_BASE}/task`,
  group: `${ASSET_BASE}/group`,
  car: `${ASSET_BASE}/car`,
  house: `${ASSET_BASE}/house`,
  boat: `${ASSET_BASE}/boat`,
  item: `${ASSET_BASE}/item`,
  job: `${ASSET_BASE}/job`,
  career: `${ASSET_BASE}/career`,
  location: `${ASSET_BASE}/location`,
  event: `${ASSET_BASE}/event`,
  section_background: `${ASSET_BASE}/section_background`,
  hero: `${ASSET_BASE}/hero`,
  thumbnail: `${ASSET_BASE}/thumbnail`,
  avatar: `${ASSET_BASE}/avatar`,
  badge: `${ASSET_BASE}/badge`,
  icon: `${ASSET_BASE}/icon`,
  illustration: `${ASSET_BASE}/illustration`,
};

export const CHARACTER_LIBRARY_SLOT_COUNT = 50;

/** Default aspect when category is known but entry is ad-hoc. */
export const DEFAULT_ASPECT_BY_CATEGORY: Partial<Record<AssetCategory, AssetAspect>> = {
  characters: '1:1',
  avatar: '1:1',
  badge: '1:1',
  icon: '1:1',
  item: '1:1',
  car: '1:1',
  house: '1:1',
  boat: '1:1',
  thumbnail: '2:1',
  hero: '3:1',
  news: '3:1',
  referendum: '3:1',
  section_background: '4:1',
  task: '2:1',
  career: '1:1',
  illustration: '2:1',
};

const GAZZETTA_CATEGORIES = [
  'cronaca',
  'economy',
  'city',
  'milestone',
  'referendum',
  'politica',
  'sociale',
  'lavoro',
] as const;

const SECTION_HEROES = [
  { id: 'home-hero', label: 'Hero Home' },
  { id: 'marketplace-hero', label: 'Hero Mercato' },
  { id: 'jobs-hero', label: 'Hero Lavoro' },
  { id: 'tasks-hero', label: 'Hero Attività' },
  { id: 'comune-hero', label: 'Hero Comune' },
  { id: 'relazioni-hero', label: 'Hero Relazioni' },
  { id: 'profilo-hero', label: 'Hero Profilo' },
] as const;

const SECTION_BACKGROUNDS = [
  'home',
  'comune',
  'gazzetta',
  'relazioni',
  'mercato',
  'lavoro',
  'profilo',
  'attivita',
] as const;

const REFERENDUM_HEROES = ['referendum-default', 'referendum-cannabis'] as const;

const OPENING_BACKGROUNDS = [
  { id: 'home-morning', label: 'Apertura — Mattino' },
  { id: 'home-day', label: 'Apertura — Giorno' },
  { id: 'home-sunset', label: 'Apertura — Tramonto' },
  { id: 'home-night', label: 'Apertura — Notte' },
] as const;

function entry(
  category: AssetCategory,
  assetId: string,
  aspect: AssetAspect,
  options?: {
    filename?: string;
    label?: string;
    metadata?: AssetCatalogEntry['metadata'];
    legacyPaths?: string[];
    timePhased?: boolean;
  },
): AssetCatalogEntry {
  const filename = options?.filename ?? `${assetId}.webp`;
  return {
    assetKey: `${category}:${assetId}`,
    category,
    filename,
    aspect,
    recommendedPx: ASPECT_RECOMMENDED_PX[aspect],
    label: options?.label ?? assetId,
    metadata: options?.metadata,
    legacyPaths: options?.legacyPaths,
    timePhased: options?.timePhased,
  };
}

function characterSlotEntries(prefix: 'profile' | 'npc', legacyDir: string): AssetCatalogEntry[] {
  return Array.from({ length: CHARACTER_LIBRARY_SLOT_COUNT }, (_, index) => {
    const slot = index + 1;
    const assetId = `${prefix}_${String(slot).padStart(3, '0')}`;
    return entry('characters', assetId, '1:1', {
      label: `Character ${assetId}`,
      legacyPaths: [`${legacyDir}/${assetId}.webp`],
    });
  });
}

/** Master catalog — gameplay references assetKey / semantic imageKey, not URLs. */
export function buildAssetCatalog(): AssetCatalogEntry[] {
  const catalog: AssetCatalogEntry[] = [];

  catalog.push(...characterSlotEntries('profile', '/profiles'));
  catalog.push(...characterSlotEntries('npc', '/npc-portraits'));

  for (const cat of GAZZETTA_CATEGORIES) {
    const assetId = `gazzetta-${cat}`;
    catalog.push(
      entry('news', assetId, '3:1', {
        label: `Gazzetta ${cat}`,
        timePhased: true,
      }),
    );
  }

  for (const hero of SECTION_HEROES) {
    catalog.push(entry('hero', hero.id, '3:1', { label: hero.label, timePhased: true }));
  }

  for (const opening of OPENING_BACKGROUNDS) {
    catalog.push(entry('hero', opening.id, '9:16', { label: opening.label }));
  }

  for (const section of SECTION_BACKGROUNDS) {
    catalog.push(
      entry('section_background', `${section}-bg`, '4:1', {
        label: `Background ${section}`,
        timePhased: true,
      }),
    );
  }

  for (const ref of REFERENDUM_HEROES) {
    catalog.push(
      entry('referendum', ref, '3:1', {
        label: ref,
        timePhased: true,
      }),
    );
  }

  catalog.push(
    entry('referendum', 'referendum', '3:1', { label: 'Referendum generico', timePhased: true }),
  );

  return catalog;
}

export const ASSET_CATALOG: AssetCatalogEntry[] = buildAssetCatalog();

export function findCatalogEntry(assetKey: string): AssetCatalogEntry | undefined {
  return ASSET_CATALOG.find((e) => e.assetKey === assetKey);
}

export function findCatalogEntryByCategoryId(
  category: AssetCategory,
  assetId: string,
): AssetCatalogEntry | undefined {
  return findCatalogEntry(`${category}:${assetId}`);
}
