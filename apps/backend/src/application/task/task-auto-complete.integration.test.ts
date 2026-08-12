import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDatabase } from '../../infrastructure/db/client.js';
import { taskInstances } from '../../infrastructure/db/schema/index.js';
import { SLICE_DEMO_TASK_OPTION_HELP } from '../../slice/constants.js';
import { MEGA1_ELDERLY_HELP_SYMPATHY_DELTA } from '../../test/mega1-elderly-task-expectations.js';
import { FEED_VISIBLE_SIZE } from '../../slice/feed-constants.js';
import { buildTestApp, loginAs, startStandardTask, withIdempotency, withSession } from '../../test/test-app.js';
import type { TaskInstanceContext } from '../../application/effects/effect-types.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

async function createDemoCitizen(app: Awaited<ReturnType<typeof buildTestApp>>['app']) {
  const accountId = `test-auto-${randomUUID()}`;
  const login = await loginAs(app, accountId);
  const create = await app.inject({
    method: 'POST',
    url: '/api/v1/citizens',
    headers: {
      ...withSession(login.sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { displayName: 'Auto Complete', gender: 'male', age: 30 },
  });
  const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };
  return { login, demoTaskInstanceId };
}

async function commitChoice(
  app: Awaited<ReturnType<typeof buildTestApp>>['app'],
  sessionCookie: string,
  taskInstanceId: string,
  optionId: string,
) {
  await startStandardTask(app, sessionCookie, taskInstanceId);
  return app.inject({
    method: 'POST',
    url: `/api/v1/tasks/${taskInstanceId}/complete`,
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { optionId },
  });
}

async function setReadyAt(
  db: ReturnType<typeof createDatabase>['db'],
  taskInstanceId: string,
  readyAt: string,
) {
  const rows = await db
    .select()
    .from(taskInstances)
    .where(eq(taskInstances.taskInstanceId, taskInstanceId));
  const context = rows[0]!.context as TaskInstanceContext;
  await db
    .update(taskInstances)
    .set({
      context: {
        ...context,
        timing: {
          ...context.timing,
          readyAt,
        },
      },
    })
    .where(eq(taskInstances.taskInstanceId, taskInstanceId));
}

describe.skipIf(!hasDatabase)('V1-TASK-FLOW-AUTO-COMPLETE-FIX', () => {
  it('choice sets readyAt without applying effects', async () => {
    const { app, close } = await buildTestApp();

    try {
      const { login, demoTaskInstanceId } = await createDemoCitizen(app);
      const commit = await commitChoice(
        app,
        login.sessionCookie,
        demoTaskInstanceId,
        SLICE_DEMO_TASK_OPTION_HELP,
      );

      expect(commit.statusCode).toBe(200);
      expect(commit.json()).toMatchObject({
        taskWaiting: true,
        optionId: SLICE_DEMO_TASK_OPTION_HELP,
      });
      expect(commit.json().readyAt).toBeTruthy();
      expect(commit.json().effectsApplied.personalValues).toEqual({});
    } finally {
      await close();
    }
  });

  it('does not finalize before readyAt on GET home', async () => {
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);

    try {
      const { login, demoTaskInstanceId } = await createDemoCitizen(app);
      await commitChoice(app, login.sessionCookie, demoTaskInstanceId, SLICE_DEMO_TASK_OPTION_HELP);

      const future = new Date(Date.now() + 60_000).toISOString();
      await setReadyAt(db, demoTaskInstanceId, future);

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });

      expect(home.json().personalValues.sympathy).toBe(0);
      expect(home.json().activeTasks.some(
        (task: { taskInstanceId: string }) => task.taskInstanceId === demoTaskInstanceId,
      )).toBe(true);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('auto-finalizes after readyAt on GET home and applies effects once', async () => {
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);

    try {
      const { login, demoTaskInstanceId } = await createDemoCitizen(app);
      const homeBefore = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const sympathyBefore = homeBefore.json().personalValues.sympathy;

      await commitChoice(app, login.sessionCookie, demoTaskInstanceId, SLICE_DEMO_TASK_OPTION_HELP);
      await setReadyAt(db, demoTaskInstanceId, new Date(Date.now() - 1_000).toISOString());

      const homeAfter = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });

      expect(homeAfter.json().personalValues.sympathy).toBe(sympathyBefore + MEGA1_ELDERLY_HELP_SYMPATHY_DELTA);
      expect(homeAfter.json().activeTasks.some(
        (task: { taskInstanceId: string }) => task.taskInstanceId === demoTaskInstanceId,
      )).toBe(false);

      const rows = await db
        .select()
        .from(taskInstances)
        .where(eq(taskInstances.taskInstanceId, demoTaskInstanceId));
      expect(rows[0]?.status).toBe('completed');

      const homeRetry = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(homeRetry.json().personalValues.sympathy).toBe(sympathyBefore + MEGA1_ELDERLY_HELP_SYMPATHY_DELTA);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('refills feed and frees slot after auto-finalize', async () => {
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);

    try {
      const { login, demoTaskInstanceId } = await createDemoCitizen(app);
      const homeInitial = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const initialCount = homeInitial.json().activeTasks.length;

      await commitChoice(app, login.sessionCookie, demoTaskInstanceId, SLICE_DEMO_TASK_OPTION_HELP);
      await setReadyAt(db, demoTaskInstanceId, new Date(Date.now() - 1_000).toISOString());

      const homeAfter = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });

      expect(homeAfter.json().activeTasks.length).toBeGreaterThanOrEqual(
        Math.min(initialCount, FEED_VISIBLE_SIZE),
      );
      expect(homeAfter.json().activeTasks.length).toBeLessThanOrEqual(FEED_VISIBLE_SIZE);
      expect(
        homeAfter.json().activeTasks.every(
          (task: { feedState?: string }) => task.feedState !== 'ready',
        ),
      ).toBe(true);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('finalizes expired tasks independently', async () => {
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);

    try {
      const loginA = await loginAs(app, `test-auto-a-${randomUUID()}`);
      const createA = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(loginA.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Auto A', gender: 'male', age: 30 },
      });
      const { demoTaskInstanceId: taskA } = createA.json() as { demoTaskInstanceId: string };

      const loginB = await loginAs(app, `test-auto-b-${randomUUID()}`);
      const createB = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(loginB.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Auto B', gender: 'female', age: 28 },
      });
      const { demoTaskInstanceId: taskB } = createB.json() as { demoTaskInstanceId: string };

      await commitChoice(app, loginA.sessionCookie, taskA, SLICE_DEMO_TASK_OPTION_HELP);
      await commitChoice(app, loginB.sessionCookie, taskB, 'ignore');

      await setReadyAt(db, taskA, new Date(Date.now() - 2_000).toISOString());
      await setReadyAt(db, taskB, new Date(Date.now() - 1_000).toISOString());

      const homeA = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(loginA.sessionCookie),
      });
      const homeB = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(loginB.sessionCookie),
      });

      expect(homeA.json().activeTasks.some(
        (task: { taskInstanceId: string }) => task.taskInstanceId === taskA,
      )).toBe(false);
      expect(homeB.json().activeTasks.some(
        (task: { taskInstanceId: string }) => task.taskInstanceId === taskB,
      )).toBe(false);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('rejects manual finalize before readyAt', async () => {
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);

    try {
      const { login, demoTaskInstanceId } = await createDemoCitizen(app);
      await commitChoice(app, login.sessionCookie, demoTaskInstanceId, SLICE_DEMO_TASK_OPTION_HELP);
      await setReadyAt(db, demoTaskInstanceId, new Date(Date.now() + 60_000).toISOString());

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: SLICE_DEMO_TASK_OPTION_HELP },
      });

      expect(response.statusCode).toBe(409);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });
});
