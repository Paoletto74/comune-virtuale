import { randomUUID } from 'node:crypto';
import type { CitizenRepository, TaskRepository } from '../../domain/ports/repositories.js';
import type { EconomyService } from '../economy/economy-service.js';
import type { EffectRegistry } from '../effects/effect-registry.js';
import { defaultEffectRegistry } from '../effects/effect-registry.js';
import { applyEconomicEffect } from '../effects/effect-applicator.js';
import { scaleTaskCashReward } from '../../slice/task-economy-scaling.js';
import type { TaskInstanceContext } from '../effects/effect-types.js';
import type { RiskService } from '../risk/risk-service.js';
import { SLICE_GAME_CURRENCY_ID } from '../../slice/economy-constants.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';
import { getDialogueNext } from '../../slice/dialogue-routing.js';
import { FEED_VISIBLE_SIZE, MAX_CONCURRENT_STANDARD_TASKS } from '../../slice/feed-constants.js';
import { getDefaultTaskDurationMs } from '../../slice/task-timing-constants.js';
import type {
  CompleteTaskInput,
  CompleteTaskResult,
  PersonalValueDelta,
  PersonalValueEffectsApplied,
  StartTaskInput,
  TaskSummaryDto,
} from './task-service.types.js';
import type { TaskDefinitionCatalog } from './task-definition-catalog.js';
import { defaultTaskDefinitionCatalog } from './task-definition-catalog.js';
import type { TaskSelectionService } from './task-selection-service.js';
import type { TaskInstanceMaterializer } from './task-instance-materializer.js';
import type { CitizenProfileService } from '../citizen/citizen-profile-service.js';
import type { CitizenProgressionService } from '../citizen/citizen-progression-service.js';
import type { NpcRelationshipService } from '../npc/npc-relationship-service.js';
import type { WorldClockService } from '../../domain/time/world-clock-service.js';
import { getNpcTaskConsequence } from '../../slice/npc-relationship-consequences-constants.js';
import { getNpcTaskBinding } from '../../slice/npc-relationship-constants.js';
import type { StoryThreadService } from '../story/story-thread-service.js';
import type { TaskFeedPhaseRefreshService } from './task-feed-phase-refresh-service.js';
import { getTaskGameplayHints, getTaskOptionStatEffects } from './task-gameplay-profile.js';
import { personalValuesFromPartial, nonZeroPersonalDeltas } from '../../slice/personal-values-constants.js';
import type { GameSurfaceRepository } from '../../domain/ports/repositories.js';
import { evaluateProductRequirement, findConsumableInventoryMatch } from '../../slice/product-requirement-resolver.js';
import { getTaskProductRequirement } from '../../slice/task-product-requirements-constants.js';
import { getTaskAttributeEffects } from '../../slice/task-attribute-effects-constants.js';
import {
  checkAttributeRequirements,
  mergeAttributeMaps,
  projectAttributePreview,
} from '../../slice/attribute-gameplay-constants.js';
import type { CareerProgressionService } from '../citizen/career-progression-service.js';
import type { CitizenNpcRelationshipRepository } from '../../domain/ports/repositories.js';
import type { SocialGameplayService } from '../social/social-gameplay-service.js';
import './register-slice-task-definitions.js';

export type {
  CompleteTaskInput,
  CompleteTaskResult,
  PersonalValueDelta,
  StartTaskInput,
  TaskSummaryDto,
  CashMoneyDto,
  CompleteTaskEffectsApplied,
} from './task-service.types.js';

const DIALOGUE_CONTINUED_MESSAGE_KEY = 'slice.dialogue.continued';
const TASK_ACTION_COMMITTED_MESSAGE_KEY = 'slice.task.action_committed';

function cashEffectFromDelta(deltaMinor: bigint) {
  return {
    deltaMinor: deltaMinor.toString(),
    currency: SLICE_GAME_CURRENCY_ID,
  };
}

function personalValuesFromRecord(values: Record<string, number>): PersonalValueDelta {
  return personalValuesFromPartial(values);
}

function personalDeltaFromRecord(values: Record<string, number>): PersonalValueEffectsApplied {
  return nonZeroPersonalDeltas(values);
}

function zeroEffectsApplied(): CompleteTaskResult['effectsApplied'] {
  return {
    personalValues: {},
    economic: {
      cash: {
        deltaMinor: '0',
        currency: SLICE_GAME_CURRENCY_ID,
      },
    },
  };
}

export class TaskService {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly citizens: CitizenRepository,
    private readonly economy: EconomyService,
    private readonly effects: EffectRegistry = defaultEffectRegistry,
    private readonly risk?: RiskService,
    private readonly catalog: TaskDefinitionCatalog = defaultTaskDefinitionCatalog,
    private readonly materializer?: TaskInstanceMaterializer,
    private readonly taskSelection?: TaskSelectionService,
    private readonly profile?: CitizenProfileService,
    private readonly npcRelationships?: NpcRelationshipService,
    private readonly progression?: CitizenProgressionService,
    private readonly worldClock?: WorldClockService,
    private readonly storyThreads?: StoryThreadService,
    private readonly taskFeedPhaseRefresh?: TaskFeedPhaseRefreshService,
    private readonly inventoryAccess?: Pick<
      GameSurfaceRepository,
      'listInventoryByCitizen' | 'removeInventoryItem'
    >,
    private readonly careerProgression?: CareerProgressionService,
    private readonly npcRelationshipRepo?: CitizenNpcRelationshipRepository,
    private readonly socialGameplay?: SocialGameplayService,
  ) {}

  async getActiveTasks(citizenId: string, correlationId?: string): Promise<TaskSummaryDto[]> {
    await this.finalizeDueStandardTasks(citizenId, correlationId);
    if (this.taskFeedPhaseRefresh) {
      await this.taskFeedPhaseRefresh.refreshIfPhaseChanged(citizenId, correlationId);
    }
    await this.ensureMinimumFeedTasks(citizenId, correlationId);
    const instances = await this.tasks.findActiveByCitizenId(citizenId);
    const inventory = this.inventoryAccess
      ? await this.inventoryAccess.listInventoryByCitizen(citizenId)
      : [];
    const personalValues = await this.citizens.getPersonalValues(citizenId);
    return instances.map((instance) => this.toSummary(instance, inventory, personalValues));
  }

  async startTask(input: StartTaskInput): Promise<TaskSummaryDto> {
    const instance = await this.tasks.findById(input.taskInstanceId);
    if (!instance || instance.citizenId !== input.citizenId) {
      throw new AppError('NOT_FOUND', 'TASK_NOT_FOUND', 'error.task.not_found');
    }

    if (instance.status !== 'pending') {
      throw new AppError('CONFLICT', 'TASK_ALREADY_STARTED', 'error.task.already_started');
    }

    const definition = this.catalog.get(instance.definitionId);
    const taskKind = definition?.taskKind ?? 'standard';
    if (taskKind !== 'standard') {
      throw new AppError('BUSINESS', 'TASK_NOT_STARTABLE', 'error.task.not_startable');
    }

    const activeInstances = await this.tasks.findActiveByCitizenId(input.citizenId);
    const runningStandardCount = activeInstances.filter((row) => {
      if (row.status !== 'active') {
        return false;
      }
      const rowDefinition = this.catalog.get(row.definitionId);
      return (rowDefinition?.taskKind ?? 'standard') === 'standard';
    }).length;

    if (runningStandardCount >= MAX_CONCURRENT_STANDARD_TASKS) {
      throw new AppError(
        'CONFLICT',
        'MAX_STANDARD_TASKS_REACHED',
        'error.task.max_standard_tasks',
      );
    }

    const requirementDef = getTaskProductRequirement(instance.definitionId);
    if (requirementDef && this.inventoryAccess) {
      const inventory = await this.inventoryAccess.listInventoryByCitizen(input.citizenId);
      const evaluation = evaluateProductRequirement(requirementDef.requirement, inventory);
      if (!evaluation.satisfied) {
        throw new AppError(
          'CONFLICT',
          'TASK_PRODUCT_REQUIREMENT',
          'error.task.product_requirement',
        );
      }
      if (requirementDef.consumeOnStart) {
        const consumable = findConsumableInventoryMatch(inventory);
        if (consumable?.inventoryId) {
          await this.inventoryAccess.removeInventoryItem(consumable.inventoryId, input.citizenId);
        }
      }
    }

    const now = new Date();
    const context = instance.context as TaskInstanceContext;
    const updatedContext: TaskInstanceContext = {
      ...context,
      timing: {
        startedAt: now.toISOString(),
      },
    };

    const updated = await this.tasks.updateTaskInstance({
      taskInstanceId: input.taskInstanceId,
      citizenId: input.citizenId,
      status: 'active',
      context: updatedContext as Record<string, unknown>,
    });

    return this.toSummary(updated, this.inventoryAccess
      ? await this.inventoryAccess.listInventoryByCitizen(input.citizenId)
      : []);
  }

  async completeTask(input: CompleteTaskInput): Promise<CompleteTaskResult> {
    const instance = await this.tasks.findById(input.taskInstanceId);
    if (!instance || instance.citizenId !== input.citizenId) {
      throw new AppError('NOT_FOUND', 'TASK_NOT_FOUND', 'error.task.not_found');
    }

    if (instance.status === 'completed') {
      throw new AppError('CONFLICT', 'TASK_ALREADY_COMPLETED', 'error.task.already_completed');
    }

    if (instance.status !== 'active' && instance.status !== 'pending') {
      throw new AppError('BUSINESS', 'TASK_NOT_COMPLETABLE', 'error.task.not_completable');
    }

    if (!this.catalog.isSupported(instance.definitionId)) {
      throw new AppError('BUSINESS', 'TASK_NOT_SUPPORTED', 'error.task.not_supported');
    }

    if (!this.catalog.isAllowedOption(instance.definitionId, input.optionId)) {
      throw new AppError('VALIDATION', 'OPTION_NOT_SUPPORTED', 'error.task.option_not_supported');
    }

    const definition = this.catalog.get(instance.definitionId);
    const taskKind = definition?.taskKind ?? 'standard';
    const context = instance.context as TaskInstanceContext;

    if (taskKind === 'standard' && instance.status === 'pending') {
      throw new AppError('CONFLICT', 'TASK_NOT_STARTED', 'error.task.not_started');
    }

    if (taskKind === 'standard' && !context.timing?.readyAt) {
      return this.commitStandardTaskChoice(input, instance, context);
    }

    if (taskKind === 'standard') {
      this.assertTaskReady(context);
      const committedOptionId = context.pendingChoice?.optionId;
      if (committedOptionId && committedOptionId !== input.optionId) {
        throw new AppError('CONFLICT', 'TASK_OPTION_LOCKED', 'error.task.option_locked');
      }
      return this.completeWithEffects(
        { ...input, optionId: committedOptionId ?? input.optionId },
        instance,
        context,
        false,
      );
    }

    if (taskKind === 'dialogue_step') {
      return this.completeDialogueStep(input, instance, context);
    }

    return this.completeWithEffects(input, instance, context, taskKind === 'dialogue_terminal');
  }

  private isReadyAtPassed(readyAt?: string): boolean {
    if (!readyAt) {
      return false;
    }
    const readyAtMs = Date.parse(readyAt);
    return Number.isFinite(readyAtMs) && Date.now() >= readyAtMs;
  }

  private assertTaskReady(context: TaskInstanceContext): void {
    if (!context.timing?.readyAt) {
      throw new AppError('CONFLICT', 'TASK_NOT_READY', 'error.task.not_ready');
    }
    if (!this.isReadyAtPassed(context.timing.readyAt)) {
      throw new AppError('CONFLICT', 'TASK_NOT_READY', 'error.task.not_ready', {
        details: { readyAt: context.timing.readyAt },
      });
    }
  }

  private async ensureMinimumFeedTasks(
    citizenId: string,
    correlationId?: string,
  ): Promise<void> {
    if (!this.taskSelection) return;

    const active = await this.tasks.findActiveByCitizenId(citizenId);
    if (active.length >= FEED_VISIBLE_SIZE) return;

    await this.taskSelection.fillFeed({
      trigger: 'anti_stall_refresh',
      citizenId,
      correlationId,
      refreshNonce: correlationId ?? randomUUID(),
    });
  }

  private async finalizeDueStandardTasks(
    citizenId: string,
    correlationId?: string,
  ): Promise<void> {
    const instances = await this.tasks.findActiveByCitizenId(citizenId);

    for (const instance of instances) {
      const definition = this.catalog.get(instance.definitionId);
      const taskKind = definition?.taskKind ?? 'standard';
      if (taskKind !== 'standard' || instance.status !== 'active') {
        continue;
      }

      const context = instance.context as TaskInstanceContext;
      if (!context.pendingChoice?.optionId || !this.isReadyAtPassed(context.timing?.readyAt)) {
        continue;
      }

      try {
        await this.completeWithEffects(
          {
            taskInstanceId: instance.taskInstanceId,
            citizenId,
            optionId: context.pendingChoice.optionId,
            correlationId,
          },
          instance,
          context,
          false,
        );
      } catch (error) {
        if (
          error instanceof AppError &&
          error.code === 'TASK_ALREADY_COMPLETED'
        ) {
          continue;
        }
        throw error;
      }
    }
  }

  private async commitStandardTaskChoice(
    input: CompleteTaskInput,
    instance: {
      taskInstanceId: string;
      definitionId: string;
      citizenId: string;
    },
    context: TaskInstanceContext,
  ): Promise<CompleteTaskResult> {
    if (context.pendingChoice) {
      if (context.pendingChoice.optionId !== input.optionId) {
        throw new AppError('CONFLICT', 'TASK_OPTION_LOCKED', 'error.task.option_locked');
      }

      const personalValues = personalValuesFromRecord(
        await this.citizens.getPersonalValues(input.citizenId),
      );
      const balance = await this.economy.getBalance(input.citizenId);

      return {
        taskInstanceId: input.taskInstanceId,
        taskId: instance.definitionId,
        optionId: input.optionId,
        status: 'waiting',
        messageKey: TASK_ACTION_COMMITTED_MESSAGE_KEY,
        personalValues,
        economic: { cash: balance.availableCash },
        effectsApplied: zeroEffectsApplied(),
        taskWaiting: true,
        ...(context.timing?.readyAt ? { readyAt: context.timing.readyAt } : {}),
      };
    }

    const durationMs = getDefaultTaskDurationMs();
    const now = new Date();
    const readyAt = new Date(now.getTime() + durationMs).toISOString();
    const updatedContext: TaskInstanceContext = {
      ...context,
      pendingChoice: {
        optionId: input.optionId,
        committedAt: now.toISOString(),
      },
      timing: {
        startedAt: context.timing?.startedAt ?? now.toISOString(),
        actionCommittedAt: now.toISOString(),
        readyAt,
        durationMs,
      },
    };

    await this.tasks.updateTaskInstance({
      taskInstanceId: input.taskInstanceId,
      citizenId: input.citizenId,
      status: 'active',
      context: updatedContext as Record<string, unknown>,
    });

    const personalValues = personalValuesFromRecord(
      await this.citizens.getPersonalValues(input.citizenId),
    );
    const balance = await this.economy.getBalance(input.citizenId);

    return {
      taskInstanceId: input.taskInstanceId,
      taskId: instance.definitionId,
      optionId: input.optionId,
      status: 'waiting',
      messageKey: TASK_ACTION_COMMITTED_MESSAGE_KEY,
      personalValues,
      economic: { cash: balance.availableCash },
      effectsApplied: zeroEffectsApplied(),
      taskWaiting: true,
      readyAt,
    };
  }

  private async completeDialogueStep(
    input: CompleteTaskInput,
    instance: {
      taskInstanceId: string;
      definitionId: string;
      citizenId: string;
      targetNpcId: string | null;
    },
    context: TaskInstanceContext,
  ): Promise<CompleteTaskResult> {
    const nextDefinitionId = getDialogueNext(instance.definitionId, input.optionId);
    if (!nextDefinitionId) {
      throw new AppError('VALIDATION', 'OPTION_NOT_SUPPORTED', 'error.task.option_not_supported');
    }

    if (!this.materializer) {
      throw new AppError('TECHNICAL', 'DIALOGUE_MATERIALIZER_MISSING', 'error.technical.internal');
    }

    const completedAt = new Date();
    await this.tasks.completeTask({
      taskInstanceId: input.taskInstanceId,
      citizenId: input.citizenId,
      optionId: input.optionId,
      completedAt,
    });

    const session = context.dialogueSession;
    if (!session) {
      throw new AppError('TECHNICAL', 'DIALOGUE_SESSION_MISSING', 'error.technical.internal');
    }

    const updatedSession = {
      ...session,
      stepIndex: session.stepIndex + 1,
      path: [...session.path, input.optionId],
      priorInstanceIds: [...(session.priorInstanceIds ?? []), input.taskInstanceId],
      lastChoiceAt: completedAt.toISOString(),
    };

    const nextTaskInstanceId = randomUUID();
    const materialized = await this.materializer.materialize({
      definitionId: nextDefinitionId,
      taskInstanceId: nextTaskInstanceId,
      citizenId: input.citizenId,
    });

    const nextContext: TaskInstanceContext = {
      ...materialized.context,
      dialogueSession: updatedSession,
    };

    await this.tasks.createTaskInstance({
      taskInstanceId: nextTaskInstanceId,
      definitionId: nextDefinitionId,
      citizenId: input.citizenId,
      targetNpcId: materialized.targetNpcId ?? instance.targetNpcId,
      context: nextContext as Record<string, unknown>,
      status: 'active',
    });

    const personalValues = personalValuesFromRecord(
      await this.citizens.getPersonalValues(input.citizenId),
    );
    const balance = await this.economy.getBalance(input.citizenId);

    return {
      taskInstanceId: input.taskInstanceId,
      taskId: instance.definitionId,
      optionId: input.optionId,
      status: 'completed',
      messageKey: DIALOGUE_CONTINUED_MESSAGE_KEY,
      personalValues,
      economic: { cash: balance.availableCash },
      effectsApplied: zeroEffectsApplied(),
      dialogueContinued: true,
    };
  }

  private async completeWithEffects(
    input: CompleteTaskInput,
    instance: {
      taskInstanceId: string;
      definitionId: string;
      citizenId: string;
    },
    context: TaskInstanceContext,
    isDialogueTerminal: boolean,
  ): Promise<CompleteTaskResult> {
    const fresh = await this.tasks.findById(input.taskInstanceId);
    if (!fresh || fresh.citizenId !== input.citizenId) {
      throw new AppError('NOT_FOUND', 'TASK_NOT_FOUND', 'error.task.not_found');
    }
    if (fresh.status === 'completed') {
      throw new AppError('CONFLICT', 'TASK_ALREADY_COMPLETED', 'error.task.already_completed');
    }

    const attributeSpec = getTaskAttributeEffects(instance.definitionId, input.optionId);
    if (attributeSpec?.requires) {
      const currentValues = await this.citizens.getPersonalValues(input.citizenId);
      const requirementCheck = checkAttributeRequirements(currentValues, attributeSpec.requires);
      if (!requirementCheck.ok) {
        throw new AppError(
          'BUSINESS',
          'INSUFFICIENT_ATTRIBUTES',
          'error.task.insufficient_attributes',
          { details: { missing: requirementCheck.missing } },
        );
      }
    }
    if (attributeSpec?.costs) {
      const currentValues = await this.citizens.getPersonalValues(input.citizenId);
      const costCheck = checkAttributeRequirements(currentValues, attributeSpec.costs);
      if (!costCheck.ok) {
        throw new AppError(
          'BUSINESS',
          'INSUFFICIENT_ATTRIBUTES',
          'error.task.insufficient_attributes',
          { details: { missing: costCheck.missing } },
        );
      }
    }

    const bundle = this.effects.resolve({
      definitionId: instance.definitionId,
      optionId: input.optionId,
      taskInstanceId: input.taskInstanceId,
      citizenId: input.citizenId,
      context,
    });

    const progressionRecord = await this.citizens.getProgression(input.citizenId);
    const scaledBundle =
      bundle.economic.kind === 'cash_delta'
        ? {
            ...bundle,
            economic: {
              ...bundle.economic,
              deltaMinor: scaleTaskCashReward(
                bundle.economic.deltaMinor,
                progressionRecord?.mainLevel ?? 1,
                progressionRecord?.progressionPoints ?? 0,
              ),
            },
          }
        : bundle;

    const personalEffectsApplied = personalDeltaFromRecord(scaledBundle.personalValues);
    const { cashDeltaMinor, balance } = await applyEconomicEffect(this.economy, {
      bundle: scaledBundle,
      citizenId: input.citizenId,
      taskInstanceId: input.taskInstanceId,
      optionId: input.optionId,
      correlationId: input.correlationId,
    });

    const completedAt = new Date();
    await this.tasks.completeTask({
      taskInstanceId: input.taskInstanceId,
      citizenId: input.citizenId,
      optionId: input.optionId,
      completedAt,
    });

    let personalValues: PersonalValueDelta;
    const personalDeltas = nonZeroPersonalDeltas(bundle.personalValues);
    const attributeDeltas = attributeSpec?.deltas ?? {};
    const mergedDeltas = mergeAttributeMaps(
      personalDeltas as Record<string, number>,
      attributeDeltas,
    );
    const hasPersonalEffect =
      Object.keys(mergedDeltas).length > 0 || Object.keys(attributeSpec?.costs ?? {}).length > 0;

    if (hasPersonalEffect) {
      try {
        const applied = await this.citizens.applyPersonalValueEffects(input.citizenId, {
          costs: attributeSpec?.costs,
          deltas: mergedDeltas,
        });
        personalValues = personalValuesFromRecord(applied.values);
        for (const [key, value] of Object.entries(applied.applied)) {
          personalEffectsApplied[key as keyof PersonalValueEffectsApplied] = value;
        }
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('INSUFFICIENT_PERSONAL_VALUE')) {
          throw new AppError('BUSINESS', 'INSUFFICIENT_ATTRIBUTES', 'error.task.insufficient_attributes');
        }
        throw error;
      }
    } else {
      const current = await this.citizens.getPersonalValues(input.citizenId);
      personalValues = personalValuesFromRecord(current);
    }

    const riskOutcome = this.risk
      ? await this.risk.evaluate({
          taskInstanceId: input.taskInstanceId,
          optionId: input.optionId,
          citizenId: input.citizenId,
          resolvedRisk: context.resolvedRisk,
          correlationId: input.correlationId,
        })
      : null;

    const riskEffectsApplied = riskOutcome ? this.risk!.toEffectsApplied(riskOutcome) : undefined;

    const worldTimeMs = this.worldClock
      ? Number((await this.worldClock.now()).worldTimeMs)
      : Date.now();

    const progressionResult = this.progression
      ? await this.progression.grantForTaskCompletion({
          citizenId: input.citizenId,
          taskInstanceId: input.taskInstanceId,
          definitionId: instance.definitionId,
          optionId: input.optionId,
          sympathyDelta: personalEffectsApplied.sympathy ?? 0,
          reputationDelta: personalEffectsApplied.reputation ?? 0,
          hadRiskOutcome: Boolean(riskEffectsApplied?.outcome),
          worldTimeMs,
        })
      : null;

    if (this.progression && attributeSpec?.bonusGlobalXp && attributeSpec.bonusGlobalXp > 0) {
      await this.progression.grantProgression({
        citizenId: input.citizenId,
        idempotencyKey: `progression:task_bonus:${input.taskInstanceId}:${input.optionId}`,
        points: attributeSpec.bonusGlobalXp,
        sourceType: 'task_attribute_bonus',
        sourceRef: instance.definitionId,
        worldTimeMs,
      });
    }

    if (this.careerProgression && attributeSpec?.careerAffinity) {
      await this.careerProgression.applyAffinityDeltas({
        citizenId: input.citizenId,
        deltas: attributeSpec.careerAffinity,
        source: `task:${instance.definitionId}:${input.optionId}`,
      });
    }

    if (fresh.targetNpcId && this.npcRelationships?.hasBinding(fresh.definitionId)) {
      await this.npcRelationships.recordTaskInteraction({
        citizenId: input.citizenId,
        npcId: fresh.targetNpcId,
        taskInstanceId: input.taskInstanceId,
        definitionId: fresh.definitionId,
        optionId: input.optionId,
        occurredAt: completedAt,
      });

      if (this.progression) {
        await this.progression.grantForNpcFirstMeeting({
          citizenId: input.citizenId,
          npcId: fresh.targetNpcId,
          worldTimeMs,
        });
      }

      const consequence = getNpcTaskConsequence(fresh.definitionId);
      if (consequence) {
        await this.npcRelationships.recordConsequenceApplied({
          citizenId: input.citizenId,
          npcId: fresh.targetNpcId,
          consequenceKey: consequence.consequenceKey,
        });
      }
    }

    if (fresh.targetNpcId && attributeSpec?.relationship && this.npcRelationshipRepo) {
      await this.npcRelationshipRepo.applyRelationshipMetrics({
        citizenId: input.citizenId,
        npcId: fresh.targetNpcId,
        trust: attributeSpec.relationship.trust,
        affection: attributeSpec.relationship.affection,
        conflict: attributeSpec.relationship.conflict,
        familiarity: attributeSpec.relationship.familiarity,
        unlockContact: attributeSpec.relationship.unlockContact,
        enableChat: attributeSpec.relationship.unlockContact,
      });
    }

    if (fresh.targetNpcId && this.socialGameplay) {
      await this.socialGameplay.applyGroupEffectsFromTask({
        citizenId: input.citizenId,
        npcId: fresh.targetNpcId,
        explicitGroup: attributeSpec?.group,
      });
    }

    if (this.taskSelection) {
      const poolCompletedDefinitionId = isDialogueTerminal
        ? (context.dialogueSession?.rootDefinitionId ?? instance.definitionId)
        : instance.definitionId;

      await this.taskSelection.fillFeed({
        trigger: 'task_completed',
        citizenId: input.citizenId,
        completedTaskInstanceId: input.taskInstanceId,
        completedDefinitionId: poolCompletedDefinitionId,
        correlationId: input.correlationId,
      });
    }

    const profileUnlocks = this.profile
      ? await this.profile.recordTaskCompleted(input.citizenId, instance.definitionId)
      : [];

    if (this.storyThreads) {
      const binding = getNpcTaskBinding(fresh.definitionId);
      const consequence = getNpcTaskConsequence(fresh.definitionId);
      await this.storyThreads.onTaskCompleted({
        citizenId: input.citizenId,
        definitionId: fresh.definitionId,
        optionId: input.optionId,
        taskInstanceId: input.taskInstanceId,
        npcTemplateId: consequence?.templateId ?? binding?.templateId,
        npcId: fresh.targetNpcId ?? undefined,
        worldTimeMs,
      });
    }

    const latestLevelUp = progressionResult?.levelUps.at(-1);

    return {
      taskInstanceId: input.taskInstanceId,
      taskId: instance.definitionId,
      optionId: input.optionId,
      status: 'completed',
      messageKey: bundle.messageKey,
      personalValues,
      economic: {
        cash: balance.availableCash,
      },
      effectsApplied: {
        personalValues: personalEffectsApplied,
        economic: {
          cash: cashEffectFromDelta(cashDeltaMinor),
        },
        ...(riskEffectsApplied ? { risk: riskEffectsApplied } : {}),
        ...(progressionResult && progressionResult.pointsGranted > 0
          ? { progression: { pointsGranted: progressionResult.pointsGranted } }
          : {}),
      },
      ...(profileUnlocks.length > 0
        ? {
            profileUnlocks: profileUnlocks.map((event) => ({
              dimensionId: event.dimensionId,
              label: event.label,
            })),
          }
        : {}),
      ...(latestLevelUp
        ? {
            levelUp: {
              level: latestLevelUp.level,
              title: latestLevelUp.title,
              body: latestLevelUp.body,
              eventId: latestLevelUp.eventId,
            },
          }
        : {}),
    };
  }

  private toSummary(
    instance: {
      taskInstanceId: string;
      definitionId: string;
      status: string;
      context: Record<string, unknown>;
    },
    inventory: Array<{ itemId: string }> = [],
    personalValues: Record<string, number> = {},
  ) {
    const definition = this.catalog.get(instance.definitionId);
    const context = instance.context as TaskInstanceContext;
    const taskKind = definition?.taskKind ?? 'standard';
    const feedState = this.deriveFeedState(instance.status, taskKind, context);
    const gameplayHints = getTaskGameplayHints(instance.definitionId) ?? undefined;
    const pendingOption = context.pendingChoice
      ? definition?.options.find((option) => option.optionId === context.pendingChoice!.optionId)
      : undefined;

    const requirementDef = getTaskProductRequirement(instance.definitionId);
    const productRequirement =
      requirementDef && instance.status === 'pending'
        ? evaluateProductRequirement(requirementDef.requirement, inventory)
        : undefined;

    return {
      taskInstanceId: instance.taskInstanceId,
      taskId: instance.definitionId,
      title: definition?.title ?? instance.definitionId,
      description: definition?.description ?? '',
      status: instance.status,
      ...(definition?.taskKind ? { taskKind: definition.taskKind } : {}),
      feedState,
      ...(gameplayHints ? { gameplayHints } : {}),
      ...(context.npcPresentation ? { npc: context.npcPresentation } : {}),
      ...(context.timing?.readyAt ? { readyAt: context.timing.readyAt } : {}),
      ...(context.pendingChoice
        ? {
            pendingOptionId: context.pendingChoice.optionId,
            ...(pendingOption ? { pendingOptionLabel: pendingOption.label } : {}),
          }
        : {}),
      ...(productRequirement ? { productRequirement } : {}),
      options:
        definition?.options.map((option) => {
          const statEffects = getTaskOptionStatEffects(instance.definitionId, option.optionId);
          const attributeSpec = getTaskAttributeEffects(instance.definitionId, option.optionId);
          const attributePreview =
            attributeSpec && (attributeSpec.costs || attributeSpec.requires || attributeSpec.deltas)
              ? {
                  required: attributeSpec.requires ?? {},
                  costs: attributeSpec.costs ?? {},
                  preview: projectAttributePreview(
                    personalValues,
                    attributeSpec.costs ?? {},
                    attributeSpec.deltas ?? {},
                  ),
                }
              : undefined;
          return {
            optionId: option.optionId,
            label: option.label,
            ...(option.presentationHint ? { presentationHint: option.presentationHint } : {}),
            ...(statEffects ? { statEffects } : {}),
            ...(attributePreview ? { attributePreview } : {}),
          };
        }) ?? [],
    };
  }

  private deriveFeedState(
    status: string,
    taskKind: 'standard' | 'dialogue_step' | 'dialogue_terminal',
    context: TaskInstanceContext,
  ): TaskSummaryDto['feedState'] {
    if (taskKind !== 'standard') {
      return 'dialogue';
    }
    if (status === 'pending') {
      return 'available';
    }
    if (!context.timing?.readyAt) {
      return 'interactive';
    }
    const readyAtMs = context.timing.readyAt ? Date.parse(context.timing.readyAt) : 0;
    if (Number.isFinite(readyAtMs) && Date.now() < readyAtMs) {
      return 'in_progress';
    }
    return 'ready';
  }
}
