import { describe, expect, it } from 'vitest';
import {
  INITIAL_NPC_COUNT,
  INITIAL_NPC_ROSTER,
  buildInitialNpcTemplates,
} from './initial-npc-roster.js';

describe('initial NPC roster', () => {
  it('contains exactly 30 NPC templates', () => {
    expect(INITIAL_NPC_COUNT).toBe(30);
    expect(INITIAL_NPC_ROSTER.length).toBe(30);
  });

  it('has unique template ids and display names', () => {
    const ids = INITIAL_NPC_ROSTER.map((npc) => npc.templateId);
    const names = INITIAL_NPC_ROSTER.map((npc) => npc.displayName);
    expect(new Set(ids).size).toBe(30);
    expect(new Set(names).size).toBe(30);
  });

  it('avoids placeholder-style names', () => {
    const blocked = ['Time Citizen', 'Buyer', 'Mimmo', 'Test Citizen', 'Game Surface'];
    for (const npc of INITIAL_NPC_ROSTER) {
      expect(npc.displayName).not.toMatch(/npc\s*\d+|personaggio\s*\d+/i);
      expect(blocked).not.toContain(npc.displayName);
      expect(npc.firstName.length).toBeGreaterThan(1);
      expect(npc.lastName.length).toBeGreaterThan(1);
      expect(npc.ageYears).toBeGreaterThan(15);
      expect(npc.ageYears).toBeLessThan(95);
    }
  });

  it('builds template map with 30 entries', () => {
    const templates = buildInitialNpcTemplates();
    expect(Object.keys(templates).length).toBe(30);
  });
});
