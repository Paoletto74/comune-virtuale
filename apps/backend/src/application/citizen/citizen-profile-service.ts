import type { CitizenProgressionRecord, CitizenRecord, CitizenRepository } from '../../domain/ports/repositories.js';
import {
  FAMILY_LABELS,
  HOUSING_LABELS,
  OCCUPATION_LABELS,
  PROFILE_DIMENSIONS,
  PROFILE_VALUE_KEYS,
  buildInitialProfileValues,
  isWorkTaskDefinitionId,
  resolveAgeBand,
  resolveLevelLabel,
  type ProfileDimensionId,
} from '../../slice/citizen-profile-constants.js';
import {
  resolveNextLevelThreshold,
  resolveProgressToNextLevel,
} from '../../slice/citizen-progression-constants.js';

export interface ProfileDimensionView {
  label: string;
  value: string;
}

export interface LockedProfileDimensionView {
  id: ProfileDimensionId;
  label: string;
  hint: string;
}

export interface CitizenProfileViewDto {
  levelLabel: string;
  ageBand: string;
  progression: {
    levelId: string;
    level: number;
    label: string;
    globalXp: number;
    nextLevel?: number;
    progressToNextLevel?: number;
  };
  unlocked: {
    work?: ProfileDimensionView;
    living?: ProfileDimensionView;
    personal?: ProfileDimensionView;
  };
  locked: LockedProfileDimensionView[];
}

/** Context exposed for future task personalization (Prompt 4). */
export interface CitizenProfileContext {
  citizenId: string;
  age: number;
  occupationCode: number;
  occupationLabel: string;
  housingCode: number;
  familyCode: number;
  level: number;
  sympathy: number;
  reputation: number;
  unlockedDimensions: ProfileDimensionId[];
  tasksCompleted: number;
  workTasksCompleted: number;
}

export interface ProfileUnlockEvent {
  dimensionId: ProfileDimensionId;
  label: string;
}

interface UnlockEvaluationInput {
  values: Record<string, number>;
  level: number;
}

function isDimensionUnlocked(
  dimensionId: ProfileDimensionId,
  input: UnlockEvaluationInput,
): boolean {
  const { values, level } = input;
  const tasksCompleted = values[PROFILE_VALUE_KEYS.tasksCompleted] ?? 0;
  const workTasks = values[PROFILE_VALUE_KEYS.workTasksCompleted] ?? 0;
  const sympathy = values.sympathy ?? 0;
  const reputation = values.reputation ?? 0;

  switch (dimensionId) {
    case 'work':
      return (
        (values[PROFILE_VALUE_KEYS.unlockWork] ?? 0) > 0 ||
        workTasks >= 1 ||
        level >= 2
      );
    case 'living':
      return (
        (values[PROFILE_VALUE_KEYS.unlockLiving] ?? 0) > 0 ||
        tasksCompleted >= 3 ||
        level >= 3
      );
    case 'personal':
      return (
        (values[PROFILE_VALUE_KEYS.unlockPersonal] ?? 0) > 0 ||
        (sympathy >= 5 && reputation >= 5) ||
        level >= 4
      );
    default:
      return false;
  }
}

function unlockFlagKey(dimensionId: ProfileDimensionId): string {
  switch (dimensionId) {
    case 'work':
      return PROFILE_VALUE_KEYS.unlockWork;
    case 'living':
      return PROFILE_VALUE_KEYS.unlockLiving;
    case 'personal':
      return PROFILE_VALUE_KEYS.unlockPersonal;
  }
}

export class CitizenProfileService {
  constructor(private readonly citizens: CitizenRepository) {}

  buildInitialProfileValues(citizenId: string, age: number): Record<string, number> {
    return buildInitialProfileValues(citizenId, age);
  }

  async ensureProfileSeeded(citizen: CitizenRecord): Promise<Record<string, number>> {
    const values = await this.citizens.getPersonalValues(citizen.citizenId);
    if (values[PROFILE_VALUE_KEYS.occupation] !== undefined) {
      return values;
    }

    const seeded = buildInitialProfileValues(citizen.citizenId, citizen.age);
    await this.citizens.setPersonalValues(citizen.citizenId, seeded);
    return { ...values, ...seeded };
  }

  resolveProfileView(input: {
    citizen: CitizenRecord;
    progression: CitizenProgressionRecord | null;
    personalValues: Record<string, number>;
  }): CitizenProfileViewDto {
    const level = input.progression?.mainLevel ?? 1;
    const levelId = input.progression?.mainLevelId ?? 'main_L01';
    const levelLabel = resolveLevelLabel(level);
    const progressionPoints = input.progression?.progressionPoints ?? 0;
    const nextLevel = resolveNextLevelThreshold(level);
    const progressToNextLevel = resolveProgressToNextLevel(progressionPoints, level);
    const evaluation: UnlockEvaluationInput = { values: input.personalValues, level };

    const occupationCode = input.personalValues[PROFILE_VALUE_KEYS.occupation] ?? 0;
    const housingCode = input.personalValues[PROFILE_VALUE_KEYS.housing] ?? 0;
    const familyCode = input.personalValues[PROFILE_VALUE_KEYS.family] ?? 0;

    const unlocked: CitizenProfileViewDto['unlocked'] = {};
    const locked: LockedProfileDimensionView[] = [];

    if (isDimensionUnlocked('work', evaluation)) {
      unlocked.work = {
        label: PROFILE_DIMENSIONS.work.label,
        value: OCCUPATION_LABELS[occupationCode] ?? '—',
      };
    } else {
      locked.push({
        id: 'work',
        label: PROFILE_DIMENSIONS.work.label,
        hint: PROFILE_DIMENSIONS.work.lockedHint,
      });
    }

    if (isDimensionUnlocked('living', evaluation)) {
      unlocked.living = {
        label: PROFILE_DIMENSIONS.living.label,
        value: HOUSING_LABELS[housingCode] ?? '—',
      };
    } else {
      locked.push({
        id: 'living',
        label: PROFILE_DIMENSIONS.living.label,
        hint: PROFILE_DIMENSIONS.living.lockedHint,
      });
    }

    if (isDimensionUnlocked('personal', evaluation)) {
      unlocked.personal = {
        label: PROFILE_DIMENSIONS.personal.label,
        value: FAMILY_LABELS[familyCode] ?? '—',
      };
    } else {
      locked.push({
        id: 'personal',
        label: PROFILE_DIMENSIONS.personal.label,
        hint: PROFILE_DIMENSIONS.personal.lockedHint,
      });
    }

    return {
      levelLabel,
      ageBand: resolveAgeBand(input.citizen.age),
      progression: {
        levelId,
        level,
        label: levelLabel,
        globalXp: progressionPoints,
        ...(nextLevel !== null
          ? { nextLevel, progressToNextLevel: progressToNextLevel ?? 0 }
          : {}),
      },
      unlocked,
      locked,
    };
  }

  buildProfileContext(input: {
    citizen: CitizenRecord;
    progression: CitizenProgressionRecord | null;
    personalValues: Record<string, number>;
  }): CitizenProfileContext {
    const level = input.progression?.mainLevel ?? 1;
    const evaluation: UnlockEvaluationInput = { values: input.personalValues, level };
    const unlockedDimensions = (['work', 'living', 'personal'] as const).filter((id) =>
      isDimensionUnlocked(id, evaluation),
    );

    const occupationCode = input.personalValues[PROFILE_VALUE_KEYS.occupation] ?? 0;

    return {
      citizenId: input.citizen.citizenId,
      age: input.citizen.age,
      occupationCode,
      occupationLabel: OCCUPATION_LABELS[occupationCode] ?? '—',
      housingCode: input.personalValues[PROFILE_VALUE_KEYS.housing] ?? 0,
      familyCode: input.personalValues[PROFILE_VALUE_KEYS.family] ?? 0,
      level,
      sympathy: input.personalValues.sympathy ?? 0,
      reputation: input.personalValues.reputation ?? 0,
      unlockedDimensions,
      tasksCompleted: input.personalValues[PROFILE_VALUE_KEYS.tasksCompleted] ?? 0,
      workTasksCompleted: input.personalValues[PROFILE_VALUE_KEYS.workTasksCompleted] ?? 0,
    };
  }

  async recordTaskCompleted(
    citizenId: string,
    definitionId: string,
  ): Promise<ProfileUnlockEvent[]> {
    const deltas: Record<string, number> = {
      [PROFILE_VALUE_KEYS.tasksCompleted]: 1,
    };
    if (isWorkTaskDefinitionId(definitionId)) {
      deltas[PROFILE_VALUE_KEYS.workTasksCompleted] = 1;
    }

    const values = await this.citizens.incrementPersonalValues(citizenId, deltas);
    const progression = await this.citizens.getProgression(citizenId);
    return this.persistNewUnlocks(citizenId, values, progression?.mainLevel ?? 1);
  }

  private async persistNewUnlocks(
    citizenId: string,
    values: Record<string, number>,
    level: number,
  ): Promise<ProfileUnlockEvent[]> {
    const evaluation: UnlockEvaluationInput = { values, level };
    const toPersist: Record<string, number> = {};
    const events: ProfileUnlockEvent[] = [];

    for (const dimensionId of ['work', 'living', 'personal'] as const) {
      const flagKey = unlockFlagKey(dimensionId);
      const alreadyPersisted = (values[flagKey] ?? 0) > 0;
      if (alreadyPersisted) continue;

      if (isDimensionUnlocked(dimensionId, evaluation)) {
        toPersist[flagKey] = 1;
        events.push({
          dimensionId,
          label: PROFILE_DIMENSIONS[dimensionId].label,
        });
      }
    }

    if (Object.keys(toPersist).length > 0) {
      await this.citizens.setPersonalValues(citizenId, toPersist);
    }

    return events;
  }

  async getProfileContextForSelection(citizenId: string): Promise<CitizenProfileContext | null> {
    const citizen = await this.citizens.findById(citizenId);
    if (!citizen) {
      return null;
    }

    const progression = await this.citizens.getProgression(citizenId);
    const personalValues = await this.ensureProfileSeeded(citizen);

    return this.buildProfileContext({
      citizen,
      progression,
      personalValues,
    });
  }
}
