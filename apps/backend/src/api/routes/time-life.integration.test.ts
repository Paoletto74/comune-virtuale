import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { SLICE_GAME_CURRENCY_ID } from '../../slice/economy-constants.js';
import {
  buildTestApp,
  completeStandardTask,
  ensureAdminWithCitizen,
  loginAs,
  withAdminSession,
  withIdempotency,
  withSession,
} from '../../test/test-app.js';
import { LIFE_REVIEW_CONFIG } from '../../slice/time-life-constants.js';

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
      displayName: 'Time Citizen',
      gender: 'male',
      age: 32,
    },
  });
  expect(response.statusCode).toBe(200);
  return response.json() as { citizenId: string; demoTaskInstanceId: string };
}

describe.skipIf(!hasDatabase)('time and life evolution integration', () => {
  it('persists game clock state across admin scale, pause, and advance', async () => {
    const { app, close } = await buildTestApp();

    try {
      const admin = await ensureAdminWithCitizen(app);
      const adminHeaders = withAdminSession(admin);

      const initial = await app.inject({ method: 'GET', url: '/api/v1/admin/time', headers: adminHeaders });
      expect(initial.statusCode).toBe(200);
      expect((initial.json() as { isPaused: boolean }).isPaused).toBeDefined();

      const scaled = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/time/scale',
        headers: adminHeaders,
        payload: { timeScale: 5 },
      });
      expect(scaled.statusCode).toBe(200);
      expect((scaled.json() as { timeScale: number }).timeScale).toBe(5);

      const paused = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/time/pause',
        headers: adminHeaders,
        payload: { paused: true },
      });
      expect((paused.json() as { isPaused: boolean }).isPaused).toBe(true);

      const beforeAdvance = await app.inject({ method: 'GET', url: '/api/v1/admin/time', headers: adminHeaders });
      const beforeAdvanceMs = (beforeAdvance.json() as { worldTimeMs: number }).worldTimeMs;

      const advanced = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/time/advance',
        headers: adminHeaders,
        payload: { deltaMs: 10_000 },
      });
      expect(advanced.statusCode).toBe(200);
      expect((advanced.json() as { worldTimeMs: number }).worldTimeMs).toBe(beforeAdvanceMs + 10_000);

      const reloaded = await app.inject({ method: 'GET', url: '/api/v1/admin/time', headers: adminHeaders });
      const snapshot = reloaded.json() as { worldTimeMs: number; timeScale: number; isPaused: boolean };
      expect(snapshot.worldTimeMs).toBe(beforeAdvanceMs + 10_000);
      expect(snapshot.timeScale).toBe(5);
      expect(snapshot.isPaused).toBe(true);
    } finally {
      const admin = await ensureAdminWithCitizen(app);
      const adminHeaders = withAdminSession(admin);
      await app.inject({ method: 'POST', url: '/api/v1/admin/time/pause', headers: adminHeaders, payload: { paused: false } });
      await app.inject({ method: 'POST', url: '/api/v1/admin/time/scale', headers: adminHeaders, payload: { timeScale: 1 } });
      await close();
    }
  });

  it('records citizen milestone and exposes game date on home', async () => {
    const accountId = `test-time-milestone-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      await createCitizen(app, login.sessionCookie);

      const homeResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      expect(homeResponse.statusCode).toBe(200);
      const home = homeResponse.json() as {
        gameDate: { label: string };
        recentLifeEvents: Array<{ eventType: string; title: string | null }>;
        gameTime: { worldTimeMs: number; isPaused?: boolean; schemaVersion?: number };
      };

      expect(home.gameDate.label).toMatch(/^Giorno \d+, \d{2}:\d{2}:\d{2}$/);
      expect(home.recentLifeEvents.some((event) => event.eventType === 'milestone')).toBe(true);
      expect(home.gameTime.schemaVersion).toBeDefined();
    } finally {
      await close();
    }
  });

  it('does not duplicate life review across reload and login', async () => {
    const accountId = `test-life-review-${randomUUID()}`;
    const { app, close, citizenRepo, economyRepo } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const created = await createCitizen(app, login.sessionCookie);
      const admin = await ensureAdminWithCitizen(app);

      await app.inject({
        method: 'POST',
        url: '/api/v1/admin/time/advance',
        headers: withAdminSession(admin),
        payload: { deltaMs: LIFE_REVIEW_CONFIG.minWorldTimeForFirstReviewMs + 1000 },
      });

      await citizenRepo.setPersonalValues(created.citizenId, {
        sympathy: 0,
        reputation: 0,
      });

      await economyRepo.creditOwner({
        owner: { ownerType: 'citizen', ownerRef: created.citizenId },
        amountMinor: 500_00n,
        transactionType: 'test_credit',
        transactionClass: 'test',
        reasonCode: 'test_life_review',
        sourceActionId: randomUUID(),
        idempotencyKey: `test-credit-${randomUUID()}`,
      });

      const firstHome = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const first = firstHome.json() as { lifeReview: { reviewId: string } | null };
      expect(first.lifeReview).not.toBeNull();

      const reloadHome = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const reloaded = reloadHome.json() as { lifeReview: { reviewId: string } | null };
      expect(reloaded.lifeReview?.reviewId).toBe(first.lifeReview?.reviewId);

      const relogin = await loginAs(app, accountId);
      const loginHome = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(relogin.sessionCookie),
      });
      const afterLogin = loginHome.json() as { lifeReview: { reviewId: string } | null };
      expect(afterLogin.lifeReview?.reviewId).toBe(first.lifeReview?.reviewId);
    } finally {
      await close();
    }
  });

  it('returns same life review after backend restart', async () => {
    const accountId = `test-life-review-restart-${randomUUID()}`;
    let reviewId: string | undefined;

    const firstApp = await buildTestApp();
    try {
      const login = await loginAs(firstApp.app, accountId);
      const created = await createCitizen(firstApp.app, login.sessionCookie);
      const admin = await ensureAdminWithCitizen(firstApp.app);

      await firstApp.app.inject({
        method: 'POST',
        url: '/api/v1/admin/time/advance',
        headers: withAdminSession(admin),
        payload: { deltaMs: LIFE_REVIEW_CONFIG.minWorldTimeForFirstReviewMs + 1000 },
      });

      await firstApp.citizenRepo.setPersonalValues(created.citizenId, {
        sympathy: 0,
        reputation: 0,
      });

      await firstApp.economyRepo.creditOwner({
        owner: { ownerType: 'citizen', ownerRef: created.citizenId },
        amountMinor: 500_00n,
        transactionType: 'test_credit',
        transactionClass: 'test',
        reasonCode: 'test_life_review_restart',
        sourceActionId: randomUUID(),
        idempotencyKey: `test-credit-restart-${randomUUID()}`,
      });

      const homeResponse = await firstApp.app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      reviewId = (homeResponse.json() as { lifeReview: { reviewId: string } | null }).lifeReview
        ?.reviewId;
      expect(reviewId).toBeDefined();
    } finally {
      await firstApp.close();
    }

    const restartedApp = await buildTestApp();
    try {
      const relogin = await loginAs(restartedApp.app, accountId);
      const homeResponse = await restartedApp.app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(relogin.sessionCookie),
      });
      const home = homeResponse.json() as { lifeReview: { reviewId: string } | null };
      expect(home.lifeReview?.reviewId).toBe(reviewId);
    } finally {
      await restartedApp.close();
    }
  });

  it('keeps feed, NPC, and task flow compatible after time-life wiring', async () => {
    const accountId = `test-time-compat-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const created = await createCitizen(app, login.sessionCookie);

      const homeBefore = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const before = homeBefore.json() as {
        activeTasks: unknown[];
        knownNpcs: unknown[];
        balance: { availableCash: { amountMinor: string; currency: string } };
      };
      expect(before.activeTasks.length).toBeGreaterThan(0);
      expect(before.balance.availableCash.currency).toBe(SLICE_GAME_CURRENCY_ID);

      const complete = await completeStandardTask(
        app,
        login.sessionCookie,
        created.demoTaskInstanceId,
        'help',
      );
      expect(complete.statusCode).toBe(200);

      const homeAfter = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const after = homeAfter.json() as {
        activeTasks: unknown[];
        knownNpcs: unknown[];
        personalValues: { sympathy: number; reputation: number };
      };
      expect(after.personalValues.sympathy).toBeGreaterThan(0);
      expect(after.activeTasks.length).toBeGreaterThan(0);
      expect(Array.isArray(after.knownNpcs)).toBe(true);
    } finally {
      await close();
    }
  });
});
