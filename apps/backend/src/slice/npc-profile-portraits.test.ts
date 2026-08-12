import { describe, expect, it } from 'vitest';
import { INITIAL_NPC_COUNT } from './initial-npc-roster.js';
import {
  NPC_PORTRAIT_PROFILES,
  resolveNpcPortraitImagePath,
  resolveNpcPortraitVariant,
} from './npc-profile-portraits.js';

describe('npc-profile-portraits', () => {
  it('defines portrait metadata for all 30 roster NPCs', () => {
    expect(Object.keys(NPC_PORTRAIT_PROFILES).length).toBe(INITIAL_NPC_COUNT);
    expect(INITIAL_NPC_COUNT).toBe(30);
  });

  it('keeps variant stable within the same time bucket', () => {
    const a = resolveNpcPortraitVariant({ templateId: 'neighbor_marco', gameTimeMs: 1_000_000 });
    const b = resolveNpcPortraitVariant({ templateId: 'neighbor_marco', gameTimeMs: 1_500_000 });
    expect(a.variantId).toBe(b.variantId);
  });

  it('falls back to primary for unknown template', () => {
    const portrait = resolveNpcPortraitVariant({ templateId: 'unknown_npc', gameTimeMs: 0 });
    expect(portrait.imagePath).toContain('generic');
  });

  it('prefers work variant when context is work and occupation exists', () => {
    const portrait = resolveNpcPortraitVariant({
      templateId: 'colleague_laura',
      gameTimeMs: 0,
      context: 'work',
    });
    expect(portrait.variantId).toBe('work');
  });

  it('uses assigned pool portrait when provided', () => {
    const portrait = resolveNpcPortraitVariant({
      templateId: 'neighbor_marco',
      assignedPortraitId: 'npc_012',
      gameTimeMs: 999_999,
      context: 'work',
    });
    expect(portrait.variantId).toBe('primary');
    expect(portrait.imagePath).toBe('/npc-portraits/npc_012.webp');
  });

  it('ignores invalid assigned portrait ids and keeps fallback behaviour', () => {
    const withAssignment = resolveNpcPortraitVariant({
      templateId: 'neighbor_marco',
      assignedPortraitId: 'invalid',
      gameTimeMs: 1_000_000,
    });
    const fallback = resolveNpcPortraitVariant({
      templateId: 'neighbor_marco',
      gameTimeMs: 1_000_000,
    });
    expect(withAssignment.imagePath).toBe(fallback.imagePath);
  });

  it('resolveNpcPortraitImagePath prefers assigned pool portrait', () => {
    expect(resolveNpcPortraitImagePath('neighbor_marco', 'npc_003')).toBe(
      '/npc-portraits/npc_003.webp',
    );
    expect(resolveNpcPortraitImagePath('neighbor_marco', null)).toBe(
      '/npc-portraits/neighbor_marco/primary.webp',
    );
  });
});
