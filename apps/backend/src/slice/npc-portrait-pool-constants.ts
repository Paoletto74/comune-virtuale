/** Shared pool — unified characters/ library with /npc-portraits legacy fallback. */
export const NPC_PORTRAIT_POOL_SIZE = 50;

const NPC_PORTRAIT_ID_PATTERN = /^npc_\d{3}$/;

export function isValidNpcPoolPortraitId(portraitId: string): boolean {
  if (!NPC_PORTRAIT_ID_PATTERN.test(portraitId)) return false;
  const slot = Number.parseInt(portraitId.slice(4), 10);
  return slot >= 1 && slot <= NPC_PORTRAIT_POOL_SIZE;
}

import { resolveCharacterPortraitAsset } from '@comune-virtuale/shared';

export function npcPoolPortraitImagePath(portraitId: string): string {
  return resolveCharacterPortraitAsset(portraitId).primaryUrl;
}

export function listNpcPoolPortraitIds(): string[] {
  return Array.from({ length: NPC_PORTRAIT_POOL_SIZE }, (_, index) =>
    `npc_${String(index + 1).padStart(3, '0')}`,
  );
}
