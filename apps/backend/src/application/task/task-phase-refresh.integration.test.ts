import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { deriveGameDate, resolveDayNightPhase } from '@comune-virtuale/shared';
import { defaultTaskPoolRegistry } from './task-pool-registry.js';
import { getTaskPhaseAffinity, isTaskCompatibleWithDayPhase } from './task-phase-metadata.js';
import {
  buildTestApp,
  loginAs,
  withIdempotency,
  withSession,
} from '../../test/test-app.js';

const hasDatabase = !!process.env.DATABASE_URL;

function gameTimeMsForHour(hour: number): number {
  return hour * 3600 * 1000;
}

describe.skipIf(!hasDatabase)('task phase refresh integration', () => {
  it('keeps in-progress tasks and refreshes pending tasks on phase change', async () => {
    const { app, worldClockService, citizenRepo } = await buildTestApp({
      poolRegistry: defaultTaskPoolRegistry,
    });

    try {
      await worldClockService.setWorldTimeMs(gameTimeMsForHour(14));

      const login = await loginAs(app, `phase-refresh-${randomUUID()}`);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Phase Refresh', gender: 'female', age: 29 },
      });
      expect(create.statusCode).toBe(200);
      const { citizenId } = create.json() as { citizenId: string };

      const afternoonHome = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(afternoonHome.statusCode).toBe(200);
      const afternoonBody = afternoonHome.json() as {
        activeTasks: Array<{
          taskInstanceId: string;
          taskId: string;
          feedState: string;
        }>;
        gameDate: { hour: number };
      };
      expect(resolveDayNightPhase(afternoonBody.gameDate)).toBe('afternoon');

      const pendingDayTask = afternoonBody.activeTasks.find(
        (task) =>
          task.feedState === 'available' &&
          getTaskPhaseAffinity(task.taskId) === 'DAY',
      );
      expect(pendingDayTask).toBeDefined();

      const start = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${pendingDayTask!.taskInstanceId}/start`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
      });
      expect(start.statusCode).toBe(200);
      const startedTaskInstanceId = pendingDayTask!.taskInstanceId;

      await citizenRepo.setLastTaskDayPhase(citizenId, 'afternoon');

      await worldClockService.setWorldTimeMs(gameTimeMsForHour(18));

      const sunsetHome = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(sunsetHome.statusCode).toBe(200);
      const sunsetBody = sunsetHome.json() as {
        activeTasks: Array<{
          taskInstanceId: string;
          taskId: string;
          feedState: string;
        }>;
        gameDate: { hour: number };
      };

      expect(resolveDayNightPhase(deriveGameDate(gameTimeMsForHour(18)))).toBe('sunset');
      expect(resolveDayNightPhase(sunsetBody.gameDate)).toBe('sunset');

      const startedTask = sunsetBody.activeTasks.find(
        (task) => task.taskInstanceId === startedTaskInstanceId,
      );
      expect(startedTask).toBeDefined();
      expect(startedTask?.feedState).not.toBe('available');

      const remainingDayPending = sunsetBody.activeTasks.filter(
        (task) =>
          task.feedState === 'available' &&
          getTaskPhaseAffinity(task.taskId) === 'DAY' &&
          !isTaskCompatibleWithDayPhase(task.taskId, 'sunset'),
      );
      expect(remainingDayPending).toHaveLength(0);

      const eveningOrAllDayPending = sunsetBody.activeTasks.filter(
        (task) =>
          task.feedState === 'available' &&
          isTaskCompatibleWithDayPhase(task.taskId, 'sunset'),
      );
      expect(eveningOrAllDayPending.length).toBeGreaterThan(0);
    } finally {
      await app.close();
    }
  });
});
