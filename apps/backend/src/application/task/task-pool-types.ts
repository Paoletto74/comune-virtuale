import type { DayNightPhase } from '@comune-virtuale/shared';
import type { TaskSelectionPersonalizationAudit } from './task-personalization-types.js';
import type { TaskSelectionRelationshipAudit } from './task-personalization-types.js';
import type { TaskSelectionWorldEventAudit } from '../world/world-event-types.js';
import type { TaskSelectionStoryThreadAudit } from '../story/story-thread-types.js';

export type TaskPoolRepeatPolicy = 'once' | 'repeatable';

export interface TaskPoolEntry {
  definitionId: string;
  weight: number;
  repeatPolicy: TaskPoolRepeatPolicy;
  enabled: boolean;
}

export interface TaskPoolDefinition {
  poolId: string;
  entries: readonly TaskPoolEntry[];
}

export interface TaskSelectionAudit {
  poolId: string;
  selectionVersion: number;
  sourceSeed: string;
  selectionSeed: string;
  candidateDefinitionIds: string[];
  chosenDefinitionId: string;
  idempotencyKey: string;
  correlationId?: string;
  sourceCompletedTaskInstanceId?: string;
  dayPhase?: DayNightPhase;
  previousDayPhase?: DayNightPhase;
  personalization?: TaskSelectionPersonalizationAudit;
  relationship?: TaskSelectionRelationshipAudit;
  worldEvent?: TaskSelectionWorldEventAudit;
  storyThread?: TaskSelectionStoryThreadAudit;
}

export type TaskSelectionTrigger =
  | {
      trigger: 'onboarding';
      citizenId: string;
      correlationId?: string;
    }
  | {
      trigger: 'task_completed';
      citizenId: string;
      completedTaskInstanceId: string;
      completedDefinitionId: string;
      correlationId?: string;
    }
  | {
      trigger: 'phase_changed';
      citizenId: string;
      dayPhase: DayNightPhase;
      previousDayPhase: DayNightPhase;
      correlationId?: string;
    }
  | {
      trigger: 'anti_stall_refresh';
      citizenId: string;
      correlationId?: string;
      /** Unique per refresh wave — avoids idempotency collisions on repeatable tasks. */
      refreshNonce?: string;
    };

export interface TaskSelectionResult {
  taskInstanceId: string;
  definitionId: string;
  poolId: string;
  selectionAudit: TaskSelectionAudit;
  created: boolean;
}

export interface PlayerSelectionContext {
  citizenId: string;
  completedDefinitionIds: ReadonlySet<string>;
  activeOrPendingDefinitionIds: ReadonlySet<string>;
}
