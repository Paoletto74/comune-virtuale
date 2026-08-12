import { describe, expect, it, vi } from 'vitest';
import { deriveGameDate, resolveDayNightPhase } from '@comune-virtuale/shared';
import { TaskFeedPhaseRefreshService } from './task-feed-phase-refresh-service.js';
import type { CitizenRepository, TaskRepository } from '../../domain/ports/repositories.js';
import type { WorldClockService } from '../../domain/time/world-clock-service.js';
import type { TaskSelectionService } from './task-selection-service.js';

function gameTimeMsForHour(hour: number): number {
  return hour * 3600 * 1000;
}

describe('TaskFeedPhaseRefreshService', () => {
  it('does nothing when phase is unchanged', async () => {
    const afternoonMs = gameTimeMsForHour(14);
    const tasks: TaskRepository = {
      findActiveByCitizenId: vi.fn(),
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
    const citizens: CitizenRepository = {
      findByAccountId: vi.fn(),
      findById: vi.fn(),
      createWithOnboarding: vi.fn(),
      getProgression: vi.fn(),
      applyProgressionGrant: vi.fn(),
      getPersonalValues: vi.fn(),
      incrementPersonalValues: vi.fn(),
      applyPersonalValueEffects: vi.fn().mockResolvedValue({ values: {}, applied: {} }),
      setPersonalValues: vi.fn(),
      getLastTaskDayPhase: vi.fn().mockResolvedValue('afternoon'),
      setLastTaskDayPhase: vi.fn(),
      updatePortraitId: vi.fn(),
      deleteByCitizenId: vi.fn(),
      updateDisplayName: vi.fn(),
      updateMainLevel: vi.fn(),
      listAll: vi.fn(),
    };
    const taskSelection = {
      fillFeed: vi.fn(),
    } as unknown as TaskSelectionService;
    const worldClock = {
      now: vi.fn().mockResolvedValue({ worldTimeMs: afternoonMs }),
    } as unknown as WorldClockService;

    const service = new TaskFeedPhaseRefreshService(tasks, citizens, taskSelection, worldClock);
    const refreshed = await service.refreshIfPhaseChanged('cit-1');

    expect(refreshed).toBe(false);
    expect(tasks.cancelPendingTasks).not.toHaveBeenCalled();
    expect(taskSelection.fillFeed).not.toHaveBeenCalled();
  });

  it('seeds last phase on first observation without refresh', async () => {
    const afternoonMs = gameTimeMsForHour(14);
    const citizens: CitizenRepository = {
      findByAccountId: vi.fn(),
      findById: vi.fn(),
      createWithOnboarding: vi.fn(),
      getProgression: vi.fn(),
      applyProgressionGrant: vi.fn(),
      getPersonalValues: vi.fn(),
      incrementPersonalValues: vi.fn(),
      applyPersonalValueEffects: vi.fn().mockResolvedValue({ values: {}, applied: {} }),
      setPersonalValues: vi.fn(),
      getLastTaskDayPhase: vi.fn().mockResolvedValue(null),
      setLastTaskDayPhase: vi.fn(),
      updatePortraitId: vi.fn(),
      deleteByCitizenId: vi.fn(),
      updateDisplayName: vi.fn(),
      updateMainLevel: vi.fn(),
      listAll: vi.fn(),
    };
    const taskSelection = { fillFeed: vi.fn() } as unknown as TaskSelectionService;
    const worldClock = {
      now: vi.fn().mockResolvedValue({ worldTimeMs: afternoonMs }),
    } as unknown as WorldClockService;
    const tasks = {
      findActiveByCitizenId: vi.fn(),
      findAllByCitizenId: vi.fn(),
      findById: vi.fn(),
      findByCitizenAndDefinitionId: vi.fn(),
      findBySelectionIdempotencyKey: vi.fn(),
      createTaskInstance: vi.fn(),
      createTaskInstanceIdempotent: vi.fn(),
      completeTask: vi.fn(),
      updateTaskInstance: vi.fn(),
      cancelPendingTasks: vi.fn(),
    } as TaskRepository;

    const service = new TaskFeedPhaseRefreshService(tasks, citizens, taskSelection, worldClock);
    const refreshed = await service.refreshIfPhaseChanged('cit-1');

    expect(refreshed).toBe(false);
    expect(citizens.setLastTaskDayPhase).toHaveBeenCalledWith('cit-1', 'afternoon');
    expect(taskSelection.fillFeed).not.toHaveBeenCalled();
  });

  it('cancels incompatible pending tasks and fills feed on phase transition', async () => {
    const sunsetMs = gameTimeMsForHour(18);
    const tasks: TaskRepository = {
      findActiveByCitizenId: vi.fn().mockResolvedValue([
        {
          taskInstanceId: 'active-1',
          definitionId: 'DEMO_V2_WORK_CLIENT_ANGER',
          citizenId: 'cit-1',
          status: 'active',
          context: { timing: { startedAt: new Date().toISOString() } },
          targetNpcId: null,
          selectedOptionId: null,
          completedAt: null,
          createdAt: new Date(),
          expiresAt: null,
        },
        {
          taskInstanceId: 'pending-day',
          definitionId: 'DEMO_V2_WORK_BOSS_CRITICISM',
          citizenId: 'cit-1',
          status: 'pending',
          context: {},
          targetNpcId: null,
          selectedOptionId: null,
          completedAt: null,
          createdAt: new Date(),
          expiresAt: null,
        },
        {
          taskInstanceId: 'pending-all-day',
          definitionId: 'DEMO_V3_FAMILY_SIBLING_CALL',
          citizenId: 'cit-1',
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
      cancelPendingTasks: vi.fn().mockResolvedValue(1),
    };
    const citizens: CitizenRepository = {
      findByAccountId: vi.fn(),
      findById: vi.fn(),
      createWithOnboarding: vi.fn(),
      getProgression: vi.fn(),
      applyProgressionGrant: vi.fn(),
      getPersonalValues: vi.fn(),
      incrementPersonalValues: vi.fn(),
      applyPersonalValueEffects: vi.fn().mockResolvedValue({ values: {}, applied: {} }),
      setPersonalValues: vi.fn(),
      getLastTaskDayPhase: vi.fn().mockResolvedValue('afternoon'),
      setLastTaskDayPhase: vi.fn(),
      updatePortraitId: vi.fn(),
      deleteByCitizenId: vi.fn(),
      updateDisplayName: vi.fn(),
      updateMainLevel: vi.fn(),
      listAll: vi.fn(),
    };
    const taskSelection = {
      fillFeed: vi.fn().mockResolvedValue([]),
    } as unknown as TaskSelectionService;
    const worldClock = {
      now: vi.fn().mockResolvedValue({ worldTimeMs: sunsetMs }),
    } as unknown as WorldClockService;

    const service = new TaskFeedPhaseRefreshService(tasks, citizens, taskSelection, worldClock);
    const refreshed = await service.refreshIfPhaseChanged('cit-1', 'corr-1');

    expect(refreshed).toBe(true);
    expect(resolveDayNightPhase(deriveGameDate(sunsetMs))).toBe('sunset');
    expect(tasks.cancelPendingTasks).toHaveBeenCalledWith('cit-1', ['pending-day']);
    expect(taskSelection.fillFeed).toHaveBeenCalledWith({
      trigger: 'phase_changed',
      citizenId: 'cit-1',
      dayPhase: 'sunset',
      previousDayPhase: 'afternoon',
      correlationId: 'corr-1',
    });
    expect(citizens.setLastTaskDayPhase).toHaveBeenCalledWith('cit-1', 'sunset');
  });
});
