import type { PersonalizationContextTag } from '../task/task-personalization-types.js';
import type { FlashOpportunityType } from '../../slice/flash-opportunities-constants.js';

export const STORY_THREAD_VERSION = 1;

export type StoryThreadStatus = 'active' | 'dormant' | 'completed' | 'abandoned';
export type StoryThreadType = 'npc' | 'world_event' | 'flash' | 'economic' | 'social';

export interface StoryThreadContext {
  threadTemplateId: string;
  stage: number;
  attempts: number;
  originTaskInstanceId?: string;
  originDefinitionId?: string;
  npcTemplateId?: string;
  npcId?: string;
  worldEventId?: string;
  worldEventTemplateId?: string;
  flashTemplateId?: string;
  flashOpportunityId?: string;
  lastOutcome?: string;
  relationshipLevel?: number;
}

export interface StoryThreadRecord {
  threadId: string;
  citizenId: string;
  type: StoryThreadType;
  status: StoryThreadStatus;
  origin: string;
  stage: number;
  priority: number;
  createdAtGameMs: number;
  lastActivityGameMs: number;
  dormantUntilGameMs: number | null;
  expiresAtGameMs: number | null;
  context: StoryThreadContext;
  metadata: Record<string, unknown>;
  idempotencyKey: string;
}

export interface StoryThreadWeightEffects {
  taskDefinitionMultipliers?: Record<string, number>;
  taskContextMultipliers?: Partial<Record<PersonalizationContextTag, number>>;
  flashTypeMultipliers?: Partial<Record<FlashOpportunityType, number>>;
  flashTemplateMultipliers?: Record<string, number>;
  npcTemplateMultipliers?: Record<string, number>;
}

export interface CombinedStoryThreadModifiers {
  activeThreadIds: string[];
  taskDefinitionMultipliers: Record<string, number>;
  taskContextMultipliers: Partial<Record<PersonalizationContextTag, number>>;
  flashTypeMultipliers: Partial<Record<FlashOpportunityType, number>>;
  flashTemplateMultipliers: Record<string, number>;
  npcTemplateMultipliers: Record<string, number>;
}

export interface TaskSelectionStoryThreadAudit {
  storyThreadVersion: number;
  activeThreadIds: string[];
  chosenMultiplier: number;
  appliedModifiers: CombinedStoryThreadModifiers;
}

export interface StoryThreadLifeContext {
  activeCount: number;
  completedCount: number;
  abandonedCount: number;
  dormantCount: number;
  recurringSocialThreads: number;
}
