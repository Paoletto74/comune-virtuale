import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import {
  BOSS_DIALOGUE_PATH_NEGATIVE_SHORT,
  BOSS_DIALOGUE_PATH_NEUTRAL,
  BOSS_DIALOGUE_PATH_POSITIVE,
  BOSS_DIALOGUE_S1_OPTIONS,
  DEMO_BOSS_LATE_END_NEGATIVE,
  DEMO_BOSS_LATE_END_NEUTRAL,
  DEMO_BOSS_LATE_S2A,
} from '../../slice/boss-dialogue-constants.js';
import {
  completeActiveTaskOption,
  spawnBossDialogue,
  walkBossDialoguePath,
} from '../../test/dialogue-test-helpers.js';
import { buildTestApp, completeStandardTask, loginAs, startStandardTask, withIdempotency, withSession } from '../../test/test-app.js';

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
    payload: { displayName: 'Dialogue Pilot', gender: 'male', age: 30 },
  });
}

describe.skipIf(!hasDatabase)('V1-DIALOGUE-1 boss dialogue', () => {
  it('spawns boss dialogue S1 with four options after elderly', async () => {
    const accountId = `test-dialogue-spawn-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      const tasks = await spawnBossDialogue(
        app,
        login.sessionCookie,
        create.json().demoTaskInstanceId as string,
      );
      const boss = tasks.find((task) => task.taskId === DEMO_BOSS_GREETING_DEFINITION_ID);
      expect(boss).toBeTruthy();

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const active = home.json().activeTasks[0];
      expect(active.taskKind).toBe('dialogue_step');
      expect(active.options).toHaveLength(4);
    } finally {
      await close();
    }
  });

  it('rejects invalid dialogue option', async () => {
    const accountId = `test-dialogue-invalid-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      await spawnBossDialogue(app, login.sessionCookie, create.json().demoTaskInstanceId as string);

      const response = await completeActiveTaskOption(
        app,
        login.sessionCookie,
        'invented_option',
      );
      expect(response.statusCode).toBe(400);
    } finally {
      await close();
    }
  });

  it('path A (positive) applies effects only at terminal', async () => {
    const accountId = `test-dialogue-path-a-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      await spawnBossDialogue(app, login.sessionCookie, create.json().demoTaskInstanceId as string);

      const step1 = await completeActiveTaskOption(
        app,
        login.sessionCookie,
        BOSS_DIALOGUE_PATH_POSITIVE[0]!,
      );
      const step1Body = step1.json() as { dialogueContinued?: boolean; personalValues: { reputation: number } };
      expect(step1Body.dialogueContinued).toBe(true);
      expect(step1Body.personalValues.reputation).toBe(0);

      const activeMid = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/active',
        headers: withSession(login.sessionCookie),
      });
      expect(activeMid.json().tasks[0]?.taskId).toBe(DEMO_BOSS_LATE_S2A);

      const finalBody = await walkBossDialoguePath(
        app,
        login.sessionCookie,
        BOSS_DIALOGUE_PATH_POSITIVE.slice(1),
      );
      expect(finalBody?.dialogueContinued).toBeUndefined();
      expect(finalBody?.personalValues).toEqual(expect.objectContaining({ sympathy: 1, reputation: 1, happiness: 0 }));
    } finally {
      await close();
    }
  });

  it('path B (neutral) ends with neutral effects', async () => {
    const accountId = `test-dialogue-path-b-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      await spawnBossDialogue(app, login.sessionCookie, create.json().demoTaskInstanceId as string);

      const finalBody = await walkBossDialoguePath(app, login.sessionCookie, BOSS_DIALOGUE_PATH_NEUTRAL);
      expect(finalBody?.personalValues).toEqual(expect.objectContaining({ sympathy: 0, reputation: 0, happiness: 0 }));
      expect(finalBody?.taskId).toBe(DEMO_BOSS_LATE_END_NEUTRAL);
    } finally {
      await close();
    }
  });

  it('path C (negative short) ends with negative effects', async () => {
    const accountId = `test-dialogue-path-c-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      await spawnBossDialogue(app, login.sessionCookie, create.json().demoTaskInstanceId as string);

      const finalBody = await walkBossDialoguePath(
        app,
        login.sessionCookie,
        BOSS_DIALOGUE_PATH_NEGATIVE_SHORT,
      );
      expect(finalBody?.personalValues).toEqual(expect.objectContaining({ sympathy: 0, reputation: 0, happiness: 0 }));
      expect(finalBody?.taskId).toBe(DEMO_BOSS_LATE_END_NEGATIVE);
    } finally {
      await close();
    }
  });

  it('does not spawn pool tasks between dialogue steps', async () => {
    const accountId = `test-dialogue-no-pool-mid-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      await spawnBossDialogue(app, login.sessionCookie, create.json().demoTaskInstanceId as string);

      await completeActiveTaskOption(app, login.sessionCookie, BOSS_DIALOGUE_S1_OPTIONS[0]!);

      const active = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/active',
        headers: withSession(login.sessionCookie),
      });
      const tasks = active.json().tasks as Array<{ taskId: string }>;
      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.taskId).toBe(DEMO_BOSS_LATE_S2A);
    } finally {
      await close();
    }
  });

  it('spawns follow-up pool task after terminal conclusion', async () => {
    const accountId = `test-dialogue-pool-after-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      await spawnBossDialogue(app, login.sessionCookie, create.json().demoTaskInstanceId as string);

      await walkBossDialoguePath(app, login.sessionCookie, BOSS_DIALOGUE_PATH_NEGATIVE_SHORT);

      const active = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/active',
        headers: withSession(login.sessionCookie),
      });
      const tasks = active.json().tasks as Array<{ taskId: string }>;
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0]?.taskId).not.toBe(DEMO_BOSS_GREETING_DEFINITION_ID);
      expect(tasks[0]?.taskId).not.toBe(DEMO_BOSS_LATE_END_NEGATIVE);
    } finally {
      await close();
    }
  });

  it('persists current dialogue node across reload', async () => {
    const accountId = `test-dialogue-reload-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);
      await spawnBossDialogue(app, login.sessionCookie, create.json().demoTaskInstanceId as string);
      await completeActiveTaskOption(app, login.sessionCookie, BOSS_DIALOGUE_S1_OPTIONS[0]!);

      const before = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const instanceId = before.json().activeTasks[0]?.taskInstanceId as string;

      const again = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(again.json().activeTasks[0]?.taskInstanceId).toBe(instanceId);
      expect(again.json().activeTasks[0]?.taskId).toBe(DEMO_BOSS_LATE_S2A);
    } finally {
      await close();
    }
  });

  it('idempotent re-complete returns conflict', async () => {
    const accountId = `test-dialogue-idempotent-${randomUUID()}`;
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

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${boss.taskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: BOSS_DIALOGUE_S1_OPTIONS[0]! },
      });

      const retry = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${boss.taskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: BOSS_DIALOGUE_S1_OPTIONS[0]! },
      });

      expect(retry.statusCode).toBe(409);
    } finally {
      await close();
    }
  });
});

describe.skipIf(!hasDatabase)('V1-DIALOGUE-1 standard task timing', () => {
  it('starts interactive phase without readyAt, then sets readyAt after choice', async () => {
    const accountId = `test-task-timing-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await createCitizen(app, login.sessionCookie);

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };
      expect(home.json().activeTasks[0].feedState).toBe('available');

      const started = await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);
      expect(started.statusCode).toBe(200);
      expect(started.json().task.feedState).toBe('interactive');
      expect(started.json().task.readyAt).toBeUndefined();

      const response = await completeStandardTask(app, login.sessionCookie, demoTaskInstanceId, 'help');
      expect(response.statusCode).toBe(200);
      expect(response.json().taskWaiting).toBeUndefined();
    } finally {
      await close();
    }
  });
});
