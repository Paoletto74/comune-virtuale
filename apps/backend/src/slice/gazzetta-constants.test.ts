import { describe, expect, it } from 'vitest';
import {
  expandGazzettaArticle,
  GAZZETTA_MIN_ARTICLES,
  gazzettaRefreshIdempotencyKey,
} from './gazzetta-constants.js';

describe('gazzetta-constants', () => {
  it('requires at least fifteen articles in feed policy', () => {
    expect(GAZZETTA_MIN_ARTICLES).toBe(15);
  });

  it('deduplicates refresh buckets every five game minutes', () => {
    expect(gazzettaRefreshIdempotencyKey(0)).toBe('gazzetta-refresh:0');
    expect(gazzettaRefreshIdempotencyKey(299_999)).toBe('gazzetta-refresh:0');
    expect(gazzettaRefreshIdempotencyKey(300_000)).toBe('gazzetta-refresh:1');
  });

  it('expands articles with summary and full body', () => {
    const expanded = expandGazzettaArticle({
      title: 'Test',
      body: 'Breve.',
      category: 'cronaca',
      gameTimeMs: 1000,
      articleId: 'article-1',
    });
    expect(expanded.summary.length).toBeGreaterThan(0);
    expect(expanded.fullBody.split('\n\n').length).toBeGreaterThanOrEqual(4);
  });
});
