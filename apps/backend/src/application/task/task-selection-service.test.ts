import { describe, expect, it, vi } from 'vitest';
import './register-slice-task-definitions.js';
import { TaskSelectionService } from './task-selection-service.js';
import type { TaskRepository } from '../../domain/ports/repositories.js';
import type { TaskInstanceMaterializer } from './task-instance-materializer.js';
import { ALL_POOL_ENTRY_DEFINITION_IDS, createElderlyOnlyPoolRegistry } from './task-pool-registry.js';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import {
  DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
} from '../../slice/c3-pilot-tasks-constants.js';
import { SLICE_DEMO_TASK_DEFINITION_ID } from '../../slice/constants.js';
import { POOL_AFTER_ELDERLY, POOL_AFTER_TASK, POOL_START } from '../../slice/task-pool-constants.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';
import type { TaskSelectionAudit } from './task-pool-types.js';

function buildAudit(overrides: Partial<TaskSelectionAudit> = {}): TaskSelectionAudit {
  return {
    poolId: POOL_START,
    selectionVersion: 1,
    sourceSeed: 'onboarding:cit-1',
    selectionSeed: 'seed',
    candidateDefinitionIds: [SLICE_DEMO_TASK_DEFINITION_ID],
    chosenDefinitionId: SLICE_DEMO_TASK_DEFINITION_ID,
    idempotencyKey: 'task-selection:onboarding:cit-1:POOL_START:fill0',
    ...overrides,
  };
}

function createTaskRepo(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    findActiveByCitizenId: vi.fn().mockResolvedValue([]),
    findAllByCitizenId: vi.fn().mockResolvedValue([]),
    findById: vi.fn(),
    findByCitizenAndDefinitionId: vi.fn().mockResolvedValue(null),
    findBySelectionIdempotencyKey: vi.fn().mockResolvedValue(null),
    createTaskInstance: vi.fn(),
    createTaskInstanceIdempotent: vi.fn(),
    completeTask: vi.fn(),
    updateTaskInstance: vi.fn(),
    cancelPendingTasks: vi.fn(),
    ...overrides,
  };
}

describe('TaskSelectionService', () => {
  it('selects elderly from POOL_START on onboarding', async () => {
    const audit = buildAudit();
    const tasks = createTaskRepo({
      createTaskInstanceIdempotent: vi.fn().mockResolvedValue({
        record: {
          taskInstanceId: 'task-elderly',
          definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
          citizenId: 'cit-1',
          targetNpcId: 'npc-1',
          context: { selectionAudit: audit },
          status: 'active',
          selectedOptionId: null,
          completedAt: null,
          createdAt: new Date(),
          expiresAt: null,
        },
        created: true,
      }),
    });

    const materializer = {
      materialize: vi.fn().mockResolvedValue({
        targetNpcId: 'npc-1',
        context: { targetNpcId: 'npc-1' },
      }),
    } as unknown as TaskInstanceMaterializer;

    const service = new TaskSelectionService(tasks, materializer, undefined, createElderlyOnlyPoolRegistry());
    const result = await service.selectNext({ trigger: 'onboarding', citizenId: 'cit-1' });

    expect(result?.definitionId).toBe(SLICE_DEMO_TASK_DEFINITION_ID);
    expect(result?.poolId).toBe(POOL_START);
    expect(result?.selectionAudit.candidateDefinitionIds).toEqual([SLICE_DEMO_TASK_DEFINITION_ID]);
    expect(result?.selectionAudit.chosenDefinitionId).toBe(SLICE_DEMO_TASK_DEFINITION_ID);
    expect(result?.created).toBe(true);
    expect(tasks.createTaskInstanceIdempotent).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending' }),
    );
  });

  it('selects boss from POOL_AFTER_ELDERLY after elderly complete', async () => {
    const audit = buildAudit({
      poolId: POOL_AFTER_ELDERLY,
      chosenDefinitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
      candidateDefinitionIds: [DEMO_BOSS_GREETING_DEFINITION_ID],
      idempotencyKey: 'task-selection:task-elderly:POOL_AFTER_ELDERLY',
      sourceCompletedTaskInstanceId: 'task-elderly',
    });

    const tasks = createTaskRepo({
      findAllByCitizenId: vi.fn().mockResolvedValue([
        {
          taskInstanceId: 'task-elderly',
          definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
          citizenId: 'cit-1',
          targetNpcId: 'npc-1',
          context: {},
          status: 'completed',
          selectedOptionId: 'help',
          completedAt: new Date(),
          createdAt: new Date(),
          expiresAt: null,
        },
      ]),
      createTaskInstanceIdempotent: vi.fn().mockResolvedValue({
        record: {
          taskInstanceId: 'task-boss',
          definitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
          citizenId: 'cit-1',
          targetNpcId: null,
          context: { selectionAudit: audit },
          status: 'active',
          selectedOptionId: null,
          completedAt: null,
          createdAt: new Date(),
          expiresAt: null,
        },
        created: true,
      }),
    });

    const materializer = {
      materialize: vi.fn().mockResolvedValue({ context: {} }),
    } as unknown as TaskInstanceMaterializer;

    const service = new TaskSelectionService(tasks, materializer, undefined, createElderlyOnlyPoolRegistry());
    const result = await service.selectNext({
      trigger: 'task_completed',
      citizenId: 'cit-1',
      completedTaskInstanceId: 'task-elderly',
      completedDefinitionId: SLICE_DEMO_TASK_DEFINITION_ID,
    });

    expect(result?.definitionId).toBe(DEMO_BOSS_GREETING_DEFINITION_ID);
    expect(result?.poolId).toBe(POOL_AFTER_ELDERLY);
  });

  it('selects next task from POOL_AFTER_TASK after boss complete', async () => {
    const audit = buildAudit({
      poolId: POOL_AFTER_TASK,
      chosenDefinitionId: DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
      candidateDefinitionIds: [DEMO_NEIGHBOR_FAVOR_DEFINITION_ID],
      idempotencyKey: 'task-selection:task-boss:POOL_AFTER_TASK',
    });

    const tasks = createTaskRepo({
      findAllByCitizenId: vi.fn().mockResolvedValue([
        {
          taskInstanceId: 'task-boss',
          definitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
          citizenId: 'cit-1',
          targetNpcId: null,
          context: {},
          status: 'completed',
          selectedOptionId: 'conclude',
          completedAt: new Date(),
          createdAt: new Date(),
          expiresAt: null,
        },
      ]),
      createTaskInstanceIdempotent: vi.fn().mockResolvedValue({
        record: {
          taskInstanceId: 'task-neighbor',
          definitionId: DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
          citizenId: 'cit-1',
          targetNpcId: null,
          context: { selectionAudit: audit },
          status: 'active',
          selectedOptionId: null,
          completedAt: null,
          createdAt: new Date(),
          expiresAt: null,
        },
        created: true,
      }),
    });

    const materializer = {
      materialize: vi.fn().mockResolvedValue({ context: {} }),
    } as unknown as TaskInstanceMaterializer;

    const service = new TaskSelectionService(tasks, materializer);
    const result = await service.selectNext({
      trigger: 'task_completed',
      citizenId: 'cit-1',
      completedTaskInstanceId: 'task-boss',
      completedDefinitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
    });

    expect(result?.poolId).toBe(POOL_AFTER_TASK);
    expect(result?.definitionId).toBe(DEMO_NEIGHBOR_FAVOR_DEFINITION_ID);
  });

  it('returns null when POOL_AFTER_TASK has no remaining candidates', async () => {
    const completedPoolTasks = ALL_POOL_ENTRY_DEFINITION_IDS.map((definitionId, index) => ({
      taskInstanceId: `task-pool-${index}`,
      definitionId,
      citizenId: 'cit-1',
      targetNpcId: null,
      context: {},
      status: 'completed' as const,
      selectedOptionId: 'ignore',
      completedAt: new Date(),
      createdAt: new Date(),
      expiresAt: null,
    }));

    const tasks = createTaskRepo({
      findAllByCitizenId: vi.fn().mockResolvedValue([
        {
          taskInstanceId: 'task-boss',
          definitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
          citizenId: 'cit-1',
          targetNpcId: null,
          context: {},
          status: 'completed',
          selectedOptionId: 'conclude',
          completedAt: new Date(),
          createdAt: new Date(),
          expiresAt: null,
        },
        ...completedPoolTasks,
      ]),
    });
    const materializer = { materialize: vi.fn() } as unknown as TaskInstanceMaterializer;
    const service = new TaskSelectionService(tasks, materializer);

    const result = await service.selectNext({
      trigger: 'task_completed',
      citizenId: 'cit-1',
      completedTaskInstanceId: 'task-boss',
      completedDefinitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
    });

    expect(result).toBeNull();
    expect(materializer.materialize).not.toHaveBeenCalled();
  });

  it('returns existing selection on idempotency hit', async () => {
    const audit = buildAudit({
      poolId: POOL_AFTER_ELDERLY,
      chosenDefinitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
      idempotencyKey: 'task-selection:task-elderly:POOL_AFTER_ELDERLY',
    });

    const tasks = createTaskRepo({
      findBySelectionIdempotencyKey: vi.fn().mockResolvedValue({
        taskInstanceId: 'task-boss',
        definitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
        citizenId: 'cit-1',
        targetNpcId: null,
        context: { selectionAudit: audit },
        status: 'active',
        selectedOptionId: null,
        completedAt: null,
        createdAt: new Date(),
        expiresAt: null,
      }),
    });

    const materializer = { materialize: vi.fn() } as unknown as TaskInstanceMaterializer;
    const service = new TaskSelectionService(tasks, materializer, undefined, createElderlyOnlyPoolRegistry());

    const result = await service.selectNext({
      trigger: 'task_completed',
      citizenId: 'cit-1',
      completedTaskInstanceId: 'task-elderly',
      completedDefinitionId: SLICE_DEMO_TASK_DEFINITION_ID,
    });

    expect(result?.created).toBe(false);
    expect(materializer.materialize).not.toHaveBeenCalled();
  });

  it('excludes once-completed definitions', async () => {
    const tasks = createTaskRepo({
      findAllByCitizenId: vi.fn().mockResolvedValue([
        {
          taskInstanceId: 'task-boss',
          definitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
          citizenId: 'cit-1',
          targetNpcId: null,
          context: {},
          status: 'completed',
          selectedOptionId: 'conclude',
          completedAt: new Date(),
          createdAt: new Date(),
          expiresAt: null,
        },
      ]),
    });

    const materializer = { materialize: vi.fn() } as unknown as TaskInstanceMaterializer;
    const service = new TaskSelectionService(tasks, materializer, undefined, createElderlyOnlyPoolRegistry());

    const result = await service.selectNext({
      trigger: 'task_completed',
      citizenId: 'cit-1',
      completedTaskInstanceId: 'task-elderly',
      completedDefinitionId: SLICE_DEMO_TASK_DEFINITION_ID,
    });

    expect(result).toBeNull();
    expect(materializer.materialize).not.toHaveBeenCalled();
  });

  it('excludes active duplicate definitions', async () => {
    const tasks = createTaskRepo({
      findAllByCitizenId: vi.fn().mockResolvedValue([
        {
          taskInstanceId: 'task-boss-active',
          definitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
          citizenId: 'cit-1',
          targetNpcId: null,
          context: {},
          status: 'active',
          selectedOptionId: null,
          completedAt: null,
          createdAt: new Date(),
          expiresAt: null,
        },
      ]),
    });

    const materializer = { materialize: vi.fn() } as unknown as TaskInstanceMaterializer;
    const service = new TaskSelectionService(tasks, materializer, undefined, createElderlyOnlyPoolRegistry());

    const result = await service.selectNext({
      trigger: 'task_completed',
      citizenId: 'cit-1',
      completedTaskInstanceId: 'task-elderly',
      completedDefinitionId: SLICE_DEMO_TASK_DEFINITION_ID,
    });

    expect(result).toBeNull();
  });

  it('throws on failed POOL_START onboarding selection', async () => {
    const tasks = createTaskRepo({
      findAllByCitizenId: vi.fn().mockResolvedValue([
        {
          taskInstanceId: 'task-elderly',
          definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
          citizenId: 'cit-1',
          targetNpcId: 'npc-1',
          context: {},
          status: 'active',
          selectedOptionId: null,
          completedAt: null,
          createdAt: new Date(),
          expiresAt: null,
        },
      ]),
    });

    const materializer = { materialize: vi.fn() } as unknown as TaskInstanceMaterializer;
    const service = new TaskSelectionService(tasks, materializer, undefined, createElderlyOnlyPoolRegistry());

    await expect(
      service.selectNext({ trigger: 'onboarding', citizenId: 'cit-1' }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
