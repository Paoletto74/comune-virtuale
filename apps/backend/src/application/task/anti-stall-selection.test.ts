import { describe, expect, it, vi } from 'vitest';
import * as playerSelectionContext from './player-selection-context.js';
import { TaskSelectionService } from './task-selection-service.js';
import { defaultTaskDefinitionCatalog } from './task-definition-catalog.js';
import { defaultTaskPoolRegistry } from './task-pool-registry.js';
import { defaultTaskPoolResolver } from './task-pool-resolver.js';
import { POOL_ANTI_STALL } from '../../slice/task-pool-constants.js';
import { ANTI_STALL_TASK_DEFINITION_IDS } from '../../slice/anti-stall-tasks-constants.js';
import { registerSliceTaskDefinitions } from './register-slice-task-definitions.js';

registerSliceTaskDefinitions();

describe('TaskSelectionService anti-stall fallback', () => {
  it('selects repeatable anti-stall tasks when the main pool is exhausted', async () => {
    const tasks = {
      findActiveByCitizenId: vi.fn().mockResolvedValue([]),
      findBySelectionIdempotencyKey: vi.fn().mockResolvedValue(null),
      createTaskInstanceIdempotent: vi.fn().mockImplementation(async (input) => ({
        created: true,
        record: {
          taskInstanceId: input.taskInstanceId,
          definitionId: input.definitionId,
          context: input.context,
        },
      })),
    };

    const materializer = {
      materialize: vi.fn().mockResolvedValue({
        context: { definitionId: 'ANTI_STALL_PASSEGGIATA' },
      }),
    };

    const service = new TaskSelectionService(
      tasks as never,
      materializer as never,
      defaultTaskDefinitionCatalog,
      defaultTaskPoolRegistry,
      defaultTaskPoolResolver,
    );

    vi.spyOn(playerSelectionContext, 'buildPlayerSelectionContext').mockResolvedValue({
      citizenId: 'cit-anti-stall',
      completedDefinitionIds: new Set(['DEMO_ELDERLY_CROSSING']),
      activeOrPendingDefinitionIds: new Set(),
    });

    const result = await service.selectNext({
      trigger: 'anti_stall_refresh',
      citizenId: 'cit-anti-stall',
      refreshNonce: 'nonce-1',
      feedFillIndex: 0,
    });

    expect(result).not.toBeNull();
    expect(result!.poolId).toBe(POOL_ANTI_STALL);
    expect(ANTI_STALL_TASK_DEFINITION_IDS).toContain(result!.definitionId);
  });
});
