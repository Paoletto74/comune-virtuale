import { createHash } from 'node:crypto';
import type { DayNightPhase } from '@comune-virtuale/shared';
import { deterministicBranchRoll } from '../risk/deterministic-roll.js';

export type TaskSelectionTriggerKind =
  | 'onboarding'
  | 'task_completed'
  | 'phase_changed'
  | 'anti_stall_refresh';

export function computeTaskSelectionSourceSeed(input: {
  trigger: TaskSelectionTriggerKind;
  citizenId: string;
  completedTaskInstanceId?: string;
  feedFillIndex?: number;
  dayPhase?: DayNightPhase;
  refreshNonce?: string;
}): string {
  const fillSuffix =
    input.feedFillIndex !== undefined ? `:fill${input.feedFillIndex}` : '';

  if (input.trigger === 'onboarding') {
    return `onboarding:${input.citizenId}${fillSuffix}`;
  }

  if (input.trigger === 'phase_changed') {
    return `phase_changed:${input.citizenId}:${input.dayPhase ?? 'unknown'}${fillSuffix}`;
  }

  if (input.trigger === 'anti_stall_refresh') {
    return `anti_stall_refresh:${input.citizenId}:${input.refreshNonce ?? 'default'}${fillSuffix}`;
  }

  return `task_completed:${input.completedTaskInstanceId}${fillSuffix}`;
}

export function computeTaskSelectionSeed(
  poolId: string,
  sourceSeed: string,
  selectionVersion: number,
): string {
  return createHash('sha256')
    .update(`${poolId}:${sourceSeed}:v${selectionVersion}`)
    .digest('hex');
}

export function buildTaskSelectionIdempotencyKey(input: {
  trigger: TaskSelectionTriggerKind;
  citizenId: string;
  poolId: string;
  completedTaskInstanceId?: string;
  feedFillIndex?: number;
  dayPhase?: DayNightPhase;
  refreshNonce?: string;
  forcedPoolId?: string;
}): string {
  const fillSuffix =
    input.feedFillIndex !== undefined ? `:fill${input.feedFillIndex}` : '';
  const fallbackSuffix = input.forcedPoolId
    ? `:fallback:${input.forcedPoolId}${fillSuffix}`
    : fillSuffix;

  if (input.trigger === 'onboarding') {
    return `task-selection:onboarding:${input.citizenId}:${input.poolId}${fallbackSuffix}`;
  }

  if (input.trigger === 'phase_changed') {
    return `task-selection:phase_changed:${input.citizenId}:${input.dayPhase}:${input.poolId}${fallbackSuffix}`;
  }

  if (input.trigger === 'anti_stall_refresh') {
    return `task-selection:anti_stall:${input.citizenId}:${input.refreshNonce ?? 'default'}:${input.poolId}${fillSuffix}`;
  }

  return `task-selection:${input.completedTaskInstanceId}:${input.poolId}${fallbackSuffix}`;
}

export interface WeightedTaskCandidate {
  definitionId: string;
  weight: number;
}

export interface DeterministicTaskSelectionResult {
  chosenDefinitionId: string;
  selectionSeed: string;
  rollDigest: string;
  rollValue: number;
}

export function deterministicWeightedTaskSelection(
  selectionSeed: string,
  candidates: WeightedTaskCandidate[],
): DeterministicTaskSelectionResult {
  const roll = deterministicBranchRoll(
    selectionSeed,
    candidates.map((candidate) => ({
      branchId: candidate.definitionId,
      weight: candidate.weight,
    })),
  );

  return {
    chosenDefinitionId: roll.branchId,
    selectionSeed,
    rollDigest: roll.rollDigest,
    rollValue: roll.rollValue,
  };
}
