import { describe, expect, it, vi } from 'vitest';
import { CitizenProfileService } from './citizen-profile-service.js';
import type { CitizenRepository } from '../../domain/ports/repositories.js';
import {
  FAMILY_CODES,
  HOUSING_CODES,
  OCCUPATION_CODES,
  OCCUPATION_LABELS,
  PROFILE_VALUE_KEYS,
  assignProfileCodes,
  buildInitialProfileValues,
} from '../../slice/citizen-profile-constants.js';

function createCitizen(overrides?: Partial<{ citizenId: string; age: number }>) {
  return {
    citizenId: overrides?.citizenId ?? 'citizen-test-1',
    accountId: 'acc-1',
    displayName: 'Paolo',
    gender: 'male',
    age: overrides?.age ?? 30,
    portraitId: null,
    onboardingCompletedAt: new Date(),
    createdAt: new Date(),
  };
}

function createRepository(
  initialValues: Record<string, number> = {},
): CitizenRepository & { store: Record<string, number> } {
  const store: Record<string, number> = { sympathy: 0, reputation: 0, ...initialValues };

  return {
    store,
    findByAccountId: vi.fn(),
    findById: vi.fn(),
    createWithOnboarding: vi.fn(),
    getProgression: vi.fn().mockResolvedValue({
      citizenId: 'citizen-test-1',
      mainLevelId: 'main_L01',
      mainLevel: 1,
      progressionPoints: 0,
    }),
    applyProgressionGrant: vi.fn(),
    getPersonalValues: vi.fn().mockImplementation(async () => ({ ...store })),
    incrementPersonalValues: vi.fn().mockImplementation(async (_citizenId, deltas: Record<string, number>) => {
      for (const [key, delta] of Object.entries(deltas)) {
        store[key] = (store[key] ?? 0) + delta;
      }
      return { ...store };
    }),
    applyPersonalValueEffects: vi.fn().mockImplementation(async (_citizenId: string, input: {
      costs?: Record<string, number>;
      deltas?: Record<string, number>;
    }) => {
      for (const [key, cost] of Object.entries(input.costs ?? {})) {
        store[key] = (store[key] ?? 0) - cost;
      }
      for (const [key, delta] of Object.entries(input.deltas ?? {})) {
        store[key] = (store[key] ?? 0) + delta;
      }
      return { values: { ...store }, applied: input.deltas ?? {} };
    }),
    setPersonalValues: vi.fn().mockImplementation(async (_citizenId, values) => {
      Object.assign(store, values);
      return { ...store };
    }),
    getLastTaskDayPhase: vi.fn().mockResolvedValue(null),
    setLastTaskDayPhase: vi.fn(),
    updatePortraitId: vi.fn(),
    deleteByCitizenId: vi.fn(),
    updateDisplayName: vi.fn(),
    updateMainLevel: vi.fn(),
    listAll: vi.fn(),
  };
}

describe('citizen profile constants', () => {
  it('assigns coherent profile codes from age and citizen id', () => {
    const young = assignProfileCodes('young-citizen', 22);
    expect([OCCUPATION_CODES.studente, OCCUPATION_CODES.freelance]).toContain(young.occupation);

    const senior = assignProfileCodes('senior-citizen', 70);
    expect(senior.occupation).toBe(OCCUPATION_CODES.pensionato);
  });

  it('builds initial profile values with zero counters and locks', () => {
    const values = buildInitialProfileValues('citizen-a', 35);
    expect(values[PROFILE_VALUE_KEYS.occupation]).toBeGreaterThan(0);
    expect(values[PROFILE_VALUE_KEYS.housing]).toBeGreaterThan(0);
    expect(values[PROFILE_VALUE_KEYS.family]).toBeGreaterThan(0);
    expect(values[PROFILE_VALUE_KEYS.tasksCompleted]).toBe(0);
    expect(values[PROFILE_VALUE_KEYS.unlockWork]).toBe(0);
  });
});

describe('CitizenProfileService', () => {
  it('seeds profile for legacy citizens missing profile keys', async () => {
    const citizens = createRepository();
    const service = new CitizenProfileService(citizens);
    const citizen = createCitizen();

    const values = await service.ensureProfileSeeded(citizen);

    expect(values[PROFILE_VALUE_KEYS.occupation]).toBeGreaterThan(0);
    expect(citizens.setPersonalValues).toHaveBeenCalledOnce();
  });

  it('shows only core dimensions unlocked at start', () => {
    const citizens = createRepository(buildInitialProfileValues('citizen-a', 30));
    const service = new CitizenProfileService(citizens);
    const citizen = createCitizen();

    const view = service.resolveProfileView({
      citizen,
      progression: { citizenId: citizen.citizenId, mainLevelId: 'main_L01', mainLevel: 1, progressionPoints: 0 },
      personalValues: citizens.store,
    });

    expect(view.unlocked.work).toBeUndefined();
    expect(view.unlocked.living).toBeUndefined();
    expect(view.unlocked.personal).toBeUndefined();
    expect(view.locked).toHaveLength(3);
    expect(view.locked.every((entry) => entry.hint.length > 0)).toBe(true);
  });

  it('does not expose real occupation while work is locked', () => {
    const profileValues = buildInitialProfileValues('citizen-a', 30);
    profileValues[PROFILE_VALUE_KEYS.occupation] = OCCUPATION_CODES.commerciante;
    const citizens = createRepository(profileValues);
    const service = new CitizenProfileService(citizens);

    const view = service.resolveProfileView({
      citizen: createCitizen(),
      progression: { citizenId: 'citizen-test-1', mainLevelId: 'main_L01', mainLevel: 1, progressionPoints: 0 },
      personalValues: citizens.store,
    });

    expect(JSON.stringify(view)).not.toContain(OCCUPATION_LABELS[OCCUPATION_CODES.commerciante]!);
  });

  it('unlocks work after a work-related task completion', async () => {
    const citizens = createRepository(buildInitialProfileValues('citizen-a', 30));
    const service = new CitizenProfileService(citizens);

    const unlocks = await service.recordTaskCompleted(
      'citizen-test-1',
      'DEMO_V2_WORK_CLIENT_ANGER',
    );

    expect(unlocks).toEqual([{ dimensionId: 'work', label: 'Lavoro' }]);
    expect(citizens.store[PROFILE_VALUE_KEYS.unlockWork]).toBe(1);
    expect(citizens.store[PROFILE_VALUE_KEYS.workTasksCompleted]).toBe(1);

    const view = service.resolveProfileView({
      citizen: createCitizen(),
      progression: { citizenId: 'citizen-test-1', mainLevelId: 'main_L01', mainLevel: 1, progressionPoints: 0 },
      personalValues: citizens.store,
    });
    expect(view.unlocked.work?.value).toBeTruthy();
  });

  it('unlocks living after three completed tasks', async () => {
    const citizens = createRepository(buildInitialProfileValues('citizen-a', 30));
    const service = new CitizenProfileService(citizens);

    await service.recordTaskCompleted('citizen-test-1', 'DEMO_ELDERLY_CROSSING');
    await service.recordTaskCompleted('citizen-test-1', 'DEMO_ELDERLY_CROSSING');
    const unlocks = await service.recordTaskCompleted('citizen-test-1', 'DEMO_ELDERLY_CROSSING');

    expect(unlocks.some((event) => event.dimensionId === 'living')).toBe(true);
    expect(citizens.store[PROFILE_VALUE_KEYS.unlockLiving]).toBe(1);
  });

  it('unlocks personal when sympathy and reputation thresholds are met', async () => {
    const profileValues = buildInitialProfileValues('citizen-a', 30);
    profileValues.sympathy = 5;
    profileValues.reputation = 5;
    const citizens = createRepository(profileValues);
    const service = new CitizenProfileService(citizens);

    const events = await service.recordTaskCompleted('citizen-test-1', 'DEMO_ELDERLY_CROSSING');

    expect(events.some((event) => event.dimensionId === 'personal')).toBe(true);
    expect(citizens.store[PROFILE_VALUE_KEYS.unlockPersonal]).toBe(1);
  });

  it('exposes profile context for future task personalization', () => {
    const profileValues = buildInitialProfileValues('citizen-a', 30);
    profileValues[PROFILE_VALUE_KEYS.unlockWork] = 1;
    profileValues[PROFILE_VALUE_KEYS.occupation] = OCCUPATION_CODES.tecnico;
    profileValues[PROFILE_VALUE_KEYS.housing] = HOUSING_CODES.affitto;
    profileValues[PROFILE_VALUE_KEYS.family] = FAMILY_CODES.coppia;

    const citizens = createRepository(profileValues);
    const service = new CitizenProfileService(citizens);

    const context = service.buildProfileContext({
      citizen: createCitizen(),
      progression: { citizenId: 'citizen-test-1', mainLevelId: 'main_L01', mainLevel: 2, progressionPoints: 100 },
      personalValues: citizens.store,
    });

    expect(context.occupationCode).toBe(OCCUPATION_CODES.tecnico);
    expect(context.unlockedDimensions).toContain('work');
    expect(context.level).toBe(2);
  });
});
