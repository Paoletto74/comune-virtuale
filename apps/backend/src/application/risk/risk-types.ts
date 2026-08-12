export type RiskExposureLevel = 'none' | 'low' | 'medium' | 'high';

export type RiskExecutionOrder = 'post_deterministic_effects' | 'pre_deterministic_effects';

export interface OptionRiskBranchDefinition {
  branchId: string;
  weight: number;
}

export interface OptionRiskSpecDefinition {
  riskSpecRef: string;
  exposureLevel?: RiskExposureLevel;
  branches: OptionRiskBranchDefinition[];
  executionOrder?: RiskExecutionOrder;
  resolutionVersion: number;
}

export interface FrozenOptionRiskBranch {
  branchId: string;
  weight: string;
}

export interface FrozenOptionRiskSpec {
  riskSpecRef: string;
  exposureLevel?: RiskExposureLevel;
  branches: FrozenOptionRiskBranch[];
  resolutionSeed: string;
  resolutionVersion: number;
  frozenAt: string;
}

export interface ResolvedRiskContext {
  resolutionVersion: 1;
  byOptionId: Record<string, FrozenOptionRiskSpec>;
}

export interface RiskSpecResolveInput {
  definitionId: string;
  taskInstanceId: string;
  citizenId: string;
}

export interface RiskEvaluateInput {
  taskInstanceId: string;
  optionId: string;
  citizenId: string;
  resolvedRisk?: ResolvedRiskContext;
  correlationId?: string;
}

export interface RiskOutcomeDto {
  outcomeId: string;
  taskInstanceId: string;
  optionId: string;
  riskSpecRef: string;
  branchId: string;
  resolutionSeed: string;
  rollDigest: string;
  exposureLevel?: RiskExposureLevel;
  messageKey?: string;
  visibility?: 'visible' | 'hidden';
  duplicate: boolean;
}

export interface RiskOutcomeRecord {
  outcomeId: string;
  taskInstanceId: string;
  optionId: string;
  riskSpecRef: string;
  branchId: string;
  resolutionSeed: string;
  rollDigest: string;
  idempotencyKey: string;
  correlationId: string | null;
  createdAt: Date;
}

export interface ConsequenceApplyInput {
  outcomeId: string;
  taskInstanceId: string;
  optionId: string;
  riskSpecRef: string;
  branchId: string;
  citizenId: string;
  correlationId?: string;
}

export interface ConsequenceApplyResult {
  applied: boolean;
  consequenceRefs: string[];
  messageKey?: string;
  visibility?: 'visible' | 'hidden';
}

export interface RiskEffectsApplied {
  exposureLevel?: RiskExposureLevel;
  outcome?: {
    branchId: string;
    visibility: 'visible' | 'hidden';
    messageKey?: string;
  };
}
