import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildTestApp,
  completeStandardTask,
  loginAs,
  withIdempotency,
  withSession,
} from '../../test/test-app.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('world events integration', () => {
  beforeAll(async () => {
    const { client, close } = await buildTestApp();
    try {
      const popupDismissSql = readFileSync(
        resolve(import.meta.dirname, '../../../drizzle/0012_world_event_popup_dismiss.sql'),
        'utf8',
      );
      await client.unsafe(popupDismissSql);
    } finally {
      await close();
    }
  });
  async function seedActiveWorldEvent(
    worldEventRepo: Awaited<ReturnType<typeof buildTestApp>>['worldEventRepo'],
    worldClockService: Awaited<ReturnType<typeof buildTestApp>>['worldClockService'],
    input?: {
      templateId?: string;
      type?: string;
      scope?: string;
      effects?: Record<string, unknown>;
      title?: string;
      comuneLine?: string;
    },
  ) {
    const gameTime = await worldClockService.now();
    const gameTimeMs = Number(gameTime.worldTimeMs);
    const eventId = randomUUID();

    await worldEventRepo.createEvent({
      eventId,
      templateId: input?.templateId ?? 'demo_weather_heat_wave',
      scope: input?.scope ?? 'global',
      type: input?.type ?? 'weather',
      status: 'active',
      severity: 'moderate',
      title: input?.title ?? 'Ondata di caldo',
      body: 'Le temperature salgono.',
      comuneLine: input?.comuneLine ?? 'Anche l\'asfalto ha deciso di chiedere ferie.',
      startedAtGameMs: gameTimeMs - 1000,
      endsAtGameMs: gameTimeMs + 6 * 60 * 60 * 1000,
      effects: input?.effects ?? { taskContextMultipliers: { social: 1.18 } },
      idempotencyKey: `integration:${eventId}`,
    });

    return { eventId, gameTimeMs };
  }

  it('exposes active world events on home without duplicating notices on reload', async () => {
    const accountId = `test-world-events-home-${randomUUID()}`;
    const { app, worldEventRepo, worldClockService, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'World Event Citizen', gender: 'female', age: 32 },
      });

      const { eventId } = await seedActiveWorldEvent(worldEventRepo, worldClockService);

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(home.statusCode).toBe(200);
      const body = home.json() as {
        worldEvents: { enabled: boolean; activeEvents: Array<{ eventId: string; title: string }> };
      };
      expect(body.worldEvents.enabled).toBe(true);
      const seededEvent = body.worldEvents.activeEvents.find((event) => event.eventId === eventId);
      expect(seededEvent).toBeTruthy();
      expect(seededEvent?.title).toBe('Ondata di caldo');

      const reload = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const reloaded = reload.json() as {
        worldEvents: { activeEvents: Array<{ eventId: string }> };
      };
      expect(reloaded.worldEvents.activeEvents.filter((event) => event.eventId === eventId)).toHaveLength(1);

      const dismiss = await app.inject({
        method: 'POST',
        url: `/api/v1/world-events/${eventId}/dismiss-popup`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
      });
      expect(dismiss.statusCode).toBe(200);

      const afterDismiss = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const dismissedBody = afterDismiss.json() as {
        worldEvents: { activeEvents: Array<{ eventId: string }> };
      };
      expect(dismissedBody.worldEvents.activeEvents.some((event) => event.eventId === eventId)).toBe(false);
    } finally {
      await close();
    }
  });

  it('records task selection world event audit when an event is active', async () => {
    const accountId = `test-world-events-task-${randomUUID()}`;
    const { app, worldEventRepo, worldClockService, taskRepo, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'World Event Task', gender: 'male', age: 40 },
      });
      const created = create.json() as { citizenId: string; demoTaskInstanceId: string };

      await seedActiveWorldEvent(worldEventRepo, worldClockService, {
        effects: { taskContextMultipliers: { social: 1.25 } },
      });

      const complete = await completeStandardTask(
        app,
        login.sessionCookie,
        created.demoTaskInstanceId,
        'help',
      );
      expect(complete.statusCode).toBe(200);

      const tasks = await taskRepo.findActiveByCitizenId(created.citizenId);
      const withAudit = tasks.find((task) => {
        const audit = task.context.selectionAudit as { worldEvent?: { activeEventIds: string[] } } | undefined;
        return audit?.worldEvent?.activeEventIds?.length;
      });

      expect(withAudit).toBeTruthy();
    } finally {
      await close();
    }
  });

  it('ends events based on game time', async () => {
    const accountId = `test-world-events-end-${randomUUID()}`;
    const { app, worldEventRepo, worldClockService, worldEventService, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'World Event End', gender: 'female', age: 29 },
      });

      const gameTime = await worldClockService.now();
      const gameTimeMs = Number(gameTime.worldTimeMs);
      const eventId = randomUUID();

      await worldEventRepo.createEvent({
        eventId,
        templateId: 'demo_weather_heat_wave',
        scope: 'global',
        type: 'weather',
        status: 'active',
        severity: 'moderate',
        title: 'Breve caldo',
        body: 'Caldo breve',
        startedAtGameMs: gameTimeMs - 2000,
        endsAtGameMs: gameTimeMs - 1,
        effects: {},
        idempotencyKey: `ended:${eventId}`,
      });

      await worldEventService.evaluateScheduler(gameTimeMs);
      const active = await worldEventService.getActiveEvents(gameTimeMs);
      expect(active.some((event) => event.eventId === eventId)).toBe(false);

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const body = home.json() as {
        worldEvents: { activeEvents: Array<{ eventId: string }> };
      };
      expect(body.worldEvents.activeEvents.some((event) => event.eventId === eventId)).toBe(false);
    } finally {
      await close();
    }
  });

  it('supports global and local event scopes in persistence', async () => {
    const { worldEventRepo, worldClockService, close } = await buildTestApp();

    try {
      const gameTime = await worldClockService.now();
      const gameTimeMs = Number(gameTime.worldTimeMs);

      const global = await worldEventRepo.createEvent({
        eventId: randomUUID(),
        templateId: 'demo_weather_heat_wave',
        scope: 'global',
        type: 'weather',
        status: 'active',
        severity: 'moderate',
        title: 'Global',
        body: 'Global',
        startedAtGameMs: gameTimeMs,
        endsAtGameMs: gameTimeMs + 1000,
        effects: {},
        idempotencyKey: `global:${randomUUID()}`,
      });

      const local = await worldEventRepo.createEvent({
        eventId: randomUUID(),
        templateId: 'demo_infrastructure_transport_disruption',
        scope: 'local',
        type: 'infrastructure',
        status: 'active',
        severity: 'moderate',
        title: 'Local',
        body: 'Local',
        startedAtGameMs: gameTimeMs,
        endsAtGameMs: gameTimeMs + 1000,
        effects: {},
        idempotencyKey: `local:${randomUUID()}`,
        zoneId: 'district_center',
      });

      expect(global.record.scope).toBe('global');
      expect(local.record.scope).toBe('local');
      expect(local.record.zoneId).toBe('district_center');
    } finally {
      await close();
    }
  });
});
