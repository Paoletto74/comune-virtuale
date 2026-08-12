import { describe, expect, it, vi } from 'vitest';
import { CitizenService } from './citizen-service.js';
import type { CitizenRepository, SessionRepository } from '../../domain/ports/repositories.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';
import type { TaskSelectionService } from '../task/task-selection-service.js';
import { SLICE_DEMO_TASK_DEFINITION_ID } from '../../slice/constants.js';
import { POOL_START } from '../../slice/task-pool-constants.js';

function createMocks() {
  const citizens: CitizenRepository = {
    findByAccountId: vi.fn().mockResolvedValue(null),
    findById: vi.fn(),
    createWithOnboarding: vi.fn().mockResolvedValue({
      citizenId: 'cit-1',
      accountId: 'acc-1',
      displayName: 'Paolo',
      gender: 'male',
      age: 30,
      portraitId: null,
      onboardingCompletedAt: new Date(),
      createdAt: new Date(),
    }),
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

  const sessions: SessionRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    revoke: vi.fn(),
    updateCitizenId: vi.fn().mockResolvedValue(undefined),
  };

  const taskSelection = {
    fillFeed: vi.fn().mockResolvedValue([
      {
        taskInstanceId: 'task-elderly',
        definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
        poolId: POOL_START,
        selectionAudit: {
          poolId: POOL_START,
          selectionVersion: 1,
          sourceSeed: 'onboarding:cit-1',
          selectionSeed: 'seed',
          candidateDefinitionIds: [SLICE_DEMO_TASK_DEFINITION_ID],
          chosenDefinitionId: SLICE_DEMO_TASK_DEFINITION_ID,
          idempotencyKey: 'task-selection:onboarding:cit-1:POOL_START:fill0',
        },
        created: true,
      },
    ]),
  } as unknown as TaskSelectionService;

  return { citizens, sessions, taskSelection };
}

describe('CitizenService', () => {
  it('creates citizen and selects demo task from POOL_START', async () => {
    const { citizens, sessions, taskSelection } = createMocks();
    const service = new CitizenService(citizens, sessions, taskSelection);

    const result = await service.createCitizen({
      accountId: 'acc-1',
      sessionId: 'sess-1',
      displayName: 'Paolo',
      gender: 'male',
      age: 30,
    });

    expect(result.citizenId).toBe('cit-1');
    expect(result.demoTaskInstanceId).toBe('task-elderly');
    expect(citizens.createWithOnboarding).toHaveBeenCalledOnce();
    expect(taskSelection.fillFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: 'onboarding',
        correlationId: undefined,
      }),
    );
    expect(sessions.updateCitizenId).toHaveBeenCalledWith('sess-1', 'cit-1');
  });

  it('rejects duplicate citizen for account', async () => {
    const { citizens, sessions, taskSelection } = createMocks();
    vi.mocked(citizens.findByAccountId).mockResolvedValue({
      citizenId: 'existing',
      accountId: 'acc-1',
      displayName: 'X',
      gender: 'male',
      age: 20,
      portraitId: null,
      onboardingCompletedAt: new Date(),
      createdAt: new Date(),
    });

    const service = new CitizenService(citizens, sessions, taskSelection);
    await expect(
      service.createCitizen({
        accountId: 'acc-1',
        sessionId: 'sess-1',
        displayName: 'Paolo',
        gender: 'male',
        age: 30,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('validates display name length', () => {
    const { citizens, sessions, taskSelection } = createMocks();
    const service = new CitizenService(citizens, sessions, taskSelection);
    expect(() =>
      service.validateIdentity({ displayName: 'A', gender: 'male', age: 25 }),
    ).toThrow(AppError);
  });
});
