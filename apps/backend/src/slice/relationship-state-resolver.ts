/** Derives relationship state labels from underlying metrics. */

export type RelationshipStateLabel =
  | 'conoscenza'
  | 'simpatia'
  | 'amicizia'
  | 'forte_amicizia'
  | 'collaborazione'
  | 'attrazione'
  | 'infatuazione'
  | 'amore'
  | 'distanza'
  | 'antipatia'
  | 'conflitto'
  | 'rottura';

export function clampMetric(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function computeRelationshipScore(input: {
  trust: number;
  affection: number;
  familiarity: number;
  conflict: number;
  relationshipLevel: number;
}): number {
  const raw =
    input.trust * 0.25 +
    input.affection * 0.35 +
    input.familiarity * 0.2 +
    input.relationshipLevel * 8 -
    input.conflict * 0.4;
  return clampMetric(raw, -100, 100);
}

export function resolveRelationshipState(input: {
  trust: number;
  affection: number;
  conflict: number;
  familiarity: number;
  relationshipLevel: number;
  contactUnlocked: boolean;
}): RelationshipStateLabel {
  const score = computeRelationshipScore(input);
  if (input.conflict >= 70) return 'rottura';
  if (input.conflict >= 45) return 'conflitto';
  if (input.conflict >= 25 && input.affection < 20) return 'antipatia';
  if (score < -10 && input.familiarity < 15) return 'distanza';
  if (input.affection >= 85 && input.trust >= 70) return 'amore';
  if (input.affection >= 70 && input.trust >= 55) return 'infatuazione';
  if (input.affection >= 55) return 'attrazione';
  if (input.trust >= 60 && input.familiarity >= 40) return 'collaborazione';
  if (input.affection >= 40 && input.familiarity >= 30) return 'forte_amicizia';
  if (input.affection >= 25 || input.familiarity >= 20) return 'amicizia';
  if (input.affection >= 10 || input.familiarity >= 10) return 'simpatia';
  return 'conoscenza';
}

export const RELATIONSHIP_STATE_LABELS: Record<RelationshipStateLabel, string> = {
  conoscenza: 'Conoscenza',
  simpatia: 'Simpatia',
  amicizia: 'Amicizia',
  forte_amicizia: 'Forte amicizia',
  collaborazione: 'Collaborazione',
  attrazione: 'Attrazione',
  infatuazione: 'Infatuazione',
  amore: 'Amore',
  distanza: 'Distanza',
  antipatia: 'Antipatia',
  conflitto: 'Conflitto',
  rottura: 'Rottura',
};
