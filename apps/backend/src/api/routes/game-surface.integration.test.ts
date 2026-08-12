import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildTestApp,
  ensureGameSurfaceSchemaForTests,
  loginAs,
  withIdempotency,
  withSession,
} from '../../test/test-app.js';
import {
  GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS,
  GAME_SURFACE_WORK_SHIFT_DURATION_MS,
} from '../../slice/game-surface-constants.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('game surface integration', () => {
  beforeAll(async () => {
    const { client, close } = await buildTestApp();
    try {
      await ensureGameSurfaceSchemaForTests(client);
    } finally {
      await close();
    }
  });

  it('returns enabled referendums and accepts idempotent vote', async () => {
    const accountId = `test-game-surface-${randomUUID()}`;
    const { app, worldClockService, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Game Surface', gender: 'female', age: 31 },
      });
      expect(create.statusCode).toBe(200);

      await worldClockService.advanceGameTime(GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS + 1_000);

      let referendums = await app.inject({
        method: 'GET',
        url: '/api/v1/referendums',
        headers: withSession(login.sessionCookie),
      });
      let referendumBody = referendums.json() as {
        enabled: boolean;
        referendums: Array<{ referendumId: string; status: string; startsAtGameMs: number; endsAtGameMs: number }>;
      };

      let gameTimeMs = Number((await worldClockService.now()).worldTimeMs);
      let active = referendumBody.referendums.find(
        (item) =>
          item.status === 'active' &&
          gameTimeMs >= item.startsAtGameMs &&
          gameTimeMs <= item.endsAtGameMs,
      );

      if (!active) {
        await worldClockService.advanceGameTime(GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS + 1_000);
        referendums = await app.inject({
          method: 'GET',
          url: '/api/v1/referendums',
          headers: withSession(login.sessionCookie),
        });
        referendumBody = referendums.json() as typeof referendumBody;
        gameTimeMs = Number((await worldClockService.now()).worldTimeMs);
        active = referendumBody.referendums.find(
          (item) =>
            item.status === 'active' &&
            gameTimeMs >= item.startsAtGameMs &&
            gameTimeMs <= item.endsAtGameMs,
        );
      }
      expect(referendums.statusCode).toBe(200);
      expect(referendumBody.enabled).toBe(true);
      expect(referendumBody.referendums.some((item) => item.status === 'active')).toBe(true);

      const activeReferendum = referendumBody.referendums.find((item) => item.status === 'active');
      expect(activeReferendum).toBeTruthy();
      if (
        !active ||
        gameTimeMs < activeReferendum!.startsAtGameMs ||
        gameTimeMs > activeReferendum!.endsAtGameMs
      ) {
        const voteWindowMs = activeReferendum!.startsAtGameMs + 1_000;
        await worldClockService.setWorldTimeMs(voteWindowMs);
        gameTimeMs = voteWindowMs;
        active = activeReferendum;
      }
      expect(active).toBeTruthy();

      const vote = await app.inject({
        method: 'POST',
        url: `/api/v1/referendums/${active!.referendumId}/vote`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'a' },
      });
      expect(vote.statusCode).toBe(200);
      expect((vote.json() as { duplicate: boolean }).duplicate).toBe(false);

      const replay = await app.inject({
        method: 'POST',
        url: `/api/v1/referendums/${active!.referendumId}/vote`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'a' },
      });
      expect(replay.statusCode).toBe(200);
      expect((replay.json() as { duplicate: boolean }).duplicate).toBe(true);
    } finally {
      await close();
    }
  });

  it('purchases marketplace item idempotently', async () => {
    const accountId = `test-game-surface-purchase-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Buyer', gender: 'male', age: 28 },
      });

      const marketplace = await app.inject({
        method: 'GET',
        url: '/api/v1/marketplace',
        headers: withSession(login.sessionCookie),
      });
      expect(marketplace.statusCode).toBe(200);
      const items = (marketplace.json() as { items: Array<{ itemId: string; priceMinor: string }> }).items;
      expect(items.length).toBeGreaterThan(0);

      const item = items.find((entry) => entry.itemId === 'item_test_affordable_v1') ?? items[0]!;
      expect(BigInt(item.priceMinor)).toBeLessThanOrEqual(100n);

      const itemId = item.itemId;
      const idempotencyKey = randomUUID();

      const purchase = await app.inject({
        method: 'POST',
        url: `/api/v1/marketplace/${itemId}/purchase`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(idempotencyKey),
        },
      });
      expect(purchase.statusCode).toBe(200);
      expect((purchase.json() as { duplicate: boolean }).duplicate).toBe(false);

      const replay = await app.inject({
        method: 'POST',
        url: `/api/v1/marketplace/${itemId}/purchase`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
      });
      expect(replay.statusCode).toBe(200);
      expect((replay.json() as { duplicate: boolean }).duplicate).toBe(true);
    } finally {
      await close();
    }
  });

  it('returns seeded job offers', async () => {
    const accountId = `test-game-surface-jobs-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Worker', gender: 'male', age: 30 },
      });

      const jobs = await app.inject({
        method: 'GET',
        url: '/api/v1/jobs',
        headers: withSession(login.sessionCookie),
      });
      expect(jobs.statusCode).toBe(200);
      const body = jobs.json() as { enabled: boolean; offers: Array<{ offerId: string }> };
      expect(body.enabled).toBe(true);
      expect(body.offers.length).toBeGreaterThanOrEqual(10);
    } finally {
      await close();
    }
  });

  it('returns profile detail for new citizen without optional data', async () => {
    const accountId = `test-game-surface-profile-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Profilo Test', gender: 'female', age: 25 },
      });

      const profile = await app.inject({
        method: 'GET',
        url: '/api/v1/profile/detail',
        headers: withSession(login.sessionCookie),
      });
      expect(profile.statusCode).toBe(200);
      const body = profile.json() as {
        citizenId: string;
        employment: unknown;
        inventory: unknown[];
        patrimonioSnapshots: unknown[];
      };
      expect(body.citizenId).toBeTruthy();
      expect(body.employment).toBeNull();
      expect(Array.isArray(body.inventory)).toBe(true);
      expect(Array.isArray(body.patrimonioSnapshots)).toBe(true);
    } finally {
      await close();
    }
  });

  it('returns municipality inflation history from real snapshots', async () => {
    const accountId = `test-game-surface-municipality-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Comune Test', gender: 'male', age: 33 },
      });

      await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });

      const municipality = await app.inject({
        method: 'GET',
        url: '/api/v1/municipality',
        headers: withSession(login.sessionCookie),
      });
      expect(municipality.statusCode).toBe(200);
      const body = municipality.json() as {
        enabled: boolean;
        priceIndexBps?: number;
        inflationHistory: Array<{ recordedAtGameMs: number; inflationRateBps: number; priceIndexBps?: number }>;
      };
      expect(body.enabled).toBe(true);
      expect(body.priceIndexBps).toBeGreaterThan(0);
      expect(Array.isArray(body.inflationHistory)).toBe(true);
      expect(body.inflationHistory.length).toBeGreaterThan(0);
    } finally {
      await close();
    }
  });

  it('supports job application, clock-in, shift blocking, and second job', async () => {
    const accountId = `test-game-surface-jobs-${randomUUID()}`;
    const { app, worldClockService, close, citizenRepo } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Lavoratore', gender: 'male', age: 28 },
      });
      const { citizenId } = createResponse.json() as { citizenId: string };
      await citizenRepo.incrementPersonalValues(citizenId, {
        culture: 15,
        civicParticipation: 20,
        reputation: 25,
      });

      const jobsBefore = await app.inject({
        method: 'GET',
        url: '/api/v1/jobs',
        headers: withSession(login.sessionCookie),
      });
      const jobsBody = jobsBefore.json() as {
        offers: Array<{
          offerId: string;
          salaryHintMinor: string;
          engagementStatus: string;
        }>;
      };
      const clerk = jobsBody.offers.find((offer) => offer.offerId === 'job_comune_clerk_v1');
      const delivery = jobsBody.offers.find((offer) => offer.offerId === 'job_delivery_v1');
      expect(clerk?.salaryHintMinor).toBe('2500');
      expect(clerk?.engagementStatus).toBe('available');

      let acceptBody: {
        decision: string;
        duplicate: boolean;
        message: { title: string; body: string };
      } | null = null;
      let acceptKey = randomUUID();
      let applyAttempts = 0;

      for (let attempt = 0; attempt < 24; attempt += 1) {
        applyAttempts += 1;
        acceptKey = randomUUID();
        const acceptApply = await app.inject({
          method: 'POST',
          url: '/api/v1/jobs/job_comune_clerk_v1/apply',
          headers: {
            ...withSession(login.sessionCookie),
            ...withIdempotency(acceptKey),
          },
          payload: {},
        });
        expect(acceptApply.statusCode).toBe(200);
        const body = acceptApply.json() as {
          decision: string;
          duplicate: boolean;
          message: { title: string; body: string };
        };
        if (body.decision === 'accepted') {
          acceptBody = body;
          break;
        }
      }

      expect(acceptBody).not.toBeNull();
      expect(acceptBody!.duplicate).toBe(false);
      expect(acceptBody!.message.body).toContain('Impiegato comunale');

      const duplicateApply = await app.inject({
        method: 'POST',
        url: '/api/v1/jobs/job_comune_clerk_v1/apply',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(acceptKey),
        },
        payload: {},
      });
      expect(duplicateApply.statusCode).toBe(200);
      const duplicateBody = duplicateApply.json() as { decision: string; duplicate: boolean };
      expect(duplicateBody.decision).toBe('accepted');

      const notifications = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications?scope=personal',
        headers: withSession(login.sessionCookie),
      });
      const notificationBody = notifications.json() as {
        notifications: Array<{ type: string; title: string; body: string }>;
      };
      const jobNotices = notificationBody.notifications.filter((n) => n.type === 'job_application');
      const acceptedJobNotices = jobNotices.filter((n) => n.title === 'Congratulazioni!');
      const rejectedJobNotices = jobNotices.filter((n) => n.title === 'Esito candidatura');
      expect(acceptedJobNotices.length).toBe(1);
      expect(rejectedJobNotices.length).toBe(applyAttempts - 1);
      expect(jobNotices.length).toBe(applyAttempts);

      const clockIn = await app.inject({
        method: 'POST',
        url: '/api/v1/jobs/job_comune_clerk_v1/clock-in',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {},
      });
      expect(clockIn.statusCode).toBe(200);

      const jobsActive = await app.inject({
        method: 'GET',
        url: '/api/v1/jobs',
        headers: withSession(login.sessionCookie),
      });
      const activeBody = jobsActive.json() as {
        offers: Array<{ offerId: string; engagementStatus: string; remainingShiftMs?: number }>;
      };
      const activeClerk = activeBody.offers.find((offer) => offer.offerId === 'job_comune_clerk_v1');
      expect(activeClerk?.engagementStatus).toBe('shift_active');
      expect(activeClerk?.remainingShiftMs).toBeGreaterThan(0);

      const blockedApply = await app.inject({
        method: 'POST',
        url: '/api/v1/jobs/job_comune_clerk_v1/apply',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {},
      });
      expect(blockedApply.statusCode).toBe(409);

      await worldClockService.advanceGameTime(GAME_SURFACE_WORK_SHIFT_DURATION_MS + 1_000);

      const jobsBlocked = await app.inject({
        method: 'GET',
        url: '/api/v1/jobs',
        headers: withSession(login.sessionCookie),
      });
      const blockedBody = jobsBlocked.json() as {
        offers: Array<{ offerId: string; engagementStatus: string }>;
      };
      const blockedClerk = blockedBody.offers.find((offer) => offer.offerId === 'job_comune_clerk_v1');
      expect(blockedClerk?.engagementStatus).toBe('blocked_today');

      const notificationsAfterShift = await app.inject({
        method: 'GET',
        url: '/api/v1/notifications?scope=personal',
        headers: withSession(login.sessionCookie),
      });
      const payrollBody = notificationsAfterShift.json() as {
        notifications: Array<{ type: string; title: string }>;
      };
      const payrollNotices = payrollBody.notifications.filter((n) => n.type === 'job_payroll');
      expect(payrollNotices.length).toBe(1);
      expect(payrollNotices[0]?.title).toBe('Stipendio turno');

      let secondAccepted = false;
      for (let attempt = 0; attempt < 24; attempt += 1) {
        const secondJobApply = await app.inject({
          method: 'POST',
          url: `/api/v1/jobs/${delivery!.offerId}/apply`,
          headers: {
            ...withSession(login.sessionCookie),
            ...withIdempotency(randomUUID()),
          },
          payload: {},
        });
        expect(secondJobApply.statusCode).toBe(200);
        const secondBody = secondJobApply.json() as { decision: string };
        if (secondBody.decision === 'accepted') {
          secondAccepted = true;
          break;
        }
      }
      expect(secondAccepted).toBe(true);
    } finally {
      await close();
    }
  });

  it('returns realistic marketplace prices from backend catalog', async () => {
    const accountId = `test-game-surface-market-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Acquirente', gender: 'female', age: 30 },
      });

      const municipality = await app.inject({
        method: 'GET',
        url: '/api/v1/municipality',
        headers: withSession(login.sessionCookie),
      });
      const municipalityBody = municipality.json() as { priceIndexBps?: number };

      const marketplace = await app.inject({
        method: 'GET',
        url: '/api/v1/marketplace',
        headers: withSession(login.sessionCookie),
      });
      const body = marketplace.json() as {
        items: Array<{ itemId: string; priceMinor: string }>;
        categories: Array<{ categoryId: string; items: unknown[]; showcase: unknown[] }>;
      };
      expect(body.categories.length).toBeGreaterThanOrEqual(4);
      const coffee = body.items.find((item) => item.itemId === 'cv_cons_001');
      const vehicle = body.items.find((item) => item.itemId === 'cv_veic_001');
      expect(coffee).toBeTruthy();
      expect(vehicle).toBeTruthy();
      const indexBps = municipalityBody.priceIndexBps ?? 10_000;
      const expectedCoffee = Math.max(1, Math.floor((3 * indexBps) / 10_000));
      const expectedVehicle = Math.max(1, Math.floor((3 * indexBps) / 10_000));
      expect(Number(coffee?.priceMinor)).toBe(expectedCoffee);
      expect(Number(vehicle?.priceMinor)).toBe(expectedVehicle);
      expect(body.items.length).toBeGreaterThanOrEqual(40);
    } finally {
      await close();
    }
  });
});
