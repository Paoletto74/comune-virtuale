import { describe, expect, it } from 'vitest';
import type { CitizenProfileContext } from '../citizen/citizen-profile-service.js';
import { OCCUPATION_CODES } from '../../slice/citizen-profile-constants.js';
import {
  applyPersonalizedWeights,
  computePersonalizationMultiplier,
  rankCandidatesByPersonalization,
} from './task-personalization-scorer.js';

function buildProfile(overrides: Partial<CitizenProfileContext> = {}): CitizenProfileContext {
  return {
    citizenId: 'cit-1',
    age: 34,
    occupationCode: OCCUPATION_CODES.insegnante,
    occupationLabel: 'Insegnante',
    housingCode: 1,
    familyCode: 3,
    level: 1,
    sympathy: 0,
    reputation: 0,
    unlockedDimensions: [],
    tasksCompleted: 0,
    workTasksCompleted: 0,
    ...overrides,
  };
}

describe('task personalization scorer', () => {
  it('boosts work tasks for teachers without excluding other contexts', () => {
    const teacher = buildProfile({ occupationCode: OCCUPATION_CODES.insegnante });

    const workMultiplier = computePersonalizationMultiplier({
      definitionId: 'DEMO_V2_WORK_CLIENT_ANGER',
      baseWeight: 25,
      profile: teacher,
      feedContextTags: [],
    });
    const socialMultiplier = computePersonalizationMultiplier({
      definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE',
      baseWeight: 25,
      profile: teacher,
      feedContextTags: [],
    });
    const genericMultiplier = computePersonalizationMultiplier({
      definitionId: 'DEMO_ELDERLY_CROSSING',
      baseWeight: 25,
      profile: teacher,
      feedContextTags: [],
    });

    expect(workMultiplier).toBeGreaterThan(socialMultiplier);
    expect(genericMultiplier).toBeGreaterThan(0.75);
    expect(genericMultiplier).toBeLessThanOrEqual(1.15);
  });

  it('keeps generic tasks near baseline for any occupation', () => {
    const merchant = buildProfile({ occupationCode: OCCUPATION_CODES.commerciante, level: 4 });
    const genericMultiplier = computePersonalizationMultiplier({
      definitionId: 'DEMO_ELDERLY_CROSSING',
      baseWeight: 25,
      profile: merchant,
      feedContextTags: [],
    });

    expect(genericMultiplier).toBeGreaterThanOrEqual(0.95);
    expect(genericMultiplier).toBeLessThanOrEqual(1.15);
  });

  it('boosts living tasks when living dimension is unlocked', () => {
    const locked = buildProfile({
      occupationCode: OCCUPATION_CODES.pensionato,
      unlockedDimensions: [],
    });
    const unlocked = buildProfile({
      occupationCode: OCCUPATION_CODES.pensionato,
      unlockedDimensions: ['living'],
    });

    const lockedMultiplier = computePersonalizationMultiplier({
      definitionId: 'DEMO_V3_NEIGHBORHOOD_PARKING_DISPUTE',
      baseWeight: 25,
      profile: locked,
      feedContextTags: [],
    });
    const unlockedMultiplier = computePersonalizationMultiplier({
      definitionId: 'DEMO_V3_NEIGHBORHOOD_PARKING_DISPUTE',
      baseWeight: 25,
      profile: unlocked,
      feedContextTags: [],
    });

    expect(unlockedMultiplier).toBeGreaterThan(lockedMultiplier);
  });

  it('prefers demanding tasks at higher levels', () => {
    const lowLevel = buildProfile({ level: 1 });
    const highLevel = buildProfile({ level: 4 });

    const low = computePersonalizationMultiplier({
      definitionId: 'DEMO_V3_RISKY_OFF_BOOK_JOB',
      baseWeight: 25,
      profile: lowLevel,
      feedContextTags: [],
    });
    const high = computePersonalizationMultiplier({
      definitionId: 'DEMO_V3_RISKY_OFF_BOOK_JOB',
      baseWeight: 25,
      profile: highLevel,
      feedContextTags: [],
    });

    expect(high).toBeGreaterThan(low);
  });

  it('applies metric bias without extreme swings', () => {
    const lowRep = buildProfile({ reputation: 0 });
    const highRep = buildProfile({ reputation: 6 });

    const low = computePersonalizationMultiplier({
      definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE',
      baseWeight: 25,
      profile: lowRep,
      feedContextTags: [],
    });
    const high = computePersonalizationMultiplier({
      definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE',
      baseWeight: 25,
      profile: highRep,
      feedContextTags: [],
    });

    expect(high / low).toBeLessThan(1.2);
  });

  it('penalizes over-represented contexts in the current feed snapshot', () => {
    const profile = buildProfile({ occupationCode: OCCUPATION_CODES.insegnante });

    const fresh = computePersonalizationMultiplier({
      definitionId: 'DEMO_V2_WORK_CLIENT_ANGER',
      baseWeight: 25,
      profile,
      feedContextTags: [],
    });
    const saturated = computePersonalizationMultiplier({
      definitionId: 'DEMO_V2_WORK_CLIENT_ANGER',
      baseWeight: 25,
      profile,
      feedContextTags: ['work', 'work', 'work'],
    });

    expect(saturated).toBeLessThan(fresh);
  });

  it('keeps adjusted weights positive for weighted selection', () => {
    const profile = buildProfile({ occupationCode: OCCUPATION_CODES.freelance });
    const adjustments = applyPersonalizedWeights(
      [
        { definitionId: 'DEMO_V2_WORK_CLIENT_ANGER', weight: 25 },
        { definitionId: 'DEMO_ELDERLY_CROSSING', weight: 25 },
        { definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE', weight: 25 },
      ],
      profile,
      ['work'],
    );

    expect(adjustments.every((entry) => entry.adjustedWeight >= 1)).toBe(true);
    expect(new Set(adjustments.map((entry) => entry.adjustedWeight)).size).toBeGreaterThan(1);
  });

  it('ranks merchant-aligned tasks higher for a merchant profile', () => {
    const merchant = buildProfile({ occupationCode: OCCUPATION_CODES.commerciante });
    const ranked = rankCandidatesByPersonalization(
      [
        'DEMO_V2_WORK_CLIENT_ANGER',
        'DEMO_V2_ECON_BILL_SHOCK',
        'DEMO_V3_UNEXPECTED_FLYAWAY_HAT',
      ],
      merchant,
    );

    expect(ranked[0]?.definitionId).not.toBe('DEMO_V3_UNEXPECTED_FLYAWAY_HAT');
  });
});
