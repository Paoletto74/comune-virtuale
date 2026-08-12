import { describe, expect, it } from 'vitest';
import { ConsequenceApplier } from './consequence-applicator.js';
import {
  DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
  DEMO_STEAL_WALLET_RISK_MESSAGE_KEYS,
  DEMO_STEAL_WALLET_RISK_REF,
} from '../../slice/risk-constants.js';

describe('ConsequenceApplier steal_wallet balancing', () => {
  const applier = new ConsequenceApplier();

  it('unseen has no narrative consequence', async () => {
    const result = await applier.apply({
      outcomeId: 'out-1',
      taskInstanceId: 'task-1',
      optionId: 'steal_wallet',
      riskSpecRef: DEMO_STEAL_WALLET_RISK_REF,
      branchId: DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
      citizenId: 'cit-1',
    });

    expect(result).toEqual({ applied: false, consequenceRefs: [] });
  });

  it('witnessed returns narrative message without persistent penalty', async () => {
    const result = await applier.apply({
      outcomeId: 'out-2',
      taskInstanceId: 'task-1',
      optionId: 'steal_wallet',
      riskSpecRef: DEMO_STEAL_WALLET_RISK_REF,
      branchId: DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
      citizenId: 'cit-1',
    });

    expect(result.applied).toBe(true);
    expect(result.messageKey).toBe(DEMO_STEAL_WALLET_RISK_MESSAGE_KEYS.witnessed);
    expect(result.visibility).toBe('hidden');
  });

  it('identified returns graver narrative message without persistent penalty', async () => {
    const result = await applier.apply({
      outcomeId: 'out-3',
      taskInstanceId: 'task-1',
      optionId: 'steal_wallet',
      riskSpecRef: DEMO_STEAL_WALLET_RISK_REF,
      branchId: DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
      citizenId: 'cit-1',
    });

    expect(result.applied).toBe(true);
    expect(result.messageKey).toBe(DEMO_STEAL_WALLET_RISK_MESSAGE_KEYS.identified);
    expect(result.visibility).toBe('visible');
  });
});
