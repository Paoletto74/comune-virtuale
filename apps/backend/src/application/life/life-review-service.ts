import { randomUUID } from 'node:crypto';
import type { WorldTimeSnapshot } from '@comune-virtuale/shared';
import type {
  CitizenLifeEvolutionRepository,
  CitizenTemporalEventRepository,
} from '../../domain/ports/repositories.js';
import type { CitizenProgressionService } from '../citizen/citizen-progression-service.js';
import { LIFE_REVIEW_CONFIG } from '../../slice/time-life-constants.js';
import {
  buildDefaultLifeReview,
  detectPrimaryContradiction,
  type CitizenMetricSnapshot,
} from './life-contradiction-detector.js';

export interface LifeReviewDto {
  reviewId: string;
  title: string;
  body: string;
  severity: 'neutral' | 'ironic' | 'sharp';
  contradictionId?: string;
  worldTimeMs: number;
}

export interface LifeEventSummaryDto {
  eventId: string;
  eventType: string;
  title: string | null;
  worldTimeMs: number;
}

export class LifeReviewService {
  constructor(
    private readonly lifeState: CitizenLifeEvolutionRepository,
    private readonly events: CitizenTemporalEventRepository,
    private readonly progression?: CitizenProgressionService,
  ) {}

  async evaluateForHome(input: {
    citizenId: string;
    gameTime: WorldTimeSnapshot;
    metrics: CitizenMetricSnapshot;
  }): Promise<LifeReviewDto | null> {
    const state = await this.lifeState.ensureState(input.citizenId);
    const completedTasks = await this.events.countCompletedTasks(input.citizenId);
    const tasksSinceReview = completedTasks - state.completedTasksAtLastReview;
    const gameTimeSinceReview =
      state.lastLifeReviewWorldMs === null
        ? input.gameTime.worldTimeMs
        : input.gameTime.worldTimeMs - state.lastLifeReviewWorldMs;

    const contradiction = detectPrimaryContradiction(input.metrics);
    const meetsTaskThreshold = tasksSinceReview >= LIFE_REVIEW_CONFIG.minTasksSinceLastReview;
    const meetsTimeThreshold =
      state.lastLifeReviewWorldMs === null
        ? input.gameTime.worldTimeMs >= LIFE_REVIEW_CONFIG.minWorldTimeForFirstReviewMs
        : gameTimeSinceReview >= LIFE_REVIEW_CONFIG.minGameTimeBetweenReviewsMs;
    const meetsContradictionOverride = contradiction !== null && contradiction.priority >= 85;

    const eligibleForNextReviewCycle = meetsTaskThreshold && meetsTimeThreshold;
    const eligibleForFirstReview =
      state.lifeReviewCount === 0 &&
      (meetsContradictionOverride ||
        (meetsTaskThreshold && meetsTimeThreshold));

    if (state.lifeReviewCount > 0) {
      const currentReviewKey = `life_review:v1:${input.citizenId}:${state.lifeReviewCount}`;
      const currentReview = await this.events.findByIdempotencyKey(
        input.citizenId,
        currentReviewKey,
      );

      if (!eligibleForNextReviewCycle) {
        if (currentReview?.title && currentReview.body) {
          return {
            reviewId: currentReview.eventId,
            title: currentReview.title,
            body: currentReview.body,
            severity: contradiction ? 'sharp' : 'ironic',
            contradictionId:
              (currentReview.payload.contradictionId as string | undefined) ?? undefined,
            worldTimeMs: currentReview.worldTimeMs,
          };
        }
        return null;
      }
    } else if (!eligibleForFirstReview) {
      return null;
    }

    const reviewNumber = state.lifeReviewCount + 1;
    const idempotencyKey = `life_review:v1:${input.citizenId}:${reviewNumber}`;
    const existing = await this.events.findByIdempotencyKey(input.citizenId, idempotencyKey);
    if (existing?.title && existing.body) {
      return {
        reviewId: existing.eventId,
        title: existing.title,
        body: existing.body,
        severity: 'ironic',
        contradictionId: (existing.payload.contradictionId as string | undefined) ?? undefined,
        worldTimeMs: existing.worldTimeMs,
      };
    }

    const content = contradiction ?? buildDefaultLifeReview(input.metrics);
    const title = 'Il Comune fa il punto';
    const body = `${content.positiveResult}\n${content.observation}\n${content.ironicContrast}`;

    const recorded = await this.events.recordEvent({
      eventId: randomUUID(),
      citizenId: input.citizenId,
      eventType: 'life_review',
      idempotencyKey,
      worldTimeMs: input.gameTime.worldTimeMs,
      title,
      body,
      payload: {
        contradictionId: content.id,
        tasksSinceReview,
        gameTimeSinceReview,
      },
    });

    if (recorded.created) {
      await this.lifeState.updateAfterLifeReview({
        citizenId: input.citizenId,
        worldTimeMs: input.gameTime.worldTimeMs,
        completedTasksCount: completedTasks,
      });

      if (this.progression) {
        await this.progression.grantForLifeReview({
          citizenId: input.citizenId,
          reviewNumber,
          worldTimeMs: input.gameTime.worldTimeMs,
        });
      }
    }

    return {
      reviewId: recorded.record.eventId,
      title,
      body,
      severity: contradiction ? 'sharp' : 'ironic',
      contradictionId: content.id,
      worldTimeMs: input.gameTime.worldTimeMs,
    };
  }

  async getRecentEvents(citizenId: string, limit = 5): Promise<LifeEventSummaryDto[]> {
    const rows = await this.events.listRecentByCitizen(citizenId, limit);
    return rows.map((row) => ({
      eventId: row.eventId,
      eventType: row.eventType,
      title: row.title,
      worldTimeMs: row.worldTimeMs,
    }));
  }
}
