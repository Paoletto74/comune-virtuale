import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildTestApp, completeStandardTask, loginAs, startStandardTask, withIdempotency, withSession } from '../../test/test-app.js';
import { resolveDemoElderlyNpcWalletMinor } from '../../application/economy/demo-npc-wallet-seeder.js';
import { resolveDemoStealRequestedAmountMinor } from '../../application/economy/demo-steal-amount-resolver.js';
import {
  MEGA1_ELDERLY_HELP_PERSONAL_VALUES,
  MEGA1_ELDERLY_IGNORE_PERSONAL_VALUES,
} from '../../test/mega1-elderly-task-expectations.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('vertical slice API', () => {
  it('POST /api/v1/citizens creates citizen', async () => {
    const accountId = `test-create-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {
          displayName: 'Maria Rossi',
          gender: 'female',
          age: 35,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as { success: boolean; citizenId: string; demoTaskInstanceId: string };
      expect(body.success).toBe(true);
      expect(body.citizenId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(body.demoTaskInstanceId).toBeTruthy();
    } finally {
      await close();
    }
  });

  it('POST complete task applies sympathy and reputation', async () => {
    const accountId = `test-complete-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Luigi', gender: 'male', age: 40 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      const response = await completeStandardTask(app, login.sessionCookie, demoTaskInstanceId, 'help');

      expect(response.statusCode).toBe(200);
      const body = response.json() as {
        personalValues: { sympathy: number; reputation: number };
        effectsApplied: {
          personalValues: { sympathy: number; reputation: number };
          economic: { cash: { deltaMinor: string; currency: string } };
        };
        economic: { cash: { amountMinor: string; currency: string } };
      };
      expect(body.personalValues).toEqual(
        expect.objectContaining(MEGA1_ELDERLY_HELP_PERSONAL_VALUES),
      );
      expect(body.effectsApplied.personalValues).toEqual(
        expect.objectContaining(MEGA1_ELDERLY_HELP_PERSONAL_VALUES),
      );
      expect(body.effectsApplied.economic.cash).toEqual({
        deltaMinor: '0',
        currency: 'game_currency',
      });
      expect(body.economic.cash.amountMinor).toBe('100');
    } finally {
      await close();
    }
  });

  it('POST /api/v1/citizens grants STARTER_CASH=100', async () => {
    const accountId = `test-starter-${randomUUID()}`;
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
        payload: { displayName: 'Starter Test', gender: 'male', age: 25 },
      });

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });

      expect(home.statusCode).toBe(200);
      expect(home.json()).toMatchObject({
        balance: {
          availableCash: { amountMinor: '100', currency: 'game_currency' },
        },
      });
    } finally {
      await close();
    }
  });

  it('idempotency on citizen creation does not duplicate starter cash', async () => {
    const accountId = `test-starter-idem-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const idempotencyKey = randomUUID();

    try {
      const login = await loginAs(app, accountId);
      const headers = {
        ...withSession(login.sessionCookie),
        ...withIdempotency(idempotencyKey),
      };
      const payload = { displayName: 'Starter Idem', gender: 'female', age: 30 };

      await app.inject({ method: 'POST', url: '/api/v1/citizens', headers, payload });
      await app.inject({ method: 'POST', url: '/api/v1/citizens', headers, payload });

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(home.json()).toMatchObject({
        balance: { availableCash: { amountMinor: '100' } },
      });
    } finally {
      await close();
    }
  });

  it('POST complete task with ignore leaves personal values unchanged', async () => {
    const accountId = `test-ignore-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Giulia', gender: 'female', age: 32 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      const response = await completeStandardTask(app, login.sessionCookie, demoTaskInstanceId, 'ignore');

      expect(response.statusCode).toBe(200);
      const body = response.json() as {
        optionId: string;
        personalValues: { sympathy: number; reputation: number };
        effectsApplied: {
          personalValues: { sympathy: number; reputation: number };
          economic: { cash: { deltaMinor: string; currency: string } };
        };
        economic: { cash: { amountMinor: string; currency: string } };
      };
      expect(body.optionId).toBe('ignore');
      expect(body.personalValues).toEqual(
        expect.objectContaining(MEGA1_ELDERLY_IGNORE_PERSONAL_VALUES),
      );
      expect(body.effectsApplied.economic.cash).toEqual({
        deltaMinor: '0',
        currency: 'game_currency',
      });
      expect(body.economic.cash.amountMinor).toBe('100');
    } finally {
      await close();
    }
  });

  it('idempotency on help complete does not duplicate taskReward cash', async () => {
    const accountId = `test-help-idem-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const idempotencyKey = randomUUID();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Help Idem', gender: 'male', age: 33 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);
      const payload = { optionId: 'help' };

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload,
      });

      const headers = {
        ...withSession(login.sessionCookie),
        ...withIdempotency(idempotencyKey),
      };

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers,
        payload,
      });
      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers,
        payload,
      });

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(home.json()).toMatchObject({
        personalValues: {
          sympathy: MEGA1_ELDERLY_HELP_PERSONAL_VALUES.sympathy,
          reputation: MEGA1_ELDERLY_HELP_PERSONAL_VALUES.reputation,
        },
        balance: { availableCash: { amountMinor: '100' } },
      });
    } finally {
      await close();
    }
  });

  it('idempotency replays ignore complete response', async () => {
    const accountId = `test-idem-ignore-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const idempotencyKey = randomUUID();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Idem Ignore', gender: 'male', age: 29 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);
      const payload = { optionId: 'ignore' };

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload,
      });

      const headers = {
        ...withSession(login.sessionCookie),
        ...withIdempotency(idempotencyKey),
      };

      const first = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers,
        payload,
      });
      const second = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers,
        payload,
      });

      expect(first.statusCode).toBe(200);
      expect(second.statusCode).toBe(200);
      expect(second.json()).toEqual(first.json());

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(home.json()).toMatchObject({
        personalValues: { sympathy: 0, reputation: 0 },
      });
    } finally {
      await close();
    }
  });

  it('POST complete steal_wallet transfers NPC cash to player', async () => {
    const accountId = `test-steal-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Steal Test', gender: 'male', age: 25 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };
      const walletMinor = resolveDemoElderlyNpcWalletMinor(demoTaskInstanceId);
      const requestedMinor = resolveDemoStealRequestedAmountMinor(walletMinor);

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'steal_wallet' },
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'steal_wallet' },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as {
        optionId: string;
        personalValues: { sympathy: number; reputation: number };
        effectsApplied: {
          personalValues: { sympathy: number; reputation: number };
          economic: { cash: { deltaMinor: string; currency: string } };
        };
        economic: { cash: { amountMinor: string } };
      };
      expect(body.optionId).toBe('steal_wallet');
      expect(body.personalValues).toEqual(
        expect.objectContaining({ sympathy: 0, reputation: 0, stress: 1, happiness: 0 }),
      );
      expect(body.effectsApplied.personalValues).toEqual(
        expect.objectContaining({ sympathy: -1, reputation: -1, stress: 1, happiness: -1 }),
      );
      expect(body.effectsApplied.economic.cash.deltaMinor).toBe(requestedMinor.toString());
      expect(body.economic.cash.amountMinor).toBe((100n + requestedMinor).toString());
    } finally {
      await close();
    }
  });

  it('idempotency on steal_wallet complete does not duplicate transfer', async () => {
    const accountId = `test-steal-idem-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const idempotencyKey = randomUUID();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Steal Idem', gender: 'female', age: 27 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };
      const requestedMinor = resolveDemoStealRequestedAmountMinor(
        resolveDemoElderlyNpcWalletMinor(demoTaskInstanceId),
      );
      const payload = { optionId: 'steal_wallet' };

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload,
      });

      const headers = {
        ...withSession(login.sessionCookie),
        ...withIdempotency(idempotencyKey),
      };

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers,
        payload,
      });
      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers,
        payload,
      });

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(home.json()).toMatchObject({
        personalValues: { sympathy: 0, reputation: 0, happiness: 0 },
        balance: { availableCash: { amountMinor: (100n + requestedMinor).toString() } },
      });
    } finally {
      await close();
    }
  });

  it('GET /api/v1/tasks/active exposes help, ignore and steal_wallet options', async () => {
    const accountId = `test-options-${randomUUID()}`;
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
        payload: { displayName: 'Options Test', gender: 'female', age: 27 },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/active',
        headers: withSession(login.sessionCookie),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as {
        tasks: Array<{ options: Array<{ optionId: string; label: string }> }>;
      };
      expect(body.tasks[0]?.options).toEqual([
        {
          optionId: 'help',
          label: 'La aiuti',
          presentationHint: 'action',
          statEffects: expect.objectContaining({ sympathy: 1, reputation: 1, health: 1, civicParticipation: 1 }),
          attributePreview: expect.objectContaining({
            preview: expect.objectContaining({
              sympathy: expect.objectContaining({ before: 0, after: 8 }),
            }),
          }),
        },
        {
          optionId: 'ignore',
          label: 'La ignori',
          presentationHint: 'action',
          statEffects: expect.objectContaining({ stress: 1, happiness: -1 }),
          attributePreview: expect.objectContaining({
            preview: expect.objectContaining({
              reputation: expect.objectContaining({ before: 0, after: 0 }),
            }),
          }),
        },
        {
          optionId: 'steal_wallet',
          label: 'Le rubi il portafoglio',
          presentationHint: 'action',
          statEffects: expect.objectContaining({
            sympathy: -1,
            reputation: -1,
            stress: 1,
            happiness: -1,
            cashMinor: '10',
          }),
        },
      ]);
    } finally {
      await close();
    }
  });

  it('idempotency replays citizen creation response', async () => {
    const accountId = `test-idem-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const idempotencyKey = randomUUID();

    try {
      const login = await loginAs(app, accountId);
      const headers = {
        ...withSession(login.sessionCookie),
        ...withIdempotency(idempotencyKey),
      };
      const payload = { displayName: 'Idem Test', gender: 'other', age: 22 };

      const first = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers,
        payload,
      });
      const second = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers,
        payload,
      });

      expect(first.statusCode).toBe(200);
      expect(second.statusCode).toBe(200);
      expect(second.json()).toEqual(first.json());
    } finally {
      await close();
    }
  });

  it('propagates correlation id on mutations', async () => {
    const accountId = `test-corr-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const correlationId = randomUUID();

    try {
      const login = await loginAs(app, accountId);
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
          'x-correlation-id': correlationId,
        },
        payload: { displayName: 'Corr Test', gender: 'male', age: 30 },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['x-correlation-id']).toBe(correlationId);
      expect(response.json()).toMatchObject({ correlationId });
    } finally {
      await close();
    }
  });
});
