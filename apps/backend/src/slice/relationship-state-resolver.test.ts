import { describe, expect, it } from 'vitest';
import {
  computeRelationshipScore,
  resolveRelationshipState,
} from '../slice/relationship-state-resolver.js';

describe('relationship-state-resolver', () => {
  it('resolves conoscenza for low metrics', () => {
    const state = resolveRelationshipState({
      trust: 50,
      affection: 0,
      conflict: 0,
      familiarity: 0,
      relationshipLevel: 0,
      contactUnlocked: false,
    });
    expect(state).toBe('conoscenza');
  });

  it('resolves amore for high affection and trust', () => {
    const state = resolveRelationshipState({
      trust: 80,
      affection: 90,
      conflict: 0,
      familiarity: 60,
      relationshipLevel: 4,
      contactUnlocked: true,
    });
    expect(state).toBe('amore');
  });

  it('resolves conflitto when conflict is high', () => {
    const state = resolveRelationshipState({
      trust: 40,
      affection: 10,
      conflict: 50,
      familiarity: 20,
      relationshipLevel: 0,
      contactUnlocked: false,
    });
    expect(state).toBe('conflitto');
  });

  it('computes relationship score from metrics', () => {
    const score = computeRelationshipScore({
      trust: 60,
      affection: 40,
      familiarity: 30,
      conflict: 10,
      relationshipLevel: 2,
    });
    expect(score).toBeGreaterThan(0);
  });
});
