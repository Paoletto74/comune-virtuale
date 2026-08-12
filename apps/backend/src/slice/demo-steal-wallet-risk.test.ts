import { describe, expect, it } from 'vitest';
import { deterministicBranchRoll } from '../application/risk/deterministic-roll.js';
import { RiskSpecRegistry } from '../application/risk/risk-spec-registry.js';
import { RiskSpecResolver } from '../application/risk/risk-spec-resolver.js';
import {
  DEMO_STEAL_WALLET_RISK_BRANCHES,
  DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
  DEMO_STEAL_WALLET_RISK_REF,
  DEMO_STEAL_WALLET_RISK_REGISTRATION,
} from '../slice/risk-constants.js';
import {
  SLICE_DEMO_TASK_DEFINITION_ID,
  SLICE_DEMO_TASK_OPTION_HELP,
  SLICE_DEMO_TASK_OPTION_IGNORE,
  SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
} from '../slice/constants.js';
import { findResolutionSeedForRollValue } from '../test/steal-wallet-risk-test-utils.js';

describe('DEMO_STEAL_WALLET_RISK balancing', () => {
  it('registers 55/30/15 branches on default registry for steal_wallet only', () => {
    const registry = new RiskSpecRegistry();
    registry.register(
      DEMO_STEAL_WALLET_RISK_REGISTRATION.definitionId,
      DEMO_STEAL_WALLET_RISK_REGISTRATION.optionId,
      DEMO_STEAL_WALLET_RISK_REGISTRATION.spec,
    );

    const stealSpec = registry.get(SLICE_DEMO_TASK_DEFINITION_ID, SLICE_DEMO_TASK_OPTION_STEAL_WALLET);
    expect(stealSpec?.riskSpecRef).toBe(DEMO_STEAL_WALLET_RISK_REF);
    expect(stealSpec?.exposureLevel).toBe('medium');
    expect(stealSpec?.branches).toEqual([
      { branchId: DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN, weight: 55 },
      { branchId: DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED, weight: 30 },
      { branchId: DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED, weight: 15 },
    ]);
    expect(registry.get(SLICE_DEMO_TASK_DEFINITION_ID, SLICE_DEMO_TASK_OPTION_HELP)).toBeNull();
    expect(registry.get(SLICE_DEMO_TASK_DEFINITION_ID, SLICE_DEMO_TASK_OPTION_IGNORE)).toBeNull();
  });

  it('freezes steal_wallet risk spec at spawn via RiskSpecResolver', () => {
    const registry = new RiskSpecRegistry();
    registry.register(
      DEMO_STEAL_WALLET_RISK_REGISTRATION.definitionId,
      DEMO_STEAL_WALLET_RISK_REGISTRATION.optionId,
      DEMO_STEAL_WALLET_RISK_REGISTRATION.spec,
    );
    const resolver = new RiskSpecResolver(registry);

    const resolved = resolver.resolveSpecsForTask({
      definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
      taskInstanceId: 'task-steal-risk',
      citizenId: 'cit-1',
    });

    expect(resolved?.byOptionId[SLICE_DEMO_TASK_OPTION_STEAL_WALLET]?.riskSpecRef).toBe(
      DEMO_STEAL_WALLET_RISK_REF,
    );
    expect(resolved?.byOptionId[SLICE_DEMO_TASK_OPTION_STEAL_WALLET]?.exposureLevel).toBe('medium');
    expect(Object.keys(resolved?.byOptionId ?? {})).toHaveLength(1);
  });

  it.each([
    [0, DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN],
    [54, DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN],
    [55, DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED],
    [84, DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED],
    [85, DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED],
    [99, DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED],
  ])('maps rollValue %i to branch %s with 55/30/15 weights', (rollValue, expectedBranch) => {
    const seed = findResolutionSeedForRollValue(rollValue);
    const roll = deterministicBranchRoll(seed, [...DEMO_STEAL_WALLET_RISK_BRANCHES]);
    expect(roll.branchId).toBe(expectedBranch);
    expect(roll.rollValue).toBe(rollValue);
  });
});
