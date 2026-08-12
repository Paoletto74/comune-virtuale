import { describe, expect, it } from 'vitest';
import {
  deterministicChance,
  deterministicInt,
  deterministicPick,
  deterministicUnit,
} from './deterministic-flash-random.js';

describe('deterministic-flash-random', () => {
  it('returns stable unit values for the same seed', () => {
    expect(deterministicUnit('seed-a')).toBe(deterministicUnit('seed-a'));
    expect(deterministicUnit('seed-a')).not.toBe(deterministicUnit('seed-b'));
  });

  it('returns integers inside the requested range', () => {
    for (let i = 0; i < 20; i++) {
      const value = deterministicInt(`range:${i}`, 5, 15);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(15);
    }
  });

  it('picks deterministically from a list', () => {
    const items = ['a', 'b', 'c'] as const;
    expect(deterministicPick('pick-1', items)).toBe(deterministicPick('pick-1', items));
  });

  it('evaluates chance deterministically', () => {
    expect(deterministicChance('chance-1', 0.5)).toBe(deterministicChance('chance-1', 0.5));
  });
});
