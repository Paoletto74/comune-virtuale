/**
 * Configurable grade advancement requirements per career track.
 */
import type { DemoCareerId } from './career-constants.js';
import { LEVEL_POINT_THRESHOLDS } from './citizen-progression-constants.js';

export interface CareerGradeRequirement {
  minGlobalXp: number;
  minAffinity: number;
  minReputation?: number;
}

/** Grade index 1–20 requirements for demo careers (shared curve, overridable per career). */
export function resolveGradeRequirement(
  careerId: DemoCareerId,
  gradeIndex: number,
): CareerGradeRequirement {
  const levelForGrade = Math.min(20, Math.max(1, Math.ceil(gradeIndex / 1)));
  const xpLevel = Math.min(20, gradeIndex);
  return {
    minGlobalXp: LEVEL_POINT_THRESHOLDS[xpLevel] ?? 0,
    minAffinity: Math.max(0, (gradeIndex - 1) * 5),
    ...(careerId === 'criminalita' && gradeIndex >= 10 ? { minReputation: 20 } : {}),
    ...(careerId === 'medicina' && gradeIndex >= 8 ? { minReputation: 15 } : {}),
  };
}
