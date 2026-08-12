import { describe, expect, it } from 'vitest';
import { resolveNpcVisualId } from '@/utils/npcVisual';

describe('resolveNpcVisualId', () => {
  it('maps known NPC ids', () => {
    expect(resolveNpcVisualId('marco')).toBe('marco');
    expect(resolveNpcVisualId('laura')).toBe('laura');
    expect(resolveNpcVisualId('giulia')).toBe('giulia');
  });

  it('maps by display name when id is unknown', () => {
    expect(resolveNpcVisualId('npc_001', 'Marco Rossi')).toBe('marco');
    expect(resolveNpcVisualId('npc_002', 'Laura Bianchi')).toBe('laura');
    expect(resolveNpcVisualId('npc_003', 'Giulia Verdi')).toBe('giulia');
  });

  it('returns generic for unknown NPCs', () => {
    expect(resolveNpcVisualId('unknown_npc', 'Qualcuno')).toBe('generic');
  });
});
