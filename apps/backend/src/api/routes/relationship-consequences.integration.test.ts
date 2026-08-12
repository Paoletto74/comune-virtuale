import { describe, expect, it } from 'vitest';
import {
  DEMO_NEIGHBOR_OPTION_HELP,
  DEMO_NEIGHBOR_OPTION_IGNORE,
} from '../../slice/c3-pilot-tasks-constants.js';
import {
  DEMO_ACQUAINTANCE_OPTION_RUDE_NO,
} from '../../slice/variety-content-constants.js';
import {
  DEMO_NPC_GIULIA_WARNING_DEFINITION_ID,
  DEMO_NPC_MARCO_OPPORTUNITY_DEFINITION_ID,
} from '../../slice/npc-relationship-consequences-constants.js';
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
const neighborOnlyPool = createNeighborFavorOnlyPoolRegistry();

describe.skipIf(!hasDatabase)('Relationship consequences integration', () => {
  it('shows Marco opportunity with memory after positive relationship', async () => {
    const { app, close, taskRepo, taskMaterializer } = await buildTestApp({
      poolRegistry: neighborOnlyPool,
    });

    try {
      const rolled = await createCitizenWithNeighborFavorTask(app);
      await completeStandardTask(
        app,
        rolled.sessionCookie,
        rolled.task.taskInstanceId,
        DEMO_NEIGHBOR_OPTION_HELP,
      );

      await spawnTaskInstanceForCitizen({
        taskRepo,
        materializer: taskMaterializer,
        citizenId: rolled.citizenId,
        definitionId: DEMO_NPC_MARCO_OPPORTUNITY_DEFINITION_ID,
      });

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(rolled.sessionCookie),
      });
      const task = (
        home.json() as {
          activeTasks: Array<{
            taskId: string;
            npc?: { memoryLine?: string; consequenceLine?: string; displayName?: string };
          }>;
        }
      ).activeTasks.find((entry) => entry.taskId === DEMO_NPC_MARCO_OPPORTUNITY_DEFINITION_ID);

      expect(task?.npc?.displayName).toBe('Marco Rossi');
      expect(task?.npc?.memoryLine).toMatch(/Marco Rossi ricorda/i);
      expect(task?.npc?.consequenceLine).toMatch(/favore torna indietro/i);
    } finally {
      await close();
    }
  });

  it('shows Giulia warning after negative relationship', async () => {
    const { app, close, taskRepo, taskMaterializer, npcRelationshipService } = await buildTestApp({
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

      const giuliaTask = await spawnTaskInstanceForCitizen({
        taskRepo,
        materializer: taskMaterializer,
        citizenId: rolled.citizenId,
        definitionId: 'DEMO_ACQUAINTANCE_FAVOR',
      });
      await completeStandardTask(
        app,
        rolled.sessionCookie,
        giuliaTask,
        DEMO_ACQUAINTANCE_OPTION_RUDE_NO,
      );

      await spawnTaskInstanceForCitizen({
        taskRepo,
        materializer: taskMaterializer,
        citizenId: rolled.citizenId,
        definitionId: DEMO_NPC_GIULIA_WARNING_DEFINITION_ID,
      });

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(rolled.sessionCookie),
      });
      const task = (
        home.json() as {
          activeTasks: Array<{
            taskId: string;
            npc?: { memoryLine?: string; consequenceLine?: string; displayName?: string };
          }>;
        }
      ).activeTasks.find((entry) => entry.taskId === DEMO_NPC_GIULIA_WARNING_DEFINITION_ID);

      expect(task?.npc?.displayName).toBe('Giulia Colombo');
      expect(task?.npc?.memoryLine).toMatch(/Giulia/i);
      expect(task?.npc?.consequenceLine).toMatch(/non ha dimenticato/i);

      const known = await npcRelationshipService.getKnownNpcs(rolled.citizenId);
      expect(known.some((entry) => entry.displayName === 'Giulia Colombo')).toBe(true);
    } finally {
      await close();
    }
  });

  it('records consequence once and persists across reload/login', async () => {
    const { app, close, taskRepo, taskMaterializer, npcRelationshipService } = await buildTestApp({
      poolRegistry: neighborOnlyPool,
    });

    try {
      const rolled = await createCitizenWithNeighborFavorTask(app);
      await completeStandardTask(
        app,
        rolled.sessionCookie,
        rolled.task.taskInstanceId,
        DEMO_NEIGHBOR_OPTION_HELP,
      );

      const opportunityId = await spawnTaskInstanceForCitizen({
        taskRepo,
        materializer: taskMaterializer,
        citizenId: rolled.citizenId,
        definitionId: DEMO_NPC_MARCO_OPPORTUNITY_DEFINITION_ID,
      });
      const acceptResponse = await completeStandardTask(app, rolled.sessionCookie, opportunityId, 'accept');
      expect(acceptResponse.statusCode).toBe(200);
      expect((acceptResponse.json() as { status: string }).status).toBe('completed');

      const knownBefore = await npcRelationshipService.getKnownNpcs(rolled.citizenId);
      const marco = knownBefore.find((entry) => entry.displayName === 'Marco Rossi');
      expect(marco?.interactionCount).toBeGreaterThanOrEqual(2);

      const reload = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(rolled.sessionCookie),
      });
      expect((reload.json() as { activeTasks: unknown[] }).activeTasks.length).toBeLessThanOrEqual(
        FEED_VISIBLE_SIZE,
      );

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
      expect((afterLogin.json() as { knownNpcs: unknown[] }).knownNpcs.length).toBeGreaterThan(0);
    } finally {
      await close();
    }
  });
});
