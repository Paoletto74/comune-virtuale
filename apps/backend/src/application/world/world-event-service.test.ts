import { randomUUID } from 'node:crypto';
import { describe, expect, it, afterEach } from 'vitest';
import type { WorldEventRepository } from '../../domain/ports/repositories.js';
import { setWorldEventConfigForTests } from '../../slice/world-events-constants.js';
import { WorldEventService } from './world-event-service.js';
import type { WorldEventRecord } from './world-event-types.js';

class InMemoryWorldEventRepository implements WorldEventRepository {
  private events = new Map<string, WorldEventRecord>();
  private notices = new Set<string>();
  private dismissedPopups = new Set<string>();
  private scheduler = { lastEvaluatedGameMs: 0, spawnCycle: 0, lastSpawnedGameMs: null as number | null };

  async findById(eventId: string) {
    return this.events.get(eventId) ?? null;
  }

  async findByIdempotencyKey(idempotencyKey: string) {
    for (const event of this.events.values()) {
      if (event.idempotencyKey === idempotencyKey) return event;
    }
    return null;
  }

  async listActiveAtGameTime(gameTimeMs: number) {
    return [...this.events.values()].filter(
      (event) =>
        event.status === 'active' &&
        event.startedAtGameMs <= gameTimeMs &&
        event.endsAtGameMs > gameTimeMs,
    );
  }

  async listByStatus(status: string) {
    return [...this.events.values()].filter((event) => event.status === status);
  }

  async createEvent(input: Parameters<WorldEventRepository['createEvent']>[0]) {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { record: existing, created: false };

    const record: WorldEventRecord = {
      eventId: input.eventId,
      templateId: input.templateId,
      scope: input.scope as WorldEventRecord['scope'],
      type: input.type as WorldEventRecord['type'],
      status: input.status as WorldEventRecord['status'],
      severity: input.severity as WorldEventRecord['severity'],
      title: input.title,
      body: input.body,
      comuneLine: input.comuneLine ?? null,
      source: input.source ?? 'system',
      startedAtGameMs: input.startedAtGameMs,
      endsAtGameMs: input.endsAtGameMs,
      effects: input.effects as WorldEventRecord['effects'],
      metadata: input.metadata ?? {},
      idempotencyKey: input.idempotencyKey,
      zoneId: input.zoneId ?? null,
      createdAt: new Date(),
    };
    this.events.set(record.eventId, record);
    return { record, created: true };
  }

  async updateStatus(eventId: string, status: string) {
    const event = this.events.get(eventId);
    if (!event) throw new Error('missing event');
    event.status = status as WorldEventRecord['status'];
    return event;
  }

  async endEventsBefore(gameTimeMs: number) {
    const ended: WorldEventRecord[] = [];
    for (const event of this.events.values()) {
      if (event.status === 'active' && event.endsAtGameMs <= gameTimeMs) {
        event.status = 'ended';
        ended.push(event);
      }
    }
    return ended;
  }

  async activateScheduledEvents(gameTimeMs: number) {
    const activated: WorldEventRecord[] = [];
    for (const event of this.events.values()) {
      if (
        event.status === 'scheduled' &&
        event.startedAtGameMs <= gameTimeMs &&
        event.endsAtGameMs > gameTimeMs
      ) {
        event.status = 'active';
        activated.push(event);
      }
    }
    return activated;
  }

  async getSchedulerState() {
    return { ...this.scheduler };
  }

  async saveSchedulerState(input: {
    lastEvaluatedGameMs: number;
    spawnCycle: number;
    lastSpawnedGameMs?: number | null;
  }) {
    this.scheduler = {
      lastEvaluatedGameMs: input.lastEvaluatedGameMs,
      spawnCycle: input.spawnCycle,
      lastSpawnedGameMs:
        input.lastSpawnedGameMs === undefined ? this.scheduler.lastSpawnedGameMs : input.lastSpawnedGameMs,
    };
  }

  async findLastEndedByTemplate(templateId: string) {
    const ended = [...this.events.values()]
      .filter((event) => event.templateId === templateId && event.status === 'ended')
      .sort((a, b) => b.endsAtGameMs - a.endsAtGameMs);
    return ended[0] ?? null;
  }

  async recordCitizenNotice(input: {
    citizenId: string;
    worldEventId: string;
    idempotencyKey: string;
  }) {
    const key = `${input.citizenId}:${input.worldEventId}`;
    if (this.notices.has(key)) return { created: false };
    this.notices.add(key);
    return { created: true };
  }

  async hasCitizenNotice(citizenId: string, worldEventId: string) {
    return this.notices.has(`${citizenId}:${worldEventId}`);
  }

  async isPopupDismissed(citizenId: string, worldEventId: string) {
    return this.dismissedPopups.has(`${citizenId}:${worldEventId}`);
  }

  async markPopupDismissed(citizenId: string, worldEventId: string) {
    const key = `${citizenId}:${worldEventId}`;
    if (!this.notices.has(key)) {
      this.notices.add(key);
    }
    this.dismissedPopups.add(key);
    return true;
  }
}

describe('WorldEventService', () => {
  afterEach(() => {
    setWorldEventConfigForTests(null);
  });

  it('transitions scheduled events to active at game time', async () => {
    const repo = new InMemoryWorldEventRepository();
    const service = new WorldEventService(repo);
    const eventId = randomUUID();

    await repo.createEvent({
      eventId,
      templateId: 'demo',
      scope: 'global',
      type: 'weather',
      status: 'scheduled',
      severity: 'moderate',
      title: 'Ondata di caldo',
      body: 'Caldo',
      startedAtGameMs: 5000,
      endsAtGameMs: 20_000,
      effects: {},
      idempotencyKey: 'scheduled-1',
    });

    const before = await service.getActiveEvents(4000);
    expect(before).toHaveLength(0);

    await service.evaluateScheduler(5000);
    const active = await service.getActiveEvents(5000);
    expect(active).toHaveLength(1);
    expect(active[0]?.status).toBe('active');
  });

  it('ends active events when game time passes endsAt', async () => {
    const repo = new InMemoryWorldEventRepository();
    const service = new WorldEventService(repo);

    await repo.createEvent({
      eventId: randomUUID(),
      templateId: 'demo',
      scope: 'global',
      type: 'weather',
      status: 'active',
      severity: 'moderate',
      title: 'Ondata di caldo',
      body: 'Caldo',
      startedAtGameMs: 0,
      endsAtGameMs: 1000,
      effects: {},
      idempotencyKey: 'active-1',
    });

    await service.evaluateScheduler(1000);
    const active = await service.getActiveEvents(1000);
    expect(active).toHaveLength(0);
  });

  it('does not duplicate events with the same idempotency key', async () => {
    const repo = new InMemoryWorldEventRepository();
    const service = new WorldEventService(repo);

    setWorldEventConfigForTests({
      enabled: true,
      maxActiveEvents: 2,
      spawnCheckIntervalGameMs: 0,
      globalSpawnCooldownGameMs: 0,
      spawnProbability: 1,
      maxCombinedTaskMultiplier: 1.35,
      minCombinedTaskMultiplier: 0.85,
      maxCombinedFlashMultiplier: 1.4,
      minCombinedFlashMultiplier: 0.9,
    });

    await service.evaluateScheduler(10_000);
    await service.evaluateScheduler(10_000);

    const all = await repo.listByStatus('active');
    const keys = new Set(all.map((event) => event.idempotencyKey));
    expect(keys.size).toBe(all.length);
  });

  it('returns combined modifiers for overlapping active events with caps', async () => {
    const repo = new InMemoryWorldEventRepository();
    const service = new WorldEventService(repo);

    await repo.createEvent({
      eventId: 'a',
      templateId: 'demo_weather_heat_wave',
      scope: 'global',
      type: 'weather',
      status: 'active',
      severity: 'moderate',
      title: 'A',
      body: 'A',
      startedAtGameMs: 0,
      endsAtGameMs: 10_000,
      effects: { taskContextMultipliers: { social: 1.2 } },
      idempotencyKey: 'a',
    });
    await repo.createEvent({
      eventId: 'b',
      templateId: 'demo_economic_cost_of_living',
      scope: 'global',
      type: 'economic',
      status: 'active',
      severity: 'high',
      title: 'B',
      body: 'B',
      startedAtGameMs: 0,
      endsAtGameMs: 10_000,
      effects: { taskContextMultipliers: { social: 1.2, economic: 1.15 } },
      idempotencyKey: 'b',
    });

    const modifiers = await service.getCombinedModifiers(1000);
    expect(modifiers.activeEventIds).toEqual(['a', 'b']);
    expect(modifiers.taskContextMultipliers.social).toBeCloseTo(1.44);
    expect(modifiers.taskContextMultipliers.economic).toBe(1.15);
  });

  it('builds home notices without duplicating citizen relevance', async () => {
    const repo = new InMemoryWorldEventRepository();
    const service = new WorldEventService(repo);
    const eventId = randomUUID();

    await repo.createEvent({
      eventId,
      templateId: 'demo_weather_heat_wave',
      scope: 'global',
      type: 'weather',
      status: 'active',
      severity: 'moderate',
      title: 'Ondata di caldo',
      body: 'Caldo',
      comuneLine: 'Anche l\'asfalto ha deciso di chiedere ferie.',
      startedAtGameMs: 0,
      endsAtGameMs: 10_000,
      effects: {},
      idempotencyKey: 'notice-1',
    });

    const first = await service.syncForHome({ citizenId: 'citizen-1', gameTimeMs: 1000 });
    const second = await service.syncForHome({ citizenId: 'citizen-1', gameTimeMs: 1000 });

    expect(first.activeEvents).toHaveLength(1);
    expect(second.activeEvents[0]?.eventId).toBe(eventId);
    expect(await repo.hasCitizenNotice('citizen-1', eventId)).toBe(true);
  });

  it('refreshes active events when spawn cycle is skipped at the same game time', async () => {
    const repo = new InMemoryWorldEventRepository();
    const service = new WorldEventService(repo);
    const gameTimeMs = 5000;

    await service.evaluateScheduler(gameTimeMs);

    const eventId = randomUUID();
    await repo.createEvent({
      eventId,
      templateId: 'demo_weather_heat_wave',
      scope: 'global',
      type: 'weather',
      status: 'active',
      severity: 'moderate',
      title: 'Ondata di caldo',
      body: 'Caldo',
      comuneLine: 'Anche l\'asfalto ha deciso di chiedere ferie.',
      startedAtGameMs: gameTimeMs - 1000,
      endsAtGameMs: gameTimeMs + 10_000,
      effects: {},
      idempotencyKey: 'post-scheduler-seed',
    });

    const home = await service.syncForHome({ citizenId: 'citizen-1', gameTimeMs });
    expect(home.activeEvents.some((event) => event.eventId === eventId)).toBe(true);
  });

  it('hides popup after dismiss without ending the world event', async () => {
    const repo = new InMemoryWorldEventRepository();
    const service = new WorldEventService(repo);
    const eventId = randomUUID();

    await repo.createEvent({
      eventId,
      templateId: 'demo_weather_heat_wave',
      scope: 'global',
      type: 'weather',
      status: 'active',
      severity: 'moderate',
      title: 'Ondata di caldo',
      body: 'Caldo',
      comuneLine: 'Anche l\'asfalto ha deciso di chiedere ferie.',
      startedAtGameMs: 0,
      endsAtGameMs: 10_000,
      effects: {},
      idempotencyKey: 'dismiss-popup-1',
    });

    const beforeDismiss = await service.syncForHome({ citizenId: 'citizen-1', gameTimeMs: 1000 });
    expect(beforeDismiss.activeEvents).toHaveLength(1);

    await service.dismissPopup({ citizenId: 'citizen-1', worldEventId: eventId });

    const afterDismiss = await service.syncForHome({ citizenId: 'citizen-1', gameTimeMs: 1000 });
    expect(afterDismiss.activeEvents).toHaveLength(0);

    const active = await service.getActiveEvents(1000);
    expect(active.some((event) => event.eventId === eventId)).toBe(true);
  });
});
