import { describe, expect, it, vi } from 'vitest';
import { ConsequenceApplier } from './consequence-applicator.js';
import { computeResolutionSeed } from './deterministic-roll.js';
import { RiskService } from './risk-service.js';
import { riskOutcomeIdempotencyKey } from './risk-constants.js';
import type { RiskOutcomeRepository } from '../../domain/ports/repositories.js';
import {
  RISK_TEST_BRANCH_ALPHA,
  RISK_TEST_BRANCH_BETA,
  RISK_TEST_OPTION_A,
  RISK_TEST_SPEC_REF,
} from '../../test/risk-test-fixtures.js';

function createFrozenRiskContext(taskInstanceId: string) {
  return {
    resolutionVersion: 1 as const,
    byOptionId: {
      [RISK_TEST_OPTION_A]: {
        riskSpecRef: RISK_TEST_SPEC_REF,
        exposureLevel: 'medium' as const,
        branches: [
          { branchId: RISK_TEST_BRANCH_ALPHA, weight: '1' },
          { branchId: RISK_TEST_BRANCH_BETA, weight: '1' },
        ],
        resolutionSeed: computeResolutionSeed(taskInstanceId, RISK_TEST_OPTION_A, RISK_TEST_SPEC_REF, 1),
        resolutionVersion: 1,
        frozenAt: new Date().toISOString(),
      },
    },
  };
}

function createMockOutcomeRepo(): RiskOutcomeRepository {
  const store = new Map<string, ReturnType<typeof baseRecord>>();

  function baseRecord(input: {
    outcomeId: string;
    taskInstanceId: string;
    optionId: string;
    riskSpecRef: string;
    branchId: string;
    resolutionSeed: string;
    rollDigest: string;
    idempotencyKey: string;
    correlationId: string | null;
  }) {
    return {
      ...input,
      createdAt: new Date(),
    };
  }

  return {
    findByIdempotencyKey: vi.fn(async (key: string) => store.get(key) ?? null),
    findByTaskInstanceAndOption: vi.fn(async (taskInstanceId: string, optionId: string) => {
      for (const record of store.values()) {
        if (record.taskInstanceId === taskInstanceId && record.optionId === optionId) {
          return record;
        }
      }
      return null;
    }),
    save: vi.fn(async (input) => {
      const existing = store.get(input.idempotencyKey);
      if (existing) return existing;
      const record = baseRecord(input);
      store.set(input.idempotencyKey, record);
      return record;
    }),
  };
}

describe('RiskService', () => {
  it('returns null for an option without frozen risk spec', async () => {
    const repo = createMockOutcomeRepo();
    const service = new RiskService(repo);

    const result = await service.evaluate({
      taskInstanceId: 'task-no-risk',
      optionId: 'option_without_risk',
      citizenId: 'cit-1',
      resolvedRisk: { resolutionVersion: 1, byOptionId: {} },
    });

    expect(result).toBeNull();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('evaluates risk for an option with frozen spec', async () => {
    const repo = createMockOutcomeRepo();
    const service = new RiskService(repo);
    const taskInstanceId = 'task-with-risk';

    const result = await service.evaluate({
      taskInstanceId,
      optionId: RISK_TEST_OPTION_A,
      citizenId: 'cit-1',
      resolvedRisk: createFrozenRiskContext(taskInstanceId),
      correlationId: 'corr-1',
    });

    expect(result).not.toBeNull();
    expect(result?.riskSpecRef).toBe(RISK_TEST_SPEC_REF);
    expect([RISK_TEST_BRANCH_ALPHA, RISK_TEST_BRANCH_BETA]).toContain(result?.branchId);
    expect(result?.resolutionSeed).toHaveLength(64);
    expect(result?.rollDigest).toHaveLength(64);
    expect(result?.duplicate).toBe(false);
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: 'corr-1',
        idempotencyKey: riskOutcomeIdempotencyKey(taskInstanceId, RISK_TEST_OPTION_A),
      }),
    );
  });

  it('is idempotent on retry without a second roll', async () => {
    const repo = createMockOutcomeRepo();
    const service = new RiskService(repo);
    const taskInstanceId = 'task-idempotent';

    const first = await service.evaluate({
      taskInstanceId,
      optionId: RISK_TEST_OPTION_A,
      citizenId: 'cit-1',
      resolvedRisk: createFrozenRiskContext(taskInstanceId),
    });

    const second = await service.evaluate({
      taskInstanceId,
      optionId: RISK_TEST_OPTION_A,
      citizenId: 'cit-1',
      resolvedRisk: createFrozenRiskContext(taskInstanceId),
    });

    expect(first?.branchId).toBe(second?.branchId);
    expect(first?.outcomeId).toBe(second?.outcomeId);
    expect(second?.duplicate).toBe(true);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('invokes ConsequenceApplicator hook without applying gameplay consequences', async () => {
    const repo = createMockOutcomeRepo();
    const consequenceApplier = new ConsequenceApplier();
    const applySpy = vi.spyOn(consequenceApplier, 'apply');
    const service = new RiskService(repo, consequenceApplier);

    await service.evaluate({
      taskInstanceId: 'task-hook',
      optionId: RISK_TEST_OPTION_A,
      citizenId: 'cit-1',
      resolvedRisk: createFrozenRiskContext('task-hook'),
    });

    expect(applySpy).toHaveBeenCalledOnce();
    const hookResult = await applySpy.mock.results[0]?.value;
    expect(hookResult).toEqual({ applied: false, consequenceRefs: [] });
  });
});
