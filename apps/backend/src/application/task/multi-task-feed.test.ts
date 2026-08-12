import { describe, expect, it, vi } from 'vitest';
import { TaskService } from './task-service.js';
import type { CitizenRepository, TaskRepository } from '../../domain/ports/repositories.js';
import type { EconomyService } from '../economy/economy-service.js';
import { FEED_VISIBLE_SIZE, MAX_CONCURRENT_STANDARD_TASKS } from '../../slice/feed-constants.js';
import { ALL_POOL_ENTRY_DEFINITION_IDS } from './task-pool-registry.js';
import './register-slice-task-definitions.js';

describe('V1-MULTI-TASK-FEED-1 constants', () => {
  it('targets about 100 unique pool entries', () => {
    expect(ALL_POOL_ENTRY_DEFINITION_IDS.length).toBeGreaterThanOrEqual(98);
    expect(ALL_POOL_ENTRY_DEFINITION_IDS.length).toBeLessThanOrEqual(115);
    expect(new Set(ALL_POOL_ENTRY_DEFINITION_IDS).size).toBe(ALL_POOL_ENTRY_DEFINITION_IDS.length);
  });

  it('configures feed visibility and concurrency limits', () => {
    expect(FEED_VISIBLE_SIZE).toBe(7);
    expect(MAX_CONCURRENT_STANDARD_TASKS).toBe(3);
  });
});

describe('TaskService feed behavior', () => {
  it('rejects starting a fourth standard task', async () => {
    const tasks: TaskRepository = {
      findActiveByCitizenId: vi.fn().mockResolvedValue([
        { taskInstanceId: 'a1', definitionId: 'DEMO_V2_WORK_CLIENT_ANGER', status: 'active', context: {}, citizenId: 'c1', targetNpcId: null, selectedOptionId: null, completedAt: null, createdAt: new Date(), expiresAt: null },
        { taskInstanceId: 'a2', definitionId: 'DEMO_V2_WORK_BOSS_CRITICISM', status: 'active', context: {}, citizenId: 'c1', targetNpcId: null, selectedOptionId: null, completedAt: null, createdAt: new Date(), expiresAt: null },
        { taskInstanceId: 'a3', definitionId: 'DEMO_V2_WORK_ERROR_FOUND', status: 'active', context: {}, citizenId: 'c1', targetNpcId: null, selectedOptionId: null, completedAt: null, createdAt: new Date(), expiresAt: null },
      ]),
      findAllByCitizenId: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        taskInstanceId: 'pending-1',
        definitionId: 'DEMO_V2_WORK_DEADLINE_HELP',
        citizenId: 'c1',
        status: 'pending',
        context: {},
        targetNpcId: null,
        selectedOptionId: null,
        completedAt: null,
        createdAt: new Date(),
        expiresAt: null,
      }),
      findByCitizenAndDefinitionId: vi.fn(),
      findBySelectionIdempotencyKey: vi.fn(),
      createTaskInstance: vi.fn(),
      createTaskInstanceIdempotent: vi.fn(),
      completeTask: vi.fn(),
      updateTaskInstance: vi.fn(),
      cancelPendingTasks: vi.fn(),
    };

    const service = new TaskService(
      tasks,
      {} as CitizenRepository,
      {} as EconomyService,
    );

    await expect(
      service.startTask({ citizenId: 'c1', taskInstanceId: 'pending-1' }),
    ).rejects.toMatchObject({ code: 'MAX_STANDARD_TASKS_REACHED' });
  });

  it('marks pending standard tasks as available in summary', async () => {
    const tasks: TaskRepository = {
      findActiveByCitizenId: vi.fn().mockResolvedValue([
        {
          taskInstanceId: 'pending-1',
          definitionId: 'DEMO_V2_WORK_CLIENT_ANGER',
          citizenId: 'c1',
          status: 'pending',
          context: {},
          targetNpcId: null,
          selectedOptionId: null,
          completedAt: null,
          createdAt: new Date(),
          expiresAt: null,
        },
      ]),
      findAllByCitizenId: vi.fn(),
      findById: vi.fn(),
      findByCitizenAndDefinitionId: vi.fn(),
      findBySelectionIdempotencyKey: vi.fn(),
      createTaskInstance: vi.fn(),
      createTaskInstanceIdempotent: vi.fn(),
      completeTask: vi.fn(),
      updateTaskInstance: vi.fn(),
      cancelPendingTasks: vi.fn(),
    };

    const citizens = {
      getPersonalValues: vi.fn().mockResolvedValue({}),
    } as unknown as CitizenRepository;

    const service = new TaskService(tasks, citizens, {} as EconomyService);
    const summaries = await service.getActiveTasks('c1');
    expect(summaries[0]?.feedState).toBe('available');
  });
});
