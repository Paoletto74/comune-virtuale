import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import { BOSS_DIALOGUE_PATH_NEGATIVE_SHORT } from '../../slice/boss-dialogue-constants.js';
import { spawnBossDialogue, walkBossDialoguePath } from '../../test/dialogue-test-helpers.js';
import { buildTestApp, completeStandardTask, loginAs, withIdempotency, withSession } from '../../test/test-app.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

async function createCitizen(app: Awaited<ReturnType<typeof buildTestApp>>['app'], sessionCookie: string) {
  return app.inject({
    method: 'POST',
    url: '/api/v1/citizens',
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { displayName: 'Boss Pilot', gender: 'male', age: 32 },
  });
}

describe.skipIf(!hasDatabase)('DEMO_BOSS_GREETING dialogue entry', () => {
  it('spawns multi-step boss dialogue only after elderly task is completed', async () => {
    const accountId = `test-boss-spawn-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      const before = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/active',
        headers: withSession(login.sessionCookie),
      });
      const beforeTasks = before.json().tasks as Array<{ taskId: string }>;
      expect(beforeTasks.some((task) => task.taskId === DEMO_BOSS_GREETING_DEFINITION_ID)).toBe(false);

      await completeStandardTask(app, login.sessionCookie, demoTaskInstanceId, 'ignore');

      const after = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/active',
        headers: withSession(login.sessionCookie),
      });
      const boss = (after.json().tasks as Array<{ taskId: string; taskKind?: string; options: unknown[] }>).find(
        (task) => task.taskId === DEMO_BOSS_GREETING_DEFINITION_ID,
      );
      expect(boss).toBeTruthy();
      expect(boss?.taskKind).toBe('dialogue_step');
      expect(boss?.options.length).toBeGreaterThanOrEqual(3);
    } finally {
      await close();
    }
  });

  it('rejects invented optionId on dialogue S1', async () => {
    const accountId = `test-boss-invalid-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      await spawnBossDialogue(app, login.sessionCookie, create.json().demoTaskInstanceId as string);

      const active = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/active',
        headers: withSession(login.sessionCookie),
      });
      const boss = active.json().tasks[0]!;

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${boss.taskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'invented_dialogue_line' },
      });

      expect(response.statusCode).toBe(400);
    } finally {
      await close();
    }
  });

  it('completes full dialogue and applies terminal effects', async () => {
    const accountId = `test-boss-complete-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      await spawnBossDialogue(app, login.sessionCookie, create.json().demoTaskInstanceId as string);

      const finalBody = await walkBossDialoguePath(
        app,
        login.sessionCookie,
        BOSS_DIALOGUE_PATH_NEGATIVE_SHORT,
      ) as { personalValues: { reputation: number } };
      expect(finalBody.personalValues.reputation).toBe(0);
    } finally {
      await close();
    }
  });
});
