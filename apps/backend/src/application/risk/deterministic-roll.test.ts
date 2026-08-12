import { describe, expect, it } from 'vitest';
import { computeResolutionSeed, deterministicBranchRoll } from './deterministic-roll.js';
import {
  RISK_TEST_BRANCH_ALPHA,
  RISK_TEST_BRANCH_BETA,
  RISK_TEST_BRANCH_GAMMA,
  RISK_TEST_OPTION_A,
  RISK_TEST_SPEC_REF,
} from '../../test/risk-test-fixtures.js';

describe('deterministicBranchRoll', () => {
  it('produces the same branch for the same resolution seed', () => {
    const seed = computeResolutionSeed('task-1', RISK_TEST_OPTION_A, RISK_TEST_SPEC_REF, 1);
    const first = deterministicBranchRoll(seed, [
      { branchId: RISK_TEST_BRANCH_ALPHA, weight: 1 },
      { branchId: RISK_TEST_BRANCH_BETA, weight: 1 },
      { branchId: RISK_TEST_BRANCH_GAMMA, weight: 1 },
    ]);
    const second = deterministicBranchRoll(seed, [
      { branchId: RISK_TEST_BRANCH_ALPHA, weight: 1 },
      { branchId: RISK_TEST_BRANCH_BETA, weight: 1 },
      { branchId: RISK_TEST_BRANCH_GAMMA, weight: 1 },
    ]);

    expect(first.branchId).toBe(second.branchId);
    expect(first.rollDigest).toBe(second.rollDigest);
    expect(first.rollValue).toBe(second.rollValue);
  });

  it('changes branch when taskInstanceId changes', () => {
    const branches = [
      { branchId: RISK_TEST_BRANCH_ALPHA, weight: 1 },
      { branchId: RISK_TEST_BRANCH_BETA, weight: 99 },
    ];

    const seedA = computeResolutionSeed('task-a', RISK_TEST_OPTION_A, RISK_TEST_SPEC_REF, 1);
    const seedB = computeResolutionSeed('task-b', RISK_TEST_OPTION_A, RISK_TEST_SPEC_REF, 1);

    const rollA = deterministicBranchRoll(seedA, branches);
    const rollB = deterministicBranchRoll(seedB, branches);

    expect(seedA).not.toBe(seedB);
    expect([RISK_TEST_BRANCH_ALPHA, RISK_TEST_BRANCH_BETA]).toContain(rollA.branchId);
    expect([RISK_TEST_BRANCH_ALPHA, RISK_TEST_BRANCH_BETA]).toContain(rollB.branchId);
  });

  it('rejects invalid branch weights', () => {
    expect(() =>
      deterministicBranchRoll('seed', [{ branchId: RISK_TEST_BRANCH_ALPHA, weight: 0 }]),
    ).toThrow('Invalid branch weights');
  });
});

describe('computeResolutionSeed', () => {
  it('is stable for identical inputs', () => {
    const seed = computeResolutionSeed('task-1', 'opt-1', 'SPEC', 1);
    expect(seed).toHaveLength(64);
    expect(seed).toBe(computeResolutionSeed('task-1', 'opt-1', 'SPEC', 1));
  });
});
