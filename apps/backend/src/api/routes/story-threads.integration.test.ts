import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildTestApp,
  completeStandardTask,
  ensureStoryThreadsSchemaForTests,
  loginAs,
  withIdempotency,
  withSession,
} from '../../test/test-app.js';
import { createNeighborFavorOnlyPoolRegistry } from '../../test/npc-relationship-test-helpers.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('story threads integration', () => {
  beforeAll(async () => {
    const { client, close } = await buildTestApp();
    try {
      await ensureStoryThreadsSchemaForTests(client);
    } finally {
      await close();
    }
  });
  it('creates Marco favor thread after neighbor help and persists across reload', async () => {
    const accountId = `test-story-marco-${randomUUID()}`;
    const { app, storyThreadRepo, close } = await buildTestApp({
      poolRegistry: createNeighborFavorOnlyPoolRegistry(),
    });

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Story Marco', gender: 'male', age: 34 },
      });
      const created = create.json() as { citizenId: string; demoTaskInstanceId: string };

      const complete = await completeStandardTask(
        app,
        login.sessionCookie,
        created.demoTaskInstanceId,
        'help',
      );
      expect(complete.statusCode).toBe(200);

      const threads = await storyThreadRepo.listByCitizenId(created.citizenId);
      const marcoThread = threads.find((thread) => thread.context.threadTemplateId === 'marco_favor_v1');
      expect(marcoThread).toBeTruthy();
      expect(marcoThread?.status).toBe('active');

      const reload = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(reload.statusCode).toBe(200);

      const persisted = await storyThreadRepo.listByCitizenId(created.citizenId);
      expect(persisted.filter((thread) => thread.context.threadTemplateId === 'marco_favor_v1')).toHaveLength(1);
    } finally {
      await close();
    }
  });

  it('does not duplicate Marco thread on idempotent task replay', async () => {
    const accountId = `test-story-idempotent-${randomUUID()}`;
    const { app, storyThreadRepo, close } = await buildTestApp({
      poolRegistry: createNeighborFavorOnlyPoolRegistry(),
    });

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Story Idempotent', gender: 'female', age: 29 },
      });
      const created = create.json() as { citizenId: string; demoTaskInstanceId: string };
      const finalizeIdempotencyKey = randomUUID();

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${created.demoTaskInstanceId}/start`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {},
      });

      const commit = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${created.demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'help' },
      });
      expect(commit.statusCode).toBe(200);

      const finalize = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${created.demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(finalizeIdempotencyKey),
        },
        payload: { optionId: 'help' },
      });
      expect(finalize.statusCode).toBe(200);

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${created.demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(finalizeIdempotencyKey),
        },
        payload: { optionId: 'help' },
      });

      const threads = await storyThreadRepo.listByCitizenId(created.citizenId);
      expect(threads.filter((thread) => thread.context.threadTemplateId === 'marco_favor_v1')).toHaveLength(1);
    } finally {
      await close();
    }
  });
});
