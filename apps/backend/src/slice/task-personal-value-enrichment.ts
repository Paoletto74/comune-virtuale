/**
 * Deterministic thematic personal-value deltas for task effects.
 * Extends base registry effects so the task pool covers all 14 personal values.
 */
import {
  PERSONAL_VALUE_KEYS,
  type PersonalValueKey,
} from './personal-values-constants.js';

export type PersonalValuePartial = Partial<Record<PersonalValueKey, number>>;

interface ThemeRule {
  test: (definitionId: string) => boolean;
  deltas: PersonalValuePartial;
}

const THEME_RULES: ThemeRule[] = [
  {
    test: (id) => /TEACHER|EDUCATION|SCHOOL|BOOK|READ|CULTURE|LIBRARY|MUSEUM|ART|LECTURE/i.test(id),
    deltas: { culture: 1, education: 1 },
  },
  {
    test: (id) => /POLITIC|REFERENDUM|CHARITY|CIVIC|COMUNE|VOTE|ELECTION|CLERK/i.test(id),
    deltas: { civicParticipation: 1, politicalInfluence: 1 },
  },
  {
    test: (id) => /WORK|BOSS|COLLEAGUE|SUPPLIER|CLIENT|DEADLINE|OFFICE|ACCOUNTANT|ENGINEER/i.test(id),
    deltas: { experience: 1, reliability: 1, stress: 1 },
  },
  {
    test: (id) => /FAMILY|NEIGHBOR|FRIEND|SOCIAL|ACQUAINTANCE|CHECKIN|GREETING/i.test(id),
    deltas: { popularity: 1, sympathy: 1, freeTime: -1 },
  },
  {
    test: (id) => /SHADY|STEAL|CRIMINAL|GANG|BRIBE|SCAM|SUITCASE|COLLECT|RISKY/i.test(id),
    deltas: { stress: 1, luck: -1, reputation: -1 },
  },
  {
    test: (id) => /NURSE|HEALTH|DOCTOR|REST|SLEEP|WALK|PARK|ELDERLY|AMBUL/i.test(id),
    deltas: { health: 1, happiness: 1 },
  },
  {
    test: (id) => /RELAX|FREE|LEISURE|COFFEE|BREAK|GARDEN|WALK/i.test(id),
    deltas: { freeTime: 1, happiness: 1, stress: -1 },
  },
  {
    test: (id) => /MANAGER|LAWYER|LAW|LEGAL|INFLUENCE|MAYOR|COUNCIL/i.test(id),
    deltas: { politicalInfluence: 1, experience: 1 },
  },
  {
    test: (id) => /TIP|REWARD|WALLET|FOUND|MONEY|CASH|ECON/i.test(id),
    deltas: { luck: 1, experience: 1 },
  },
  {
    test: (id) => /LANDLORD|RENT|HOUSING|HOME|APART/i.test(id),
    deltas: { reliability: 1, stress: 1 },
  },
];

const NEGATIVE_OPTION_PATTERN =
  /ignore|refuse|dismiss|rude|blame|hide|steal|negative|report|decline|no$/i;

const POSITIVE_OPTION_PATTERN =
  /help|calm|accept|share|fix|answer|donate|cover|follow|return|yes|lend|positive/i;

function optionModifier(optionId: string, delta: number): number {
  if (NEGATIVE_OPTION_PATTERN.test(optionId)) {
    return delta > 0 ? -Math.abs(delta) : delta;
  }
  if (POSITIVE_OPTION_PATTERN.test(optionId) && delta !== 0) {
    return delta > 0 ? delta : Math.abs(delta);
  }
  return delta;
}

/** Merge base task effects with deterministic thematic extensions. */
export function enrichTaskPersonalValues(
  definitionId: string,
  optionId: string,
  base: PersonalValuePartial,
): PersonalValuePartial {
  const result: PersonalValuePartial = { ...base };

  const isNegativeOption = NEGATIVE_OPTION_PATTERN.test(optionId);

  for (const rule of THEME_RULES) {
    if (!rule.test(definitionId)) continue;
    for (const key of PERSONAL_VALUE_KEYS) {
      const delta = rule.deltas[key];
      if (delta == null || delta === 0) continue;
      if (result[key] != null) continue;
      if (isNegativeOption && delta > 0 && (key === 'happiness' || key === 'health' || key === 'sympathy')) {
        continue;
      }
      result[key] = optionModifier(optionId, delta);
    }
  }

  if (isNegativeOption) {
    if (result.stress == null) result.stress = 1;
    if (result.happiness == null) result.happiness = -1;
  }

  if (POSITIVE_OPTION_PATTERN.test(optionId)) {
    if (result.reliability == null && /WORK|OFFICE|SUPPLIER|CLIENT/i.test(definitionId)) {
      result.reliability = 1;
    }
  }

  return result;
}

/** Collect personal-value keys touched across all registered task definition ids. */
export function personalValueCoverageFromEffects(
  entries: Array<{ definitionId: string; optionId: string; effects: PersonalValuePartial }>,
): Set<PersonalValueKey> {
  const covered = new Set<PersonalValueKey>();
  for (const entry of entries) {
    const enriched = enrichTaskPersonalValues(entry.definitionId, entry.optionId, entry.effects);
    for (const key of PERSONAL_VALUE_KEYS) {
      const value = enriched[key];
      if (value != null && value !== 0) covered.add(key);
    }
  }
  return covered;
}
