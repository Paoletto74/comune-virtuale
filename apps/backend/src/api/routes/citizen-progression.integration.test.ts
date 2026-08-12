import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildTestApp, completeStandardTask, loginAs, withIdempotency, withSession } from '../../test/test-app.js';
import { LEVEL_POINT_THRESHOLDS } from '../../slice/citizen-progression-constants.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('citizen progression integration', () => {
  it('starts at level 1 with zero progression points', async () => {
    const accountId = `test-progression-start-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Progression Start', gender: 'male', age: 30 },
      });

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(home.statusCode).toBe(200);
      const body = home.json() as {
        level: { level: number };
        citizenProfile: { progression: { level: number; progressToNextLevel?: number } };
        levelUpNotice: unknown;
      };
      expect(body.level.level).toBe(1);
      expect(body.citizenProfile.progression.level).toBe(1);
      expect(body.citizenProfile.progression.progressToNextLevel).toBe(0);
      expect(body.levelUpNotice).toBeNull();
    } finally {
      await close();
    }
  });

  it('grants progression on task completion and persists across reload', async () => {
    const accountId = `test-progression-task-${randomUUID()}`;
    const { app, citizenRepo, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Progression Task', gender: 'female', age: 28 },
      });
      const created = create.json() as { demoTaskInstanceId: string; citizenId: string };

      const complete = await completeStandardTask(
        app,
        login.sessionCookie,
        created.demoTaskInstanceId,
        'help',
      );
      expect(complete.statusCode).toBe(200);

      const progression = await citizenRepo.getProgression(created.citizenId);
      expect(progression?.progressionPoints ?? 0).toBeGreaterThan(0);

      const reloaded = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const home = reloaded.json() as {
        citizenProfile: { progression: { progressToNextLevel?: number } };
      };
      expect(home.citizenProfile.progression.progressToNextLevel).toBeGreaterThan(0);
    } finally {
      await close();
    }
  });

  it('does not duplicate progression grants on idempotent replay', async () => {
    const accountId = `test-progression-idempotent-${randomUUID()}`;
    const { app, citizenRepo, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Progression Idempotent', gender: 'male', age: 35 },
      });
      const created = create.json() as { demoTaskInstanceId: string; citizenId: string };
      const idempotencyKey = randomUUID();

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${created.demoTaskInstanceId}/start`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {},
      });

      const first = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${created.demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(idempotencyKey),
        },
        payload: { optionId: 'help' },
      });
      expect(first.statusCode).toBe(200);

      const afterFirst = await citizenRepo.getProgression(created.citizenId);
      const pointsAfterFirst = afterFirst?.progressionPoints ?? 0;

      const replay = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${created.demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(idempotencyKey),
        },
        payload: { optionId: 'help' },
      });
      expect(replay.statusCode).toBe(200);

      const afterReplay = await citizenRepo.getProgression(created.citizenId);
      expect(afterReplay?.progressionPoints).toBe(pointsAfterFirst);
    } finally {
      await close();
    }
  });

  it('levels up once when crossing a threshold and exposes a Comune notice', async () => {
    const accountId = `test-progression-levelup-${randomUUID()}`;
    const { app, citizenRepo, citizenProgressionService, worldClockService, close } =
      await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Progression LevelUp', gender: 'female', age: 33 },
      });
      const created = create.json() as { citizenId: string };

      await citizenRepo.applyProgressionGrant({
        grantId: randomUUID(),
        citizenId: created.citizenId,
        idempotencyKey: `test:seed:${created.citizenId}`,
        pointsGranted: LEVEL_POINT_THRESHOLDS[2]! - 10,
        sourceType: 'test_seed',
      });

      const homeBefore = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const before = homeBefore.json() as { level: { level: number }; levelUpNotice: unknown };
      expect(before.level.level).toBe(1);
      expect(before.levelUpNotice).toBeNull();

      const gameTimeAfterHome = await worldClockService.now();
      const levelUpWorldTimeMs = Number(gameTimeAfterHome.worldTimeMs) + 1;

      await citizenProgressionService.grantProgression({
        citizenId: created.citizenId,
        idempotencyKey: `test:levelup:${created.citizenId}`,
        points: 15,
        sourceType: 'test_seed',
        worldTimeMs: levelUpWorldTimeMs,
      });

      const homeAfter = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const after = homeAfter.json() as {
        level: { level: number };
        levelUpNotice: { level: number; title: string; body: string } | null;
        recentLifeEvents: Array<{ eventType: string }>;
      };

      expect(after.level.level).toBe(2);
      expect(after.levelUpNotice?.level).toBe(2);
      expect(after.levelUpNotice?.title).toContain('2');
      expect(after.levelUpNotice?.body.length).toBeGreaterThan(10);
      expect(after.recentLifeEvents.some((event) => event.eventType === 'level_up')).toBe(true);
    } finally {
      await close();
    }
  });
});
