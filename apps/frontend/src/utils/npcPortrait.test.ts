import { describe, expect, it } from 'vitest';
import { resolveNpcPortrait } from '@/utils/npcPortrait';

describe('resolveNpcPortrait', () => {
  it('uses assigned pool portrait when provided', () => {
    const portrait = resolveNpcPortrait({
      templateId: 'neighbor_marco',
      assignedPortraitId: 'npc_008',
      gameTimeMs: 0,
    });
    expect(portrait.imagePath).toBe('/npc-portraits/npc_008.webp');
    expect(portrait.variantId).toBe('primary');
    expect(portrait.useSvgFallback).toBe(false);
  });

  it('falls back to template variant path when no assignment exists', () => {
    const portrait = resolveNpcPortrait({
      templateId: 'neighbor_marco',
      gameTimeMs: 0,
    });
    expect(portrait.imagePath).toContain('/npc-portraits/neighbor_marco/');
    expect(portrait.useSvgFallback).toBe(true);
  });
});
