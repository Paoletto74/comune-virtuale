import { createHash } from 'node:crypto';

export function computeResolutionSeed(
  taskInstanceId: string,
  optionId: string,
  riskSpecRef: string,
  resolutionVersion: number,
): string {
  return createHash('sha256')
    .update(`${taskInstanceId}:${optionId}:${riskSpecRef}:v${resolutionVersion}`)
    .digest('hex');
}

export interface BranchWeightInput {
  branchId: string;
  weight: number | string;
}

export interface DeterministicRollResult {
  branchId: string;
  rollDigest: string;
  rollValue: number;
}

export function deterministicBranchRoll(
  resolutionSeed: string,
  branches: BranchWeightInput[],
): DeterministicRollResult {
  const normalized = branches.map((branch) => ({
    branchId: branch.branchId,
    weight: typeof branch.weight === 'string' ? Number.parseInt(branch.weight, 10) : branch.weight,
  }));

  const totalWeight = normalized.reduce((sum, branch) => sum + branch.weight, 0);
  if (totalWeight <= 0 || normalized.some((branch) => branch.weight <= 0)) {
    throw new Error('Invalid branch weights for deterministic roll');
  }

  const digest = createHash('sha256').update(resolutionSeed).digest();
  const rollValue = Number(digest.readBigUInt64BE(0) % BigInt(totalWeight));

  let cumulative = 0;
  for (const branch of normalized) {
    cumulative += branch.weight;
    if (rollValue < cumulative) {
      return {
        branchId: branch.branchId,
        rollDigest: digest.toString('hex'),
        rollValue,
      };
    }
  }

  const lastBranch = normalized[normalized.length - 1]!;
  return {
    branchId: lastBranch.branchId,
    rollDigest: digest.toString('hex'),
    rollValue,
  };
}
