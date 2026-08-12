import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import { SLICE_DEMO_TASK_DEFINITION_ID } from '../../slice/constants.js';
import { isDialogueTerminal } from '../../slice/dialogue-routing.js';
import { POOL_AFTER_ELDERLY, POOL_AFTER_TASK, POOL_ANTI_STALL, POOL_START } from '../../slice/task-pool-constants.js';
import type { TaskSelectionTrigger } from './task-pool-types.js';
import { ALL_POOL_ENTRY_DEFINITION_IDS } from './task-pool-registry.js';
import { resolvePhasePoolId } from './task-phase-metadata.js';

const POOL_AFTER_TASK_COMPLETED_IDS = new Set<string>([
  DEMO_BOSS_GREETING_DEFINITION_ID,
  ...ALL_POOL_ENTRY_DEFINITION_IDS,
]);

export class TaskPoolResolver {
  resolvePoolId(input: TaskSelectionTrigger): string | null {
    if (input.trigger === 'phase_changed') {
      return resolvePhasePoolId(input.dayPhase);
    }

    if (input.trigger === 'onboarding') {
      return POOL_START;
    }

    if (input.trigger === 'anti_stall_refresh') {
      return POOL_ANTI_STALL;
    }

    if (input.completedDefinitionId === SLICE_DEMO_TASK_DEFINITION_ID) {
      return POOL_AFTER_ELDERLY;
    }

    if (
      input.completedDefinitionId &&
      (POOL_AFTER_TASK_COMPLETED_IDS.has(input.completedDefinitionId) ||
        isDialogueTerminal(input.completedDefinitionId))
    ) {
      return POOL_AFTER_TASK;
    }

    return null;
  }
}

export const defaultTaskPoolResolver = new TaskPoolResolver();
