import { describe, expect, it } from 'vitest';
import { ASPECT_RATIO_CSS, aspectToCssRatio } from './aspect-ratio.js';

describe('aspect-ratio', () => {
  it('maps official formats to CSS aspect-ratio values', () => {
    expect(aspectToCssRatio('3:1')).toBe('3 / 1');
    expect(aspectToCssRatio('4:5')).toBe('4 / 5');
    expect(ASPECT_RATIO_CSS['1:1']).toBe('1 / 1');
  });
});
