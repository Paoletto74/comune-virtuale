import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  createCitizenWithStartTask,
  createSingleStartTaskPoolRegistry,
} from '../../test/task-selection-test-helpers.js';
import {
  buildTestApp,
  completeStandardTask,
  withIdempotency,
  withSession,
} from '../../test/test-app.js';

const hasDatabase = !!process.env.DATABASE_URL;
const elderlyPool = createSingleStartTaskPoolRegistry('DEMO_ELDERLY_CROSSING');

async function fetchNpcAffection(
  app: Awaited<ReturnType<typeof buildTestApp>>['app'],
  sessionCookie: string,
  npcId: string,
): Promise<number> {
  const profileRes = await app.inject({
    method: 'GET',
    url: `/api/v1/relazioni/npc/${npcId}`,
    headers: withSession(sessionCookie),
  });
  expect(profileRes.statusCode).toBe(200);
  return (profileRes.json() as { profile: { affection: number } }).profile.affection;
}

async function citizenWithUnlockedContact(app: Awaited<ReturnType<typeof buildTestApp>>['app']) {
  const rolled = await createCitizenWithStartTask(app, 'DEMO_ELDERLY_CROSSING');
  await completeStandardTask(app, rolled.sessionCookie, rolled.taskInstanceId, 'help');

  const home = await app.inject({
    method: 'GET',
    url: '/api/v1/home',
    headers: withSession(rolled.sessionCookie),
  });
  const knownNpcs = (home.json() as { knownNpcs: Array<{ npcId: string }> }).knownNpcs;
  expect(knownNpcs.length).toBeGreaterThan(0);

  const profileRes = await app.inject({
    method: 'GET',
    url: `/api/v1/relazioni/npc/${knownNpcs[0]!.npcId}`,
    headers: withSession(rolled.sessionCookie),
  });
  expect(profileRes.statusCode).toBe(200);
  const profile = (profileRes.json() as { profile: { contactUnlocked: boolean; chatEnabled: boolean } }).profile;
  expect(profile.contactUnlocked || profile.chatEnabled).toBe(true);

  return { ...rolled, npcId: knownNpcs[0]!.npcId };
}

describe.skipIf(!hasDatabase)('Social Brain free chat integration', () => {
  it('starts free chat and responds to a greeting', async () => {
    const { app, close } = await buildTestApp({ poolRegistry: elderlyPool });

    try {
      const rolled = await citizenWithUnlockedContact(app);

      const start = await app.inject({
        method: 'POST',
        url: `/api/v1/relazioni/npc/${rolled.npcId}/chat/free/start`,
        headers: {
          ...withSession(rolled.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { localHour: 19 },
      });
      expect(start.statusCode).toBe(200);
      const startBody = start.json() as {
        chat: {
          threadId: string;
          freeTextEnabled: boolean;
          messages: Array<{ speaker: string; body: string }>;
        };
      };
      expect(startBody.chat.freeTextEnabled).toBe(true);
      expect(startBody.chat.messages.some((m) => m.speaker === 'npc')).toBe(true);

      const reply = await app.inject({
        method: 'POST',
        url: `/api/v1/relazioni/chat/${startBody.chat.threadId}/message`,
        headers: {
          ...withSession(rolled.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { message: 'Ciao!' },
      });
      expect(reply.statusCode).toBe(200);
      const replyBody = reply.json() as {
        chat: {
          messages: Array<{ speaker: string; body: string }>;
          lastEvaluation?: { intent: string };
        };
      };
      expect(replyBody.chat.messages.length).toBeGreaterThanOrEqual(3);
      expect(replyBody.chat.lastEvaluation?.intent).toBe('GREETING');
    } finally {
      await close();
    }
  });

  it('applies relationship effects via game engine on compliment', async () => {
    const { app, close } = await buildTestApp({ poolRegistry: elderlyPool });

    try {
      const rolled = await citizenWithUnlockedContact(app);

      const affectionBefore = await fetchNpcAffection(app, rolled.sessionCookie, rolled.npcId);

      const start = await app.inject({
        method: 'POST',
        url: `/api/v1/relazioni/npc/${rolled.npcId}/chat/free/start`,
        headers: {
          ...withSession(rolled.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {},
      });
      const threadId = (start.json() as { chat: { threadId: string } }).chat.threadId;

      await app.inject({
        method: 'POST',
        url: `/api/v1/relazioni/chat/${threadId}/message`,
        headers: {
          ...withSession(rolled.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { message: 'Sei fantastico, grazie!' },
      });

      const affectionAfter = await fetchNpcAffection(app, rolled.sessionCookie, rolled.npcId);
      expect(affectionAfter).toBeGreaterThan(affectionBefore);
    } finally {
      await close();
    }
  });
});
