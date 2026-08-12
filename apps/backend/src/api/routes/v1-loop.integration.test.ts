import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createElderlyOnlyPoolRegistry } from '../../application/task/task-pool-registry.js';
import { createDatabase } from '../../infrastructure/db/client.js';
import { taskInstances } from '../../infrastructure/db/schema/index.js';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import { BOSS_DIALOGUE_PATH_NEUTRAL } from '../../slice/boss-dialogue-constants.js';
import {
  DEMO_FOUND_WALLET_DEFINITION_ID,
  DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
  DEMO_SUITCASE_OFFER_DEFINITION_ID,
} from '../../slice/c3-pilot-tasks-constants.js';
import { SLICE_DEMO_TASK_DEFINITION_ID } from '../../slice/constants.js';
import { POOL_AFTER_TASK } from '../../slice/task-pool-constants.js';
import { ANTI_STALL_TASK_DEFINITION_IDS } from '../../slice/anti-stall-tasks-constants.js';
import { walkBossDialoguePath } from '../../test/dialogue-test-helpers.js';
import { buildTestApp, completeStandardTask, loginAs, startStandardTask, withIdempotency, withSession } from '../../test/test-app.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

const COMPLETE_OPTIONS: Record<string, string> = {
  DEMO_ELDERLY_CROSSING: 'ignore',
  DEMO_NEIGHBOR_FAVOR: 'ignore',
  DEMO_SUITCASE_OFFER: 'refuse',
  DEMO_FOUND_WALLET: 'return_wallet',
};

const ONCE_TASK_DEFINITION_IDS = new Set([
  SLICE_DEMO_TASK_DEFINITION_ID,
  DEMO_BOSS_GREETING_DEFINITION_ID,
  DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
  DEMO_SUITCASE_OFFER_DEFINITION_ID,
  DEMO_FOUND_WALLET_DEFINITION_ID,
]);

describe.skipIf(!hasDatabase)('V1-LOOP-1 session loop', () => {
  it('elderly path completes once tasks then keeps anti-stall progression', async () => {
    const accountId = `test-v1-loop-elderly-${randomUUID()}`;
    const { app, close } = await buildTestApp({ poolRegistry: createElderlyOnlyPoolRegistry() });
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
        payload: { displayName: 'Loop Elderly', gender: 'male', age: 30 },
      });
      expect(create.statusCode).toBe(200);
      const { citizenId } = create.json() as { citizenId: string; demoTaskInstanceId: string };

      const completedOnce = new Set<string>();
      let guard = 0;
      while (completedOnce.size < 5 && guard < 30) {
        guard += 1;
        const home = await app.inject({
          method: 'GET',
          url: '/api/v1/home',
          headers: withSession(login.sessionCookie),
        });
        const activeTasks = (home.json() as {
          activeTasks: Array<{
            taskInstanceId: string;
            taskId: string;
            taskKind?: string;
            feedState?: string;
          }>;
        }).activeTasks;
        if (activeTasks.length === 0) break;

        const bossTask = activeTasks.find((entry) => entry.taskId === DEMO_BOSS_GREETING_DEFINITION_ID);
        if (bossTask) {
          await walkBossDialoguePath(app, login.sessionCookie, BOSS_DIALOGUE_PATH_NEUTRAL);
          completedOnce.add(DEMO_BOSS_GREETING_DEFINITION_ID);
          continue;
        }

        const task =
          activeTasks.find(
            (entry) =>
              ONCE_TASK_DEFINITION_IDS.has(entry.taskId) &&
              !completedOnce.has(entry.taskId) &&
              entry.taskKind !== 'dialogue_step' &&
              entry.taskKind !== 'dialogue_terminal',
          ) ??
          activeTasks.find(
            (entry) => entry.taskKind !== 'dialogue_step' && entry.taskKind !== 'dialogue_terminal',
          );
        if (!task || !ONCE_TASK_DEFINITION_IDS.has(task.taskId)) {
          continue;
        }
        if (completedOnce.has(task.taskId)) {
          continue;
        }
        if (task.feedState === 'available') {
          const started = await startStandardTask(app, login.sessionCookie, task.taskInstanceId);
          expect(started.statusCode).toBe(200);
          continue;
        }

        const optionId = COMPLETE_OPTIONS[task.taskId] ?? 'ignore';
        const complete = await completeStandardTask(
          app,
          login.sessionCookie,
          task.taskInstanceId,
          optionId,
        );
        expect(complete.statusCode).toBe(200);
        completedOnce.add(task.taskId);
      }

      expect(completedOnce.size).toBe(5);

      const rows = await db
        .select()
        .from(taskInstances)
        .where(eq(taskInstances.citizenId, citizenId));
      const completed = rows.filter((row) => row.status === 'completed');
      expect(completed.length).toBeGreaterThanOrEqual(5);
      const completedDefinitionIds = new Set(completed.map((row) => row.definitionId));
      expect(completedDefinitionIds.has(SLICE_DEMO_TASK_DEFINITION_ID)).toBe(true);
      expect(completedDefinitionIds.has(DEMO_BOSS_GREETING_DEFINITION_ID)).toBe(true);
      expect(completedDefinitionIds.has(DEMO_NEIGHBOR_FAVOR_DEFINITION_ID)).toBe(true);
      expect(completedDefinitionIds.has(DEMO_SUITCASE_OFFER_DEFINITION_ID)).toBe(true);
      expect(completedDefinitionIds.has(DEMO_FOUND_WALLET_DEFINITION_ID)).toBe(true);

      const homeFinal = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const finalTasks = (homeFinal.json() as { activeTasks: Array<{ taskId: string }> }).activeTasks;
      expect(finalTasks.length).toBeGreaterThan(0);
      expect(
        finalTasks.some((entry) =>
          (ANTI_STALL_TASK_DEFINITION_IDS as readonly string[]).includes(entry.taskId),
        ),
      ).toBe(true);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('boss complete selection audit references POOL_AFTER_TASK', async () => {
    const accountId = `test-v1-loop-audit-${randomUUID()}`;
    const { app, close } = await buildTestApp({ poolRegistry: createElderlyOnlyPoolRegistry() });
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
        payload: { displayName: 'Loop Audit', gender: 'female', age: 27 },
      });
      const { demoTaskInstanceId, citizenId } = create.json() as {
        demoTaskInstanceId: string;
        citizenId: string;
      };

      await completeStandardTask(app, login.sessionCookie, demoTaskInstanceId, 'help');

      await walkBossDialoguePath(app, login.sessionCookie, BOSS_DIALOGUE_PATH_NEUTRAL);

      const homeAfterBoss = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const activeAfterBoss = (homeAfterBoss.json() as { activeTasks: Array<{ taskInstanceId: string }> })
        .activeTasks;

      const rows = await db
        .select()
        .from(taskInstances)
        .where(eq(taskInstances.citizenId, citizenId));
      const poolIds = rows
        .filter((row) => row.status !== 'completed')
        .map((row) => (row.context as { selectionAudit?: { poolId: string } }).selectionAudit?.poolId)
        .filter(Boolean);
      expect(poolIds).toContain(POOL_AFTER_TASK);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('retry complete does not duplicate follow-up task', async () => {
    const accountId = `test-v1-loop-idempotency-${randomUUID()}`;
    const { app, close } = await buildTestApp({ poolRegistry: createElderlyOnlyPoolRegistry() });
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
        payload: { displayName: 'Loop Retry', gender: 'male', age: 32 },
      });
      const { demoTaskInstanceId, citizenId } = create.json() as {
        demoTaskInstanceId: string;
        citizenId: string;
      };

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'help' },
      });

      const first = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'help' },
      });
      expect(first.statusCode).toBe(200);

      const retry = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'help' },
      });
      expect(retry.statusCode).toBe(409);

      const rows = await db
        .select()
        .from(taskInstances)
        .where(eq(taskInstances.citizenId, citizenId));
      expect(rows.filter((row) => row.definitionId === DEMO_BOSS_GREETING_DEFINITION_ID)).toHaveLength(1);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });
});
