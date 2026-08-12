import { describe, expect, it } from 'vitest';
import { TaskPoolResolver } from './task-pool-resolver.js';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import { SLICE_DEMO_TASK_DEFINITION_ID } from '../../slice/constants.js';
import { POOL_AFTER_ELDERLY, POOL_AFTER_TASK, POOL_START } from '../../slice/task-pool-constants.js';
import { DEMO_NEIGHBOR_FAVOR_DEFINITION_ID } from '../../slice/c3-pilot-tasks-constants.js';
import { DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID } from '../../slice/variety-content-constants.js';
import { DEMO_LANDLORD_GREETING_DEFINITION_ID } from '../../slice/variety-dialogue-constants.js';

describe('TaskPoolResolver', () => {
  const resolver = new TaskPoolResolver();

  it('resolves onboarding to POOL_START', () => {
    expect(
      resolver.resolvePoolId({
        trigger: 'onboarding',
        citizenId: 'cit-1',
      }),
    ).toBe(POOL_START);
  });

  it('resolves elderly complete to POOL_AFTER_ELDERLY', () => {
    expect(
      resolver.resolvePoolId({
        trigger: 'task_completed',
        citizenId: 'cit-1',
        completedTaskInstanceId: 'task-elderly',
        completedDefinitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      }),
    ).toBe(POOL_AFTER_ELDERLY);
  });

  it('resolves boss complete to POOL_AFTER_TASK', () => {
    expect(
      resolver.resolvePoolId({
        trigger: 'task_completed',
        citizenId: 'cit-1',
        completedTaskInstanceId: 'task-boss',
        completedDefinitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
      }),
    ).toBe(POOL_AFTER_TASK);
  });

  it('resolves pool task completes to POOL_AFTER_TASK', () => {
    for (const definitionId of [
      DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
      DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID,
      DEMO_LANDLORD_GREETING_DEFINITION_ID,
    ]) {
      expect(
        resolver.resolvePoolId({
          trigger: 'task_completed',
          citizenId: 'cit-1',
          completedTaskInstanceId: `task-${definitionId}`,
          completedDefinitionId: definitionId,
        }),
      ).toBe(POOL_AFTER_TASK);
    }
  });

  it('returns null for unknown completed definition', () => {
    expect(
      resolver.resolvePoolId({
        trigger: 'task_completed',
        citizenId: 'cit-1',
        completedTaskInstanceId: 'task-other',
        completedDefinitionId: 'UNKNOWN_TASK',
      }),
    ).toBeNull();
  });

  it('resolves phase_changed to phase pool', () => {
    expect(
      resolver.resolvePoolId({
        trigger: 'phase_changed',
        citizenId: 'cit-1',
        dayPhase: 'sunset',
        previousDayPhase: 'afternoon',
      }),
    ).toBe('POOL_PHASE_EVENING');
  });
});
