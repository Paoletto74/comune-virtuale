import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import { BOSS_DIALOGUE_PATH_NEUTRAL } from '../../slice/boss-dialogue-constants.js';
import { walkBossDialoguePath } from '../../test/dialogue-test-helpers.js';
import {
  DEMO_FOUND_WALLET_DEFINITION_ID,
  DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
  DEMO_SUITCASE_OFFER_DEFINITION_ID,
} from '../../slice/c3-pilot-tasks-constants.js';
import { SLICE_DEMO_TASK_DEFINITION_ID } from '../../slice/constants.js';
import { POOL_AFTER_ELDERLY, POOL_START } from '../../slice/task-pool-constants.js';
import { createDatabase } from '../../infrastructure/db/client.js';
import { taskInstances } from '../../infrastructure/db/schema/index.js';
import { buildTestApp, completeStandardTask, loginAs, startStandardTask, withIdempotency, withSession } from '../../test/test-app.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('Task Pool v1 integration', () => {
  async function createCitizen(app: Awaited<ReturnType<typeof buildTestApp>>['app'], sessionCookie: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/citizens',
      headers: {
        ...withSession(sessionCookie),
        ...withIdempotency(randomUUID()),
      },
      payload: {
        displayName: 'Pool Test Citizen',
        gender: 'male',
        age: 30,
      },
    });
    expect(response.statusCode).toBe(200);
    return response.json() as { citizenId: string; demoTaskInstanceId: string };
  }

  it('onboarding selects elderly from POOL_START with selection audit', async () => {
    const accountId = `test-pool-start-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);

    try {
      const login = await loginAs(app, accountId);
      const created = await createCitizen(app, login.sessionCookie);

      const rows = await db
        .select()
        .from(taskInstances)
        .where(eq(taskInstances.taskInstanceId, created.demoTaskInstanceId));
      const instance = rows[0]!;
      const audit = (instance.context as { selectionAudit?: Record<string, unknown> }).selectionAudit;

      expect(instance.definitionId).toBe(SLICE_DEMO_TASK_DEFINITION_ID);
      expect(instance.status).toBe('pending');
      expect(audit?.poolId).toBe(POOL_START);
      expect(audit?.selectionSeed).toBeTruthy();
      expect(audit?.sourceSeed).toBe(`onboarding:${created.citizenId}:fill0`);
      expect(audit?.candidateDefinitionIds).toEqual([SLICE_DEMO_TASK_DEFINITION_ID]);
      expect(audit?.chosenDefinitionId).toBe(SLICE_DEMO_TASK_DEFINITION_ID);
      expect(audit?.idempotencyKey).toBe(
        `task-selection:onboarding:${created.citizenId}:${POOL_START}:fill0`,
      );
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('complete elderly selects boss from POOL_AFTER_ELDERLY', async () => {
    const accountId = `test-pool-after-elderly-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const created = await createCitizen(app, login.sessionCookie);

      const started = await startStandardTask(app, login.sessionCookie, created.demoTaskInstanceId);
      expect(started.statusCode).toBe(200);

      const complete = await completeStandardTask(app, login.sessionCookie, created.demoTaskInstanceId, 'help');
      expect(complete.statusCode).toBe(200);

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const body = home.json() as {
        activeTasks: Array<{ taskId: string; taskInstanceId: string }>;
      };

      expect(body.activeTasks).toHaveLength(1);
      expect(body.activeTasks[0]?.taskId).toBe(DEMO_BOSS_GREETING_DEFINITION_ID);

      const { db, client } = createDatabase(process.env.DATABASE_URL!);
      const rows = await db
        .select()
        .from(taskInstances)
        .where(eq(taskInstances.taskInstanceId, body.activeTasks[0]!.taskInstanceId));
      const audit = (rows[0]!.context as { selectionAudit?: Record<string, unknown> }).selectionAudit;

      expect(audit?.poolId).toBe(POOL_AFTER_ELDERLY);
      expect(audit?.sourceCompletedTaskInstanceId).toBe(created.demoTaskInstanceId);
      expect(audit?.idempotencyKey).toBe(
        `task-selection:${created.demoTaskInstanceId}:${POOL_AFTER_ELDERLY}:fill0`,
      );
      await client.end();
    } finally {
      await close();
    }
  });

  it('complete boss spawns next task from POOL_AFTER_TASK', async () => {
    const accountId = `test-pool-boss-end-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const created = await createCitizen(app, login.sessionCookie);

      const started = await startStandardTask(app, login.sessionCookie, created.demoTaskInstanceId);
      expect(started.statusCode).toBe(200);

      await completeStandardTask(app, login.sessionCookie, created.demoTaskInstanceId, 'help');

      await walkBossDialoguePath(app, login.sessionCookie, BOSS_DIALOGUE_PATH_NEUTRAL);

      const homeAfterBoss = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const afterBoss = homeAfterBoss.json() as {
        activeTasks: Array<{ taskId: string; taskInstanceId: string }>;
      };
      expect(afterBoss.activeTasks.length).toBeGreaterThanOrEqual(1);
      expect(
        afterBoss.activeTasks.map((task) => task.taskId),
      ).toEqual(
        expect.arrayContaining([
          DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
          DEMO_SUITCASE_OFFER_DEFINITION_ID,
          DEMO_FOUND_WALLET_DEFINITION_ID,
        ].filter((id) => afterBoss.activeTasks.some((task) => task.taskId === id))),
      );
    } finally {
      await close();
    }
  });

  it('retry complete elderly does not duplicate boss task', async () => {
    const accountId = `test-pool-idempotency-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);

    try {
      const login = await loginAs(app, accountId);
      const created = await createCitizen(app, login.sessionCookie);

      const started = await startStandardTask(app, login.sessionCookie, created.demoTaskInstanceId);
      expect(started.statusCode).toBe(200);

      const first = await completeStandardTask(app, login.sessionCookie, created.demoTaskInstanceId, 'ignore');
      expect(first.statusCode).toBe(200);

      const retry = await completeStandardTask(app, login.sessionCookie, created.demoTaskInstanceId, 'ignore');
      expect(retry.statusCode).toBe(409);

      const instances = await db
        .select()
        .from(taskInstances)
        .where(eq(taskInstances.citizenId, created.citizenId));
      const bossInstances = instances.filter(
        (row) => row.definitionId === DEMO_BOSS_GREETING_DEFINITION_ID,
      );

      expect(bossInstances).toHaveLength(1);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });
});
