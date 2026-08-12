import { describe, expect, it } from 'vitest';
import { RiskSpecRegistry } from './risk-spec-registry.js';
import { RiskSpecResolver } from './risk-spec-resolver.js';
import {
  RISK_TEST_BRANCH_ALPHA,
  RISK_TEST_BRANCH_BETA,
  RISK_TEST_OPTION_A,
  RISK_TEST_OPTION_B,
  RISK_TEST_OPTION_C,
  RISK_TEST_OPTION_D,
  RISK_TEST_OPTION_E,
  RISK_TEST_SPEC_REF,
  RISK_TEST_SPEC_REF_B,
  RISK_TEST_SPEC_REF_C,
  RISK_TEST_TASK_DEFINITION_ID,
} from '../../test/risk-test-fixtures.js';

function createTestRegistry(): RiskSpecRegistry {
  const registry = new RiskSpecRegistry();
  registry.register(RISK_TEST_TASK_DEFINITION_ID, RISK_TEST_OPTION_A, {
    riskSpecRef: RISK_TEST_SPEC_REF,
    exposureLevel: 'low',
    branches: [
      { branchId: RISK_TEST_BRANCH_ALPHA, weight: 1 },
      { branchId: RISK_TEST_BRANCH_BETA, weight: 1 },
    ],
    resolutionVersion: 1,
  });
  return registry;
}

describe('RiskSpecResolver', () => {
  it('returns null when no specs are registered for a definition', () => {
    const resolver = new RiskSpecResolver(new RiskSpecRegistry());
    const result = resolver.resolveSpecsForTask({
      definitionId: RISK_TEST_TASK_DEFINITION_ID,
      taskInstanceId: 'task-1',
      citizenId: 'cit-1',
    });
    expect(result).toBeNull();
  });

  it('freezes risk spec for a single option (2-option task subset)', () => {
    const registry = createTestRegistry();
    registry.register(RISK_TEST_TASK_DEFINITION_ID, RISK_TEST_OPTION_B, {
      riskSpecRef: RISK_TEST_SPEC_REF_B,
      exposureLevel: 'medium',
      branches: [{ branchId: RISK_TEST_BRANCH_ALPHA, weight: 1 }],
      resolutionVersion: 1,
    });

    const resolver = new RiskSpecResolver(registry);
    const result = resolver.resolveSpecsForTask({
      definitionId: RISK_TEST_TASK_DEFINITION_ID,
      taskInstanceId: 'task-2opt',
      citizenId: 'cit-1',
    });

    expect(result?.byOptionId[RISK_TEST_OPTION_A]?.riskSpecRef).toBe(RISK_TEST_SPEC_REF);
    expect(result?.byOptionId[RISK_TEST_OPTION_B]?.exposureLevel).toBe('medium');
    expect(Object.keys(result?.byOptionId ?? {})).toHaveLength(2);
  });

  it('freezes specs for 3 options independently', () => {
    const registry = createTestRegistry();
    registry.register(RISK_TEST_TASK_DEFINITION_ID, RISK_TEST_OPTION_B, {
      riskSpecRef: RISK_TEST_SPEC_REF_B,
      exposureLevel: 'none',
      branches: [{ branchId: RISK_TEST_BRANCH_ALPHA, weight: 1 }],
      resolutionVersion: 1,
    });
    registry.register(RISK_TEST_TASK_DEFINITION_ID, RISK_TEST_OPTION_C, {
      riskSpecRef: RISK_TEST_SPEC_REF_C,
      exposureLevel: 'high',
      branches: [{ branchId: RISK_TEST_BRANCH_BETA, weight: 1 }],
      resolutionVersion: 1,
    });

    const resolver = new RiskSpecResolver(registry);
    const result = resolver.resolveSpecsForTask({
      definitionId: RISK_TEST_TASK_DEFINITION_ID,
      taskInstanceId: 'task-3opt',
      citizenId: 'cit-1',
    });

    expect(Object.keys(result?.byOptionId ?? {})).toHaveLength(3);
    expect(result?.byOptionId[RISK_TEST_OPTION_C]?.exposureLevel).toBe('high');
    expect(result?.byOptionId[RISK_TEST_OPTION_A]?.resolutionSeed).not.toBe(
      result?.byOptionId[RISK_TEST_OPTION_B]?.resolutionSeed,
    );
  });

  it('freezes specs for N options (5)', () => {
    const registry = new RiskSpecRegistry();
    const options = [
      RISK_TEST_OPTION_A,
      RISK_TEST_OPTION_B,
      RISK_TEST_OPTION_C,
      RISK_TEST_OPTION_D,
      RISK_TEST_OPTION_E,
    ];

    for (const [index, optionId] of options.entries()) {
      registry.register(RISK_TEST_TASK_DEFINITION_ID, optionId, {
        riskSpecRef: `${RISK_TEST_SPEC_REF}_${index}`,
        exposureLevel: 'low',
        branches: [{ branchId: RISK_TEST_BRANCH_ALPHA, weight: 1 }],
        resolutionVersion: 1,
      });
    }

    const resolver = new RiskSpecResolver(registry);
    const result = resolver.resolveSpecsForTask({
      definitionId: RISK_TEST_TASK_DEFINITION_ID,
      taskInstanceId: 'task-nopt',
      citizenId: 'cit-1',
    });

    expect(Object.keys(result?.byOptionId ?? {})).toHaveLength(5);
  });
});
