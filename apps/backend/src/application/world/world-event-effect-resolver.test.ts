import { describe, expect, it, afterEach } from 'vitest';
import {
  applyWorldEventWeights,
  combineActiveWorldEventEffects,
  resolveFlashTemplateWorldEventMultiplier,
  resolveNpcWorldEventMultiplier,
  resolveTaskWorldEventMultiplier,
} from './world-event-effect-resolver.js';
import type { WorldEventRecord } from './world-event-types.js';
import { setWorldEventConfigForTests } from '../../slice/world-events-constants.js';

function makeEvent(
  partial: Partial<WorldEventRecord> & Pick<WorldEventRecord, 'eventId' | 'effects'>,
): WorldEventRecord {
  return {
    templateId: 'demo',
    scope: 'global',
    type: 'weather',
    status: 'active',
    severity: 'moderate',
    title: 'Test',
    body: 'Test body',
    comuneLine: null,
    source: 'system',
    startedAtGameMs: 0,
    endsAtGameMs: 10_000,
    metadata: {},
    idempotencyKey: `key:${partial.eventId}`,
    zoneId: null,
    createdAt: new Date(),
    ...partial,
  };
}

describe('world-event-effect-resolver', () => {
  afterEach(() => {
    setWorldEventConfigForTests(null);
  });

  it('combines overlapping task context multipliers by multiplication', () => {
    const combined = combineActiveWorldEventEffects([
      makeEvent({
        eventId: 'a',
        effects: { taskContextMultipliers: { social: 1.2 } },
      }),
      makeEvent({
        eventId: 'b',
        effects: { taskContextMultipliers: { social: 1.1 } },
      }),
    ]);

    expect(combined.activeEventIds).toEqual(['a', 'b']);
    expect(combined.taskContextMultipliers.social).toBeCloseTo(1.32);
  });

  it('applies penalties as multipliers below one', () => {
    const combined = combineActiveWorldEventEffects([
      makeEvent({
        eventId: 'a',
        effects: { taskContextPenalties: { work: 0.9 } },
      }),
    ]);

    expect(combined.taskContextMultipliers.work).toBe(0.9);
  });

  it('caps combined task multipliers', () => {
    setWorldEventConfigForTests({
      enabled: true,
      maxActiveEvents: 2,
      spawnCheckIntervalGameMs: 1000,
      globalSpawnCooldownGameMs: 1000,
      spawnProbability: 1,
      maxCombinedTaskMultiplier: 1.2,
      minCombinedTaskMultiplier: 0.9,
      maxCombinedFlashMultiplier: 1.3,
      minCombinedFlashMultiplier: 0.9,
    });

    const modifiers = combineActiveWorldEventEffects([
      makeEvent({
        eventId: 'a',
        effects: { taskContextMultipliers: { social: 1.5 } },
      }),
    ]);

    const multiplier = resolveTaskWorldEventMultiplier('task_help_neighbor', modifiers);
    expect(multiplier).toBeLessThanOrEqual(1.2);
    expect(multiplier).toBeGreaterThanOrEqual(0.9);
  });

  it('adjusts task weights without zeroing candidates', () => {
    const modifiers = combineActiveWorldEventEffects([
      makeEvent({
        eventId: 'heat',
        effects: { taskContextMultipliers: { social: 1.18 } },
      }),
    ]);

    const adjusted = applyWorldEventWeights(
      [
        { definitionId: 'task_help_neighbor', adjustedWeight: 100 },
        { definitionId: 'task_office_paperwork', adjustedWeight: 100 },
      ],
      modifiers,
    );

    expect(adjusted.every((entry) => entry.adjustedWeight >= 1)).toBe(true);
    expect(adjusted.some((entry) => entry.multiplier !== 1)).toBe(true);
  });

  it('boosts flash template weights without guaranteeing selection', () => {
    const modifiers = combineActiveWorldEventEffects([
      makeEvent({
        eventId: 'economic',
        effects: { flashTypeMultipliers: { economic: 1.2 } },
      }),
    ]);

    const multiplier = resolveFlashTemplateWorldEventMultiplier(
      'flash_cash_side_gig',
      'economic',
      modifiers,
    );
    expect(multiplier).toBeGreaterThan(1);
    expect(multiplier).toBeLessThanOrEqual(1.4);
  });

  it('exposes npc template multipliers as a hook', () => {
    const modifiers = combineActiveWorldEventEffects([
      makeEvent({
        eventId: 'transport',
        effects: { npcTemplateMultipliers: { marco_neighbor: 1.15 } },
      }),
    ]);

    expect(resolveNpcWorldEventMultiplier('marco_neighbor', modifiers)).toBe(1.15);
    expect(resolveNpcWorldEventMultiplier(undefined, modifiers)).toBe(1);
  });
});
