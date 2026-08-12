import { resolveCharacterPortraitAsset } from '@comune-virtuale/shared';

/** Static citizen portraits — unified characters/ library with /profiles legacy fallback. */

export const CITIZEN_PROFILE_PORTRAIT_SLOT_COUNT = 50;
export const CITIZEN_PROFILE_PORTRAIT_DIR = '/assets/characters';

const PORTRAIT_ID_PATTERN = /^profile_\d{3}$/;

export const CITIZEN_PROFILE_PORTRAIT_FILENAMES = Array.from(
  { length: CITIZEN_PROFILE_PORTRAIT_SLOT_COUNT },
  (_, index) => citizenProfilePortraitFilename(index + 1),
);

export const CITIZEN_PROFILE_PORTRAIT_IDS = Array.from(
  { length: CITIZEN_PROFILE_PORTRAIT_SLOT_COUNT },
  (_, index) => portraitIdFromSlot(index + 1),
);

export interface ResolvedCitizenPortrait {
  slot: number;
  imagePath: string;
  /** When true, skip loading WebP and use the SVG archetype placeholder. */
  useSvgFallback: boolean;
}

export function portraitIdFromSlot(slot: number): string {
  const clamped = Math.max(1, Math.min(CITIZEN_PROFILE_PORTRAIT_SLOT_COUNT, slot));
  return `profile_${String(clamped).padStart(3, '0')}`;
}

export function citizenProfilePortraitFilename(slot: number): string {
  return `${portraitIdFromSlot(slot)}.webp`;
}

export function citizenProfilePortraitPath(slot: number): string {
  return citizenProfilePortraitPathFromId(portraitIdFromSlot(slot));
}

export function citizenProfilePortraitPathFromId(portraitId: string): string {
  return resolveCharacterPortraitAsset(portraitId).primaryUrl;
}

export function isValidPortraitId(portraitId: string): boolean {
  if (!PORTRAIT_ID_PATTERN.test(portraitId)) {
    return false;
  }

  const slot = Number.parseInt(portraitId.slice('profile_'.length), 10);
  return Number.isInteger(slot) && slot >= 1 && slot <= CITIZEN_PROFILE_PORTRAIT_SLOT_COUNT;
}

export function resolveCitizenPortraitSlot(citizenId: string): number {
  let hash = 0;
  for (let i = 0; i < citizenId.length; i += 1) {
    hash = (hash * 31 + citizenId.charCodeAt(i)) >>> 0;
  }
  return (hash % CITIZEN_PROFILE_PORTRAIT_SLOT_COUNT) + 1;
}

export function resolveCitizenPortrait(
  citizenId?: string,
  portraitId?: string | null,
): ResolvedCitizenPortrait {
  if (portraitId && isValidPortraitId(portraitId)) {
    const slot = Number.parseInt(portraitId.slice('profile_'.length), 10);
    return {
      slot,
      imagePath: citizenProfilePortraitPathFromId(portraitId),
      useSvgFallback: false,
    };
  }

  if (!citizenId) {
    return { slot: 0, imagePath: '', useSvgFallback: true };
  }

  const slot = resolveCitizenPortraitSlot(citizenId);
  return {
    slot,
    imagePath: citizenProfilePortraitPath(slot),
    useSvgFallback: false,
  };
}
