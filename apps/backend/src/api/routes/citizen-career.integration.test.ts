import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildTestApp, loginAs, withIdempotency, withSession } from '../../test/test-app.js';
import { LEVEL_POINT_THRESHOLDS } from '../../slice/citizen-progression-constants.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('citizen career integration', () => {
  it('seeds demo career affinities for new citizens', async () => {
    const accountId = `test-career-seed-${randomUUID()}`;
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
        payload: { displayName: 'Career Seed', gender: 'male', age: 29 },
      });

      const career = await app.inject({
        method: 'GET',
        url: '/api/v1/career',
        headers: withSession(login.sessionCookie),
      });

      expect(career.statusCode).toBe(200);
      const body = career.json() as {
        career: {
          affinities: Array<{ careerId: string; affinity: number }>;
          currentCareerId: string | null;
        };
      };
      expect(body.career.affinities).toHaveLength(3);
      expect(body.career.affinities.every((a) => a.affinity === 0)).toBe(true);
      expect(body.career.currentCareerId).toBeNull();
    } finally {
      await close();
    }
  });

  it('switches career after affinity threshold and significant action streak', async () => {
    const accountId = `test-career-switch-${randomUUID()}`;
    const { app, careerProgressionService, citizenCareerRepo, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Career Switch', gender: 'male', age: 33 },
      });
      const created = create.json() as { citizenId: string };
      const citizenId = created.citizenId;

      await citizenCareerRepo.ensureSeeded(citizenId);
      await citizenCareerRepo.setAffinity(citizenId, 'medicina', 30);
      await citizenCareerRepo.setAffinity(citizenId, 'criminalita', 0);
      await citizenCareerRepo.updateState({
        citizenId,
        currentCareerId: 'medicina',
        currentGradeIndex: 2,
      });

      await careerProgressionService.applyAffinityDeltas({
        citizenId,
        deltas: { criminalita: 50 },
        source: 'test:career_switch:threshold',
      });

      for (let i = 0; i < 4; i += 1) {
        await careerProgressionService.applyAffinityDeltas({
          citizenId,
          deltas: { criminalita: 1 },
          source: `test:career_switch:streak:${i}`,
        });
      }

      const career = await app.inject({
        method: 'GET',
        url: '/api/v1/career',
        headers: withSession(login.sessionCookie),
      });

      expect(career.statusCode).toBe(200);
      const body = career.json() as {
        career: {
          currentCareerId: string | null;
          currentGradeIndex: number;
          pendingSwitchStreak: number;
        };
      };
      expect(body.career.currentCareerId).toBe('criminalita');
      expect(body.career.currentGradeIndex).toBe(1);
      expect(body.career.pendingSwitchStreak).toBe(0);
    } finally {
      await close();
    }
  });

  it('exposes career data on home summary', async () => {
    const accountId = `test-career-home-${randomUUID()}`;
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
        payload: { displayName: 'Career Home', gender: 'female', age: 31 },
      });

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });

      const body = home.json() as {
        globalProgression: { level: number; globalXp: number };
        career: { affinities: unknown[] };
        citizenProfile: { progression: { globalXp: number } };
      };

      expect(body.globalProgression.level).toBe(1);
      expect(body.globalProgression.globalXp).toBe(0);
      expect(body.citizenProfile.progression.globalXp).toBe(0);
      expect(body.career.affinities).toHaveLength(3);
    } finally {
      await close();
    }
  });
});

describe.skipIf(!hasDatabase)('citizen progression levels 11–20', () => {
  it('levels up to 11 when crossing new threshold', async () => {
    const accountId = `test-progression-l11-${randomUUID()}`;
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
        payload: { displayName: 'Progression L11', gender: 'male', age: 34 },
      });
      const created = create.json() as { citizenId: string };

      await citizenRepo.applyProgressionGrant({
        grantId: randomUUID(),
        citizenId: created.citizenId,
        idempotencyKey: `test:seed:l11:${created.citizenId}`,
        pointsGranted: LEVEL_POINT_THRESHOLDS[11]! - 5,
        sourceType: 'test_seed',
      });

      const gameTime = await worldClockService.now();
      await citizenProgressionService.grantProgression({
        citizenId: created.citizenId,
        idempotencyKey: `test:l11:push:${created.citizenId}`,
        points: 10,
        sourceType: 'test_seed',
        worldTimeMs: Number(gameTime.worldTimeMs) + 1,
      });

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const body = home.json() as {
        level: { level: number };
        globalProgression: { level: number; globalXp: number };
      };

      expect(body.level.level).toBe(11);
      expect(body.globalProgression.level).toBe(11);
      expect(body.globalProgression.globalXp).toBeGreaterThanOrEqual(LEVEL_POINT_THRESHOLDS[11]!);
    } finally {
      await close();
    }
  });
});
