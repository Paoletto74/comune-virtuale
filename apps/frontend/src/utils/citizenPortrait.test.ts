import { describe, expect, it } from 'vitest';
import {
  CITIZEN_PROFILE_PORTRAIT_FILENAMES,
  CITIZEN_PROFILE_PORTRAIT_SLOT_COUNT,
  citizenProfilePortraitPath,
  citizenProfilePortraitPathFromId,
  isValidPortraitId,
  resolveCitizenPortrait,
  resolveCitizenPortraitSlot,
} from '@/utils/citizenPortrait';

describe('citizenPortrait', () => {
  it('defines 50 static profile slots', () => {
    expect(CITIZEN_PROFILE_PORTRAIT_FILENAMES).toHaveLength(CITIZEN_PROFILE_PORTRAIT_SLOT_COUNT);
    expect(CITIZEN_PROFILE_PORTRAIT_FILENAMES[0]).toBe('profile_001.webp');
    expect(CITIZEN_PROFILE_PORTRAIT_FILENAMES[49]).toBe('profile_050.webp');
    expect(citizenProfilePortraitPath(1)).toBe('/profiles/profile_001.webp');
  });

  it('maps citizenId deterministically to a slot', () => {
    const a = resolveCitizenPortraitSlot('citizen-alpha');
    const b = resolveCitizenPortraitSlot('citizen-alpha');
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(1);
    expect(a).toBeLessThanOrEqual(CITIZEN_PROFILE_PORTRAIT_SLOT_COUNT);
  });

  it('uses explicit portraitId when provided', () => {
    expect(isValidPortraitId('profile_037')).toBe(true);
    expect(resolveCitizenPortrait('citizen-alpha', 'profile_037').imagePath).toBe(
      citizenProfilePortraitPathFromId('profile_037'),
    );
  });

  it('falls back to SVG when citizenId is missing', () => {
    expect(resolveCitizenPortrait(undefined).useSvgFallback).toBe(true);
  });
});
