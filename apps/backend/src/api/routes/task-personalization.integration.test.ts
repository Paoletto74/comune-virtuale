import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildTestApp, loginAs, withIdempotency, withSession } from '../../test/test-app.js';
import { defaultTaskPoolRegistry } from '../../application/task/task-pool-registry.js';
import { PROFILE_VALUE_KEYS, OCCUPATION_CODES } from '../../slice/citizen-profile-constants.js';
import { FEED_VISIBLE_SIZE } from '../../slice/feed-constants.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('task personalization integration', () => {
  it('stores personalization audit when selecting from a multi-entry pool', async () => {
    const accountId = `test-personalization-${randomUUID()}`;
    const { app, close, citizenRepo, taskRepo } = await buildTestApp({
      poolRegistry: defaultTaskPoolRegistry,
    });

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
          displayName: 'Personalized Citizen',
          gender: 'female',
          age: 34,
        },
      });
      expect(createResponse.statusCode).toBe(200);
      const created = createResponse.json() as { citizenId: string };

      await citizenRepo.setPersonalValues(created.citizenId, {
        [PROFILE_VALUE_KEYS.occupation]: OCCUPATION_CODES.insegnante,
        [PROFILE_VALUE_KEYS.unlockWork]: 1,
        [PROFILE_VALUE_KEYS.unlockLiving]: 1,
        [PROFILE_VALUE_KEYS.unlockPersonal]: 1,
      });

      const instances = await taskRepo.findAllByCitizenId(created.citizenId);
      const audited = instances.find(
        (instance) =>
          (instance.context.selectionAudit as { personalization?: unknown } | undefined)
            ?.personalization,
      );

      expect(audited).toBeTruthy();
    } finally {
      await close();
    }
  });

  it('keeps feed limits intact with personalization enabled', async () => {
    const accountId = `test-personalization-feed-${randomUUID()}`;
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
        payload: {
          displayName: 'Feed Citizen',
          gender: 'male',
          age: 29,
        },
      });

      const homeResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const home = homeResponse.json() as { activeTasks: unknown[] };
      expect(home.activeTasks.length).toBeLessThanOrEqual(FEED_VISIBLE_SIZE);
    } finally {
      await close();
    }
  });

  it('persists personalization behavior across reload and re-login', async () => {
    const accountId = `test-personalization-session-${randomUUID()}`;
    const { app, close, taskRepo } = await buildTestApp();

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
          displayName: 'Session Citizen',
          gender: 'other',
          age: 40,
        },
      });
      const created = createResponse.json() as { citizenId: string };

      const before = await taskRepo.findAllByCitizenId(created.citizenId);
      expect(before.length).toBeGreaterThan(0);

      await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });

      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: withSession(login.sessionCookie),
      });

      const relogin = await loginAs(app, accountId);
      const afterHome = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(relogin.sessionCookie),
      });
      expect(afterHome.statusCode).toBe(200);

      const after = await taskRepo.findAllByCitizenId(created.citizenId);
      expect(after.length).toBe(before.length);
    } finally {
      await close();
    }
  });
});
