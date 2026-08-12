import { describe, expect, it } from 'vitest';
import { createWorldTimeSnapshot } from '@comune-virtuale/shared';
import { LifeReviewService } from './life-review-service.js';
import type {
  CitizenLifeEvolutionRepository,
  CitizenLifeEvolutionStateRecord,
  CitizenTemporalEventRecord,
  CitizenTemporalEventRepository,
} from '../../domain/ports/repositories.js';
import { LIFE_REVIEW_CONFIG } from '../../slice/time-life-constants.js';

class InMemoryLifeStateRepo implements CitizenLifeEvolutionRepository {
  private states = new Map<string, CitizenLifeEvolutionStateRecord>();

  async findByCitizenId(citizenId: string) {
    return this.states.get(citizenId) ?? null;
  }

  async ensureState(citizenId: string) {
    const existing = await this.findByCitizenId(citizenId);
    if (existing) return existing;
    const created: CitizenLifeEvolutionStateRecord = {
      citizenId,
      lastLifeReviewWorldMs: null,
      completedTasksAtLastReview: 0,
      lifeReviewCount: 0,
      employmentState: null,
      metadata: {},
      updatedAt: new Date(),
    };
    this.states.set(citizenId, created);
    return created;
  }

  async updateAfterLifeReview(input: {
    citizenId: string;
    worldTimeMs: number;
    completedTasksCount: number;
  }) {
    const state = await this.ensureState(input.citizenId);
    const updated = {
      ...state,
      lastLifeReviewWorldMs: input.worldTimeMs,
      completedTasksAtLastReview: input.completedTasksCount,
      lifeReviewCount: state.lifeReviewCount + 1,
      updatedAt: new Date(),
    };
    this.states.set(input.citizenId, updated);
    return updated;
  }

  async setEmploymentState(citizenId: string, employmentState: string) {
    const state = await this.ensureState(citizenId);
    const updated = { ...state, employmentState, updatedAt: new Date() };
    this.states.set(citizenId, updated);
    return updated;
  }
}

class InMemoryTemporalEventRepo implements CitizenTemporalEventRepository {
  private events: CitizenTemporalEventRecord[] = [];
  private completedTasksByCitizen = new Map<string, number>();

  async findByIdempotencyKey(citizenId: string, idempotencyKey: string) {
    return (
      this.events.find(
        (event) => event.citizenId === citizenId && event.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  async recordEvent(input: {
    eventId: string;
    citizenId: string;
    eventType: string;
    idempotencyKey: string;
    worldTimeMs: number;
    realAt?: Date;
    status?: string;
    title?: string;
    body?: string;
    payload?: Record<string, unknown>;
  }) {
    const existing = await this.findByIdempotencyKey(input.citizenId, input.idempotencyKey);
    if (existing) {
      return { record: existing, created: false };
    }
    const record: CitizenTemporalEventRecord = {
      eventId: input.eventId,
      citizenId: input.citizenId,
      eventType: input.eventType,
      idempotencyKey: input.idempotencyKey,
      worldTimeMs: input.worldTimeMs,
      realAt: input.realAt ?? new Date(),
      status: input.status ?? 'applied',
      title: input.title ?? null,
      body: input.body ?? null,
      payload: input.payload ?? {},
    };
    this.events.push(record);
    return { record, created: true };
  }

  async listRecentByCitizen(citizenId: string, limit = 5) {
    return this.events
      .filter((event) => event.citizenId === citizenId)
      .sort((a, b) => b.worldTimeMs - a.worldTimeMs)
      .slice(0, limit);
  }

  async countCompletedTasks(citizenId: string) {
    return this.completedTasksByCitizen.get(citizenId) ?? 0;
  }

  setCompletedTasks(citizenId: string, count: number) {
    this.completedTasksByCitizen.set(citizenId, count);
  }
}

describe('LifeReviewService', () => {
  const gameTime = createWorldTimeSnapshot(
    LIFE_REVIEW_CONFIG.minWorldTimeForFirstReviewMs + 1000,
    1,
    Date.now(),
  );

  it('skips review when frequency thresholds are not met', async () => {
    const lifeState = new InMemoryLifeStateRepo();
    const events = new InMemoryTemporalEventRepo();
    events.setCompletedTasks('cit-1', 2);
    const service = new LifeReviewService(lifeState, events);

    const review = await service.evaluateForHome({
      citizenId: 'cit-1',
      gameTime,
      metrics: { balanceMinor: 100_00, sympathy: 2, reputation: 2, level: 2 },
    });
    expect(review).toBeNull();
  });

  it('creates a life review when task and time thresholds are met', async () => {
    const lifeState = new InMemoryLifeStateRepo();
    const events = new InMemoryTemporalEventRepo();
    events.setCompletedTasks('cit-1', LIFE_REVIEW_CONFIG.minTasksSinceLastReview);
    const service = new LifeReviewService(lifeState, events);

    const review = await service.evaluateForHome({
      citizenId: 'cit-1',
      gameTime,
      metrics: { balanceMinor: 100_00, sympathy: 2, reputation: 2, level: 2 },
    });
    expect(review).not.toBeNull();
    expect(review?.title).toBe('Il Comune fa il punto');
    expect(review?.body).toContain('progressi');
  });

  it('does not duplicate life review on repeated evaluation', async () => {
    const lifeState = new InMemoryLifeStateRepo();
    const events = new InMemoryTemporalEventRepo();
    events.setCompletedTasks('cit-1', LIFE_REVIEW_CONFIG.minTasksSinceLastReview);
    const service = new LifeReviewService(lifeState, events);

    const first = await service.evaluateForHome({
      citizenId: 'cit-1',
      gameTime,
      metrics: { balanceMinor: 100_00, sympathy: 2, reputation: 2, level: 2 },
    });
    const second = await service.evaluateForHome({
      citizenId: 'cit-1',
      gameTime,
      metrics: { balanceMinor: 100_00, sympathy: 2, reputation: 2, level: 2 },
    });

    expect(first?.reviewId).toBe(second?.reviewId);
    const history = await events.listRecentByCitizen('cit-1');
    expect(history.filter((event) => event.eventType === 'life_review')).toHaveLength(1);
  });

  it('does not duplicate contradiction-triggered review while cycle is active', async () => {
    const lifeState = new InMemoryLifeStateRepo();
    const events = new InMemoryTemporalEventRepo();
    const service = new LifeReviewService(lifeState, events);
    const metrics = { balanceMinor: 500_00, sympathy: 0, reputation: 0, level: 2 };
    const gameTimeEarly = createWorldTimeSnapshot(1000, 1, Date.now());

    const first = await service.evaluateForHome({
      citizenId: 'cit-1',
      gameTime: gameTimeEarly,
      metrics,
    });
    const second = await service.evaluateForHome({
      citizenId: 'cit-1',
      gameTime: gameTimeEarly,
      metrics,
    });

    expect(first?.reviewId).toBe(second?.reviewId);
    const history = await events.listRecentByCitizen('cit-1');
    expect(history.filter((event) => event.eventType === 'life_review')).toHaveLength(1);
  });

  it('triggers review early on high-priority contradiction', async () => {
    const lifeState = new InMemoryLifeStateRepo();
    const events = new InMemoryTemporalEventRepo();
    events.setCompletedTasks('cit-1', 0);
    const service = new LifeReviewService(lifeState, events);

    const review = await service.evaluateForHome({
      citizenId: 'cit-1',
      gameTime: createWorldTimeSnapshot(1000, 1, Date.now()),
      metrics: { balanceMinor: 500_00, sympathy: 0, reputation: 0, level: 2 },
    });

    expect(review).not.toBeNull();
    expect(review?.body).toContain('saldo');
    expect(review?.contradictionId).toBe('rich_unloved');
  });

  it('returns recent life events for event history', async () => {
    const lifeState = new InMemoryLifeStateRepo();
    const events = new InMemoryTemporalEventRepo();
    const service = new LifeReviewService(lifeState, events);

    await events.recordEvent({
      eventId: 'evt-1',
      citizenId: 'cit-1',
      eventType: 'milestone',
      idempotencyKey: 'milestone:test',
      worldTimeMs: 100,
      title: 'Test',
    });

    const recent = await service.getRecentEvents('cit-1');
    expect(recent).toHaveLength(1);
    expect(recent[0]?.eventType).toBe('milestone');
  });
});
