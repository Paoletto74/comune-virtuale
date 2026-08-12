import type { PersonalizationContextTag } from '../task/task-personalization-types.js';
import type { FlashOpportunityType } from '../../slice/flash-opportunities-constants.js';

export const WORLD_EVENT_VERSION = 1;

export type WorldEventStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';

export type WorldEventType =
  | 'weather'
  | 'economic'
  | 'social'
  | 'geopolitical'
  | 'infrastructure'
  | 'local'
  | 'special';

export type WorldEventScope = 'global' | 'local';

export type WorldEventSeverity = 'low' | 'moderate' | 'high';

export interface WorldEventEffects {
  taskContextMultipliers?: Partial<Record<PersonalizationContextTag, number>>;
  taskContextPenalties?: Partial<Record<PersonalizationContextTag, number>>;
  flashTypeMultipliers?: Partial<Record<FlashOpportunityType, number>>;
  flashTemplateMultipliers?: Record<string, number>;
  npcTemplateMultipliers?: Record<string, number>;
  /** Temporary reward scaling keyed by effect channel (e.g. taskReward, flashReward). */
  rewardMultipliers?: Record<string, number>;
  /** Temporary risk exposure nudges keyed by riskSpecRef. */
  riskMultipliers?: Record<string, number>;
  /** Life review / evolution frequency nudges keyed by review channel. */
  lifeEventMultipliers?: Record<string, number>;
  /** Narrative tone weight nudges keyed by channel. */
  narrativeMultipliers?: Record<string, number>;
}

export interface WorldEventRecord {
  eventId: string;
  templateId: string;
  scope: WorldEventScope;
  type: WorldEventType;
  status: WorldEventStatus;
  severity: WorldEventSeverity;
  title: string;
  body: string;
  comuneLine: string | null;
  source: string;
  startedAtGameMs: number;
  endsAtGameMs: number;
  effects: WorldEventEffects;
  metadata: Record<string, unknown>;
  idempotencyKey: string;
  zoneId: string | null;
  createdAt: Date;
}

export interface WorldEventNoticeDto {
  eventId: string;
  type: WorldEventType;
  scope: WorldEventScope;
  severity: WorldEventSeverity;
  title: string;
  body: string;
  comuneLine: string | null;
  startedAtGameMs: number;
  endsAtGameMs: number;
  remainingGameMs: number;
}

export interface WorldEventHomeStateDto {
  enabled: boolean;
  activeEvents: WorldEventNoticeDto[];
}

export interface CombinedWorldEventModifiers {
  activeEventIds: string[];
  taskContextMultipliers: Partial<Record<PersonalizationContextTag, number>>;
  flashTypeMultipliers: Partial<Record<FlashOpportunityType, number>>;
  flashTemplateMultipliers: Record<string, number>;
  npcTemplateMultipliers: Record<string, number>;
}

export interface TaskSelectionWorldEventAudit {
  worldEventVersion: number;
  activeEventIds: string[];
  chosenMultiplier: number;
  appliedModifiers: CombinedWorldEventModifiers;
}
