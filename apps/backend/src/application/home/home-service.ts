import type { WorldTimeSnapshot, GameDateSnapshot } from '@comune-virtuale/shared';
import { deriveGameDate } from '@comune-virtuale/shared';
import type { PersonalValuesRecord } from '../../slice/personal-values-constants.js';
import { personalValuesFromPartial } from '../../slice/personal-values-constants.js';
import type { CitizenRepository, TaskRepository } from '../../domain/ports/repositories.js';
import type { EconomyService, BalanceSummaryDto } from '../economy/economy-service.js';
import type { TaskService, TaskSummaryDto } from '../task/task-service.js';
import type { CitizenProfileViewDto } from '../citizen/citizen-profile-service.js';
import type { CitizenProfileService } from '../citizen/citizen-profile-service.js';
import type { KnownNpcSummaryDto, NpcRelationshipService } from '../npc/npc-relationship-service.js';
import type {
  LifeEventSummaryDto,
  LifeReviewDto,
  LifeReviewService,
} from '../life/life-review-service.js';
import type { GameSurfaceService } from '../game-surface/game-surface-service.js';
import type {
  FlashHomeStateDto,
  FlashOpportunityService,
} from '../flash/flash-opportunity-service.js';
import type {
  CitizenProgressionService,
  LevelUpNoticeDto,
} from '../citizen/citizen-progression-service.js';
import type { CitizenCareerService, CitizenCareerViewDto } from '../citizen/citizen-career-service.js';
import type { WorldEventHomeStateDto } from '../world/world-event-types.js';
import type { WorldEventService } from '../world/world-event-service.js';
import type { StoryThreadService } from '../story/story-thread-service.js';
import type { SocialGameplayService } from '../social/social-gameplay-service.js';

export interface GlobalProgressionDto {
  level: number;
  levelId: string;
  globalXp: number;
}

export interface HomeSummaryDto {
  citizenId: string;
  displayName: string;
  gender: string;
  age: number;
  portraitId: string | null;
  level: { levelId: string; level: number };
  globalProgression: GlobalProgressionDto;
  career: CitizenCareerViewDto;
  personalValues: PersonalValuesRecord;
  citizenProfile: CitizenProfileViewDto;
  knownNpcs: KnownNpcSummaryDto[];
  balance: BalanceSummaryDto;
  activeTasks: TaskSummaryDto[];
  gameTime: WorldTimeSnapshot;
  gameDate: GameDateSnapshot;
  lifeReview: LifeReviewDto | null;
  recentLifeEvents: LifeEventSummaryDto[];
  levelUpNotice: LevelUpNoticeDto | null;
  worldEvents: WorldEventHomeStateDto;
  flash: FlashHomeStateDto;
}

export class HomeService {
  constructor(
    private readonly citizens: CitizenRepository,
    private readonly tasks: TaskRepository,
    private readonly taskService: TaskService,
    private readonly economy: EconomyService,
    private readonly profile?: CitizenProfileService,
    private readonly npcRelationships?: NpcRelationshipService,
    private readonly lifeReview?: LifeReviewService,
    private readonly flashOpportunities?: FlashOpportunityService,
    private readonly progression?: CitizenProgressionService,
    private readonly career?: CitizenCareerService,
    private readonly worldEvents?: WorldEventService,
    private readonly storyThreads?: StoryThreadService,
    private readonly gameSurface?: GameSurfaceService,
    private readonly socialGameplay?: SocialGameplayService,
  ) {}

  async getHomeSummary(
    citizenId: string,
    gameTime: WorldTimeSnapshot,
    correlationId?: string,
  ): Promise<HomeSummaryDto> {
    const citizen = await this.citizens.findById(citizenId);
    if (!citizen) {
      throw new Error(`Citizen not found: ${citizenId}`);
    }

    if (this.socialGameplay) {
      const localHour = deriveGameDate(gameTime.worldTimeMs).hour;
      await this.socialGameplay.syncSpontaneousMessages(citizenId, localHour);
    }

    const progression = await this.citizens.getProgression(citizenId);
    const activeTasks = await this.taskService.getActiveTasks(citizenId, correlationId);
    const personalValuesRaw = this.profile
      ? await this.profile.ensureProfileSeeded(citizen)
      : await this.citizens.getPersonalValues(citizenId);
    const balance = await this.economy.getBalance(citizenId);

    const level = {
      levelId: progression?.mainLevelId ?? 'main_L01',
      level: progression?.mainLevel ?? 1,
    };

    const globalProgression: GlobalProgressionDto = {
      level: level.level,
      levelId: level.levelId,
      globalXp: progression?.progressionPoints ?? 0,
    };

    const career = this.career
      ? await this.career.getCareerView(citizenId)
      : {
          currentCareerId: null,
          currentCareerLabel: null,
          currentGradeIndex: 1,
          currentGradeLabel: null,
          affinities: [],
          history: [],
          switchRules: { minAffinityDelta: 15, minSignificantActions: 5 },
          pendingSwitchCareerId: null,
          pendingSwitchCareerLabel: null,
          pendingSwitchStreak: 0,
          pendingSwitchRequired: 5,
        };

    const citizenProfile =
      this.profile?.resolveProfileView({
        citizen,
        progression,
        personalValues: personalValuesRaw,
      }) ?? {
        levelLabel: 'Nuovo in città',
        ageBand: '',
        progression: { ...level, label: 'Nuovo in città', globalXp: globalProgression.globalXp },
        unlocked: {} as CitizenProfileViewDto['unlocked'],
        locked: [] as CitizenProfileViewDto['locked'],
      };

    const knownNpcs = this.npcRelationships
      ? await this.npcRelationships.getKnownNpcs(citizenId)
      : [];

    const balanceMinor = Number(balance.availableCash.amountMinor);
    const metrics = {
      balanceMinor,
      sympathy: personalValuesRaw.sympathy ?? 0,
      reputation: personalValuesRaw.reputation ?? 0,
      level: level.level,
      occupationLabel: citizenProfile.unlocked.work?.label,
      housingLabel: citizenProfile.unlocked.living?.label,
    };

    const gameTimeMs = Number(gameTime.worldTimeMs);

    if (this.storyThreads) {
      await this.storyThreads.onHomeEconomyCheck({
        citizenId,
        balanceMinor,
        worldTimeMs: gameTimeMs,
      });
    }

    const storyThreadLife = this.storyThreads
      ? await this.storyThreads.getLifeContext(citizenId, gameTimeMs)
      : null;

    const lifeReviewMetrics = {
      ...metrics,
      ...(storyThreadLife
        ? {
            storyThreadsCompleted: storyThreadLife.completedCount,
            storyThreadsAbandoned: storyThreadLife.abandonedCount,
            recurringSocialThreads: storyThreadLife.recurringSocialThreads,
          }
        : {}),
    };

    const lifeReview = this.lifeReview
      ? await this.lifeReview.evaluateForHome({ citizenId, gameTime, metrics: lifeReviewMetrics })
      : null;
    const recentLifeEvents = this.lifeReview
      ? await this.lifeReview.getRecentEvents(citizenId, 5)
      : [];

    const levelUpNotice = this.progression
      ? await this.progression.getLatestLevelUpNotice(citizenId)
      : null;

    const profileContext = this.profile
      ? await this.profile.getProfileContextForSelection(citizenId)
      : undefined;

    const worldEvents = this.worldEvents
      ? await this.worldEvents.syncForHome({ citizenId, gameTimeMs })
      : { enabled: false, activeEvents: [] };

    const flash = this.flashOpportunities
      ? await this.flashOpportunities.syncForHome({
          citizenId,
          nowMs: Date.now(),
          gameTimeMs,
          profileContext: profileContext ?? undefined,
          knownNpcs,
        })
      : {
          enabled: false,
          flashOpportunity: null,
          anticipation: null,
          expiredNotice: null,
        };

    if (this.gameSurface) {
      await this.gameSurface.recordEconomicSnapshot({
        citizenId,
        gameTimeMs,
        cashMinor: BigInt(balanceMinor),
      });
      await this.gameSurface.syncMunicipality(gameTimeMs);
    }

    return {
      citizenId: citizen.citizenId,
      displayName: citizen.displayName,
      gender: citizen.gender,
      age: citizen.age,
      portraitId: citizen.portraitId,
      level,
      globalProgression,
      career,
      personalValues: personalValuesFromPartial(personalValuesRaw),
      citizenProfile,
      knownNpcs,
      balance,
      activeTasks,
      gameTime,
      gameDate: deriveGameDate(gameTime.worldTimeMs),
      lifeReview,
      recentLifeEvents,
      levelUpNotice,
      worldEvents,
      flash,
    };
  }
}
