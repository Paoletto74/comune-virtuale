import type { ProfileDimensionId } from '../../slice/citizen-profile-constants.js';

export const TASK_PERSONALIZATION_VERSION = 1;
export const TASK_RELATIONSHIP_VERSION = 1;

/** Narrative context tags used for soft feed personalization. */
export type PersonalizationContextTag =
  | 'work'
  | 'family'
  | 'living'
  | 'social'
  | 'economic'
  | 'unexpected'
  | 'risky'
  | 'dialogue'
  | 'generic';

export type ComplexityTier = 'everyday' | 'moderate' | 'demanding';

export type MetricBias = 'high' | 'low' | 'neutral';

export interface TaskPersonalizationMetadata {
  definitionId: string;
  contexts: PersonalizationContextTag[];
  primaryContext: PersonalizationContextTag;
  /** When true the task stays at baseline weight — always eligible, never strongly biased. */
  generic: boolean;
  complexityTier: ComplexityTier;
  reputationBias: MetricBias;
  sympathyBias: MetricBias;
  requiresUnlocked: ProfileDimensionId[];
  /** Future hook: minimum citizen level before this content should be preferred (not enforced yet). */
  minLevelRequired?: number;
}

export interface PersonalizationWeightAdjustment {
  definitionId: string;
  baseWeight: number;
  adjustedWeight: number;
  multiplier: number;
  primaryContext: PersonalizationContextTag;
}

export interface TaskSelectionRelationshipAudit {
  relationshipVersion: number;
  chosenMultiplier: number;
  matchedQuery: boolean;
  consequenceType?: string;
  templateId?: string;
}

export interface TaskSelectionPersonalizationAudit {
  personalizationVersion: number;
  occupationCode: number;
  level: number;
  chosenPrimaryContext: PersonalizationContextTag;
  chosenMultiplier: number;
  feedContextSnapshot: PersonalizationContextTag[];
}
