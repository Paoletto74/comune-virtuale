import { randomUUID } from 'node:crypto';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { FEED_VISIBLE_SIZE } from '../../slice/feed-constants.js';
import {
  resetFlashOpportunityConfig,
  setFlashOpportunityConfig,
} from '../../slice/flash-opportunities-constants.js';
import {
  buildTestApp,
  completeStandardTask,
  ensureAdminWithCitizen,
  loginAs,
  withAdminSession,
  withIdempotency,
  withSession,
} from '../../test/test-app.js';
import { IDEMPOTENCY_HEADER } from '@comune-virtuale/shared';

const hasDatabase = !!process.env.DATABASE_URL;

async function createCitizen(app: Awaited<ReturnType<typeof buildTestApp>>['app'], sessionCookie: string) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/citizens',
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: {
      displayName: 'Flash Citizen',
      gender: 'female',
      age: 29,
    },
  });
  expect(response.statusCode).toBe(200);
  return response.json() as { citizenId: string; demoTaskInstanceId: string };
}

async function adminFlashHeaders(app: Awaited<ReturnType<typeof buildTestApp>>['app']) {
  const admin = await ensureAdminWithCitizen(app);
  return withAdminSession(admin);
}

describe.skipIf(!hasDatabase)('flash opportunities integration', () => {
  beforeEach(() => {
    resetFlashOpportunityConfig();
    setFlashOpportunityConfig({
      enabled: true,
      minDecisionDurationMs: 8000,
      maxDecisionDurationMs: 8000,
      minAnticipationDurationMs: 1000,
      maxAnticipationDurationMs: 1000,
      minSpawnIntervalMs: 1000,
      maxSpawnIntervalMs: 1000,
      opportunityChance: 1,
      maxActive: 1,
    });
  });

  afterEach(() => {
    resetFlashOpportunityConfig();
  });

  it('spawns, accepts, and persists flash opportunity state', async () => {
    const accountId = `test-flash-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const created = await createCitizen(app, login.sessionCookie);
      const adminHeaders = await adminFlashHeaders(app);
      const base = Date.now();

      await app.inject({
        method: 'POST',
        url: '/api/v1/admin/flash/evaluate',
        headers: adminHeaders,
        payload: { citizenId: created.citizenId, nowMs: base },
      });
      const spawned = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/flash/evaluate',
        headers: adminHeaders,
        payload: { citizenId: created.citizenId, nowMs: base + 1500 },
      });
      const flashState = spawned.json() as {
        flashOpportunity: { opportunityId: string; remainingMs: number } | null;
      };
      expect(flashState.flashOpportunity).not.toBeNull();

      const acceptKey = randomUUID();
      const accepted = await app.inject({
        method: 'POST',
        url: `/api/v1/flash-opportunities/${flashState.flashOpportunity!.opportunityId}/accept`,
        headers: {
          ...withSession(login.sessionCookie),
          [IDEMPOTENCY_HEADER]: acceptKey,
        },
      });
      expect(accepted.statusCode).toBe(200);

      const replay = await app.inject({
        method: 'POST',
        url: `/api/v1/flash-opportunities/${flashState.flashOpportunity!.opportunityId}/accept`,
        headers: {
          ...withSession(login.sessionCookie),
          [IDEMPOTENCY_HEADER]: acceptKey,
        },
      });
      expect(replay.statusCode).toBe(200);

      const home = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const summary = home.json() as {
        flash: { flashOpportunity: unknown };
        activeTasks: unknown[];
      };
      expect(summary.flash.flashOpportunity).toBeNull();
      expect(summary.activeTasks.length).toBeGreaterThan(0);
      expect(summary.activeTasks.length).toBeLessThanOrEqual(FEED_VISIBLE_SIZE);
    } finally {
      await close();
    }
  });

  it('expires flash opportunity after decision window', async () => {
    setFlashOpportunityConfig({
      minSpawnIntervalMs: 120_000,
      maxSpawnIntervalMs: 120_000,
    });
    const accountId = `test-flash-expire-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const created = await createCitizen(app, login.sessionCookie);
      const adminHeaders = await adminFlashHeaders(app);
      const base = Date.now();

      await app.inject({
        method: 'POST',
        url: '/api/v1/admin/flash/evaluate',
        headers: adminHeaders,
        payload: { citizenId: created.citizenId, nowMs: base },
      });
      const spawned = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/flash/evaluate',
        headers: adminHeaders,
        payload: { citizenId: created.citizenId, nowMs: base + 1500 },
      });
      expect((spawned.json() as { flashOpportunity: unknown }).flashOpportunity).not.toBeNull();

      const expired = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/flash/evaluate',
        headers: adminHeaders,
        payload: { citizenId: created.citizenId, nowMs: base + 20_000 },
      });
      const state = expired.json() as { flashOpportunity: unknown; expiredNotice: string | null };
      expect(state.flashOpportunity).toBeNull();
      expect(state.expiredNotice).toBeTruthy();
    } finally {
      await close();
    }
  });

  it('keeps standard feed flow unchanged with flash layer active', async () => {
    const accountId = `test-flash-compat-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const created = await createCitizen(app, login.sessionCookie);
      const adminHeaders = await adminFlashHeaders(app);
      const base = Date.now();

      await app.inject({
        method: 'POST',
        url: '/api/v1/admin/flash/evaluate',
        headers: adminHeaders,
        payload: { citizenId: created.citizenId, nowMs: base + 1500 },
      });

      const beforeCount = (
        await app.inject({
          method: 'GET',
          url: '/api/v1/home',
          headers: withSession(login.sessionCookie),
        })
      ).json() as { activeTasks: unknown[] };

      const complete = await completeStandardTask(
        app,
        login.sessionCookie,
        created.demoTaskInstanceId,
        'help',
      );
      expect(complete.statusCode).toBe(200);

      const after = (
        await app.inject({
          method: 'GET',
          url: '/api/v1/home',
          headers: withSession(login.sessionCookie),
        })
      ).json() as { activeTasks: unknown[]; personalValues: { sympathy: number } };
      expect(after.activeTasks.length).toBeGreaterThan(0);
      expect(after.personalValues.sympathy).toBeGreaterThan(0);
      expect(beforeCount.activeTasks.length).toBeLessThanOrEqual(FEED_VISIBLE_SIZE);
    } finally {
      await close();
    }
  });
});
