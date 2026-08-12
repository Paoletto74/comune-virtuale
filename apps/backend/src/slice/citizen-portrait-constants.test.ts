import { describe, expect, it } from 'vitest';
import { isValidCitizenPortraitId } from './citizen-portrait-constants.js';

describe('citizen portrait constants', () => {
  it('accepts profile ids in the supported range', () => {
    expect(isValidCitizenPortraitId('profile_001')).toBe(true);
    expect(isValidCitizenPortraitId('profile_050')).toBe(true);
    expect(isValidCitizenPortraitId('profile_051')).toBe(false);
    expect(isValidCitizenPortraitId('invalid')).toBe(false);
  });
});
