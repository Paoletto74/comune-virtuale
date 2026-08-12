import { randomUUID } from 'node:crypto';
import { deterministicChance } from '../../domain/flash/deterministic-flash-random.js';
import type {
  CitizenTemporalEventRepository,
  WorldEventRepository,
} from '../../domain/ports/repositories.js';
import type { StoryThreadService } from '../story/story-thread-service.js';
import {
  getWorldEventConfig,
  listWorldEventTemplates,
  type WorldEventTemplate,
} from '../../slice/world-events-constants.js';
import { combineActiveWorldEventEffects } from './world-event-effect-resolver.js';
import type {
  CombinedWorldEventModifiers,
  WorldEventHomeStateDto,
  WorldEventNoticeDto,
  WorldEventRecord,
} from './world-event-types.js';

export type { WorldEventHomeStateDto } from './world-event-types.js';

const EMPTY_MODIFIERS: CombinedWorldEventModifiers = {
  activeEventIds: [],
  taskContextMultipliers: {},
  flashTypeMultipliers: {},
  flashTemplateMultipliers: {},
  npcTemplateMultipliers: {},
};

function isWorldEventStorageUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes('world_events') && message.includes('does not exist');
}

export class WorldEventService {
  private cachedActiveEvents: WorldEventRecord[] = [];
  private cachedAtGameMs: number | null = null;
  private storageUnavailable = false;

  constructor(
    private readonly events: WorldEventRepository,
    private readonly temporalEvents?: CitizenTemporalEventRepository,
    private readonly storyThreads?: StoryThreadService,
  ) {}

  async evaluateScheduler(gameTimeMs: number): Promise<WorldEventRecord[]> {
    const config = getWorldEventConfig();
    if (!config.enabled || this.storageUnavailable) {
      return [];
    }

    try {
      await this.events.endEventsBefore(gameTimeMs);
      await this.events.activateScheduledEvents(gameTimeMs);

      const state = await this.events.getSchedulerState();
      if (gameTimeMs - state.lastEvaluatedGameMs >= config.spawnCheckIntervalGameMs) {
        const active = await this.events.listActiveAtGameTime(gameTimeMs);
        let spawnCycle = state.spawnCycle;
        let lastSpawnedGameMs = state.lastSpawnedGameMs;

        if (
          active.length < config.maxActiveEvents &&
          (lastSpawnedGameMs === null ||
            gameTimeMs - lastSpawnedGameMs >= config.globalSpawnCooldownGameMs) &&
          deterministicChance(`world-event-spawn-slot:${spawnCycle}:${gameTimeMs}`, config.spawnProbability)
        ) {
          const spawned = await this.trySpawnEvent(gameTimeMs, spawnCycle);
          if (spawned) {
            spawnCycle += 1;
            lastSpawnedGameMs = gameTimeMs;
          }
        }

        await this.events.saveSchedulerState({
          lastEvaluatedGameMs: gameTimeMs,
          spawnCycle,
          lastSpawnedGameMs,
        });
      }

      // Always re-read after lifecycle transitions; spawn-cycle skip must not reuse a stale cache.
      this.invalidateCache();
      const activeAfter = await this.events.listActiveAtGameTime(gameTimeMs);
      this.cachedActiveEvents = activeAfter;
      this.cachedAtGameMs = gameTimeMs;
      return activeAfter;
    } catch (error) {
      if (isWorldEventStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return [];
      }
      throw error;
    }
  }

  async getActiveEvents(gameTimeMs: number): Promise<WorldEventRecord[]> {
    if (!getWorldEventConfig().enabled || this.storageUnavailable) {
      return [];
    }

    if (this.cachedAtGameMs === gameTimeMs) {
      return this.cachedActiveEvents;
    }

    try {
      const active = await this.events.listActiveAtGameTime(gameTimeMs);
      this.cachedActiveEvents = active;
      this.cachedAtGameMs = gameTimeMs;
      return active;
    } catch (error) {
      if (isWorldEventStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return [];
      }
      throw error;
    }
  }

  async getCombinedModifiers(gameTimeMs: number): Promise<CombinedWorldEventModifiers> {
    if (!getWorldEventConfig().enabled || this.storageUnavailable) {
      return EMPTY_MODIFIERS;
    }

    const active = await this.getActiveEvents(gameTimeMs);
    return combineActiveWorldEventEffects(active);
  }

  async syncForHome(input: {
    citizenId: string;
    gameTimeMs: number;
  }): Promise<WorldEventHomeStateDto> {
    const config = getWorldEventConfig();
    if (!config.enabled || this.storageUnavailable) {
      return { enabled: false, activeEvents: [] };
    }

    try {
      const active = await this.evaluateScheduler(input.gameTimeMs);
      const notices: WorldEventNoticeDto[] = [];

      for (const event of active) {
        const popupDismissed = await this.events.isPopupDismissed(input.citizenId, event.eventId);
        if (!popupDismissed) {
          notices.push(this.toNotice(event, input.gameTimeMs));
        }
        await this.recordCitizenRelevance(input.citizenId, event, input.gameTimeMs);
      }

      return { enabled: true, activeEvents: notices };
    } catch (error) {
      if (isWorldEventStorageUnavailableError(error)) {
        this.storageUnavailable = true;
        return { enabled: false, activeEvents: [] };
      }
      throw error;
    }
  }

  private async trySpawnEvent(gameTimeMs: number, spawnCycle: number): Promise<boolean> {
    const templates = [...listWorldEventTemplates()];
    const startIndex = spawnCycle % templates.length;

    for (let offset = 0; offset < templates.length; offset += 1) {
      const template = templates[(startIndex + offset) % templates.length]!;
      const spawned = await this.spawnTemplateIfEligible(template, gameTimeMs, spawnCycle);
      if (spawned) return true;
    }

    return false;
  }

  private async spawnTemplateIfEligible(
    template: WorldEventTemplate,
    gameTimeMs: number,
    spawnCycle: number,
  ): Promise<boolean> {
    const lastEnded = await this.events.findLastEndedByTemplate(template.templateId);
    if (
      lastEnded &&
      gameTimeMs - lastEnded.endsAtGameMs < template.cooldownGameMs
    ) {
      return false;
    }

    const spawnSeed = `world-event:${template.templateId}:${spawnCycle}:${Math.floor(gameTimeMs / getWorldEventConfig().spawnCheckIntervalGameMs)}`;
    if (!deterministicChance(spawnSeed, template.spawnProbability)) {
      return false;
    }

    const idempotencyKey = `world-event:${template.templateId}:${spawnCycle}:${gameTimeMs}`;
    const startedAtGameMs = gameTimeMs;
    const endsAtGameMs = gameTimeMs + template.durationGameMs;

    const created = await this.events.createEvent({
      eventId: randomUUID(),
      templateId: template.templateId,
      scope: template.scope,
      type: template.type,
      status: startedAtGameMs <= gameTimeMs ? 'active' : 'scheduled',
      severity: template.severity,
      title: template.title,
      body: template.body,
      comuneLine: template.comuneLine,
      startedAtGameMs,
      endsAtGameMs,
      effects: template.effects as Record<string, unknown>,
      metadata: { spawnCycle },
      idempotencyKey,
      zoneId: template.zoneId,
    });

    return created.created;
  }

  private async recordCitizenRelevance(
    citizenId: string,
    event: WorldEventRecord,
    gameTimeMs: number,
  ) {
    const noticeKey = `world-event-notice:${citizenId}:${event.eventId}`;
    const notice = await this.events.recordCitizenNotice({
      citizenId,
      worldEventId: event.eventId,
      idempotencyKey: noticeKey,
    });

    if (!notice.created || !this.temporalEvents) {
      if (notice.created && this.storyThreads) {
        await this.storyThreads.onWorldEventNoticed({
          citizenId,
          worldEventId: event.eventId,
          templateId: event.templateId,
          worldTimeMs: gameTimeMs,
        });
      }
      return;
    }

    await this.temporalEvents.recordEvent({
      eventId: randomUUID(),
      citizenId,
      eventType: 'city_update',
      idempotencyKey: `city_update:${citizenId}:${event.eventId}`,
      worldTimeMs: gameTimeMs,
      title: event.title,
      body: event.comuneLine ?? event.body,
      payload: {
        worldEventId: event.eventId,
        templateId: event.templateId,
        type: event.type,
        scope: event.scope,
      },
    });

    if (this.storyThreads) {
      await this.storyThreads.onWorldEventNoticed({
        citizenId,
        worldEventId: event.eventId,
        templateId: event.templateId,
        worldTimeMs: gameTimeMs,
      });
    }
  }

  private toNotice(event: WorldEventRecord, gameTimeMs: number): WorldEventNoticeDto {
    return {
      eventId: event.eventId,
      type: event.type,
      scope: event.scope,
      severity: event.severity,
      title: event.title,
      body: event.body,
      comuneLine: event.comuneLine,
      startedAtGameMs: event.startedAtGameMs,
      endsAtGameMs: event.endsAtGameMs,
      remainingGameMs: Math.max(0, event.endsAtGameMs - gameTimeMs),
    };
  }

  private invalidateCache() {
    this.cachedAtGameMs = null;
    this.cachedActiveEvents = [];
  }

  async dismissPopup(input: { citizenId: string; worldEventId: string }): Promise<{ dismissed: boolean }> {
    if (!getWorldEventConfig().enabled || this.storageUnavailable) {
      return { dismissed: false };
    }

    const dismissed = await this.events.markPopupDismissed(input.citizenId, input.worldEventId);
    return { dismissed };
  }
}
