import { describe, expect, it } from 'vitest';
import {
  buildTaskSelectionIdempotencyKey,
  computeTaskSelectionSeed,
  computeTaskSelectionSourceSeed,
  deterministicWeightedTaskSelection,
} from './deterministic-task-selection.js';
import { POOL_AFTER_ELDERLY, POOL_PHASE_DAY, POOL_START, TASK_SELECTION_VERSION } from '../../slice/task-pool-constants.js';
import { SLICE_DEMO_TASK_DEFINITION_ID } from '../../slice/constants.js';

describe('deterministic task selection', () => {
  it('builds onboarding idempotency key', () => {
    expect(
      buildTaskSelectionIdempotencyKey({
        trigger: 'onboarding',
        citizenId: 'cit-1',
        poolId: POOL_START,
      }),
    ).toBe('task-selection:onboarding:cit-1:POOL_START');
  });

  it('builds task_completed idempotency key', () => {
    expect(
      buildTaskSelectionIdempotencyKey({
        trigger: 'task_completed',
        citizenId: 'cit-1',
        poolId: POOL_AFTER_ELDERLY,
        completedTaskInstanceId: 'task-elderly',
      }),
    ).toBe('task-selection:task-elderly:POOL_AFTER_ELDERLY');
  });

  it('builds phase_changed idempotency key', () => {
    expect(
      buildTaskSelectionIdempotencyKey({
        trigger: 'phase_changed',
        citizenId: 'cit-1',
        poolId: POOL_PHASE_DAY,
        dayPhase: 'afternoon',
        feedFillIndex: 2,
      }),
    ).toBe('task-selection:phase_changed:cit-1:afternoon:POOL_PHASE_DAY:fill2');
  });

  it('produces reproducible weighted selection', () => {
    const sourceSeed = computeTaskSelectionSourceSeed({
      trigger: 'onboarding',
      citizenId: 'cit-1',
    });
    const selectionSeed = computeTaskSelectionSeed(
      POOL_START,
      sourceSeed,
      TASK_SELECTION_VERSION,
    );

    const first = deterministicWeightedTaskSelection(selectionSeed, [
      { definitionId: SLICE_DEMO_TASK_DEFINITION_ID, weight: 100 },
    ]);
    const second = deterministicWeightedTaskSelection(selectionSeed, [
      { definitionId: SLICE_DEMO_TASK_DEFINITION_ID, weight: 100 },
    ]);

    expect(first.chosenDefinitionId).toBe(SLICE_DEMO_TASK_DEFINITION_ID);
    expect(second).toEqual(first);
  });

  it('changes selection seed when source changes', () => {
    const seedA = computeTaskSelectionSeed(
      POOL_START,
      computeTaskSelectionSourceSeed({ trigger: 'onboarding', citizenId: 'cit-a' }),
      TASK_SELECTION_VERSION,
    );
    const seedB = computeTaskSelectionSeed(
      POOL_START,
      computeTaskSelectionSourceSeed({ trigger: 'onboarding', citizenId: 'cit-b' }),
      TASK_SELECTION_VERSION,
    );

    expect(seedA).not.toBe(seedB);
  });
});
