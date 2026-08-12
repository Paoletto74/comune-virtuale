import { describe, expect, it } from 'vitest';
import {
  DEMO_NEIGHBOR_OPTION_HELP,
  DEMO_NEIGHBOR_OPTION_IGNORE,
} from '../../slice/c3-pilot-tasks-constants.js';
import { FEED_VISIBLE_SIZE } from '../../slice/feed-constants.js';
import {
  createCitizenWithNeighborFavorTask,
  createNeighborFavorOnlyPoolRegistry,
  spawnTaskInstanceForCitizen,
} from '../../test/npc-relationship-test-helpers.js';
import {
  buildTestApp,
  completeStandardTask,
  loginAs,
  withSession,
} from '../../test/test-app.js';

const hasDatabase = !!process.env.DATABASE_URL;
const NEIGHBOR_NOISE_DEFINITION_ID = 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE';
const neighborOnlyPool = createNeighborFavorOnlyPoolRegistry();

describe.skipIf(!hasDatabase)('NPC relationships integration', () => {
  it('creates Marco on neighbor task and records positive relationship', async () => {
    const { app, close, npcRelationshipService } = await buildTestApp({
      poolRegistry: neighborOnlyPool,
    });

    try {
      const rolled = await createCitizenWithNeighborFavorTask(app);
      expect(rolled.task.npc?.displayName).toBe('Marco Rossi');
      expect(rolled.knownNpcs).toHaveLength(0);

      const complete = await completeStandardTask(
        app,
        rolled.sessionCookie,
        rolled.task.taskInstanceId,
        DEMO_NEIGHBOR_OPTION_HELP,
      );
      expect(complete.statusCode).toBe(200);

      const homeAfter = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(rolled.sessionCookie),
      });
      const after = homeAfter.json() as {
        knownNpcs: Array<{ displayName: string; sentiment: string; lastOutcomeSummary: string | null }>;
      };

      expect(after.knownNpcs).toHaveLength(1);
      expect(after.knownNpcs[0]?.displayName).toBe('Marco Rossi');
      expect(after.knownNpcs[0]?.sentiment).toBe('positive');
      expect(after.knownNpcs[0]?.lastOutcomeSummary).toBe('Lo hai aiutato');

      const known = await npcRelationshipService.getKnownNpcs(rolled.citizenId);
      expect(known[0]?.interactionCount).toBe(1);
    } finally {
      await close();
    }
  });

  it('recognizes Marco on second neighbor-themed task after negative first interaction', async () => {
    const { app, close, taskRepo, taskMaterializer } = await buildTestApp({
      poolRegistry: neighborOnlyPool,
    });

    try {
      const rolled = await createCitizenWithNeighborFavorTask(app);
      await completeStandardTask(
        app,
        rolled.sessionCookie,
        rolled.task.taskInstanceId,
        DEMO_NEIGHBOR_OPTION_IGNORE,
      );

      await spawnTaskInstanceForCitizen({
        taskRepo,
        materializer: taskMaterializer,
        citizenId: rolled.citizenId,
        definitionId: NEIGHBOR_NOISE_DEFINITION_ID,
      });

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(rolled.sessionCookie),
      });
      const body = home.json() as {
        activeTasks: Array<{
          taskId: string;
          npc?: { isKnown: boolean; recognitionLine?: string; toneLine?: string };
        }>;
      };

      const noise = body.activeTasks.find((task) => task.taskId === NEIGHBOR_NOISE_DEFINITION_ID);
      expect(noise?.npc?.isKnown).toBe(true);
      expect(noise?.npc?.recognitionLine).toContain('Marco Rossi');
      expect(noise?.npc?.toneLine).toMatch(/entusiasta|memoria/i);
    } finally {
      await close();
    }
  });

  it('persists known NPCs across reload and re-login', async () => {
    const { app, close } = await buildTestApp({ poolRegistry: neighborOnlyPool });

    try {
      const rolled = await createCitizenWithNeighborFavorTask(app);
      await completeStandardTask(
        app,
        rolled.sessionCookie,
        rolled.task.taskInstanceId,
        DEMO_NEIGHBOR_OPTION_HELP,
      );

      const reload = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(rolled.sessionCookie),
      });
      const reloaded = reload.json() as { knownNpcs: unknown[]; activeTasks: unknown[] };
      expect(reloaded.knownNpcs).toHaveLength(1);
      expect(reloaded.activeTasks.length).toBeLessThanOrEqual(FEED_VISIBLE_SIZE);

      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: withSession(rolled.sessionCookie),
      });

      const relogin = await loginAs(app, rolled.accountId);
      const afterLogin = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(relogin.sessionCookie),
      });
      expect((afterLogin.json() as { knownNpcs: unknown[] }).knownNpcs).toHaveLength(1);
    } finally {
      await close();
    }
  });
});
