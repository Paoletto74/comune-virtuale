import { describe, expect, it, vi } from 'vitest';
import { HomeService } from './home-service.js';
import type { CitizenRepository, TaskRepository } from '../../domain/ports/repositories.js';
import type { TaskService } from '../task/task-service.js';
import type { EconomyService } from '../economy/economy-service.js';
import { SLICE_GAME_CURRENCY_ID } from '../../slice/economy-constants.js';

describe('HomeService', () => {
  it('includes balance in home summary', async () => {
    const citizens: CitizenRepository = {
      findById: vi.fn().mockResolvedValue({
        citizenId: 'cit-1',
        accountId: 'acc-1',
        displayName: 'Paolo',
        gender: 'male',
        age: 30,
        onboardingCompletedAt: new Date(),
        createdAt: new Date(),
      }),
      findByAccountId: vi.fn(),
      createWithOnboarding: vi.fn(),
      getProgression: vi.fn().mockResolvedValue({
        citizenId: 'cit-1',
        mainLevelId: 'main_L01',
        mainLevel: 1,
        progressionPoints: 0,
      }),
      applyProgressionGrant: vi.fn(),
      getPersonalValues: vi.fn().mockResolvedValue({ sympathy: 0, reputation: 0 }),
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

    const tasks = {} as TaskRepository;
    const taskService = {
      getActiveTasks: vi.fn().mockResolvedValue([]),
    } as unknown as TaskService;

    const economy = {
      getBalance: vi.fn().mockResolvedValue({
        availableCash: { amountMinor: '100', currency: SLICE_GAME_CURRENCY_ID },
        asOf: '2026-01-01T00:00:00.000Z',
      }),
    } as unknown as EconomyService;

    const service = new HomeService(citizens, tasks, taskService, economy);
    const summary = await service.getHomeSummary('cit-1', {
      worldTimeMs: 0,
      timeScale: 1,
      realTimestampMs: Date.now(),
      isPaused: false,
      schemaVersion: 1,
    });

    expect(summary.balance.availableCash).toEqual({
      amountMinor: '100',
      currency: SLICE_GAME_CURRENCY_ID,
    });
    expect(summary.knownNpcs).toEqual([]);
    expect(summary.gameDate.label).toMatch(/^Giorno 1,/);
    expect(summary.lifeReview).toBeNull();
    expect(summary.recentLifeEvents).toEqual([]);
    expect(summary.levelUpNotice).toBeNull();
    expect(summary.globalProgression).toEqual({
      level: 1,
      levelId: 'main_L01',
      globalXp: 0,
    });
    expect(summary.career.currentCareerId).toBeNull();
    expect(summary.worldEvents.enabled).toBe(false);
    expect(summary.flash.enabled).toBe(false);
  });
});
