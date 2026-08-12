import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { createDatabase } from '../../infrastructure/db/client.js';
import { taskInstances } from '../../infrastructure/db/schema/index.js';
import { SLICE_DEMO_TASK_OPTION_HELP } from '../../slice/constants.js';
import { MEGA1_ELDERLY_HELP_SYMPATHY_DELTA } from '../../test/mega1-elderly-task-expectations.js';
import { buildTestApp, loginAs, startStandardTask, withIdempotency, withSession } from '../../test/test-app.js';
import type { TaskInstanceContext } from '../effects/effect-types.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

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

describe.skipIf(!hasDatabase)('V1-TASK-FLOW-AND-UI-POLISH-1 task flow', () => {
  it('start makes task interactive without readyAt', async () => {
    const accountId = `test-flow-start-${randomUUID()}`;
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
        payload: { displayName: 'Flow Start', gender: 'male', age: 30 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      const started = await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);
      expect(started.statusCode).toBe(200);
      const task = started.json().task as { feedState: string; readyAt?: string };
      expect(task.feedState).toBe('interactive');
      expect(task.readyAt).toBeUndefined();
    } finally {
      await close();
    }
  });

  it('choice commits action, sets readyAt, and finalize applies effects once', async () => {
    const accountId = `test-flow-commit-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Flow Commit', gender: 'female', age: 28 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);

      const homeBefore = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const sympathyBefore = homeBefore.json().personalValues.sympathy;

      const commit = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: SLICE_DEMO_TASK_OPTION_HELP },
      });

      expect(commit.statusCode).toBe(200);
      expect(commit.json()).toMatchObject({
        taskWaiting: true,
        optionId: SLICE_DEMO_TASK_OPTION_HELP,
      });
      expect(commit.json().effectsApplied.personalValues).toEqual({});

      await setReadyAt(db, demoTaskInstanceId, new Date(Date.now() + 60_000).toISOString());

      const homeAfterCommit = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(homeAfterCommit.json().personalValues.sympathy).toBe(sympathyBefore);
      expect(homeAfterCommit.json().activeTasks.some(
        (task: { taskInstanceId: string }) => task.taskInstanceId === demoTaskInstanceId,
      )).toBe(true);

      await setReadyAt(db, demoTaskInstanceId, new Date(Date.now() - 1_000).toISOString());

      const homeAfterAuto = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(homeAfterAuto.json().personalValues.sympathy).toBe(sympathyBefore + MEGA1_ELDERLY_HELP_SYMPATHY_DELTA);

      const finalize = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: SLICE_DEMO_TASK_OPTION_HELP },
      });
      expect(finalize.statusCode).toBe(409);

      const rows = await db
        .select()
        .from(taskInstances)
        .where(eq(taskInstances.taskInstanceId, demoTaskInstanceId));
      expect(rows[0]?.status).toBe('completed');
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });
});
