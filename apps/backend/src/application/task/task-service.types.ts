export interface TaskSummaryDto {
  taskInstanceId: string;
  taskId: string;
  title: string;
  description: string;
  status: string;
  taskKind?: 'standard' | 'dialogue_step' | 'dialogue_terminal';
  feedState?: 'available' | 'interactive' | 'in_progress' | 'ready' | 'dialogue';
  readyAt?: string;
  pendingOptionId?: string;
  pendingOptionLabel?: string;
  gameplayHints?: {
    tags: Array<'normal' | 'positive' | 'economic' | 'high_gain' | 'urgent' | 'risky' | 'ambiguous'>;
    maxGainMinor?: string;
  };
  npc?: {
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
  };
  options: Array<{
    optionId: string;
    label: string;
    presentationHint?: string;
    statEffects?: {
      sympathy?: number;
      reputation?: number;
      happiness?: number;
      cashMinor?: string;
    };
  }>;
  statEffectsPreview?: Array<{
    optionId: string;
    sympathy?: number;
    reputation?: number;
    happiness?: number;
    cashMinor?: string;
  }>;
  productRequirement?: {
    label: string;
    satisfied: boolean;
    detail: string;
  };
}

export interface StartTaskInput {
  citizenId: string;
  taskInstanceId: string;
  correlationId?: string;
}

export interface CompleteTaskInput {
  citizenId: string;
  taskInstanceId: string;
  optionId: string;
  correlationId?: string;
}

import type { PersonalValuesRecord } from '../../slice/personal-values-constants.js';

/** Full personal values state returned after task completion. */
export type PersonalValueDelta = PersonalValuesRecord;

/** Non-zero personal value changes applied by a task option. */
export type PersonalValueEffectsApplied = Partial<PersonalValuesRecord>;

export interface CashMoneyDto {
  amountMinor: string;
  currency: string;
}

export interface CompleteTaskEffectsApplied {
  personalValues: PersonalValueEffectsApplied;
  economic: {
    cash: {
      deltaMinor: string;
      currency: string;
    };
  };
  risk?: {
    exposureLevel?: 'none' | 'low' | 'medium' | 'high';
    outcome?: {
      branchId: string;
      visibility: 'visible' | 'hidden';
      messageKey?: string;
    };
  };
  progression?: {
    pointsGranted: number;
  };
}

export interface LevelUpNoticeDto {
  level: number;
  title: string;
  body: string;
  eventId?: string;
}

export interface CompleteTaskResult {
  taskInstanceId: string;
  taskId: string;
  optionId: string;
  status: 'completed' | 'waiting';
  messageKey: string;
  personalValues: PersonalValueDelta;
  economic: {
    cash: CashMoneyDto;
  };
  effectsApplied: CompleteTaskEffectsApplied;
  profileUnlocks?: Array<{ dimensionId: string; label: string }>;
  levelUp?: LevelUpNoticeDto;
  dialogueContinued?: boolean;
  taskWaiting?: boolean;
  readyAt?: string;
}
