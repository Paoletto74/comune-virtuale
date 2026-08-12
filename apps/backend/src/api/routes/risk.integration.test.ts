import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CORRELATION_HEADER } from '@comune-virtuale/shared';
import { computeResolutionSeed } from '../../application/risk/deterministic-roll.js';
import { riskOutcomeIdempotencyKey } from '../../application/risk/risk-constants.js';
import { RiskService } from '../../application/risk/risk-service.js';
import { createDatabase } from '../../infrastructure/db/client.js';
import { DrizzleRiskOutcomeRepository } from '../../infrastructure/db/repositories/risk-outcome-repository.js';
import { taskInstances } from '../../infrastructure/db/schema/index.js';
import {
  RISK_TEST_BRANCH_ALPHA,
  RISK_TEST_BRANCH_BETA,
  RISK_TEST_OPTION_A,
  RISK_TEST_SPEC_REF,
} from '../../test/risk-test-fixtures.js';
import { buildTestApp, completeStandardTask, loginAs, startStandardTask, withIdempotency, withSession } from '../../test/test-app.js';
import { resolveDemoElderlyNpcWalletMinor } from '../../application/economy/demo-npc-wallet-seeder.js';
import { resolveDemoStealRequestedAmountMinor } from '../../application/economy/demo-steal-amount-resolver.js';
import { SLICE_DEMO_TASK_DEFINITION_ID } from '../../slice/constants.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

function buildTestResolvedRisk(taskInstanceId: string, optionId: string) {
  return {
    resolutionVersion: 1 as const,
    byOptionId: {
      [optionId]: {
        riskSpecRef: RISK_TEST_SPEC_REF,
        exposureLevel: 'low' as const,
        branches: [
          { branchId: RISK_TEST_BRANCH_ALPHA, weight: '1' },
          { branchId: RISK_TEST_BRANCH_BETA, weight: '1' },
        ],
        resolutionSeed: computeResolutionSeed(taskInstanceId, optionId, RISK_TEST_SPEC_REF, 1),
        resolutionVersion: 1,
        frozenAt: new Date().toISOString(),
      },
    },
  };
}

describe.skipIf(!hasDatabase)('Risk System v1 integration', () => {
  it('demo help/ignore/steal complete without risk effects (regression)', async () => {
    const accountId = `test-risk-regression-${randomUUID()}`;
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
        payload: { displayName: 'Risk Regression', gender: 'male', age: 30 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };

      const help = await completeStandardTask(app, login.sessionCookie, demoTaskInstanceId, 'help');

      expect(help.statusCode).toBe(200);
      expect(help.json().effectsApplied.risk).toBeUndefined();
    } finally {
      await close();
    }
  });

  it('ignores client-provided risk outcome fields and does not apply client branch', async () => {
    const accountId = `test-risk-client-${randomUUID()}`;
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
        payload: { displayName: 'Risk Client', gender: 'female', age: 28 },
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
        payload: {
          optionId: 'ignore',
          branchId: RISK_TEST_BRANCH_ALPHA,
          resolutionSeed: 'client-seed',
          outcome: 'witnessed',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as {
        optionId: string;
        effectsApplied: { risk?: { outcome?: { branchId: string } } };
      };
      expect(body.optionId).toBe('ignore');
      expect(body.effectsApplied.risk).toBeUndefined();
    } finally {
      await close();
    }
  });

  it('persists audit record and returns risk outcome when context has frozen spec', async () => {
    const accountId = `test-risk-audit-${randomUUID()}`;
    const correlationId = randomUUID();
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
        payload: { displayName: 'Risk Audit', gender: 'male', age: 31 },
      });
      const { demoTaskInstanceId, citizenId } = create.json() as {
        demoTaskInstanceId: string;
        citizenId: string;
      };

      const rows = await db
        .select()
        .from(taskInstances)
        .where(eq(taskInstances.taskInstanceId, demoTaskInstanceId))
        .limit(1);
      const existingContext = (rows[0]?.context ?? {}) as Record<string, unknown>;
      const resolvedRisk = buildTestResolvedRisk(demoTaskInstanceId, 'ignore');

      await db
        .update(taskInstances)
        .set({
          context: {
            ...existingContext,
            resolvedRisk,
          },
        })
        .where(eq(taskInstances.taskInstanceId, demoTaskInstanceId));

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'ignore' },
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
          [CORRELATION_HEADER]: correlationId,
        },
        payload: { optionId: 'ignore' },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as {
        effectsApplied: {
          risk?: { exposureLevel: string; outcome: { branchId: string } };
        };
      };
      expect(body.effectsApplied.risk?.exposureLevel).toBe('low');
      expect([RISK_TEST_BRANCH_ALPHA, RISK_TEST_BRANCH_BETA]).toContain(
        body.effectsApplied.risk?.outcome.branchId,
      );

      const audit = await riskOutcomeRepo.findByTaskInstanceAndOption(demoTaskInstanceId, 'ignore');
      expect(audit).not.toBeNull();
      expect(audit?.riskSpecRef).toBe(RISK_TEST_SPEC_REF);
      expect(audit?.branchId).toBe(body.effectsApplied.risk?.outcome.branchId);
      expect(audit?.resolutionSeed).toHaveLength(64);
      expect(audit?.rollDigest).toHaveLength(64);
      expect(audit?.correlationId).toBe(correlationId);
      expect(audit?.idempotencyKey).toBe(
        riskOutcomeIdempotencyKey(demoTaskInstanceId, 'ignore'),
      );
      expect(citizenId).toBeTruthy();
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('risk outcome idempotency via RiskService does not create duplicate audit rows', async () => {
    const accountId = `test-risk-idem-${randomUUID()}`;
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
        payload: { displayName: 'Risk Idem', gender: 'male', age: 34 },
      });
      const { demoTaskInstanceId, citizenId } = create.json() as {
        demoTaskInstanceId: string;
        citizenId: string;
      };

      const resolvedRisk = buildTestResolvedRisk(demoTaskInstanceId, RISK_TEST_OPTION_A);

      const first = await riskService.evaluate({
        taskInstanceId: demoTaskInstanceId,
        optionId: RISK_TEST_OPTION_A,
        citizenId,
        resolvedRisk,
        correlationId: randomUUID(),
      });

      const second = await riskService.evaluate({
        taskInstanceId: demoTaskInstanceId,
        optionId: RISK_TEST_OPTION_A,
        citizenId,
        resolvedRisk,
        correlationId: randomUUID(),
      });

      expect(first?.branchId).toBe(second?.branchId);
      expect(second?.duplicate).toBe(true);

      const audit = await riskOutcomeRepo.findByTaskInstanceAndOption(
        demoTaskInstanceId,
        RISK_TEST_OPTION_A,
      );
      expect(audit?.outcomeId).toBe(first?.outcomeId);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });

  it('steal_wallet applies risk outcome while preserving economic effects', async () => {
    const accountId = `test-risk-steal-reg-${randomUUID()}`;
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
        payload: { displayName: 'Steal Risk Reg', gender: 'female', age: 26 },
      });
      const { demoTaskInstanceId } = create.json() as { demoTaskInstanceId: string };
      const requestedMinor = resolveDemoStealRequestedAmountMinor(
        resolveDemoElderlyNpcWalletMinor(demoTaskInstanceId),
      );

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);

      await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'steal_wallet' },
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'steal_wallet' },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as {
        taskId: string;
        effectsApplied: {
          personalValues: { sympathy: number; reputation: number };
          economic: { cash: { deltaMinor: string } };
          risk: { exposureLevel: string; outcome: { branchId: string } };
        };
      };
      expect(body.taskId).toBe(SLICE_DEMO_TASK_DEFINITION_ID);
      expect(body.effectsApplied.personalValues).toEqual(
        expect.objectContaining({ sympathy: -1, reputation: -1, stress: 1, happiness: -1 }),
      );
      expect(body.effectsApplied.economic.cash.deltaMinor).toBe(requestedMinor.toString());
      expect(body.effectsApplied.risk.exposureLevel).toBe('medium');
      expect(body.effectsApplied.risk.outcome.branchId).toBeTruthy();
    } finally {
      await close();
    }
  });
});
