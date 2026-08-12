import { randomUUID } from 'node:crypto';
import type {
  CitizenRepository,
  CitizenTemporalEventRepository,
} from '../../domain/ports/repositories.js';
import {
  FLASH_OPPORTUNITY_PROGRESSION_POINTS,
  JOB_CLOCK_IN_PROGRESSION_POINTS,
  JOB_SHIFT_PAYROLL_PROGRESSION_POINTS,
  LIFE_REVIEW_PROGRESSION_POINTS,
  MARKETPLACE_PURCHASE_PROGRESSION_POINTS,
  NPC_FIRST_MEETING_PROGRESSION_POINTS,
  REFERENDUM_VOTE_PROGRESSION_POINTS,
  TASK_PROGRESSION_BY_COMPLEXITY,
  resolveLevelUpMessage,
  resolveLevelUpTitle,
} from '../../slice/citizen-progression-constants.js';
import { getTaskPersonalizationMetadata } from '../task/task-personalization-metadata.js';

export interface LevelUpNoticeDto {
  eventId: string;
  level: number;
  title: string;
  body: string;
  worldTimeMs: number;
}

export interface ProgressionGrantResultDto {
  pointsGranted: number;
  totalPoints: number;
  previousLevel: number;
  newLevel: number;
  created: boolean;
  levelUps: LevelUpNoticeDto[];
}

export interface TaskProgressionInput {
  citizenId: string;
  taskInstanceId: string;
  definitionId: string;
  optionId: string;
  sympathyDelta: number;
  reputationDelta: number;
  hadRiskOutcome: boolean;
  worldTimeMs: number;
}

export class CitizenProgressionService {
  constructor(
    private readonly citizens: CitizenRepository,
    private readonly temporalEvents?: CitizenTemporalEventRepository,
  ) {}

  async grantProgression(input: {
    citizenId: string;
    idempotencyKey: string;
    points: number;
    sourceType: string;
    sourceRef?: string;
    worldTimeMs: number;
  }): Promise<ProgressionGrantResultDto> {
    if (input.points <= 0) {
      const progression = await this.citizens.getProgression(input.citizenId);
      return {
        pointsGranted: 0,
        totalPoints: progression?.progressionPoints ?? 0,
        previousLevel: progression?.mainLevel ?? 1,
        newLevel: progression?.mainLevel ?? 1,
        created: false,
        levelUps: [],
      };
    }

    const before = await this.citizens.getProgression(input.citizenId);
    const previousLevel = before?.mainLevel ?? 1;

    const applied = await this.citizens.applyProgressionGrant({
      grantId: randomUUID(),
      citizenId: input.citizenId,
      idempotencyKey: input.idempotencyKey,
      pointsGranted: input.points,
      sourceType: input.sourceType,
      sourceRef: input.sourceRef,
    });

    const levelUps: LevelUpNoticeDto[] = [];
    if (applied.created && applied.progression.mainLevel > previousLevel) {
      for (let level = previousLevel + 1; level <= applied.progression.mainLevel; level += 1) {
        const notice = await this.recordLevelUpEvent({
          citizenId: input.citizenId,
          level,
          worldTimeMs: input.worldTimeMs,
        });
        if (notice) levelUps.push(notice);
      }
    }

    return {
      pointsGranted: applied.created ? input.points : 0,
      totalPoints: applied.progression.progressionPoints,
      previousLevel,
      newLevel: applied.progression.mainLevel,
      created: applied.created,
      levelUps,
    };
  }

  async grantForTaskCompletion(input: TaskProgressionInput): Promise<ProgressionGrantResultDto> {
    const points = computeTaskProgressionPoints(input);
    return this.grantProgression({
      citizenId: input.citizenId,
      idempotencyKey: `progression:task:${input.taskInstanceId}:${input.optionId}`,
      points,
      sourceType: 'task_completion',
      sourceRef: input.definitionId,
      worldTimeMs: input.worldTimeMs,
    });
  }

  async grantForFlashAccept(input: {
    citizenId: string;
    opportunityId: string;
    worldTimeMs: number;
  }): Promise<ProgressionGrantResultDto> {
    return this.grantProgression({
      citizenId: input.citizenId,
      idempotencyKey: `progression:flash:${input.opportunityId}:accept`,
      points: FLASH_OPPORTUNITY_PROGRESSION_POINTS,
      sourceType: 'flash_opportunity',
      sourceRef: input.opportunityId,
      worldTimeMs: input.worldTimeMs,
    });
  }

  async grantForNpcFirstMeeting(input: {
    citizenId: string;
    npcId: string;
    worldTimeMs: number;
  }): Promise<ProgressionGrantResultDto> {
    return this.grantProgression({
      citizenId: input.citizenId,
      idempotencyKey: `progression:npc:first:${input.citizenId}:${input.npcId}`,
      points: NPC_FIRST_MEETING_PROGRESSION_POINTS,
      sourceType: 'npc_first_meeting',
      sourceRef: input.npcId,
      worldTimeMs: input.worldTimeMs,
    });
  }

  async grantForLifeReview(input: {
    citizenId: string;
    reviewNumber: number;
    worldTimeMs: number;
  }): Promise<ProgressionGrantResultDto> {
    return this.grantProgression({
      citizenId: input.citizenId,
      idempotencyKey: `progression:life_review:${input.citizenId}:${input.reviewNumber}`,
      points: LIFE_REVIEW_PROGRESSION_POINTS,
      sourceType: 'life_review',
      sourceRef: String(input.reviewNumber),
      worldTimeMs: input.worldTimeMs,
    });
  }

  async grantForReferendumVote(input: {
    citizenId: string;
    referendumId: string;
    worldTimeMs: number;
  }): Promise<ProgressionGrantResultDto> {
    return this.grantProgression({
      citizenId: input.citizenId,
      idempotencyKey: `progression:referendum:${input.referendumId}:${input.citizenId}`,
      points: REFERENDUM_VOTE_PROGRESSION_POINTS,
      sourceType: 'referendum_vote',
      sourceRef: input.referendumId,
      worldTimeMs: input.worldTimeMs,
    });
  }

  async grantForJobClockIn(input: {
    citizenId: string;
    offerId: string;
    dayStartMs: number;
    worldTimeMs: number;
  }): Promise<ProgressionGrantResultDto> {
    return this.grantProgression({
      citizenId: input.citizenId,
      idempotencyKey: `progression:job_clock_in:${input.citizenId}:${input.offerId}:${input.dayStartMs}`,
      points: JOB_CLOCK_IN_PROGRESSION_POINTS,
      sourceType: 'job_clock_in',
      sourceRef: input.offerId,
      worldTimeMs: input.worldTimeMs,
    });
  }

  async grantForJobShiftPayroll(input: {
    citizenId: string;
    offerId: string;
    shiftEndsAtGameMs: number;
    worldTimeMs: number;
  }): Promise<ProgressionGrantResultDto> {
    return this.grantProgression({
      citizenId: input.citizenId,
      idempotencyKey: `progression:job_payroll:${input.citizenId}:${input.offerId}:${input.shiftEndsAtGameMs}`,
      points: JOB_SHIFT_PAYROLL_PROGRESSION_POINTS,
      sourceType: 'job_shift_payroll',
      sourceRef: input.offerId,
      worldTimeMs: input.worldTimeMs,
    });
  }

  async grantForMarketplacePurchase(input: {
    citizenId: string;
    itemId: string;
    worldTimeMs: number;
  }): Promise<ProgressionGrantResultDto> {
    return this.grantProgression({
      citizenId: input.citizenId,
      idempotencyKey: `progression:marketplace:${input.citizenId}:${input.itemId}`,
      points: MARKETPLACE_PURCHASE_PROGRESSION_POINTS,
      sourceType: 'marketplace_purchase',
      sourceRef: input.itemId,
      worldTimeMs: input.worldTimeMs,
    });
  }

  async getLatestLevelUpNotice(citizenId: string): Promise<LevelUpNoticeDto | null> {
    if (!this.temporalEvents) return null;
    const events = await this.temporalEvents.listRecentByCitizen(citizenId, 12);
    const levelUp = events.find((event) => event.eventType === 'level_up');
    if (!levelUp?.title || !levelUp.body) return null;
    return {
      eventId: levelUp.eventId,
      level: typeof levelUp.payload.level === 'number' ? levelUp.payload.level : 0,
      title: levelUp.title,
      body: levelUp.body,
      worldTimeMs: levelUp.worldTimeMs,
    };
  }

  private async recordLevelUpEvent(input: {
    citizenId: string;
    level: number;
    worldTimeMs: number;
  }): Promise<LevelUpNoticeDto | null> {
    if (!this.temporalEvents) return null;

    const title = resolveLevelUpTitle(input.level);
    const body = resolveLevelUpMessage(input.citizenId, input.level);
    const idempotencyKey = `level_up:${input.citizenId}:L${input.level}`;

    const recorded = await this.temporalEvents.recordEvent({
      eventId: randomUUID(),
      citizenId: input.citizenId,
      eventType: 'level_up',
      idempotencyKey,
      worldTimeMs: input.worldTimeMs,
      title,
      body,
      payload: { level: input.level },
    });

    return {
      eventId: recorded.record.eventId,
      level: input.level,
      title,
      body,
      worldTimeMs: recorded.record.worldTimeMs,
    };
  }
}

export function computeTaskProgressionPoints(input: {
  definitionId: string;
  optionId: string;
  sympathyDelta: number;
  reputationDelta: number;
  hadRiskOutcome: boolean;
}): number {
  const metadata = getTaskPersonalizationMetadata(input.definitionId);
  let points: number = TASK_PROGRESSION_BY_COMPLEXITY[metadata.complexityTier];

  if (metadata.complexityTier === 'demanding' && isRiskyTaskOption(input.definitionId, input.optionId)) {
    points = Math.round(points * 0.85);
  } else if (input.hadRiskOutcome) {
    points = Math.round(points * 0.9);
  }

  if (input.sympathyDelta > 0 && input.reputationDelta > 0) {
    points += 5;
  }
  if (input.sympathyDelta >= 3 || input.reputationDelta >= 3) {
    points += 5;
  }

  return Math.max(10, points);
}

function isRiskyTaskOption(definitionId: string, optionId: string): boolean {
  const upperDefinition = definitionId.toUpperCase();
  const upperOption = optionId.toUpperCase();
  if (
    upperOption.includes('STEAL') ||
    upperOption.includes('RISK') ||
    upperOption.includes('SHADY') ||
    upperOption.includes('SCAM')
  ) {
    return true;
  }
  return (
    upperDefinition.includes('STEAL') ||
    upperDefinition.includes('SHADY') ||
    upperDefinition.includes('SCAM') ||
    upperDefinition.includes('RISKY')
  );
}
