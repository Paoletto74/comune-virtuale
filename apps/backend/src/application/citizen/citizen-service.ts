import { randomUUID } from 'node:crypto';
import type { CitizenRepository, SessionRepository } from '../../domain/ports/repositories.js';
import {
  SLICE_DEFAULT_LEVEL,
  SLICE_DEFAULT_LEVEL_ID,
  SLICE_INITIAL_PERSONAL_VALUES,
} from '../../slice/constants.js';
import {
  validatePersonalityAllocation,
  type PersonalityAllocation,
} from '../../slice/personality-constants.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';
import { isValidCitizenPortraitId } from '../../slice/citizen-portrait-constants.js';
import { PENDING_CITIZEN_ID } from '../../slice/constants.js';
import type { TaskSelectionService } from '../task/task-selection-service.js';
import type { CitizenProfileService } from './citizen-profile-service.js';
import type { CitizenLifeEvolutionService } from '../life/citizen-life-evolution-service.js';
import type { WorldClockService } from '../../domain/time/world-clock-service.js';
import type { CitizenCareerService } from './citizen-career-service.js';

export interface CreateCitizenInput {
  accountId: string;
  sessionId: string;
  displayName: string;
  gender: string;
  age: number;
  portraitId?: string;
  personality?: PersonalityAllocation;
  correlationId?: string;
}

export interface CreateCitizenResult {
  citizenId: string;
  displayName: string;
  gender: string;
  age: number;
  demoTaskInstanceId: string;
}

const GENDER_VALUES = ['male', 'female', 'other', 'prefer_not_to_say'] as const;

export class CitizenService {
  constructor(
    private readonly citizens: CitizenRepository,
    private readonly sessions: SessionRepository,
    private readonly taskSelection: TaskSelectionService,
    private readonly profile?: CitizenProfileService,
    private readonly lifeEvolution?: CitizenLifeEvolutionService,
    private readonly worldClock?: WorldClockService,
    private readonly career?: CitizenCareerService,
  ) {}

  validateIdentity(input: {
    displayName: string;
    gender: string;
    age: number;
    portraitId?: string;
    personality?: PersonalityAllocation;
  }): void {
    const name = input.displayName.trim();
    if (name.length < 2 || name.length > 64) {
      throw new AppError('VALIDATION', 'INVALID_DISPLAY_NAME', 'error.validation.display_name');
    }
    if (!GENDER_VALUES.includes(input.gender as (typeof GENDER_VALUES)[number])) {
      throw new AppError('VALIDATION', 'INVALID_GENDER', 'error.validation.gender');
    }
    if (!Number.isInteger(input.age) || input.age < 18 || input.age > 120) {
      throw new AppError('VALIDATION', 'INVALID_AGE', 'error.validation.age');
    }
    if (input.portraitId && !isValidCitizenPortraitId(input.portraitId)) {
      throw new AppError('VALIDATION', 'INVALID_PORTRAIT_ID', 'error.validation.portrait_id');
    }
    if (input.personality) {
      try {
        validatePersonalityAllocation(input.personality);
      } catch {
        throw new AppError('VALIDATION', 'INVALID_PERSONALITY', 'error.validation.personality');
      }
    }
  }

  async createCitizen(input: CreateCitizenInput): Promise<CreateCitizenResult> {
    this.validateIdentity(input);

    const existing = await this.citizens.findByAccountId(input.accountId);
    if (existing) {
      throw new AppError('CONFLICT', 'CITIZEN_ALREADY_EXISTS', 'error.citizen.already_exists', {
        details: { citizenId: existing.citizenId },
      });
    }

    const citizenId = randomUUID();

    const profileValues = this.profile?.buildInitialProfileValues(citizenId, input.age) ?? {};

    const personalValues = input.personality
      ? {
          ...SLICE_INITIAL_PERSONAL_VALUES,
          ...profileValues,
          sympathy: input.personality.sympathy,
          reputation: input.personality.reputation,
          happiness: input.personality.happiness,
        }
      : { ...SLICE_INITIAL_PERSONAL_VALUES, ...profileValues };

    const citizen = await this.citizens.createWithOnboarding({
      citizenId,
      accountId: input.accountId,
      displayName: input.displayName.trim(),
      gender: input.gender,
      age: input.age,
      portraitId: input.portraitId ?? null,
      mainLevelId: SLICE_DEFAULT_LEVEL_ID,
      mainLevel: SLICE_DEFAULT_LEVEL,
      personalValues,
    });

    const selections = await this.taskSelection.fillFeed({
      trigger: 'onboarding',
      citizenId,
      correlationId: input.correlationId,
    });

    if (selections.length === 0) {
      throw new AppError(
        'TECHNICAL',
        'ONBOARDING_TASK_SELECTION_FAILED',
        'error.task.onboarding_selection_failed',
      );
    }

    await this.sessions.updateCitizenId(input.sessionId, citizen.citizenId);

    if (this.career) {
      await this.career.ensureSeeded(citizen.citizenId);
    }

    if (this.lifeEvolution && this.worldClock) {
      const gameTime = await this.worldClock.now();
      await this.lifeEvolution.recordCitizenCreated({
        citizenId: citizen.citizenId,
        worldTimeMs: gameTime.worldTimeMs,
        displayName: citizen.displayName,
      });
    }

    return {
      citizenId: citizen.citizenId,
      displayName: citizen.displayName,
      gender: citizen.gender,
      age: citizen.age,
      demoTaskInstanceId: selections[0]!.taskInstanceId,
    };
  }

  async updatePortrait(input: {
    citizenId: string;
    portraitId: string;
  }): Promise<{ citizenId: string; portraitId: string }> {
    if (!isValidCitizenPortraitId(input.portraitId)) {
      throw new AppError('VALIDATION', 'INVALID_PORTRAIT_ID', 'error.validation.portrait_id');
    }

    const citizen = await this.citizens.findById(input.citizenId);
    if (!citizen) {
      throw new AppError('NOT_FOUND', 'CITIZEN_NOT_FOUND', 'error.citizen.not_found');
    }

    const updated = await this.citizens.updatePortraitId(input.citizenId, input.portraitId);
    return { citizenId: updated.citizenId, portraitId: updated.portraitId! };
  }

  async deleteAccount(input: { accountId: string; sessionId: string }): Promise<void> {
    const citizen = await this.citizens.findByAccountId(input.accountId);
    if (!citizen) {
      throw new AppError('NOT_FOUND', 'CITIZEN_NOT_FOUND', 'error.citizen.not_found');
    }

    await this.citizens.deleteByCitizenId(citizen.citizenId);
    await this.sessions.updateCitizenId(input.sessionId, PENDING_CITIZEN_ID);
  }
}
