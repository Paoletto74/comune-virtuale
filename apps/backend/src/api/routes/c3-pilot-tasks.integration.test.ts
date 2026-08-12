import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_POOL_ENTRY_DEFINITION_IDS, defaultTaskPoolRegistry } from '../../application/task/task-pool-registry.js';
import { createDatabase } from '../../infrastructure/db/client.js';
import { taskInstances } from '../../infrastructure/db/schema/index.js';
import {
  DEMO_FOUND_WALLET_DEFINITION_ID,
  DEMO_FOUND_WALLET_OPTION_KEEP,
  DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
  DEMO_NEIGHBOR_OPTION_HELP,
  DEMO_SUITCASE_OFFER_DEFINITION_ID,
} from '../../slice/c3-pilot-tasks-constants.js';
import { POOL_START } from '../../slice/task-pool-constants.js';
import {
  createCitizenWithStartTask,
  createSingleStartTaskPoolRegistry,
} from '../../test/task-selection-test-helpers.js';
import { buildTestApp, completeStandardTask, loginAs, withIdempotency, withSession } from '../../test/test-app.js';
import { FEED_VISIBLE_SIZE } from '../../slice/feed-constants.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('C.3 pilot tasks integration', () => {
  it('onboarding audit lists all POOL_START candidates', async () => {
    const accountId = `test-c3-audit-${randomUUID()}`;
    const { app, close } = await buildTestApp({ poolRegistry: defaultTaskPoolRegistry });
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
        payload: { displayName: 'Audit C3', gender: 'female', age: 28 },
      });
      expect(create.statusCode).toBe(200);
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      const rows = await db
        .select()
        .from(taskInstances)
        .where(eq(taskInstances.taskInstanceId, demoTaskInstanceId));
      const audit = (rows[0]!.context as { selectionAudit?: { poolId: string; candidateDefinitionIds: string[] } })
        .selectionAudit;

      expect(audit?.poolId).toBe(POOL_START);
      expect(audit?.candidateDefinitionIds).toEqual(ALL_POOL_ENTRY_DEFINITION_IDS);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('completes neighbor favor and spawns follow-up task', async () => {
    const { app, close } = await buildTestApp({
      poolRegistry: createSingleStartTaskPoolRegistry(DEMO_NEIGHBOR_FAVOR_DEFINITION_ID),
    });

    try {
      const { sessionCookie, taskInstanceId } = await createCitizenWithStartTask(
        app,
        DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
      );

      const complete = await completeStandardTask(
        app,
        sessionCookie,
        taskInstanceId,
        DEMO_NEIGHBOR_OPTION_HELP,
      );
      expect(complete.statusCode).toBe(200);
      expect(complete.json().personalValues.sympathy).toBe(1);

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(sessionCookie),
      });
      expect((home.json() as { activeTasks: unknown[] }).activeTasks.length).toBeLessThanOrEqual(
        FEED_VISIBLE_SIZE,
      );
    } finally {
      await close();
    }
  });

  it('keep_wallet credits 8 minor and spawns follow-up task', async () => {
    const { app, close } = await buildTestApp({
      poolRegistry: createSingleStartTaskPoolRegistry(DEMO_FOUND_WALLET_DEFINITION_ID),
    });

    try {
      const { sessionCookie, taskInstanceId } = await createCitizenWithStartTask(
        app,
        DEMO_FOUND_WALLET_DEFINITION_ID,
      );

      const complete = await completeStandardTask(
        app,
        sessionCookie,
        taskInstanceId,
        DEMO_FOUND_WALLET_OPTION_KEEP,
      );
      const body = complete.json() as {
        personalValues: { reputation: number };
        economic: { cash: { amountMinor: string } };
        effectsApplied: { economic: { cash: { deltaMinor: string } } };
      };

      expect(complete.statusCode).toBe(200);
      expect(body.personalValues.reputation).toBe(0);
      expect(body.effectsApplied.economic.cash.deltaMinor).toBe('8');
      expect(body.economic.cash.amountMinor).toBe('108');

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(sessionCookie),
      });
      expect((home.json() as { activeTasks: unknown[] }).activeTasks.length).toBeLessThanOrEqual(
        FEED_VISIBLE_SIZE,
      );
    } finally {
      await close();
    }
  });

  it('completes suitcase offer and spawns follow-up task', async () => {
    const { app, close } = await buildTestApp({
      poolRegistry: createSingleStartTaskPoolRegistry(DEMO_SUITCASE_OFFER_DEFINITION_ID),
    });

    try {
      const { sessionCookie, taskInstanceId } = await createCitizenWithStartTask(
        app,
        DEMO_SUITCASE_OFFER_DEFINITION_ID,
      );

      const complete = await completeStandardTask(app, sessionCookie, taskInstanceId, 'refuse');
      expect(complete.statusCode).toBe(200);
      expect(complete.json().personalValues.reputation).toBe(1);

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(sessionCookie),
      });
      expect((home.json() as { activeTasks: unknown[] }).activeTasks.length).toBeLessThanOrEqual(
        FEED_VISIBLE_SIZE,
      );
    } finally {
      await close();
    }
  });
});
