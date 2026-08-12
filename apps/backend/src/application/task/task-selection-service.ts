import { randomUUID } from 'node:crypto';
import { AppError } from '../../api/plugins/error-handler-plugin.js';
import type { TaskRepository } from '../../domain/ports/repositories.js';
import { FEED_VISIBLE_SIZE } from '../../slice/feed-constants.js';
import { POOL_START, TASK_SELECTION_VERSION } from '../../slice/task-pool-constants.js';
import {
  buildTaskSelectionIdempotencyKey,
  computeTaskSelectionSeed,
  computeTaskSelectionSourceSeed,
  deterministicWeightedTaskSelection,
} from './deterministic-task-selection.js';
import { buildPlayerSelectionContext } from './player-selection-context.js';
import type { TaskDefinitionCatalog } from './task-definition-catalog.js';
import { defaultTaskDefinitionCatalog } from './task-definition-catalog.js';
import type { TaskInstanceMaterializer } from './task-instance-materializer.js';
import type { TaskPoolEntry, TaskSelectionAudit, TaskSelectionResult, TaskSelectionTrigger } from './task-pool-types.js';
import type { TaskPoolRegistry } from './task-pool-registry.js';
import { defaultTaskPoolRegistry } from './task-pool-registry.js';
import type { TaskPoolResolver } from './task-pool-resolver.js';
import { defaultTaskPoolResolver } from './task-pool-resolver.js';
import type { TaskInstanceContext } from '../effects/effect-types.js';
import type { CitizenProfileService } from '../citizen/citizen-profile-service.js';
import type { CitizenNpcRelationshipRepository } from '../../domain/ports/repositories.js';
import { getTaskPersonalizationMetadata } from './task-personalization-metadata.js';
import { applyPersonalizedWeights } from './task-personalization-scorer.js';
import { applyRelationshipWeights } from '../npc/npc-relationship-scorer.js';
import { buildRelationshipSelectionContext } from './relationship-selection-context.js';
import {
  TASK_PERSONALIZATION_VERSION,
  TASK_RELATIONSHIP_VERSION,
  type PersonalizationContextTag,
  type TaskSelectionPersonalizationAudit,
  type TaskSelectionRelationshipAudit,
} from './task-personalization-types.js';
import { getNpcTaskBinding } from '../../slice/npc-relationship-constants.js';
import { getNpcTaskConsequence } from '../../slice/npc-relationship-consequences-constants.js';
import { matchesNpcRelationshipQuery, type KnownRelationshipSnapshot } from '../npc/npc-relationship-query.js';
import type { WorldEventService } from '../world/world-event-service.js';
import type { WorldClockService } from '../../domain/time/world-clock-service.js';
import type { StoryThreadService } from '../story/story-thread-service.js';
import { applyWorldEventWeights, resolveNpcWorldEventMultiplier } from '../world/world-event-effect-resolver.js';
import { applyStoryThreadWeights, resolveNpcStoryThreadMultiplier } from '../story/story-thread-effect-resolver.js';
import { WORLD_EVENT_VERSION } from '../world/world-event-types.js';
import { STORY_THREAD_VERSION } from '../story/story-thread-types.js';
import type { GameSurfaceRepository } from '../../domain/ports/repositories.js';
import {
  applyGangCriminalTaskWeights,
  isGangMemberFromEmployment,
} from '../../slice/gang-task-boost.js';

type SelectNextInput = TaskSelectionTrigger & {
  feedFillIndex?: number;
  feedContextTags?: PersonalizationContextTag[];
  forcedPoolId?: string;
};

export class TaskSelectionService {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly materializer: TaskInstanceMaterializer,
    private readonly catalog: TaskDefinitionCatalog = defaultTaskDefinitionCatalog,
    private readonly poolRegistry: TaskPoolRegistry = defaultTaskPoolRegistry,
    private readonly poolResolver: TaskPoolResolver = defaultTaskPoolResolver,
    private readonly profile?: CitizenProfileService,
    private readonly relationships?: CitizenNpcRelationshipRepository,
    private readonly worldEvents?: WorldEventService,
    private readonly worldClock?: WorldClockService,
    private readonly storyThreads?: StoryThreadService,
    private readonly gameSurface?: GameSurfaceRepository,
  ) {}

  async fillFeed(input: TaskSelectionTrigger): Promise<TaskSelectionResult[]> {
    const results: TaskSelectionResult[] = [];
    let fillIndex = 0;
    const feedContextTags = await this.buildInitialFeedContextTags(input.citizenId);

    while (fillIndex < FEED_VISIBLE_SIZE) {
      const active = await this.tasks.findActiveByCitizenId(input.citizenId);
      if (active.length + results.length >= FEED_VISIBLE_SIZE) {
        break;
      }

      const selection = await this.selectNext({
        ...input,
        feedFillIndex: fillIndex,
        feedContextTags: [...feedContextTags],
      });
      if (!selection) {
        break;
      }

      if (selection.created) {
        results.push(selection);
        feedContextTags.push(
          getTaskPersonalizationMetadata(selection.definitionId).primaryContext,
        );
      }
      fillIndex += 1;
    }

    return results;
  }

  private async buildInitialFeedContextTags(
    citizenId: string,
  ): Promise<PersonalizationContextTag[]> {
    const active = await this.tasks.findActiveByCitizenId(citizenId);
    return active.map(
      (instance) => getTaskPersonalizationMetadata(instance.definitionId).primaryContext,
    );
  }

  async selectNext(input: SelectNextInput): Promise<TaskSelectionResult | null> {
    const poolId = input.forcedPoolId ?? this.poolResolver.resolvePoolId(input);
    if (!poolId) {
      return null;
    }

    const pool = this.poolRegistry.get(poolId);
    if (!pool || pool.entries.length === 0) {
      return this.handleEmptyPool(input, poolId);
    }

    const idempotencyKey = buildTaskSelectionIdempotencyKey({
      trigger: input.trigger,
      citizenId: input.citizenId,
      poolId,
      completedTaskInstanceId:
        input.trigger === 'task_completed' ? input.completedTaskInstanceId : undefined,
      feedFillIndex: input.feedFillIndex,
      dayPhase: input.trigger === 'phase_changed' ? input.dayPhase : undefined,
      refreshNonce: input.trigger === 'anti_stall_refresh' ? input.refreshNonce : undefined,
      forcedPoolId: input.forcedPoolId,
    });

    const existing = await this.tasks.findBySelectionIdempotencyKey(idempotencyKey);
    if (existing) {
      return this.toSelectionResult(existing, false);
    }

    const playerContext = await buildPlayerSelectionContext(this.tasks, input.citizenId);
    const relationshipContext = this.relationships
      ? await buildRelationshipSelectionContext(this.relationships, input.citizenId)
      : new Map();

    let candidates = this.filterAvailableEntries(pool.entries, playerContext);
    candidates = this.filterRelationshipEligibleEntries(candidates, relationshipContext);

    if (candidates.length === 0) {
      return this.handleNoCandidates(input, poolId);
    }

    const sourceSeed = computeTaskSelectionSourceSeed({
      trigger: input.trigger,
      citizenId: input.citizenId,
      completedTaskInstanceId:
        input.trigger === 'task_completed' ? input.completedTaskInstanceId : undefined,
      feedFillIndex: input.feedFillIndex,
      dayPhase: input.trigger === 'phase_changed' ? input.dayPhase : undefined,
      refreshNonce: input.trigger === 'anti_stall_refresh' ? input.refreshNonce : undefined,
    });
    const selectionSeed = computeTaskSelectionSeed(poolId, sourceSeed, TASK_SELECTION_VERSION);

    const profileContext = this.profile
      ? await this.profile.getProfileContextForSelection(input.citizenId)
      : null;

    const worldEventModifiers = await this.resolveWorldEventModifiers();
    const storyThreadModifiers = await this.resolveStoryThreadModifiers(input.citizenId);

    const shouldPersonalize = profileContext !== null && candidates.length > 1;
    const weightedCandidates = shouldPersonalize
      ? applyPersonalizedWeights(
          candidates.map((entry) => ({
            definitionId: entry.definitionId,
            weight: entry.weight,
          })),
          profileContext,
          input.feedContextTags ?? [],
        )
      : candidates.map((entry) => ({
          definitionId: entry.definitionId,
          baseWeight: entry.weight,
          adjustedWeight: entry.weight,
          multiplier: 1,
          primaryContext: getTaskPersonalizationMetadata(entry.definitionId).primaryContext,
        }));

    const relationshipAdjusted =
      relationshipContext.size > 0
        ? applyRelationshipWeights(
            weightedCandidates.map((entry) => ({
              definitionId: entry.definitionId,
              adjustedWeight: entry.adjustedWeight,
            })),
            relationshipContext,
          ).map((entry) => {
            const binding = getNpcTaskBinding(entry.definitionId);
            const consequence = getNpcTaskConsequence(entry.definitionId);
            const templateId = consequence?.templateId ?? binding?.templateId;
            const npcWorldMultiplier = resolveNpcWorldEventMultiplier(templateId, worldEventModifiers);
            const npcStoryMultiplier = resolveNpcStoryThreadMultiplier(templateId, storyThreadModifiers);
            const npcMultiplier = npcWorldMultiplier * npcStoryMultiplier;
            if (npcMultiplier === 1) return entry;
            return {
              ...entry,
              multiplier: entry.multiplier * npcMultiplier,
              adjustedWeight: Math.max(1, Math.round(entry.adjustedWeight * npcMultiplier)),
            };
          })
        : weightedCandidates.map((entry) => ({
            definitionId: entry.definitionId,
            baseWeight: entry.adjustedWeight,
            adjustedWeight: entry.adjustedWeight,
            multiplier: 1,
            matchedQuery: false,
            consequenceType: undefined,
          }));

    const worldEventAdjusted = applyWorldEventWeights(
      relationshipAdjusted.map((entry) => ({
        definitionId: entry.definitionId,
        adjustedWeight: entry.adjustedWeight,
      })),
      worldEventModifiers,
    );

    const storyThreadAdjusted = applyStoryThreadWeights(
      worldEventAdjusted.map((entry) => ({
        definitionId: entry.definitionId,
        adjustedWeight: entry.adjustedWeight,
      })),
      storyThreadModifiers,
    );

    const employment = this.gameSurface
      ? await this.gameSurface.getEmployment(input.citizenId)
      : null;
    const isGangMember = isGangMemberFromEmployment(employment?.currentOfferId);
    const gangAdjusted = applyGangCriminalTaskWeights(storyThreadAdjusted, isGangMember);

    if (gangAdjusted.length === 0) {
      return this.handleNoCandidates(input, poolId);
    }

    const selection = deterministicWeightedTaskSelection(
      selectionSeed,
      gangAdjusted.map((entry) => ({
        definitionId: entry.definitionId,
        weight: entry.adjustedWeight,
      })),
    );

    const chosenAdjustment = weightedCandidates.find(
      (entry) => entry.definitionId === selection.chosenDefinitionId,
    );
    const chosenRelationship = relationshipAdjusted.find(
      (entry) => entry.definitionId === selection.chosenDefinitionId,
    );
    const chosenWorldEvent = worldEventAdjusted.find(
      (entry) => entry.definitionId === selection.chosenDefinitionId,
    );
    const chosenStoryThread = gangAdjusted.find(
      (entry) => entry.definitionId === selection.chosenDefinitionId,
    );

    const personalizationAudit: TaskSelectionPersonalizationAudit | undefined =
      shouldPersonalize && profileContext && chosenAdjustment
        ? {
            personalizationVersion: TASK_PERSONALIZATION_VERSION,
            occupationCode: profileContext.occupationCode,
            level: profileContext.level,
            chosenPrimaryContext: chosenAdjustment.primaryContext,
            chosenMultiplier: chosenAdjustment.multiplier,
            feedContextSnapshot: [...(input.feedContextTags ?? [])],
          }
        : undefined;

    const consequence = getNpcTaskConsequence(selection.chosenDefinitionId);
    const binding = getNpcTaskBinding(selection.chosenDefinitionId);
    const relationshipAudit: TaskSelectionRelationshipAudit | undefined = chosenRelationship
      ? {
          relationshipVersion: TASK_RELATIONSHIP_VERSION,
          chosenMultiplier: chosenRelationship.multiplier,
          matchedQuery: chosenRelationship.matchedQuery,
          consequenceType: chosenRelationship.consequenceType,
          templateId: consequence?.templateId ?? binding?.templateId,
        }
      : undefined;

    const worldEventAudit = chosenWorldEvent
      ? {
          worldEventVersion: WORLD_EVENT_VERSION,
          activeEventIds: worldEventModifiers.activeEventIds,
          chosenMultiplier: chosenWorldEvent.multiplier,
          appliedModifiers: worldEventModifiers,
        }
      : undefined;

    const storyThreadAudit = chosenStoryThread
      ? {
          storyThreadVersion: STORY_THREAD_VERSION,
          activeThreadIds: storyThreadModifiers.activeThreadIds,
          chosenMultiplier: chosenStoryThread.multiplier,
          appliedModifiers: storyThreadModifiers,
        }
      : undefined;

    const selectionAudit: TaskSelectionAudit = {
      poolId,
      selectionVersion: TASK_SELECTION_VERSION,
      sourceSeed,
      selectionSeed,
      candidateDefinitionIds: candidates.map((entry) => entry.definitionId),
      chosenDefinitionId: selection.chosenDefinitionId,
      idempotencyKey,
      ...(personalizationAudit ? { personalization: personalizationAudit } : {}),
      ...(relationshipAudit ? { relationship: relationshipAudit } : {}),
      ...(worldEventAudit ? { worldEvent: worldEventAudit } : {}),
      ...(storyThreadAudit ? { storyThread: storyThreadAudit } : {}),
      ...(input.correlationId ? { correlationId: input.correlationId } : {}),
      ...(input.trigger === 'task_completed'
        ? { sourceCompletedTaskInstanceId: input.completedTaskInstanceId }
        : {}),
      ...(input.trigger === 'phase_changed'
        ? { dayPhase: input.dayPhase, previousDayPhase: input.previousDayPhase }
        : {}),
    };

    const taskInstanceId = randomUUID();
    const definition = this.catalog.get(selection.chosenDefinitionId);
    const taskKind = definition?.taskKind ?? 'standard';
    const isStandard = taskKind === 'standard';

    const materialized = await this.materializer.materialize({
      definitionId: selection.chosenDefinitionId,
      taskInstanceId,
      citizenId: input.citizenId,
      includeTiming: false,
    });

    const context: TaskInstanceContext = {
      ...materialized.context,
      selectionAudit,
    };

    const persisted = await this.tasks.createTaskInstanceIdempotent({
      citizenId: input.citizenId,
      idempotencyKey,
      taskInstanceId,
      definitionId: selection.chosenDefinitionId,
      targetNpcId: materialized.targetNpcId ?? null,
      context: context as Record<string, unknown>,
      status: isStandard ? 'pending' : 'active',
    });

    return this.toSelectionResult(persisted.record, persisted.created);
  }

  private filterAvailableEntries(
    entries: readonly TaskPoolEntry[],
    playerContext: Awaited<ReturnType<typeof buildPlayerSelectionContext>>,
  ): TaskPoolEntry[] {
    return entries.filter((entry) => {
      if (!entry.enabled || entry.weight <= 0) {
        return false;
      }

      if (!this.catalog.isSupported(entry.definitionId)) {
        return false;
      }

      if (
        entry.repeatPolicy === 'once' &&
        playerContext.completedDefinitionIds.has(entry.definitionId)
      ) {
        return false;
      }

      if (playerContext.activeOrPendingDefinitionIds.has(entry.definitionId)) {
        return false;
      }

      return true;
    });
  }

  private filterRelationshipEligibleEntries(
    entries: TaskPoolEntry[],
    relationships: ReadonlyMap<string, KnownRelationshipSnapshot>,
  ): TaskPoolEntry[] {
    if (relationships.size === 0) {
      return entries;
    }

    return entries.filter((entry) => {
      const consequence = getNpcTaskConsequence(entry.definitionId);
      if (!consequence?.requireEligibility) {
        return true;
      }

      const relationship = relationships.get(consequence.templateId) ?? null;
      if (consequence.consequenceKey && relationship?.appliedConsequenceKeys.has(consequence.consequenceKey)) {
        return false;
      }

      return matchesNpcRelationshipQuery(consequence.eligibilityQuery, relationship);
    });
  }

  private async resolveWorldEventModifiers() {
    if (!this.worldEvents || !this.worldClock) {
      return {
        activeEventIds: [],
        taskContextMultipliers: {},
        flashTypeMultipliers: {},
        flashTemplateMultipliers: {},
        npcTemplateMultipliers: {},
      };
    }

    const gameTime = await this.worldClock.now();
    const gameTimeMs = Number(gameTime.worldTimeMs);
    await this.worldEvents.evaluateScheduler(gameTimeMs);
    return this.worldEvents.getCombinedModifiers(gameTimeMs);
  }

  private async resolveStoryThreadModifiers(citizenId: string) {
    if (!this.storyThreads || !this.worldClock) {
      return {
        activeThreadIds: [],
        taskDefinitionMultipliers: {},
        taskContextMultipliers: {},
        flashTypeMultipliers: {},
        flashTemplateMultipliers: {},
        npcTemplateMultipliers: {},
      };
    }

    const gameTime = await this.worldClock.now();
    const gameTimeMs = Number(gameTime.worldTimeMs);
    return this.storyThreads.getCombinedModifiers(citizenId, gameTimeMs);
  }

  private toSelectionResult(
    record: {
      taskInstanceId: string;
      definitionId: string;
      context: Record<string, unknown>;
    },
    created: boolean,
  ): TaskSelectionResult {
    const audit = record.context.selectionAudit as TaskSelectionAudit | undefined;
    if (!audit) {
      throw new Error('Task instance missing selection audit');
    }

    return {
      taskInstanceId: record.taskInstanceId,
      definitionId: record.definitionId,
      poolId: audit.poolId,
      selectionAudit: audit,
      created,
    };
  }

  private handleEmptyPool(input: SelectNextInput, poolId: string): null {
    if (
      input.trigger === 'onboarding' &&
      poolId === POOL_START &&
      (input.feedFillIndex ?? 0) === 0
    ) {
      throw new AppError(
        'TECHNICAL',
        'ONBOARDING_TASK_SELECTION_FAILED',
        'error.task.onboarding_selection_failed',
      );
    }

    return null;
  }

  private handleNoCandidates(input: SelectNextInput, poolId: string): null {
    if (
      input.trigger === 'onboarding' &&
      poolId === POOL_START &&
      (input.feedFillIndex ?? 0) === 0
    ) {
      throw new AppError(
        'TECHNICAL',
        'ONBOARDING_TASK_SELECTION_FAILED',
        'error.task.onboarding_selection_failed',
      );
    }

    return null;
  }
}
