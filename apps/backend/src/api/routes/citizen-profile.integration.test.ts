import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildTestApp, completeStandardTask, loginAs, withIdempotency, withSession } from '../../test/test-app.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('citizen profile persistence', () => {
  it('seeds profile on creation and keeps locked dimensions hidden', async () => {
    const accountId = `test-profile-create-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {
          displayName: 'Profile Citizen',
          gender: 'female',
          age: 34,
        },
      });
      expect(createResponse.statusCode).toBe(200);

      const homeResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(homeResponse.statusCode).toBe(200);

      const home = homeResponse.json() as {
        citizenProfile: {
          unlocked: Record<string, unknown>;
          locked: Array<{ id: string; label: string }>;
        };
        activeTasks: unknown[];
      };

      expect(home.citizenProfile.locked).toHaveLength(3);
      expect(home.citizenProfile.unlocked.work).toBeUndefined();
      expect(home.activeTasks.length).toBeGreaterThan(0);
    } finally {
      await close();
    }
  });

  it('persists profile across reload and re-login', async () => {
    const accountId = `test-profile-persist-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {
          displayName: 'Persist Citizen',
          gender: 'male',
          age: 41,
        },
      });
      const created = createResponse.json() as { demoTaskInstanceId: string };

      await completeStandardTask(app, login.sessionCookie, created.demoTaskInstanceId, 'help');

      const firstHome = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const first = firstHome.json() as {
        citizenProfile: {
          progression: { label: string };
          locked: Array<{ id: string }>;
        };
        personalValues: { sympathy: number; reputation: number };
      };

      const reloadHome = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const reloaded = reloadHome.json() as typeof first;
      expect(reloaded.citizenProfile.progression.label).toBe(first.citizenProfile.progression.label);
      expect(reloaded.personalValues).toEqual(first.personalValues);

      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: withSession(login.sessionCookie),
      });

      const relogin = await loginAs(app, accountId);
      const afterLoginHome = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(relogin.sessionCookie),
      });
      const afterLogin = afterLoginHome.json() as typeof first;
      expect(afterLogin.personalValues).toEqual(first.personalValues);
      expect(afterLogin.citizenProfile.locked.map((entry) => entry.id)).toEqual(
        first.citizenProfile.locked.map((entry) => entry.id),
      );
    } finally {
      await close();
    }
  });
});
