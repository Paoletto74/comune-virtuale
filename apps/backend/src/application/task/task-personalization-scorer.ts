import {
  OCCUPATION_CODES,
  type ProfileDimensionId,
} from '../../slice/citizen-profile-constants.js';
import type { CitizenProfileContext } from '../citizen/citizen-profile-service.js';
import { getTaskPersonalizationMetadata } from './task-personalization-metadata.js';
import type {
  PersonalizationContextTag,
  PersonalizationWeightAdjustment,
  TaskPersonalizationMetadata,
} from './task-personalization-types.js';

/** Soft bounds — personalization nudges, never excludes. */
const MIN_MULTIPLIER = 0.78;
const MAX_MULTIPLIER = 1.52;

/** Primary occupation ↔ context affinities (narrative, not hard filters). */
const OCCUPATION_CONTEXT_AFFINITY: Record<number, PersonalizationContextTag[]> = {
  [OCCUPATION_CODES.impiegato]: ['work', 'economic', 'social'],
  [OCCUPATION_CODES.commerciante]: ['work', 'economic'],
  [OCCUPATION_CODES.freelance]: ['work', 'economic'],
  [OCCUPATION_CODES.studente]: ['social', 'economic', 'unexpected', 'living'],
  [OCCUPATION_CODES.insegnante]: ['work', 'social'],
  [OCCUPATION_CODES.tecnico]: ['work', 'economic'],
  [OCCUPATION_CODES.professionista]: ['work', 'social', 'economic'],
  [OCCUPATION_CODES.disoccupato]: ['economic', 'social', 'unexpected', 'risky'],
  [OCCUPATION_CODES.pensionato]: ['social', 'family', 'living'],
};

const STRONG_OCCUPATION_MATCH = 1.38;
const WEAK_OCCUPATION_MATCH = 1.14;
const NON_MATCH_OCCUPATION = 0.9;
const GENERIC_BASELINE = 1.0;

const UNLOCKED_DIMENSION_BOOST = 1.1;
const LEVEL_EVERYDAY_BOOST = 1.1;
const LEVEL_DEMANDING_BOOST = 1.12;
const LEVEL_DEMANDING_PENALTY = 0.88;
const METRIC_BIAS_BOOST = 1.07;

const DIVERSITY_PENALTY_AT_2 = 0.84;
const DIVERSITY_PENALTY_AT_3 = 0.72;

export interface PersonalizationScoringInput {
  definitionId: string;
  baseWeight: number;
  profile: CitizenProfileContext;
  feedContextTags: PersonalizationContextTag[];
}

function hasUnlockedDimension(
  profile: CitizenProfileContext,
  dimension: ProfileDimensionId,
): boolean {
  return profile.unlockedDimensions.includes(dimension);
}

function occupationMatchMultiplier(
  metadata: TaskPersonalizationMetadata,
  occupationCode: number,
): number {
  if (metadata.generic) {
    return GENERIC_BASELINE;
  }

  const affinities = OCCUPATION_CONTEXT_AFFINITY[occupationCode] ?? ['social', 'economic'];
  if (affinities.includes(metadata.primaryContext)) {
    return STRONG_OCCUPATION_MATCH;
  }

  if (metadata.contexts.some((context) => affinities.includes(context))) {
    return WEAK_OCCUPATION_MATCH;
  }

  return NON_MATCH_OCCUPATION;
}

function unlockedDimensionMultiplier(
  metadata: TaskPersonalizationMetadata,
  profile: CitizenProfileContext,
): number {
  let multiplier = 1;

  if (metadata.contexts.includes('work') && hasUnlockedDimension(profile, 'work')) {
    multiplier *= UNLOCKED_DIMENSION_BOOST;
  }
  if (metadata.contexts.includes('living') && hasUnlockedDimension(profile, 'living')) {
    multiplier *= UNLOCKED_DIMENSION_BOOST;
  }
  if (metadata.contexts.includes('family') && hasUnlockedDimension(profile, 'personal')) {
    multiplier *= UNLOCKED_DIMENSION_BOOST;
  }

  return multiplier;
}

function levelMultiplier(metadata: TaskPersonalizationMetadata, level: number): number {
  if (metadata.complexityTier === 'everyday' && level <= 2) {
    return LEVEL_EVERYDAY_BOOST;
  }
  if (metadata.complexityTier === 'demanding' && level >= 3) {
    return LEVEL_DEMANDING_BOOST;
  }
  if (metadata.complexityTier === 'demanding' && level <= 1) {
    return LEVEL_DEMANDING_PENALTY;
  }
  if (metadata.complexityTier === 'moderate' && level >= 2) {
    return 1.05;
  }
  return 1;
}

function metricMultiplier(
  metadata: TaskPersonalizationMetadata,
  profile: CitizenProfileContext,
): number {
  let multiplier = 1;

  if (metadata.reputationBias === 'high' && profile.reputation >= 5) {
    multiplier *= METRIC_BIAS_BOOST;
  }
  if (metadata.reputationBias === 'low' && profile.reputation <= 1) {
    multiplier *= METRIC_BIAS_BOOST;
  }
  if (metadata.sympathyBias === 'high' && profile.sympathy >= 5) {
    multiplier *= METRIC_BIAS_BOOST;
  }
  if (metadata.sympathyBias === 'low' && profile.sympathy <= 1) {
    multiplier *= METRIC_BIAS_BOOST;
  }

  return multiplier;
}

function diversityMultiplier(
  primaryContext: PersonalizationContextTag,
  feedContextTags: PersonalizationContextTag[],
): number {
  if (primaryContext === 'generic') {
    return 1;
  }

  const count = feedContextTags.filter((tag) => tag === primaryContext).length;
  if (count >= 3) return DIVERSITY_PENALTY_AT_3;
  if (count >= 2) return DIVERSITY_PENALTY_AT_2;
  return 1;
}

function clampMultiplier(value: number): number {
  return Math.min(MAX_MULTIPLIER, Math.max(MIN_MULTIPLIER, value));
}

export function computePersonalizationMultiplier(input: PersonalizationScoringInput): number {
  const metadata = getTaskPersonalizationMetadata(input.definitionId);

  const raw =
    occupationMatchMultiplier(metadata, input.profile.occupationCode) *
    unlockedDimensionMultiplier(metadata, input.profile) *
    levelMultiplier(metadata, input.profile.level) *
    metricMultiplier(metadata, input.profile) *
    diversityMultiplier(metadata.primaryContext, input.feedContextTags);

  return clampMultiplier(raw);
}

export function applyPersonalizedWeights(
  candidates: Array<{ definitionId: string; weight: number }>,
  profile: CitizenProfileContext,
  feedContextTags: PersonalizationContextTag[],
): PersonalizationWeightAdjustment[] {
  return candidates.map((candidate) => {
    const multiplier = computePersonalizationMultiplier({
      definitionId: candidate.definitionId,
      baseWeight: candidate.weight,
      profile,
      feedContextTags,
    });
    const adjustedWeight = Math.max(1, Math.round(candidate.weight * multiplier));
    const metadata = getTaskPersonalizationMetadata(candidate.definitionId);

    return {
      definitionId: candidate.definitionId,
      baseWeight: candidate.weight,
      adjustedWeight,
      multiplier,
      primaryContext: metadata.primaryContext,
    };
  });
}

/** Picks the most likely occupation-aligned tasks from a candidate set (for tests). */
export function rankCandidatesByPersonalization(
  candidates: string[],
  profile: CitizenProfileContext,
): Array<{ definitionId: string; multiplier: number }> {
  return candidates
    .map((definitionId) => ({
      definitionId,
      multiplier: computePersonalizationMultiplier({
        definitionId,
        baseWeight: 25,
        profile,
        feedContextTags: [],
      }),
    }))
    .sort((a, b) => b.multiplier - a.multiplier);
}
