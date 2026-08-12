import { isCriminalOrganizationJob } from './job-catalog-constants.js';

/** Weight multiplier for criminal-task definitions when citizen belongs to a gang/org. */
export const GANG_CRIMINAL_TASK_WEIGHT_MULTIPLIER = 2.5;

const CRIMINAL_TASK_ID_MARKERS = [
  'STEAL',
  'SHADY',
  'RISKY',
  'SCAM',
  'SUITCASE',
  'BRIBE',
  'CRIMINAL',
  'GANG',
] as const;

export function isCriminalTaskDefinition(definitionId: string): boolean {
  const id = definitionId.toUpperCase();
  return CRIMINAL_TASK_ID_MARKERS.some((marker) => id.includes(marker));
}

export function isGangMemberFromEmployment(currentOfferId: string | null | undefined): boolean {
  if (!currentOfferId) return false;
  return isCriminalOrganizationJob(currentOfferId);
}

export function applyGangCriminalTaskWeights<T extends { definitionId: string; adjustedWeight: number }>(
  entries: readonly T[],
  isGangMember: boolean,
): T[] {
  if (!isGangMember) return [...entries];
  return entries.map((entry) =>
    isCriminalTaskDefinition(entry.definitionId)
      ? { ...entry, adjustedWeight: entry.adjustedWeight * GANG_CRIMINAL_TASK_WEIGHT_MULTIPLIER }
      : entry,
  );
}
