import { describe, expect, it } from 'vitest';
import {
  applyRelationshipWeights,
  computeRelationshipMultiplier,
} from './npc-relationship-scorer.js';
import type { KnownRelationshipSnapshot } from './npc-relationship-query.js';

function marcoPositive(): Map<string, KnownRelationshipSnapshot> {
  return new Map([
    [
      'neighbor_marco',
      {
        templateId: 'neighbor_marco',
        npcId: 'npc-1',
        category: 'neighbor',
        sentiment: 'positive',
        relationshipLevel: 2,
        interactionCount: 1,
        lastOutcomeSummary: 'Lo hai aiutato',
        appliedConsequenceKeys: new Set(),
      },
    ],
  ]);
}

describe('npc-relationship-scorer', () => {
  it('boosts Marco opportunity when relationship is positive', () => {
    const result = computeRelationshipMultiplier({
      definitionId: 'DEMO_NPC_MARCO_OPPORTUNITY',
      relationships: marcoPositive(),
    });
    expect(result.matchedQuery).toBe(true);
    expect(result.multiplier).toBeGreaterThan(1);
    expect(result.consequenceType).toBe('opportunity');
  });

  it('excludes Marco opportunity when relationship is missing', () => {
    const result = computeRelationshipMultiplier({
      definitionId: 'DEMO_NPC_MARCO_OPPORTUNITY',
      relationships: new Map(),
    });
    expect(result.multiplier).toBe(0);
  });

  it('prevents duplicate consequence tasks via applied keys', () => {
    const base = marcoPositive().get('neighbor_marco')!;
    const relationships = new Map([
      [
        'neighbor_marco',
        {
          ...base,
          appliedConsequenceKeys: new Set([...base.appliedConsequenceKeys, 'marco_opportunity_v1']),
        },
      ],
    ]);
    const result = computeRelationshipMultiplier({
      definitionId: 'DEMO_NPC_MARCO_OPPORTUNITY',
      relationships,
    });
    expect(result.multiplier).toBe(0);
  });

  it('soft-boosts neighbor noise for known Marco', () => {
    const result = computeRelationshipMultiplier({
      definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE',
      relationships: marcoPositive(),
    });
    expect(result.matchedQuery).toBe(true);
    expect(result.multiplier).toBeGreaterThan(1);
  });

  it('applyRelationshipWeights removes ineligible consequence tasks', () => {
    const adjusted = applyRelationshipWeights(
      [
        { definitionId: 'DEMO_NPC_MARCO_OPPORTUNITY', adjustedWeight: 25 },
        { definitionId: 'DEMO_V2_WORK_CLIENT_ANGER', adjustedWeight: 25 },
      ],
      new Map(),
    );
    expect(adjusted.some((entry) => entry.definitionId === 'DEMO_NPC_MARCO_OPPORTUNITY')).toBe(
      false,
    );
    expect(adjusted.some((entry) => entry.definitionId === 'DEMO_V2_WORK_CLIENT_ANGER')).toBe(true);
  });
});
