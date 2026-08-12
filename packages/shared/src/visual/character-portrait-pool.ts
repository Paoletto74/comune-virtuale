/** Unified character portrait pool — NPC folder is the single source for all players. */

export const CHARACTER_PORTRAIT_POOL_SIZE = 50;
export const CHARACTER_PORTRAIT_LEGACY_DIR = '/npc-portraits';

const NPC_PORTRAIT_ID_PATTERN = /^npc_\d{3}$/;
const LEGACY_PROFILE_PORTRAIT_ID_PATTERN = /^profile_\d{3}$/;

export function normalizeCharacterPortraitId(portraitId: string): string {
  if (LEGACY_PROFILE_PORTRAIT_ID_PATTERN.test(portraitId)) {
    return `npc_${portraitId.slice('profile_'.length)}`;
  }
  return portraitId;
}

export function portraitIdFromSlot(slot: number): string {
  const clamped = Math.max(1, Math.min(CHARACTER_PORTRAIT_POOL_SIZE, slot));
  return `npc_${String(clamped).padStart(3, '0')}`;
}

export function isValidCharacterPortraitPoolId(portraitId: string): boolean {
  const normalized = normalizeCharacterPortraitId(portraitId);
  if (!NPC_PORTRAIT_ID_PATTERN.test(normalized)) {
    return false;
  }
  const slot = Number.parseInt(normalized.slice(4), 10);
  return Number.isInteger(slot) && slot >= 1 && slot <= CHARACTER_PORTRAIT_POOL_SIZE;
}

export function listCharacterPortraitPoolIds(): string[] {
  return Array.from({ length: CHARACTER_PORTRAIT_POOL_SIZE }, (_, index) =>
    portraitIdFromSlot(index + 1),
  );
}

export function characterPortraitFilename(portraitId: string): string {
  return `${normalizeCharacterPortraitId(portraitId)}.webp`;
}
