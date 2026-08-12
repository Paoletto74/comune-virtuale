import type { EconomicOwnerRef } from '../../domain/ports/repositories.js';
import type { TaskSelectionAudit } from '../task/task-pool-types.js';
import type { ResolvedRiskContext } from '../risk/risk-types.js';

export interface ResolvedStealWalletEffect {
  effectSetRef: 'DEMO_STEAL_WALLET_IMMEDIATE';
  from: EconomicOwnerRef;
  to: EconomicOwnerRef;
  requestedAmountMinor: string;
  walletAtSpawnMinor: string;
  resolutionVersion: 1;
}

export interface TaskTimingContext {
  startedAt: string;
  readyAt?: string;
  durationMs?: number;
  actionCommittedAt?: string;
}

export interface PendingTaskChoiceContext {
  optionId: string;
  committedAt: string;
}

export interface DialogueSessionContext {
  sessionId: string;
  rootDefinitionId: string;
  stepIndex: number;
  path: string[];
  priorInstanceIds?: string[];
  sessionStartedAt: string;
  lastChoiceAt?: string;
}

export interface NpcPresentationContext {
  npcId: string;
  displayName: string;
  category: string;
  narrativeRole: string;
  isKnown: boolean;
  isFirstMeeting: boolean;
  recognitionLine?: string;
  toneLine?: string;
  memoryLine?: string;
  consequenceLine?: string;
  lastOutcomeSummary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  interactionCount?: number;
}

export interface TaskInstanceContext {
  targetNpcId?: string;
  resolvedAt?: string;
  targetRuleRef?: string;
  npcPresentation?: NpcPresentationContext;
  resolvedEffects?: {
    stealWallet?: ResolvedStealWalletEffect;
  };
  resolvedRisk?: ResolvedRiskContext;
  selectionAudit?: TaskSelectionAudit;
  timing?: TaskTimingContext;
  pendingChoice?: PendingTaskChoiceContext;
  dialogueSession?: DialogueSessionContext;
}

export type PersonalValuesEffect = Record<string, number>;

export interface CashDeltaEffect {
  kind: 'cash_delta';
  deltaMinor: bigint;
  transactionType: string;
  transactionClass: string;
  reasonCode: string;
}

export interface TransferEffect {
  kind: 'transfer';
  from: EconomicOwnerRef;
  to: EconomicOwnerRef;
  amountMinor: bigint;
  transactionType: string;
  transactionClass: string;
  reasonCode: string;
}

export interface NoEconomicEffect {
  kind: 'none';
}

export type EconomicEffect = CashDeltaEffect | TransferEffect | NoEconomicEffect;

export interface EffectBundle {
  messageKey: string;
  personalValues: PersonalValuesEffect;
  economic: EconomicEffect;
}

export interface EffectResolutionInput {
  definitionId: string;
  optionId: string;
  taskInstanceId: string;
  citizenId: string;
  context: TaskInstanceContext;
}
