import { createHash } from 'node:crypto';
import { computeResolutionSeed, deterministicBranchRoll } from '../application/risk/deterministic-roll.js';
import {
  DEMO_STEAL_WALLET_RISK_BRANCHES,
  DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
  DEMO_STEAL_WALLET_RISK_REF,
  DEMO_STEAL_WALLET_RISK_RESOLUTION_VERSION,
} from '../slice/risk-constants.js';
import { SLICE_DEMO_TASK_OPTION_STEAL_WALLET } from '../slice/constants.js';

export function findResolutionSeedForRollValue(targetRollValue: number): string {
  for (let attempt = 0; attempt < 500_000; attempt++) {
    const seed = createHash('sha256').update(`risk-roll-test:${attempt}`).digest('hex');
    const digest = createHash('sha256').update(seed).digest();
    const rollValue = Number(digest.readBigUInt64BE(0) % 100n);
    if (rollValue === targetRollValue) {
      return seed;
    }
  }
  throw new Error(`Could not find resolution seed for rollValue ${targetRollValue}`);
}

export function findTaskInstanceIdForStealWalletBranch(branchId: string): string {
  for (let attempt = 0; attempt < 500_000; attempt++) {
    const taskInstanceId = createHash('sha256').update(`steal-risk-task:${branchId}:${attempt}`).digest('hex').slice(0, 36);
    const formatted = `${taskInstanceId.slice(0, 8)}-${taskInstanceId.slice(8, 12)}-${taskInstanceId.slice(12, 16)}-${taskInstanceId.slice(16, 20)}-${taskInstanceId.slice(20, 32)}`;
    const seed = computeResolutionSeed(
      formatted,
      SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
      DEMO_STEAL_WALLET_RISK_REF,
      DEMO_STEAL_WALLET_RISK_RESOLUTION_VERSION,
    );
    const roll = deterministicBranchRoll(seed, [...DEMO_STEAL_WALLET_RISK_BRANCHES]);
    if (roll.branchId === branchId) {
      return formatted;
    }
  }
  throw new Error(`Could not find taskInstanceId for branch ${branchId}`);
}

export function buildStealWalletResolvedRisk(resolutionSeed: string) {
  return {
    resolutionVersion: 1 as const,
    byOptionId: {
      [SLICE_DEMO_TASK_OPTION_STEAL_WALLET]: {
        riskSpecRef: DEMO_STEAL_WALLET_RISK_REF,
        exposureLevel: 'medium' as const,
        branches: DEMO_STEAL_WALLET_RISK_BRANCHES.map((branch) => ({
          branchId: branch.branchId,
          weight: branch.weight.toString(),
        })),
        resolutionSeed,
        resolutionVersion: DEMO_STEAL_WALLET_RISK_RESOLUTION_VERSION,
        frozenAt: new Date().toISOString(),
      },
    },
  };
}

export const STEAL_WALLET_RISK_BRANCH_IDS = [
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
  DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
] as const;
