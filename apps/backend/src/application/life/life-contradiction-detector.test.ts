import { describe, expect, it } from 'vitest';
import {
  buildDefaultLifeReview,
  detectPrimaryContradiction,
} from './life-contradiction-detector.js';

describe('detectPrimaryContradiction', () => {
  it('detects high balance with low reputation', () => {
    const signal = detectPrimaryContradiction({
      balanceMinor: 500_00,
      sympathy: 0,
      reputation: 0,
      level: 2,
    });
    expect(signal?.id).toBe('rich_unloved');
    expect(signal?.priority).toBeGreaterThanOrEqual(85);
  });

  it('detects high reputation with low balance', () => {
    const signal = detectPrimaryContradiction({
      balanceMinor: 20_00,
      sympathy: 0,
      reputation: 6,
      level: 2,
    });
    expect(signal?.id).toBe('respected_broke');
  });

  it('detects high sympathy with low reputation', () => {
    const signal = detectPrimaryContradiction({
      balanceMinor: 100_00,
      sympathy: 6,
      reputation: 0,
      level: 2,
    });
    expect(signal?.id).toBe('liked_not_respected');
  });

  it('detects high level with low balance', () => {
    const signal = detectPrimaryContradiction({
      balanceMinor: 30_00,
      sympathy: 0,
      reputation: 3,
      level: 5,
    });
    expect(signal?.id).toBe('high_level_poor');
  });

  it('prioritizes balance/reputation over sympathy/reputation', () => {
    const signal = detectPrimaryContradiction({
      balanceMinor: 500_00,
      sympathy: 6,
      reputation: 0,
      level: 2,
    });
    expect(signal?.id).toBe('rich_unloved');
  });

  it('returns null when no contradiction applies', () => {
    const signal = detectPrimaryContradiction({
      balanceMinor: 100_00,
      sympathy: 2,
      reputation: 3,
      level: 2,
    });
    expect(signal).toBeNull();
  });
});

describe('buildDefaultLifeReview', () => {
  it('builds a steady-progress template', () => {
    const review = buildDefaultLifeReview({
      balanceMinor: 420_00,
      sympathy: 2,
      reputation: 3,
      level: 5,
    });
    expect(review.positiveResult).toContain('progressi');
    expect(review.observation).toContain('Livello 5');
    expect(review.ironicContrast).toContain('soddisfatto');
  });
});
