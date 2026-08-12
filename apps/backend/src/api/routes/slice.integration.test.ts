import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import { buildTestApp, completeStandardTask, loginAs, withIdempotency, withSession } from '../../test/test-app.js';
import { MEGA1_ELDERLY_HELP_PERSONAL_VALUES, MEGA1_ELDERLY_IGNORE_PERSONAL_VALUES } from '../../test/mega1-elderly-task-expectations.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('vertical slice persistence', () => {
  it('persists citizen, task, and personal values across reload', async () => {
    const accountId = `test-persist-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      expect(login.statusCode).toBe(200);

      const idempotencyKey = randomUUID();
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(idempotencyKey),
        },
        payload: {
          displayName: 'Test Citizen',
          gender: 'female',
          age: 28,
        },
      });
      expect(createResponse.statusCode).toBe(200);
      const created = createResponse.json() as { citizenId: string; demoTaskInstanceId: string };

      const homeResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(homeResponse.statusCode).toBe(200);
      const home = homeResponse.json() as {
        personalValues: { sympathy: number; reputation: number };
        balance: { availableCash: { amountMinor: string; currency: string } };
        activeTasks: Array<{ taskInstanceId: string }>;
      };
      expect(home.personalValues).toEqual(expect.objectContaining({ sympathy: 0, reputation: 0, happiness: 0 }));
      expect(home.balance.availableCash).toEqual({
        amountMinor: '100',
        currency: 'game_currency',
      });
      expect(home.activeTasks[0]?.taskInstanceId).toBe(created.demoTaskInstanceId);

      const completeResponse = await completeStandardTask(app, login.sessionCookie, created.demoTaskInstanceId, 'help');
      expect(completeResponse.statusCode).toBe(200);

      const reloadResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const reloaded = reloadResponse.json() as {
        personalValues: { sympathy: number; reputation: number };
        balance: { availableCash: { amountMinor: string } };
        activeTasks: unknown[];
      };
      expect(reloaded.personalValues).toEqual(
        expect.objectContaining(MEGA1_ELDERLY_HELP_PERSONAL_VALUES),
      );
      expect(reloaded.balance.availableCash.amountMinor).toBe('100');
      expect(reloaded.activeTasks).toHaveLength(1);
      expect(
        (reloaded.activeTasks[0] as { taskId: string }).taskId,
      ).toBe(DEMO_BOSS_GREETING_DEFINITION_ID);
    } finally {
      await close();
    }
  });

  it('persists ignore completion without changing personal values', async () => {
    const accountId = `test-persist-ignore-${randomUUID()}`;
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
          displayName: 'Ignore Citizen',
          gender: 'male',
          age: 31,
        },
      });
      const created = createResponse.json() as { demoTaskInstanceId: string };

      const completeResponse = await completeStandardTask(app, login.sessionCookie, created.demoTaskInstanceId, 'ignore');
      expect(completeResponse.statusCode).toBe(200);
      expect(completeResponse.json()).toMatchObject({ optionId: 'ignore' });

      const reloadResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const reloaded = reloadResponse.json() as {
        personalValues: { sympathy: number; reputation: number };
        balance: { availableCash: { amountMinor: string } };
        activeTasks: unknown[];
      };
      expect(reloaded.personalValues).toEqual(
        expect.objectContaining(MEGA1_ELDERLY_IGNORE_PERSONAL_VALUES),
      );
      expect(reloaded.balance.availableCash.amountMinor).toBe('100');
      expect(reloaded.activeTasks).toHaveLength(1);
      expect(
        (reloaded.activeTasks[0] as { taskId: string }).taskId,
      ).toBe(DEMO_BOSS_GREETING_DEFINITION_ID);
    } finally {
      await close();
    }
  });
});
