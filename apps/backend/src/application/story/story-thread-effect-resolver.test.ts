import { describe, expect, it, afterEach } from 'vitest';
import {
  applyStoryThreadWeights,
  combineActiveStoryThreadEffects,
  resolveTaskStoryThreadMultiplier,
} from './story-thread-effect-resolver.js';
import type { StoryThreadRecord } from './story-thread-types.js';
import { setStoryThreadConfigForTests } from '../../slice/story-threads-constants.js';

function makeThread(partial: Partial<StoryThreadRecord> & Pick<StoryThreadRecord, 'threadId' | 'context'>): StoryThreadRecord {
  return {
    citizenId: 'citizen-1',
    type: 'npc',
    status: 'active',
    origin: 'task_completed',
    stage: partial.stage ?? partial.context.stage,
    priority: 1.1,
    createdAtGameMs: 0,
    lastActivityGameMs: 0,
    dormantUntilGameMs: null,
    expiresAtGameMs: null,
    metadata: {},
    idempotencyKey: `key:${partial.threadId}`,
    ...partial,
  };
}

describe('story-thread-effect-resolver', () => {
  afterEach(() => {
    setStoryThreadConfigForTests(null);
  });

  it('combines thread effects without exceeding caps', () => {
    setStoryThreadConfigForTests({
      enabled: true,
      maxActiveThreads: 3,
      maxPendingDevelopments: 2,
      maxCombinedTaskMultiplier: 1.25,
      minCombinedTaskMultiplier: 0.9,
      maxCombinedFlashMultiplier: 1.2,
      minCombinedFlashMultiplier: 0.92,
      tightBudgetThresholdMinor: 5000,
      tightBudgetRecoveryMinor: 10000,
    });

    const combined = combineActiveStoryThreadEffects([
      makeThread({
        threadId: 'a',
        context: {
          threadTemplateId: 'marco_favor_v1',
          stage: 1,
          attempts: 0,
        },
      }),
      makeThread({
        threadId: 'b',
        context: {
          threadTemplateId: 'tight_budget_v1',
          stage: 1,
          attempts: 0,
        },
      }),
    ]);

    const multiplier = resolveTaskStoryThreadMultiplier('DEMO_NPC_MARCO_OPPORTUNITY', combined);
    expect(multiplier).toBeLessThanOrEqual(1.25);
    expect(multiplier).toBeGreaterThan(1);
  });

  it('adjusts weights without zeroing candidates', () => {
    const modifiers = combineActiveStoryThreadEffects([
      makeThread({
        threadId: 'marco',
        context: { threadTemplateId: 'marco_favor_v1', stage: 1, attempts: 0 },
      }),
    ]);

    const adjusted = applyStoryThreadWeights(
      [
        { definitionId: 'DEMO_NPC_MARCO_OPPORTUNITY', adjustedWeight: 100 },
        { definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE', adjustedWeight: 100 },
      ],
      modifiers,
    );

    expect(adjusted.every((entry) => entry.adjustedWeight >= 1)).toBe(true);
    expect(adjusted[0]?.multiplier).toBeGreaterThan(1);
  });
});
