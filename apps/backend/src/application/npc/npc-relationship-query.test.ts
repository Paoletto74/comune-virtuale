import { describe, expect, it } from 'vitest';
import {
  matchesNpcRelationshipQuery,
  type KnownRelationshipSnapshot,
} from './npc-relationship-query.js';

function snapshot(
  overrides: Partial<KnownRelationshipSnapshot> = {},
): KnownRelationshipSnapshot {
  return {
    templateId: 'neighbor_marco',
    npcId: 'npc-1',
    category: 'neighbor',
    sentiment: 'positive',
    relationshipLevel: 2,
    interactionCount: 1,
    lastOutcomeSummary: 'Lo hai aiutato',
    appliedConsequenceKeys: new Set(),
    ...overrides,
  };
}

describe('matchesNpcRelationshipQuery', () => {
  it('matches known relationship for Marco', () => {
    expect(
      matchesNpcRelationshipQuery(
        { filter: 'known', templateId: 'neighbor_marco' },
        snapshot(),
      ),
    ).toBe(true);
  });

  it('matches new when Marco is unknown', () => {
    expect(
      matchesNpcRelationshipQuery({ filter: 'new', templateId: 'neighbor_marco' }, null),
    ).toBe(true);
    expect(
      matchesNpcRelationshipQuery({ filter: 'new', templateId: 'neighbor_marco' }, snapshot()),
    ).toBe(false);
  });

  it('matches positive with minLevel', () => {
    expect(
      matchesNpcRelationshipQuery(
        { filter: 'positive', templateId: 'neighbor_marco', minLevel: 2 },
        snapshot({ relationshipLevel: 2, sentiment: 'positive' }),
      ),
    ).toBe(true);
    expect(
      matchesNpcRelationshipQuery(
        { filter: 'positive', templateId: 'neighbor_marco', minLevel: 3 },
        snapshot({ relationshipLevel: 2, sentiment: 'positive' }),
      ),
    ).toBe(false);
  });

  it('matches negative with maxLevel', () => {
    expect(
      matchesNpcRelationshipQuery(
        { filter: 'negative', templateId: 'acquaintance_giulia', maxLevel: -1 },
        snapshot({
          templateId: 'acquaintance_giulia',
          sentiment: 'negative',
          relationshipLevel: -2,
        }),
      ),
    ).toBe(true);
  });

  it('matches neutral sentiment', () => {
    expect(
      matchesNpcRelationshipQuery(
        { filter: 'neutral', templateId: 'neighbor_marco' },
        snapshot({ sentiment: 'neutral', relationshipLevel: 0 }),
      ),
    ).toBe(true);
  });
});
