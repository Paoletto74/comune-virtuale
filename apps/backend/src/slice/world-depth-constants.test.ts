import { describe, expect, it } from 'vitest';
import {
  GAME_SURFACE_SHIFTS_PER_MONTH,
  pickReferendumTemplate,
  REFERENDUM_TEMPLATES,
  shiftPayMinor,
} from './world-depth-constants.js';

describe('world-depth-constants', () => {
  it('computes per-shift pay from monthly salary', () => {
    expect(shiftPayMinor(2500n)).toBe(2500n / GAME_SURFACE_SHIFTS_PER_MONTH);
    expect(shiftPayMinor(0n)).toBe(0n);
  });

  it('rotates referendum templates by game time bucket', () => {
    const first = pickReferendumTemplate(0);
    const second = pickReferendumTemplate(7 * 24 * 60 * 60 * 1000);
    expect(REFERENDUM_TEMPLATES).toContain(first);
    expect(REFERENDUM_TEMPLATES).toContain(second);
  });
});
