import { describe, expect, it } from 'vitest';
import {
  CHARACTER_PORTRAIT_POOL_SIZE,
  isValidCharacterPortraitPoolId,
  listCharacterPortraitPoolIds,
  normalizeCharacterPortraitId,
  portraitIdFromSlot,
} from './character-portrait-pool.js';

describe('character-portrait-pool', () => {
  it('uses npc ids for the shared pool', () => {
    expect(portraitIdFromSlot(1)).toBe('npc_001');
    expect(portraitIdFromSlot(CHARACTER_PORTRAIT_POOL_SIZE)).toBe('npc_050');
    expect(listCharacterPortraitPoolIds()).toHaveLength(CHARACTER_PORTRAIT_POOL_SIZE);
  });

  it('normalizes legacy profile ids to npc slots', () => {
    expect(normalizeCharacterPortraitId('profile_012')).toBe('npc_012');
    expect(normalizeCharacterPortraitId('npc_012')).toBe('npc_012');
  });

  it('validates npc and legacy profile ids in range', () => {
    expect(isValidCharacterPortraitPoolId('npc_001')).toBe(true);
    expect(isValidCharacterPortraitPoolId('profile_050')).toBe(true);
    expect(isValidCharacterPortraitPoolId('npc_051')).toBe(false);
    expect(isValidCharacterPortraitPoolId('profile_051')).toBe(false);
    expect(isValidCharacterPortraitPoolId('invalid')).toBe(false);
  });
});
