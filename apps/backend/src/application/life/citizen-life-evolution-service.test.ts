import { describe, expect, it } from 'vitest';
import { CitizenLifeEvolutionService } from './citizen-life-evolution-service.js';
import type {
  CitizenLifeEvolutionRepository,
  CitizenLifeEvolutionStateRecord,
  CitizenTemporalEventRecord,
  CitizenTemporalEventRepository,
} from '../../domain/ports/repositories.js';

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
  private completedTasks = 0;

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
    void citizenId;
    return this.completedTasks;
  }

  setCompletedTasks(count: number) {
    this.completedTasks = count;
  }
}

describe('CitizenLifeEvolutionService', () => {
  it('records citizen_created milestone idempotently', async () => {
    const lifeState = new InMemoryLifeStateRepo();
    const events = new InMemoryTemporalEventRepo();
    const service = new CitizenLifeEvolutionService(lifeState, events);

    await service.recordCitizenCreated({
      citizenId: 'cit-1',
      worldTimeMs: 1000,
      displayName: 'Paolo',
    });
    await service.recordCitizenCreated({
      citizenId: 'cit-1',
      worldTimeMs: 1000,
      displayName: 'Paolo',
    });

    const recent = await events.listRecentByCitizen('cit-1');
    expect(recent.filter((event) => event.eventType === 'milestone')).toHaveLength(1);
    expect(recent[0]?.title).toBe('Arrivo in città');
  });

  it('records employment change in event history', async () => {
    const lifeState = new InMemoryLifeStateRepo();
    const events = new InMemoryTemporalEventRepo();
    const service = new CitizenLifeEvolutionService(lifeState, events);

    await service.recordEmploymentChange({
      citizenId: 'cit-1',
      worldTimeMs: 5000,
      employmentState: 'employed',
      occupationLabel: 'Impiegato comunale',
    });

    const state = await lifeState.findByCitizenId('cit-1');
    expect(state?.employmentState).toBe('employed');

    const recent = await events.listRecentByCitizen('cit-1');
    expect(recent[0]?.eventType).toBe('life_update');
  });

  it('does not duplicate employment events with same idempotency key', async () => {
    const lifeState = new InMemoryLifeStateRepo();
    const events = new InMemoryTemporalEventRepo();
    const service = new CitizenLifeEvolutionService(lifeState, events);

    const input = {
      citizenId: 'cit-1',
      worldTimeMs: 5000,
      employmentState: 'employed',
      occupationLabel: 'Impiegato comunale',
    };
    await service.recordEmploymentChange(input);
    await service.recordEmploymentChange(input);

    const recent = await events.listRecentByCitizen('cit-1');
    expect(recent).toHaveLength(1);
  });
});
