import { getNpcTaskBinding } from '../../slice/npc-relationship-constants.js';
import { getNpcTaskConsequence } from '../../slice/npc-relationship-consequences-constants.js';
import {
  matchesNpcRelationshipQuery,
  resolveRelationshipForTemplate,
  type KnownRelationshipSnapshot,
} from './npc-relationship-query.js';

/** Soft bounds — relationship nudges, same spirit as personalization. */
const MIN_RELATIONSHIP_MULTIPLIER = 0.35;
const MAX_RELATIONSHIP_MULTIPLIER = 1.55;

export interface RelationshipWeightAdjustment {
  definitionId: string;
  baseWeight: number;
  adjustedWeight: number;
  multiplier: number;
  matchedQuery: boolean;
  consequenceType?: string;
}

function clampMultiplier(value: number): number {
  return Math.min(MAX_RELATIONSHIP_MULTIPLIER, Math.max(MIN_RELATIONSHIP_MULTIPLIER, value));
}

export function computeRelationshipMultiplier(input: {
  definitionId: string;
  relationships: ReadonlyMap<string, KnownRelationshipSnapshot>;
}): { multiplier: number; matchedQuery: boolean; consequenceType?: string } {
  const binding = getNpcTaskBinding(input.definitionId);
  const consequence = getNpcTaskConsequence(input.definitionId);

  if (!binding && !consequence) {
    return { multiplier: 1, matchedQuery: false };
  }

  const templateId = consequence?.templateId ?? binding?.templateId;
  const relationship = resolveRelationshipForTemplate(input.relationships, templateId);

  if (consequence?.consequenceKey && relationship?.appliedConsequenceKeys.has(consequence.consequenceKey)) {
    return { multiplier: 0, matchedQuery: false, consequenceType: consequence.consequenceType };
  }

  if (consequence) {
    const matched = matchesNpcRelationshipQuery(consequence.eligibilityQuery, relationship);
    if (consequence.requireEligibility && !matched) {
      return { multiplier: 0, matchedQuery: false, consequenceType: consequence.consequenceType };
    }

    const raw = matched ? consequence.matchWeightMultiplier : consequence.mismatchWeightMultiplier;
    return {
      multiplier: clampMultiplier(raw),
      matchedQuery: matched,
      consequenceType: consequence.consequenceType,
    };
  }

  if (binding?.selectionQuery) {
    const matched = matchesNpcRelationshipQuery(binding.selectionQuery, relationship);
    const raw = matched
      ? (binding.matchWeightMultiplier ?? 1.15)
      : (binding.mismatchWeightMultiplier ?? 0.88);
    return { multiplier: clampMultiplier(raw), matchedQuery: matched };
  }

  return { multiplier: 1, matchedQuery: false };
}

export function applyRelationshipWeights(
  candidates: Array<{ definitionId: string; adjustedWeight: number }>,
  relationships: ReadonlyMap<string, KnownRelationshipSnapshot>,
): RelationshipWeightAdjustment[] {
  return candidates
    .map((candidate) => {
      const { multiplier, matchedQuery, consequenceType } = computeRelationshipMultiplier({
        definitionId: candidate.definitionId,
        relationships,
      });
      const adjustedWeight =
        multiplier <= 0 ? 0 : Math.max(1, Math.round(candidate.adjustedWeight * multiplier));

      return {
        definitionId: candidate.definitionId,
        baseWeight: candidate.adjustedWeight,
        adjustedWeight,
        multiplier,
        matchedQuery,
        consequenceType,
      };
    })
    .filter((entry) => entry.adjustedWeight > 0);
}
