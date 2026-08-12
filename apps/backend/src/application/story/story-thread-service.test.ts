import { randomUUID } from 'node:crypto';
import { describe, expect, it, afterEach } from 'vitest';
import type { StoryThreadRepository } from '../../domain/ports/repositories.js';
import { setStoryThreadConfigForTests } from '../../slice/story-threads-constants.js';
import { StoryThreadService } from './story-thread-service.js';
import type { StoryThreadRecord } from './story-thread-types.js';

class InMemoryStoryThreadRepository implements StoryThreadRepository {
  private threads = new Map<string, StoryThreadRecord>();

  async findById(threadId: string) {
    return this.threads.get(threadId) ?? null;
  }

  async findByIdempotencyKey(idempotencyKey: string) {
    for (const thread of this.threads.values()) {
      if (thread.idempotencyKey === idempotencyKey) return thread;
    }
    return null;
  }

  async listByCitizenId(citizenId: string) {
    return [...this.threads.values()].filter((thread) => thread.citizenId === citizenId);
  }

  async listActiveForSelection(citizenId: string, gameTimeMs: number) {
    return [...this.threads.values()].filter(
      (thread) =>
        thread.citizenId === citizenId &&
        thread.status === 'active' &&
        (thread.expiresAtGameMs === null || thread.expiresAtGameMs > gameTimeMs),
    );
  }

  async countActiveByCitizenId(citizenId: string, gameTimeMs: number) {
    return (await this.listActiveForSelection(citizenId, gameTimeMs)).length;
  }

  async createThread(input: Parameters<StoryThreadRepository['createThread']>[0]) {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { record: existing, created: false };

    const record: StoryThreadRecord = {
      threadId: input.threadId,
      citizenId: input.citizenId,
      type: input.type as StoryThreadRecord['type'],
      status: input.status as StoryThreadRecord['status'],
      origin: input.origin,
      stage: input.stage,
      priority: input.priority,
      createdAtGameMs: input.createdAtGameMs,
      lastActivityGameMs: input.lastActivityGameMs,
      dormantUntilGameMs: input.dormantUntilGameMs ?? null,
      expiresAtGameMs: input.expiresAtGameMs ?? null,
      context: input.context as unknown as StoryThreadRecord['context'],
      metadata: input.metadata ?? {},
      idempotencyKey: input.idempotencyKey,
    };
    this.threads.set(record.threadId, record);
    return { record, created: true };
  }

  async updateThread(threadId: string, patch: Parameters<StoryThreadRepository['updateThread']>[1]) {
    const thread = this.threads.get(threadId);
    if (!thread) throw new Error('missing thread');
    const updated = {
      ...thread,
      ...(patch.status !== undefined ? { status: patch.status as StoryThreadRecord['status'] } : {}),
      ...(patch.stage !== undefined ? { stage: patch.stage } : {}),
      ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
      ...(patch.lastActivityGameMs !== undefined ? { lastActivityGameMs: patch.lastActivityGameMs } : {}),
      ...(patch.dormantUntilGameMs !== undefined ? { dormantUntilGameMs: patch.dormantUntilGameMs } : {}),
      ...(patch.expiresAtGameMs !== undefined ? { expiresAtGameMs: patch.expiresAtGameMs } : {}),
      ...(patch.context !== undefined ? { context: patch.context as unknown as StoryThreadRecord['context'] } : {}),
      ...(patch.metadata !== undefined ? { metadata: patch.metadata } : {}),
    };
    this.threads.set(threadId, updated);
    return updated;
  }

  async expireThreadsBefore(citizenId: string, gameTimeMs: number) {
    const ended: StoryThreadRecord[] = [];
    for (const thread of this.threads.values()) {
      if (
        thread.citizenId === citizenId &&
        (thread.status === 'active' || thread.status === 'dormant') &&
        thread.expiresAtGameMs !== null &&
        thread.expiresAtGameMs <= gameTimeMs
      ) {
        thread.status = 'abandoned';
        ended.push(thread);
      }
    }
    return ended;
  }

  async reactivateDormantThreads(citizenId: string, gameTimeMs: number) {
    const reactivated: StoryThreadRecord[] = [];
    for (const thread of this.threads.values()) {
      if (
        thread.citizenId === citizenId &&
        thread.status === 'dormant' &&
        thread.dormantUntilGameMs !== null &&
        thread.dormantUntilGameMs <= gameTimeMs &&
        (thread.expiresAtGameMs === null || thread.expiresAtGameMs > gameTimeMs)
      ) {
        thread.status = 'active';
        thread.lastActivityGameMs = gameTimeMs;
        reactivated.push(thread);
      }
    }
    return reactivated;
  }
}

describe('StoryThreadService', () => {
  afterEach(() => {
    setStoryThreadConfigForTests(null);
  });

  it('creates Marco favor thread idempotently on neighbor help', async () => {
    const repo = new InMemoryStoryThreadRepository();
    const service = new StoryThreadService(repo);

    await service.onTaskCompleted({
      citizenId: 'citizen-1',
      definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE',
      optionId: 'help',
      taskInstanceId: 'task-1',
      npcTemplateId: 'neighbor_marco',
      worldTimeMs: 1000,
    });

    await service.onTaskCompleted({
      citizenId: 'citizen-1',
      definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE',
      optionId: 'help',
      taskInstanceId: 'task-2',
      npcTemplateId: 'neighbor_marco',
      worldTimeMs: 1000,
    });

    const threads = await repo.listByCitizenId('citizen-1');
    expect(threads.filter((thread) => thread.context.threadTemplateId === 'marco_favor_v1')).toHaveLength(1);
  });

  it('advances Marco thread to completed on accepted opportunity', async () => {
    const repo = new InMemoryStoryThreadRepository();
    const service = new StoryThreadService(repo);

    await service.onTaskCompleted({
      citizenId: 'citizen-1',
      definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE',
      optionId: 'help',
      taskInstanceId: 'task-1',
      worldTimeMs: 1000,
    });

    await service.onTaskCompleted({
      citizenId: 'citizen-1',
      definitionId: 'DEMO_NPC_MARCO_OPPORTUNITY',
      optionId: 'accept',
      taskInstanceId: 'task-2',
      worldTimeMs: 2000,
    });

    const thread = (await repo.listByCitizenId('citizen-1'))[0];
    expect(thread?.status).toBe('completed');
    expect(thread?.stage).toBe(2);
  });

  it('creates flash delivery trace thread on accepted flash', async () => {
    const repo = new InMemoryStoryThreadRepository();
    const service = new StoryThreadService(repo);

    await service.onFlashOutcome({
      citizenId: 'citizen-1',
      templateId: 'FLASH_ECONOMIC_DELIVERY',
      outcome: 'accepted',
      opportunityId: randomUUID(),
      worldTimeMs: 5000,
    });

    const threads = await repo.listByCitizenId('citizen-1');
    expect(threads.some((thread) => thread.context.threadTemplateId === 'flash_delivery_trace_v1')).toBe(true);
    expect(threads[0]?.status).toBe('dormant');
  });

  it('expires threads after expiry game time', async () => {
    const repo = new InMemoryStoryThreadRepository();
    const service = new StoryThreadService(repo);

    await repo.createThread({
      threadId: randomUUID(),
      citizenId: 'citizen-1',
      type: 'economic',
      status: 'active',
      origin: 'economic_pressure',
      stage: 1,
      priority: 1,
      createdAtGameMs: 0,
      lastActivityGameMs: 0,
      expiresAtGameMs: 1000,
      context: { threadTemplateId: 'tight_budget_v1', stage: 1, attempts: 0 },
      idempotencyKey: 'expiry-test',
    });

    await service.syncLifecycle('citizen-1', 1000);
    const active = await service.getActiveThreads('citizen-1', 1000);
    expect(active).toHaveLength(0);
  });

  it('returns empty modifiers when repository throws missing-table error once', async () => {
    class MissingTableRepository extends InMemoryStoryThreadRepository {
      private failNext = true;

      override async expireThreadsBefore(citizenId: string, gameTimeMs: number) {
        if (this.failNext) {
          this.failNext = false;
          const error = new Error('relation "story_threads" does not exist') as Error & {
            code: string;
          };
          error.code = '42P01';
          throw error;
        }
        return super.expireThreadsBefore(citizenId, gameTimeMs);
      }
    }

    const service = new StoryThreadService(new MissingTableRepository());
    const modifiers = await service.getCombinedModifiers('citizen-1', 1000);
    expect(modifiers.activeThreadIds).toEqual([]);
    await expect(service.getCombinedModifiers('citizen-1', 2000)).resolves.toEqual(modifiers);
  });
});
