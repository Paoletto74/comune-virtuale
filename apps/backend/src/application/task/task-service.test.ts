import { describe, expect, it, vi } from 'vitest';
import { TaskService } from './task-service.js';
import type { CitizenRepository, TaskRepository } from '../../domain/ports/repositories.js';
import type { EconomyService } from '../economy/economy-service.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';
import {
  SLICE_DEMO_TASK_DEFINITION_ID,
  SLICE_DEMO_TASK_OPTION_HELP,
  SLICE_DEMO_TASK_OPTION_IGNORE,
} from '../../slice/constants.js';
import { SLICE_GAME_CURRENCY_ID, SLICE_DEMO_HELP_CASH_DELTA_MINOR } from '../../slice/economy-constants.js';

function createMocks(balanceMinor = '100') {
  const tasks: TaskRepository = {
    findActiveByCitizenId: vi.fn(),
    findAllByCitizenId: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue({
      taskInstanceId: 'task-1',
      definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      citizenId: 'cit-1',
      targetNpcId: 'npc-1',
      context: { targetNpcId: 'npc-1', targetRuleRef: 'random_npc_elderly' },
      status: 'active',
      selectedOptionId: null,
      completedAt: null,
      createdAt: new Date(),
      expiresAt: null,
    }),
    findByCitizenAndDefinitionId: vi.fn().mockResolvedValue(null),
    findBySelectionIdempotencyKey: vi.fn().mockResolvedValue(null),
    createTaskInstance: vi.fn(),
    createTaskInstanceIdempotent: vi.fn(),
    updateTaskInstance: vi.fn().mockImplementation(async (input) => ({
      taskInstanceId: input.taskInstanceId,
      definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      citizenId: input.citizenId,
      targetNpcId: 'npc-1',
      context: input.context,
      status: input.status ?? 'active',
      selectedOptionId: null,
      completedAt: null,
      createdAt: new Date(),
      expiresAt: null,
    })),
    completeTask: vi.fn().mockResolvedValue({
      taskInstanceId: 'task-1',
      definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      citizenId: 'cit-1',
      status: 'completed',
      selectedOptionId: SLICE_DEMO_TASK_OPTION_HELP,
      completedAt: new Date(),
      createdAt: new Date(),
      expiresAt: null,
    }),
    cancelPendingTasks: vi.fn(),
  };

  const citizens: CitizenRepository = {
    findByAccountId: vi.fn(),
    findById: vi.fn(),
    createWithOnboarding: vi.fn(),
    getProgression: vi.fn(),
    applyProgressionGrant: vi.fn(),
    getPersonalValues: vi.fn().mockResolvedValue({ sympathy: 0, reputation: 0 }),
    incrementPersonalValues: vi.fn().mockResolvedValue({ sympathy: 1, reputation: 1 }),
    applyPersonalValueEffects: vi.fn().mockImplementation(async (_citizenId, input) => ({
      values: { sympathy: 1, reputation: 1, ...(input.deltas ?? {}) },
      applied: input.deltas ?? {},
    })),
    setPersonalValues: vi.fn(),
    getLastTaskDayPhase: vi.fn().mockResolvedValue(null),
    setLastTaskDayPhase: vi.fn(),
    updatePortraitId: vi.fn(),
    deleteByCitizenId: vi.fn(),
    updateDisplayName: vi.fn(),
    updateMainLevel: vi.fn(),
    listAll: vi.fn(),
  };

  const economy = {
    getBalance: vi.fn().mockResolvedValue({
      availableCash: { amountMinor: balanceMinor, currency: SLICE_GAME_CURRENCY_ID },
      asOf: new Date().toISOString(),
    }),
    getOwnerBalance: vi.fn().mockResolvedValue(100n),
    applyCashDelta: vi.fn().mockResolvedValue({
      availableCash: {
        amountMinor: (BigInt(balanceMinor) + SLICE_DEMO_HELP_CASH_DELTA_MINOR).toString(),
        currency: SLICE_GAME_CURRENCY_ID,
      },
      asOf: new Date().toISOString(),
    }),
  } as unknown as EconomyService;

  return { tasks, citizens, economy };
}

describe('TaskService', () => {
  it('getActiveTasks exposes help and ignore options', async () => {
    const { tasks, citizens, economy } = createMocks();
    vi.mocked(tasks.findActiveByCitizenId).mockResolvedValue([
      {
        taskInstanceId: 'task-1',
        definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
        citizenId: 'cit-1',
        targetNpcId: 'npc-1',
        context: { targetNpcId: 'npc-1' },
        status: 'active',
        selectedOptionId: null,
        completedAt: null,
        createdAt: new Date(),
        expiresAt: null,
      },
    ]);

    const service = new TaskService(tasks, citizens, economy);
    const active = await service.getActiveTasks('cit-1');

    expect(active[0]?.options).toEqual([
      expect.objectContaining({
        optionId: 'help',
        label: 'La aiuti',
        presentationHint: 'action',
        statEffects: expect.objectContaining({ sympathy: 1, reputation: 1, health: 1, civicParticipation: 1 }),
        attributePreview: expect.objectContaining({
          preview: expect.objectContaining({
            sympathy: expect.objectContaining({ before: 0, after: 8 }),
          }),
        }),
      }),
      expect.objectContaining({
        optionId: 'ignore',
        label: 'La ignori',
        presentationHint: 'action',
        statEffects: expect.objectContaining({ stress: 1, happiness: -1 }),
      }),
      expect.objectContaining({
        optionId: 'steal_wallet',
        label: 'Le rubi il portafoglio',
        presentationHint: 'action',
        statEffects: expect.objectContaining({
          sympathy: -1,
          reputation: -1,
          stress: 1,
          happiness: -1,
          cashMinor: '10',
        }),
      }),
    ]);
  });
});

describe('TaskService.completeTask', () => {
  it('completes help option and applies personal values plus taskReward cash', async () => {
    const { tasks, citizens, economy } = createMocks();
    const past = new Date(Date.now() - 1_000).toISOString();
    vi.mocked(tasks.findById).mockResolvedValue({
      taskInstanceId: 'task-1',
      definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      citizenId: 'cit-1',
      targetNpcId: 'npc-1',
      context: {
        targetNpcId: 'npc-1',
        targetRuleRef: 'random_npc_elderly',
        pendingChoice: {
          optionId: SLICE_DEMO_TASK_OPTION_HELP,
          committedAt: past,
        },
        timing: {
          startedAt: past,
          actionCommittedAt: past,
          readyAt: past,
          durationMs: 0,
        },
      },
      status: 'active',
      selectedOptionId: null,
      completedAt: null,
      createdAt: new Date(),
      expiresAt: null,
    });

    vi.mocked(citizens.getPersonalValues).mockResolvedValue({ sympathy: 0, reputation: 0 });

    vi.mocked(citizens.applyPersonalValueEffects).mockResolvedValue({
      values: { sympathy: 1, reputation: 1, health: 1, civicParticipation: 1 },
      applied: { sympathy: 1, reputation: 1, health: 1, civicParticipation: 1 },
    });

    const service = new TaskService(tasks, citizens, economy);

    const result = await service.completeTask({
      citizenId: 'cit-1',
      taskInstanceId: 'task-1',
      optionId: SLICE_DEMO_TASK_OPTION_HELP,
    });

    expect(result.status).toBe('completed');
    expect(result.personalValues).toEqual(
      expect.objectContaining({ sympathy: 1, reputation: 1, health: 1, civicParticipation: 1 }),
    );
    expect(result.effectsApplied.personalValues).toEqual(
      expect.objectContaining({ sympathy: 1, reputation: 1, health: 1, civicParticipation: 1 }),
    );
    expect(result.effectsApplied.economic.cash).toEqual({
      deltaMinor: '0',
      currency: SLICE_GAME_CURRENCY_ID,
    });
    expect(result.economic.cash.amountMinor).toBe('100');
    expect(economy.applyCashDelta).not.toHaveBeenCalled();
    expect(citizens.applyPersonalValueEffects).toHaveBeenCalledWith(
      'cit-1',
      expect.objectContaining({
        deltas: expect.objectContaining({
          sympathy: 9,
          reputation: 1,
          health: 1,
          civicParticipation: 1,
          culture: 2,
          happiness: 4,
        }),
      }),
    );
  });

  it('completes ignore option without incrementing personal values or cash', async () => {
    const { tasks, citizens, economy } = createMocks();
    const past = new Date(Date.now() - 1_000).toISOString();
    vi.mocked(tasks.findById).mockResolvedValue({
      taskInstanceId: 'task-1',
      definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      citizenId: 'cit-1',
      targetNpcId: 'npc-1',
      context: {
        targetNpcId: 'npc-1',
        pendingChoice: {
          optionId: SLICE_DEMO_TASK_OPTION_IGNORE,
          committedAt: past,
        },
        timing: {
          startedAt: past,
          actionCommittedAt: past,
          readyAt: past,
          durationMs: 0,
        },
      },
      status: 'active',
      selectedOptionId: null,
      completedAt: null,
      createdAt: new Date(),
      expiresAt: null,
    });
    vi.mocked(tasks.completeTask).mockResolvedValue({
      taskInstanceId: 'task-1',
      definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      citizenId: 'cit-1',
      targetNpcId: 'npc-1',
      context: { targetNpcId: 'npc-1' },
      status: 'completed',
      selectedOptionId: SLICE_DEMO_TASK_OPTION_IGNORE,
      completedAt: new Date(),
      createdAt: new Date(),
      expiresAt: null,
    });

    vi.mocked(citizens.applyPersonalValueEffects).mockResolvedValue({
      values: { sympathy: 0, reputation: -2, stress: 4, happiness: -1 },
      applied: { reputation: -2, stress: 4, happiness: -1 },
    });

    const service = new TaskService(tasks, citizens, economy);
    const result = await service.completeTask({
      citizenId: 'cit-1',
      taskInstanceId: 'task-1',
      optionId: SLICE_DEMO_TASK_OPTION_IGNORE,
    });

    expect(result.personalValues).toEqual(
      expect.objectContaining({ sympathy: 0, reputation: -2, stress: 4, happiness: -1 }),
    );
    expect(result.effectsApplied.economic.cash.deltaMinor).toBe('0');
    expect(result.economic.cash.amountMinor).toBe('100');
    expect(economy.applyCashDelta).not.toHaveBeenCalled();
    expect(citizens.applyPersonalValueEffects).toHaveBeenCalledWith(
      'cit-1',
      expect.objectContaining({
        deltas: expect.objectContaining({ stress: 4, happiness: -1, reputation: -2 }),
      }),
    );
  });

  it('rejects unsupported options', async () => {
    const { tasks, citizens, economy } = createMocks();
    const service = new TaskService(tasks, citizens, economy);

    await expect(
      service.completeTask({
        citizenId: 'cit-1',
        taskInstanceId: 'task-1',
        optionId: 'unknown_option',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('commits choice before readyAt and does not apply effects', async () => {
    const { tasks, citizens, economy } = createMocks();
    vi.mocked(tasks.findById).mockResolvedValue({
      taskInstanceId: 'task-1',
      definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      citizenId: 'cit-1',
      targetNpcId: 'npc-1',
      context: {
        targetNpcId: 'npc-1',
        timing: {
          startedAt: new Date().toISOString(),
        },
      },
      status: 'active',
      selectedOptionId: null,
      completedAt: null,
      createdAt: new Date(),
      expiresAt: null,
    });

    const service = new TaskService(tasks, citizens, economy);
    const result = await service.completeTask({
      citizenId: 'cit-1',
      taskInstanceId: 'task-1',
      optionId: SLICE_DEMO_TASK_OPTION_HELP,
    });

    expect(result.taskWaiting).toBe(true);
    expect(result.effectsApplied.personalValues).toEqual({});
    expect(citizens.applyPersonalValueEffects).not.toHaveBeenCalled();
    expect(tasks.updateTaskInstance).toHaveBeenCalled();
  });

  it('rejects completing standard task before readyAt after choice', async () => {
    const { tasks, citizens, economy } = createMocks();
    const future = new Date(Date.now() + 60_000).toISOString();
    vi.mocked(tasks.findById).mockResolvedValue({
      taskInstanceId: 'task-1',
      definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      citizenId: 'cit-1',
      targetNpcId: 'npc-1',
      context: {
        targetNpcId: 'npc-1',
        pendingChoice: {
          optionId: SLICE_DEMO_TASK_OPTION_HELP,
          committedAt: new Date().toISOString(),
        },
        timing: {
          startedAt: new Date().toISOString(),
          actionCommittedAt: new Date().toISOString(),
          readyAt: future,
          durationMs: 60_000,
        },
      },
      status: 'active',
      selectedOptionId: null,
      completedAt: null,
      createdAt: new Date(),
      expiresAt: null,
    });

    const service = new TaskService(tasks, citizens, economy);
    await expect(
      service.completeTask({
        citizenId: 'cit-1',
        taskInstanceId: 'task-1',
        optionId: SLICE_DEMO_TASK_OPTION_HELP,
      }),
    ).rejects.toMatchObject({ code: 'TASK_NOT_READY' });
  });

  it('rejects already completed task', async () => {
    const { tasks, citizens, economy } = createMocks();
    vi.mocked(tasks.findById).mockResolvedValue({
      taskInstanceId: 'task-1',
      definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      citizenId: 'cit-1',
      targetNpcId: 'npc-1',
      context: { targetNpcId: 'npc-1' },
      status: 'completed',
      selectedOptionId: SLICE_DEMO_TASK_OPTION_HELP,
      completedAt: new Date(),
      createdAt: new Date(),
      expiresAt: null,
    });

    const service = new TaskService(tasks, citizens, economy);
    await expect(
      service.completeTask({
        citizenId: 'cit-1',
        taskInstanceId: 'task-1',
        optionId: SLICE_DEMO_TASK_OPTION_HELP,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
