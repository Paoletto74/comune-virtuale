import { describe, expect, it, vi } from 'vitest';
import './register-slice-task-definitions.js';
import { TaskSelectionService } from './task-selection-service.js';
import type { TaskRepository } from '../../domain/ports/repositories.js';
import type { TaskInstanceMaterializer } from './task-instance-materializer.js';
import type { TaskPoolRegistry } from './task-pool-registry.js';
import { TaskPoolRegistry as TaskPoolRegistryImpl } from './task-pool-registry.js';
import { POOL_START } from '../../slice/task-pool-constants.js';
import type { CitizenProfileService, CitizenProfileContext } from '../citizen/citizen-profile-service.js';
import { OCCUPATION_CODES } from '../../slice/citizen-profile-constants.js';
import { SLICE_DEMO_TASK_DEFINITION_ID } from '../../slice/constants.js';

function buildProfile(occupationCode: number): CitizenProfileContext {
  return {
    citizenId: 'cit-1',
    age: 34,
    occupationCode,
    occupationLabel: 'Test',
    housingCode: 1,
    familyCode: 1,
    level: 2,
    sympathy: 3,
    reputation: 3,
    unlockedDimensions: ['work', 'living', 'personal'],
    tasksCompleted: 5,
    workTasksCompleted: 2,
  };
}

function createMixedPoolRegistry(): TaskPoolRegistry {
  const registry = new TaskPoolRegistryImpl();
  registry.register({
    poolId: POOL_START,
    entries: [
      { definitionId: 'DEMO_V2_WORK_CLIENT_ANGER', weight: 25, repeatPolicy: 'once', enabled: true },
      { definitionId: 'DEMO_V2_ECON_BILL_SHOCK', weight: 25, repeatPolicy: 'once', enabled: true },
      { definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE', weight: 25, repeatPolicy: 'once', enabled: true },
      { definitionId: 'DEMO_ELDERLY_CROSSING', weight: 25, repeatPolicy: 'once', enabled: true },
      { definitionId: 'DEMO_V3_UNEXPECTED_FLYAWAY_HAT', weight: 25, repeatPolicy: 'once', enabled: true },
    ],
  });
  return registry;
}

function createTaskRepo(): TaskRepository {
  return {
    findActiveByCitizenId: vi.fn().mockResolvedValue([]),
    findAllByCitizenId: vi.fn().mockResolvedValue([]),
    findById: vi.fn(),
    findByCitizenAndDefinitionId: vi.fn().mockResolvedValue(null),
    findBySelectionIdempotencyKey: vi.fn().mockResolvedValue(null),
    createTaskInstance: vi.fn(),
    createTaskInstanceIdempotent: vi.fn().mockImplementation(async (input) => ({
      record: {
        taskInstanceId: input.taskInstanceId,
        definitionId: input.definitionId,
        citizenId: input.citizenId,
        targetNpcId: input.targetNpcId,
        context: input.context,
        status: input.status,
        selectedOptionId: null,
        completedAt: null,
        createdAt: new Date(),
        expiresAt: null,
      },
      created: true,
    })),
    completeTask: vi.fn(),
    updateTaskInstance: vi.fn(),
    cancelPendingTasks: vi.fn(),
  };
}

describe('TaskSelectionService personalization', () => {
  it('records personalization audit when profile context is available', async () => {
    const profile: CitizenProfileService = {
      getProfileContextForSelection: vi.fn().mockResolvedValue(buildProfile(OCCUPATION_CODES.insegnante)),
    } as unknown as CitizenProfileService;

    const tasks = createTaskRepo();
    const materializer = {
      materialize: vi.fn().mockResolvedValue({ targetNpcId: null, context: {} }),
    } as unknown as TaskInstanceMaterializer;

    const service = new TaskSelectionService(
      tasks,
      materializer,
      undefined,
      createMixedPoolRegistry(),
      undefined,
      profile,
    );

    const result = await service.selectNext({ trigger: 'onboarding', citizenId: 'cit-1' });

    expect(result?.selectionAudit.personalization).toMatchObject({
      occupationCode: OCCUPATION_CODES.insegnante,
      level: 2,
    });
    expect(result?.selectionAudit.selectionVersion).toBe(2);
  });

  it('does not personalize single-candidate pools', async () => {
    const profile: CitizenProfileService = {
      getProfileContextForSelection: vi.fn().mockResolvedValue(buildProfile(OCCUPATION_CODES.commerciante)),
    } as unknown as CitizenProfileService;

    const elderlyOnlyRegistry = new TaskPoolRegistryImpl();
    elderlyOnlyRegistry.register({
      poolId: POOL_START,
      entries: [
        {
          definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
          weight: 25,
          repeatPolicy: 'once',
          enabled: true,
        },
      ],
    });

    const tasks = createTaskRepo();
    const materializer = {
      materialize: vi.fn().mockResolvedValue({ targetNpcId: 'npc-1', context: {} }),
    } as unknown as TaskInstanceMaterializer;

    const service = new TaskSelectionService(
      tasks,
      materializer,
      undefined,
      elderlyOnlyRegistry,
      undefined,
      profile,
    );

    const result = await service.selectNext({ trigger: 'onboarding', citizenId: 'cit-1' });
    expect(result?.selectionAudit.personalization).toBeUndefined();
  });

  it('fillFeed accumulates context tags to avoid monothematic selections', async () => {
    const profile: CitizenProfileService = {
      getProfileContextForSelection: vi.fn().mockResolvedValue(buildProfile(OCCUPATION_CODES.insegnante)),
    } as unknown as CitizenProfileService;

    const tasks = createTaskRepo();
    const materializer = {
      materialize: vi.fn().mockResolvedValue({ targetNpcId: null, context: {} }),
    } as unknown as TaskInstanceMaterializer;

    const service = new TaskSelectionService(
      tasks,
      materializer,
      undefined,
      createMixedPoolRegistry(),
      undefined,
      profile,
    );

    const results = await service.fillFeed({ trigger: 'onboarding', citizenId: 'cit-1' });
    const contexts = results.map(
      (entry) => entry.selectionAudit.personalization?.chosenPrimaryContext,
    );

    expect(results.length).toBeGreaterThan(1);
    expect(new Set(contexts).size).toBeGreaterThan(1);
  });
});
