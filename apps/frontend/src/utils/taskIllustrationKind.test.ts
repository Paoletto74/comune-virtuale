import { describe, expect, it } from 'vitest';
import { feedCategoryToIllustrationKind } from '@/utils/taskIllustrationKind';

describe('feedCategoryToIllustrationKind', () => {
  it('maps feed categories to illustration kinds', () => {
    expect(feedCategoryToIllustrationKind('work')).toBe('work');
    expect(feedCategoryToIllustrationKind('family')).toBe('family');
    expect(feedCategoryToIllustrationKind('social')).toBe('social');
    expect(feedCategoryToIllustrationKind('economy')).toBe('economic');
    expect(feedCategoryToIllustrationKind('unexpected')).toBe('unexpected');
    expect(feedCategoryToIllustrationKind('risky')).toBe('risky');
    expect(feedCategoryToIllustrationKind('conversation')).toBe('dialogue');
    expect(feedCategoryToIllustrationKind('good')).toBe('living');
  });
});
