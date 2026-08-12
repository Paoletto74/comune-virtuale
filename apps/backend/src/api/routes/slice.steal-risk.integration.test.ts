import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { riskOutcomeIdempotencyKey } from '../../application/risk/risk-constants.js';
import { RiskService } from '../../application/risk/risk-service.js';
import { createDatabase } from '../../infrastructure/db/client.js';
import { DrizzleRiskOutcomeRepository } from '../../infrastructure/db/repositories/risk-outcome-repository.js';
import { resolveDemoElderlyNpcWalletMinor } from '../../application/economy/demo-npc-wallet-seeder.js';
import { resolveDemoStealRequestedAmountMinor } from '../../application/economy/demo-steal-amount-resolver.js';
import {
  DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
  DEMO_STEAL_WALLET_RISK_MESSAGE_KEYS,
  DEMO_STEAL_WALLET_RISK_REF,
} from '../../slice/risk-constants.js';
import {
  SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
} from '../../slice/constants.js';
import {
  buildStealWalletResolvedRisk,
  findResolutionSeedForRollValue,
  STEAL_WALLET_RISK_BRANCH_IDS,
} from '../../test/steal-wallet-risk-test-utils.js';
import { buildTestApp, loginAs, startStandardTask, withIdempotency, withSession } from '../../test/test-app.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

async function completeStealWallet(
  app: Awaited<ReturnType<typeof buildTestApp>>['app'],
  sessionCookie: string,
  taskInstanceId: string,
) {
  await startStandardTask(app, sessionCookie, taskInstanceId);

  await app.inject({
    method: 'POST',
    url: `/api/v1/tasks/${taskInstanceId}/complete`,
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { optionId: SLICE_DEMO_TASK_OPTION_STEAL_WALLET },
  });

  return app.inject({
    method: 'POST',
    url: `/api/v1/tasks/${taskInstanceId}/complete`,
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { optionId: SLICE_DEMO_TASK_OPTION_STEAL_WALLET },
  });
}

describe.skipIf(!hasDatabase)('steal_wallet risk balancing', () => {
  it('help completes without effectsApplied.risk', async () => {
    const accountId = `test-steal-risk-help-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Help No Risk', gender: 'male', age: 30 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'help' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().effectsApplied.risk).toBeUndefined();
    } finally {
      await close();
    }
  });

  it('ignore completes without effectsApplied.risk', async () => {
    const accountId = `test-steal-risk-ignore-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Ignore No Risk', gender: 'female', age: 28 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'ignore' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().effectsApplied.risk).toBeUndefined();
    } finally {
      await close();
    }
  });

  it('steal_wallet returns effectsApplied.risk with medium exposure and persisted branchId', async () => {
    const accountId = `test-steal-risk-outcome-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);
    const riskOutcomeRepo = new DrizzleRiskOutcomeRepository(db);

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Steal Risk Outcome', gender: 'male', age: 33 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      const response = await completeStealWallet(app, login.sessionCookie, demoTaskInstanceId);
      expect(response.statusCode).toBe(200);

      const body = response.json() as {
        effectsApplied: {
          risk: { exposureLevel: string; outcome: { branchId: string; messageKey?: string } };
        };
      };
      expect(body.effectsApplied.risk.exposureLevel).toBe('medium');
      expect(STEAL_WALLET_RISK_BRANCH_IDS).toContain(body.effectsApplied.risk.outcome.branchId);

      const audit = await riskOutcomeRepo.findByTaskInstanceAndOption(
        demoTaskInstanceId,
        SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
      );
      expect(audit?.riskSpecRef).toBe(DEMO_STEAL_WALLET_RISK_REF);
      expect(audit?.branchId).toBe(body.effectsApplied.risk.outcome.branchId);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('steal_wallet economic regression remains unchanged with risk enabled', async () => {
    const accountId = `test-steal-risk-econ-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Steal Risk Econ', gender: 'female', age: 27 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };
      const requestedMinor = resolveDemoStealRequestedAmountMinor(
        resolveDemoElderlyNpcWalletMinor(demoTaskInstanceId),
      );

      const response = await completeStealWallet(app, login.sessionCookie, demoTaskInstanceId);
      const body = response.json() as {
        personalValues: { sympathy: number; reputation: number };
        effectsApplied: {
          personalValues: { sympathy: number; reputation: number };
          economic: { cash: { deltaMinor: string } };
          risk: { outcome: { branchId: string } };
        };
        economic: { cash: { amountMinor: string } };
      };

      expect(body.personalValues).toEqual(expect.objectContaining({ sympathy: 0, reputation: 0, happiness: 0 }));
      expect(body.effectsApplied.personalValues).toEqual(
        expect.objectContaining({ sympathy: -1, reputation: -1, stress: 1, happiness: -1 }),
      );
      expect(body.effectsApplied.economic.cash.deltaMinor).toBe(requestedMinor.toString());
      expect(body.economic.cash.amountMinor).toBe((100n + requestedMinor).toString());
      expect(body.effectsApplied.risk.outcome.branchId).toBeTruthy();
    } finally {
      await close();
    }
  });

  it('RiskService retry returns the same outcome without a second roll', async () => {
    const accountId = `test-steal-risk-retry-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);
    const riskOutcomeRepo = new DrizzleRiskOutcomeRepository(db);
    const riskService = new RiskService(riskOutcomeRepo);

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Steal Risk Retry', gender: 'male', age: 35 },
      });
      const { demoTaskInstanceId, citizenId } = create.json() as {
        demoTaskInstanceId: string;
        citizenId: string;
      };

      const task = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/active',
        headers: withSession(login.sessionCookie),
      });
      expect(task.statusCode).toBe(200);

      const complete = await completeStealWallet(app, login.sessionCookie, demoTaskInstanceId);
      expect(complete.statusCode).toBe(200);
      const branchId = complete.json().effectsApplied.risk.outcome.branchId as string;

      const firstAudit = await riskOutcomeRepo.findByTaskInstanceAndOption(
        demoTaskInstanceId,
        SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
      );

      const replay = await riskService.evaluate({
        taskInstanceId: demoTaskInstanceId,
        optionId: SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
        citizenId,
        resolvedRisk: firstAudit
          ? buildStealWalletResolvedRisk(firstAudit.resolutionSeed)
          : undefined,
        correlationId: randomUUID(),
      });

      expect(replay?.branchId).toBe(branchId);
      expect(replay?.duplicate).toBe(true);

      const auditRows = await riskOutcomeRepo.findByTaskInstanceAndOption(
        demoTaskInstanceId,
        SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
      );
      expect(auditRows?.outcomeId).toBe(firstAudit?.outcomeId);
      expect(auditRows?.idempotencyKey).toBe(
        riskOutcomeIdempotencyKey(demoTaskInstanceId, SLICE_DEMO_TASK_OPTION_STEAL_WALLET),
      );
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it.each([
    [0, DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN, undefined, undefined],
    [55, DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED, DEMO_STEAL_WALLET_RISK_MESSAGE_KEYS.witnessed, 'hidden'],
    [85, DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED, DEMO_STEAL_WALLET_RISK_MESSAGE_KEYS.identified, 'visible'],
  ])(
    'rollValue %i resolves branch %s with expected narrative',
    async (rollValue, branchId, expectedMessageKey, expectedVisibility) => {
      const { db, client } = createDatabase(process.env.DATABASE_URL!);
      const riskOutcomeRepo = new DrizzleRiskOutcomeRepository(db);
      const riskService = new RiskService(riskOutcomeRepo);
      const { app, close } = await buildTestApp();

      try {
        const login = await loginAs(app, `branch-${branchId}-${randomUUID()}`);
        const create = await app.inject({
          method: 'POST',
          url: '/api/v1/citizens',
          headers: {
            ...withSession(login.sessionCookie),
            ...withIdempotency(randomUUID()),
          },
          payload: { displayName: `Branch ${branchId}`, gender: 'male', age: 40 },
        });
        const { demoTaskInstanceId, citizenId } = create.json() as {
          demoTaskInstanceId: string;
          citizenId: string;
        };

        const seed = findResolutionSeedForRollValue(rollValue);
        const resolvedRisk = buildStealWalletResolvedRisk(seed);

        const outcome = await riskService.evaluate({
          taskInstanceId: demoTaskInstanceId,
          optionId: SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
          citizenId,
          resolvedRisk,
          correlationId: randomUUID(),
        });

        expect(outcome?.branchId).toBe(branchId);
        if (expectedMessageKey) {
          expect(outcome?.messageKey).toBe(expectedMessageKey);
          expect(outcome?.visibility).toBe(expectedVisibility);
        } else {
          expect(outcome?.messageKey).toBeUndefined();
        }
      } finally {
        await app.close();
        await close();
        await client.end();
      }
    },
  );
});
