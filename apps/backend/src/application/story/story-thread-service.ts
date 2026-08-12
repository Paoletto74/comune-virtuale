import { randomUUID } from 'node:crypto';
import type {
  CitizenTemporalEventRepository,
  StoryThreadRepository,
} from '../../domain/ports/repositories.js';
import {
  FLASH_ECONOMIC_DELIVERY,
} from '../../slice/flash-opportunities-constants.js';
import { getTaskPersonalizationMetadata } from '../task/task-personalization-metadata.js';
import {
  getStoryThreadConfig,
  STORY_TEMPLATE_FLASH_DELIVERY,
  STORY_TEMPLATE_GIULIA_TENSION,
  STORY_TEMPLATE_MARCO_FAVOR,
  STORY_TEMPLATE_TIGHT_BUDGET,
  STORY_TEMPLATE_TRANSPORT_DISRUPTION,
} from '../../slice/story-threads-constants.js';
import { combineActiveStoryThreadEffects } from './story-thread-effect-resolver.js';
import type {
  CombinedStoryThreadModifiers,
  StoryThreadLifeContext,
  StoryThreadRecord,
} from './story-thread-types.js';

const MARCO_FAVOR_ORIGIN_TASK_IDS = new Set(['DEMO_V2_SOCIAL_NEIGHBOR_NOISE', 'DEMO_NEIGHBOR_FAVOR']);

const EMPTY_MODIFIERS: CombinedStoryThreadModifiers = {
  activeThreadIds: [],
  taskDefinitionMultipliers: {},
  taskContextMultipliers: {},
  flashTypeMultipliers: {},
  flashTemplateMultipliers: {},
  npcTemplateMultipliers: {},
};

function isStoryThreadStorageUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { message?: string; code?: string };
  if (candidate.code === '42P01') return true;
  const message = (candidate.message ?? String(error)).toLowerCase();
  return message.includes('story_threads') && message.includes('does not exist');
}

export class StoryThreadService {
  private storageUnavailable = false;

  constructor(
    private readonly threads: StoryThreadRepository,
    private readonly temporalEvents?: CitizenTemporalEventRepository,
  ) {}

  async syncLifecycle(citizenId: string, gameTimeMs: number): Promise<void> {
    if (!getStoryThreadConfig().enabled || this.storageUnavailable) return;

    try {
      await this.threads.expireThreadsBefore(citizenId, gameTimeMs);
      await this.threads.reactivateDormantThreads(citizenId, gameTimeMs);
    } catch (error) {
      if (isStoryThreadStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return;
      }
      throw error;
    }
  }

  async getActiveThreads(citizenId: string, gameTimeMs: number): Promise<StoryThreadRecord[]> {
    if (!getStoryThreadConfig().enabled || this.storageUnavailable) return [];

    try {
      await this.syncLifecycle(citizenId, gameTimeMs);
      if (this.storageUnavailable) return [];
      return this.threads.listActiveForSelection(citizenId, gameTimeMs);
    } catch (error) {
      if (isStoryThreadStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return [];
      }
      throw error;
    }
  }

  async getCombinedModifiers(
    citizenId: string,
    gameTimeMs: number,
  ): Promise<CombinedStoryThreadModifiers> {
    if (!getStoryThreadConfig().enabled || this.storageUnavailable) {
      return EMPTY_MODIFIERS;
    }

    try {
      const active = await this.getActiveThreads(citizenId, gameTimeMs);
      const config = getStoryThreadConfig();
      const capped = active.slice(0, config.maxActiveThreads);
      return combineActiveStoryThreadEffects(capped);
    } catch (error) {
      if (isStoryThreadStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return EMPTY_MODIFIERS;
      }
      throw error;
    }
  }

  async getLifeContext(citizenId: string, _gameTimeMs: number): Promise<StoryThreadLifeContext> {
    if (!getStoryThreadConfig().enabled || this.storageUnavailable) {
      return {
        activeCount: 0,
        completedCount: 0,
        abandonedCount: 0,
        dormantCount: 0,
        recurringSocialThreads: 0,
      };
    }

    try {
      const all = await this.threads.listByCitizenId(citizenId);
      return {
        activeCount: all.filter((thread) => thread.status === 'active').length,
        completedCount: all.filter((thread) => thread.status === 'completed').length,
        abandonedCount: all.filter((thread) => thread.status === 'abandoned').length,
        dormantCount: all.filter((thread) => thread.status === 'dormant').length,
        recurringSocialThreads: all.filter(
          (thread) =>
            (thread.type === 'npc' || thread.type === 'social') &&
            thread.status !== 'abandoned' &&
            thread.context.attempts > 0,
        ).length,
      };
    } catch (error) {
      if (isStoryThreadStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return {
          activeCount: 0,
          completedCount: 0,
          abandonedCount: 0,
          dormantCount: 0,
          recurringSocialThreads: 0,
        };
      }
      throw error;
    }
  }

  async onTaskCompleted(input: {
    citizenId: string;
    definitionId: string;
    optionId: string;
    taskInstanceId: string;
    npcTemplateId?: string;
    npcId?: string;
    relationshipLevel?: number;
    worldTimeMs: number;
  }): Promise<void> {
    if (!getStoryThreadConfig().enabled || this.storageUnavailable) return;

    try {
      await this.syncLifecycle(input.citizenId, input.worldTimeMs);
      await this.maybeCreateMarcoFavorThread(input);
      await this.maybeCreateGiuliaTensionThread(input);
      await this.advanceThreadsOnTaskCompleted(input);
    } catch (error) {
      if (isStoryThreadStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return;
      }
      throw error;
    }
  }

  async onFlashOutcome(input: {
    citizenId: string;
    templateId: string;
    outcome: 'accepted' | 'declined';
    opportunityId: string;
    worldTimeMs: number;
  }): Promise<void> {
    if (!getStoryThreadConfig().enabled || this.storageUnavailable) return;
    if (input.outcome !== 'accepted' || input.templateId !== FLASH_ECONOMIC_DELIVERY) return;

    try {
      await this.syncLifecycle(input.citizenId, input.worldTimeMs);
      const template = STORY_TEMPLATE_FLASH_DELIVERY;
      const stageConfig = template.stages[0]!;
      const idempotencyKey = `story_thread:${template.templateId}:${input.citizenId}:${input.opportunityId}`;

      const created = await this.threads.createThread({
        threadId: randomUUID(),
        citizenId: input.citizenId,
        type: template.type,
        status: 'dormant',
        origin: 'flash_accepted',
        stage: 1,
        priority: template.priority,
        createdAtGameMs: input.worldTimeMs,
        lastActivityGameMs: input.worldTimeMs,
        dormantUntilGameMs:
          input.worldTimeMs + (stageConfig.dormantCooldownGameMs ?? 4 * 60 * 60 * 1000),
        expiresAtGameMs: input.worldTimeMs + (template.stages.at(-1)?.expiryGameMs ?? 0),
        context: {
          threadTemplateId: template.templateId,
          stage: 1,
          attempts: 0,
          flashTemplateId: input.templateId,
          flashOpportunityId: input.opportunityId,
          lastOutcome: 'accepted',
        },
        idempotencyKey,
      });

      if (created.created) {
        await this.recordLifeUpdate({
          citizenId: input.citizenId,
          thread: created.record,
          worldTimeMs: input.worldTimeMs,
          title: 'Una traccia resta',
          body: 'Quella consegna lampo sembra aver lasciato il segno. Il Comune annota senza commentare.',
        });
      }
    } catch (error) {
      if (isStoryThreadStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return;
      }
      throw error;
    }
  }

  async onWorldEventNoticed(input: {
    citizenId: string;
    worldEventId: string;
    templateId: string;
    worldTimeMs: number;
  }): Promise<void> {
    if (!getStoryThreadConfig().enabled || this.storageUnavailable) return;
    if (input.templateId !== 'demo_infrastructure_transport_disruption') return;

    try {
      await this.syncLifecycle(input.citizenId, input.worldTimeMs);
      const template = STORY_TEMPLATE_TRANSPORT_DISRUPTION;
      const stageConfig = template.stages[0]!;
      const idempotencyKey = `story_thread:${template.templateId}:${input.citizenId}:${input.worldEventId}`;

      await this.threads.createThread({
        threadId: randomUUID(),
        citizenId: input.citizenId,
        type: template.type,
        status: 'active',
        origin: 'world_event',
        stage: 1,
        priority: template.priority,
        createdAtGameMs: input.worldTimeMs,
        lastActivityGameMs: input.worldTimeMs,
        expiresAtGameMs: input.worldTimeMs + (stageConfig.expiryGameMs ?? 8 * 60 * 60 * 1000),
        context: {
          threadTemplateId: template.templateId,
          stage: 1,
          attempts: 0,
          worldEventId: input.worldEventId,
          worldEventTemplateId: input.templateId,
          lastOutcome: 'noticed',
        },
        idempotencyKey,
      });
    } catch (error) {
      if (isStoryThreadStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return;
      }
      throw error;
    }
  }

  async onHomeEconomyCheck(input: {
    citizenId: string;
    balanceMinor: number;
    worldTimeMs: number;
  }): Promise<void> {
    if (!getStoryThreadConfig().enabled || this.storageUnavailable) return;

    const config = getStoryThreadConfig();
    try {
      await this.syncLifecycle(input.citizenId, input.worldTimeMs);

      const existing = await this.threads.findByIdempotencyKey(
        `story_thread:${STORY_TEMPLATE_TIGHT_BUDGET.templateId}:${input.citizenId}`,
      );

      if (existing && existing.status === 'active' && input.balanceMinor >= config.tightBudgetRecoveryMinor) {
        await this.threads.updateThread(existing.threadId, {
          status: 'completed',
          lastActivityGameMs: input.worldTimeMs,
          context: {
            ...existing.context,
            lastOutcome: 'recovered',
          },
        });
        return;
      }

      if (input.balanceMinor >= config.tightBudgetThresholdMinor || existing) return;

      const template = STORY_TEMPLATE_TIGHT_BUDGET;
      const stageConfig = template.stages[0]!;
      await this.threads.createThread({
        threadId: randomUUID(),
        citizenId: input.citizenId,
        type: template.type,
        status: 'active',
        origin: 'economic_pressure',
        stage: 1,
        priority: template.priority,
        createdAtGameMs: input.worldTimeMs,
        lastActivityGameMs: input.worldTimeMs,
        expiresAtGameMs: input.worldTimeMs + (stageConfig.expiryGameMs ?? 24 * 60 * 60 * 1000),
        context: {
          threadTemplateId: template.templateId,
          stage: 1,
          attempts: 0,
          lastOutcome: 'tight_budget',
        },
        idempotencyKey: `story_thread:${template.templateId}:${input.citizenId}`,
      });
    } catch (error) {
      if (isStoryThreadStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return;
      }
      throw error;
    }
  }

  private async maybeCreateMarcoFavorThread(input: {
    citizenId: string;
    definitionId: string;
    optionId: string;
    taskInstanceId: string;
    npcTemplateId?: string;
    relationshipLevel?: number;
    worldTimeMs: number;
  }) {
    if (!MARCO_FAVOR_ORIGIN_TASK_IDS.has(input.definitionId) || input.optionId !== 'help') return;

    const template = STORY_TEMPLATE_MARCO_FAVOR;
    const stageConfig = template.stages[0]!;
    const idempotencyKey = `story_thread:${template.templateId}:${input.citizenId}`;

    const created = await this.threads.createThread({
      threadId: randomUUID(),
      citizenId: input.citizenId,
      type: template.type,
      status: 'active',
      origin: 'task_completed',
      stage: 1,
      priority: template.priority,
      createdAtGameMs: input.worldTimeMs,
      lastActivityGameMs: input.worldTimeMs,
      expiresAtGameMs: input.worldTimeMs + (stageConfig.expiryGameMs ?? 12 * 60 * 60 * 1000),
      context: {
        threadTemplateId: template.templateId,
        stage: 1,
        attempts: 0,
        originTaskInstanceId: input.taskInstanceId,
        originDefinitionId: input.definitionId,
        npcTemplateId: input.npcTemplateId ?? 'neighbor_marco',
        lastOutcome: input.optionId,
        relationshipLevel: input.relationshipLevel,
      },
      idempotencyKey,
    });

    if (created.created) {
      await this.recordLifeUpdate({
        citizenId: input.citizenId,
        thread: created.record,
        worldTimeMs: input.worldTimeMs,
        title: 'Marco se lo ricorderà',
        body: 'Un favore fatto bene lascia sempre una porta socchiusa. Il Comune lo sa.',
      });
    }
  }

  private async maybeCreateGiuliaTensionThread(input: {
    citizenId: string;
    definitionId: string;
    optionId: string;
    taskInstanceId: string;
    worldTimeMs: number;
  }) {
    if (input.definitionId !== 'DEMO_NPC_GIULIA_WARNING') return;
    if (input.optionId !== 'ignore' && input.optionId !== 'walk_away') return;

    const template = STORY_TEMPLATE_GIULIA_TENSION;
    const stageConfig = template.stages[0]!;
    const idempotencyKey = `story_thread:${template.templateId}:${input.citizenId}`;

    await this.threads.createThread({
      threadId: randomUUID(),
      citizenId: input.citizenId,
      type: template.type,
      status: 'active',
      origin: 'task_completed',
      stage: 1,
      priority: template.priority,
      createdAtGameMs: input.worldTimeMs,
      lastActivityGameMs: input.worldTimeMs,
      expiresAtGameMs: input.worldTimeMs + (stageConfig.expiryGameMs ?? 16 * 60 * 60 * 1000),
      context: {
        threadTemplateId: template.templateId,
        stage: 1,
        attempts: 0,
        originTaskInstanceId: input.taskInstanceId,
        originDefinitionId: input.definitionId,
        npcTemplateId: 'acquaintance_giulia',
        lastOutcome: input.optionId,
      },
      idempotencyKey,
    });
  }

  private async advanceThreadsOnTaskCompleted(input: {
    citizenId: string;
    definitionId: string;
    optionId: string;
    worldTimeMs: number;
  }) {
    const active = await this.threads.listActiveForSelection(input.citizenId, input.worldTimeMs);

    for (const thread of active) {
      if (thread.context.threadTemplateId === STORY_TEMPLATE_MARCO_FAVOR.templateId) {
        await this.advanceMarcoThread(thread, input);
      } else if (thread.context.threadTemplateId === STORY_TEMPLATE_TRANSPORT_DISRUPTION.templateId) {
        await this.advanceTransportThread(thread, input);
      } else if (thread.context.threadTemplateId === STORY_TEMPLATE_GIULIA_TENSION.templateId) {
        await this.advanceGiuliaThread(thread, input);
      }
    }
  }

  private async advanceMarcoThread(
    thread: StoryThreadRecord,
    input: { definitionId: string; optionId: string; worldTimeMs: number },
  ) {
    if (input.definitionId !== 'DEMO_NPC_MARCO_OPPORTUNITY') return;

    const template = STORY_TEMPLATE_MARCO_FAVOR;
    if (input.optionId === 'accept') {
      const nextStage = 2;
      await this.threads.updateThread(thread.threadId, {
        status: 'completed',
        stage: nextStage,
        lastActivityGameMs: input.worldTimeMs,
        context: {
          ...thread.context,
          stage: nextStage,
          attempts: (thread.context.attempts ?? 0) + 1,
          lastOutcome: input.optionId,
        },
      });
      await this.recordLifeUpdate({
        citizenId: thread.citizenId,
        thread: { ...thread, stage: nextStage },
        worldTimeMs: input.worldTimeMs,
        title: 'Marco si fida',
        body: 'Hai tenuto d\'occhio le cose per lui. Il Comune registra la fiducia come dato utile.',
      });
      return;
    }

    if (input.optionId === 'decline') {
      const stageConfig = template.stages[0]!;
      await this.threads.updateThread(thread.threadId, {
        status: 'dormant',
        lastActivityGameMs: input.worldTimeMs,
        dormantUntilGameMs:
          input.worldTimeMs + (stageConfig.dormantCooldownGameMs ?? 6 * 60 * 60 * 1000),
        context: {
          ...thread.context,
          attempts: (thread.context.attempts ?? 0) + 1,
          lastOutcome: input.optionId,
        },
      });
    }
  }

  private async advanceTransportThread(
    thread: StoryThreadRecord,
    input: { definitionId: string; optionId: string; worldTimeMs: number },
  ) {
    if (thread.stage !== 1) return;
    const meta = getTaskPersonalizationMetadata(input.definitionId);
    const isSocialHelp =
      meta.primaryContext === 'social' ||
      meta.contexts.includes('social') ||
      input.optionId === 'help' ||
      input.optionId === 'accept';

    if (!isSocialHelp) return;

    const template = STORY_TEMPLATE_TRANSPORT_DISRUPTION;
    const nextStage = 2;
    const stageConfig = template.stages.find((entry) => entry.stage === nextStage);

    await this.threads.updateThread(thread.threadId, {
      status: 'dormant',
      stage: nextStage,
      lastActivityGameMs: input.worldTimeMs,
      dormantUntilGameMs:
        input.worldTimeMs + (stageConfig?.dormantCooldownGameMs ?? 10 * 60 * 60 * 1000),
      context: {
        ...thread.context,
        stage: nextStage,
        attempts: (thread.context.attempts ?? 0) + 1,
        lastOutcome: input.optionId,
      },
    });

    await this.recordLifeUpdate({
      citizenId: thread.citizenId,
      thread,
      worldTimeMs: input.worldTimeMs,
      title: 'Hai aiutato in un giorno difficile',
      body: 'Con i trasporti in tilt, una mano data conta doppio. Il Comune lo annota con distacco.',
    });
  }

  private async advanceGiuliaThread(
    thread: StoryThreadRecord,
    input: { definitionId: string; optionId: string; worldTimeMs: number },
  ) {
    if (input.definitionId !== 'DEMO_NPC_GIULIA_WARNING') return;
    if (input.optionId !== 'apologize') return;

    const nextStage = 2;
    await this.threads.updateThread(thread.threadId, {
      status: 'completed',
      stage: nextStage,
      lastActivityGameMs: input.worldTimeMs,
      context: {
        ...thread.context,
        stage: nextStage,
        attempts: (thread.context.attempts ?? 0) + 1,
        lastOutcome: input.optionId,
      },
    });
  }

  private async recordLifeUpdate(input: {
    citizenId: string;
    thread: StoryThreadRecord;
    worldTimeMs: number;
    title: string;
    body: string;
  }) {
    if (!this.temporalEvents) return;

    await this.temporalEvents.recordEvent({
      eventId: randomUUID(),
      citizenId: input.citizenId,
      eventType: 'life_update',
      idempotencyKey: `life_update:story_thread:${input.thread.threadId}:stage:${input.thread.stage}`,
      worldTimeMs: input.worldTimeMs,
      title: input.title,
      body: input.body,
      payload: {
        threadId: input.thread.threadId,
        threadTemplateId: input.thread.context.threadTemplateId,
        stage: input.thread.stage,
      },
    });
  }
}
