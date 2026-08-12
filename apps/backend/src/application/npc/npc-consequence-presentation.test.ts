import { describe, expect, it } from 'vitest';
import { buildNpcConsequencePresentation } from './npc-consequence-presentation.js';

describe('buildNpcConsequencePresentation', () => {
  it('builds memory line from recorded outcome', () => {
    const result = buildNpcConsequencePresentation({
      npc: {
        npcId: 'npc-1',
        displayName: 'Marco',
        ageCategory: 'adult',
        zoneId: 'residential',
        npcTemplateId: 'neighbor_marco',
        category: 'neighbor',
        narrativeRole: 'vicino di casa',
        occupation: null,
        isActive: true,
        metadata: {},
        createdAt: new Date(),
      },
      relationship: {
        templateId: 'neighbor_marco',
        npcId: 'npc-1',
        category: 'neighbor',
        sentiment: 'positive',
        relationshipLevel: 2,
        interactionCount: 1,
        lastOutcomeSummary: 'Lo hai aiutato',
        appliedConsequenceKeys: new Set(),
      },
      consequenceType: 'opportunity',
    });

    expect(result.memoryLine).toContain('Marco');
    expect(result.memoryLine).toContain('aiutato');
    expect(result.consequenceLine).toContain('favore torna indietro');
  });

  it('builds warning consequence line for negative Giulia', () => {
    const result = buildNpcConsequencePresentation({
      npc: {
        npcId: 'npc-2',
        displayName: 'Giulia',
        ageCategory: 'adult',
        zoneId: 'city_center',
        npcTemplateId: 'acquaintance_giulia',
        category: 'acquaintance',
        narrativeRole: 'conoscente di paese',
        occupation: null,
        isActive: true,
        metadata: {},
        createdAt: new Date(),
      },
      relationship: {
        templateId: 'acquaintance_giulia',
        npcId: 'npc-2',
        category: 'acquaintance',
        sentiment: 'negative',
        relationshipLevel: -2,
        interactionCount: 1,
        lastOutcomeSummary: 'Hai mandato via il conoscente bruscamente',
        appliedConsequenceKeys: new Set(),
      },
      consequenceType: 'warning',
    });

    expect(result.memoryLine).toContain('Giulia');
    expect(result.consequenceLine).toContain('non ha dimenticato');
  });
});
