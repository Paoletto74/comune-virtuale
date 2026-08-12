import { describe, expect, it } from 'vitest';
import { defaultEffectRegistry } from '../application/effects/effect-registry.js';
import { defaultTaskDefinitionCatalog } from '../application/task/task-definition-catalog.js';
import '../application/task/register-slice-task-definitions.js';
import {
  computeTaskSelectionSeed,
  computeTaskSelectionSourceSeed,
  deterministicWeightedTaskSelection,
} from '../application/task/deterministic-task-selection.js';
import {
  ALL_POOL_ENTRY_DEFINITION_IDS,
  defaultTaskPoolRegistry,
} from '../application/task/task-pool-registry.js';
import {
  DEMO_FOUND_WALLET_DEFINITION_ID,
  DEMO_FOUND_WALLET_KEEP_CASH_DELTA_MINOR,
  DEMO_FOUND_WALLET_OPTION_KEEP,
  DEMO_FOUND_WALLET_OPTION_RETURN,
  DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
  DEMO_NEIGHBOR_OPTION_HELP,
  DEMO_NEIGHBOR_OPTION_IGNORE,
  DEMO_SUITCASE_OFFER_DEFINITION_ID,
  DEMO_SUITCASE_OPTION_ACCEPT,
  DEMO_SUITCASE_OPTION_ASK_CONTENTS,
  DEMO_SUITCASE_OPTION_REFUSE,
  C3_POOL_START_WEIGHT,
} from '../slice/c3-pilot-tasks-constants.js';
import { POOL_START, TASK_SELECTION_VERSION } from '../slice/task-pool-constants.js';

const POOL_START_CANDIDATES = ALL_POOL_ENTRY_DEFINITION_IDS.map((definitionId) => ({
  definitionId,
  weight: C3_POOL_START_WEIGHT,
}));

describe('C.3 pilot tasks', () => {
  it('registers POOL_START with legacy plus variety weighted once entries', () => {
    const pool = defaultTaskPoolRegistry.get(POOL_START);
    expect(pool?.entries).toHaveLength(ALL_POOL_ENTRY_DEFINITION_IDS.length);
    expect(pool?.entries.map((entry) => entry.definitionId)).toEqual(ALL_POOL_ENTRY_DEFINITION_IDS);
    expect(pool?.entries.every((entry) => entry.weight === 25 && entry.repeatPolicy === 'once')).toBe(true);
  });

  it('selects different start tasks deterministically by citizenId', () => {
    function resolveOnboardingTask(citizenId: string): string {
      const sourceSeed = computeTaskSelectionSourceSeed({ trigger: 'onboarding', citizenId });
      const selectionSeed = computeTaskSelectionSeed(POOL_START, sourceSeed, TASK_SELECTION_VERSION);
      return deterministicWeightedTaskSelection(selectionSeed, POOL_START_CANDIDATES).chosenDefinitionId;
    }

    const chosen = new Set([
      resolveOnboardingTask('citizen-a'),
      resolveOnboardingTask('citizen-b'),
      resolveOnboardingTask('citizen-c'),
      resolveOnboardingTask('citizen-d'),
    ]);
    expect(chosen.size).toBeGreaterThan(1);
    expect(resolveOnboardingTask('citizen-a')).toBe(resolveOnboardingTask('citizen-a'));
  });

  it('registers catalog definitions and options for all pilot tasks', () => {
    for (const definitionId of POOL_START_CANDIDATES.map((c) => c.definitionId)) {
      expect(defaultTaskDefinitionCatalog.isSupported(definitionId)).toBe(true);
      const definition = defaultTaskDefinitionCatalog.get(definitionId);
      expect(definition?.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('applies neighbor favor effects', () => {
    const help = defaultEffectRegistry.resolve({
      definitionId: DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
      optionId: DEMO_NEIGHBOR_OPTION_HELP,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(help.personalValues).toEqual(expect.objectContaining({ sympathy: 1, reputation: 0 }));
    expect(help.economic).toEqual({ kind: 'none' });

    const ignore = defaultEffectRegistry.resolve({
      definitionId: DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
      optionId: DEMO_NEIGHBOR_OPTION_IGNORE,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(ignore.personalValues).toEqual(
      expect.objectContaining({ reputation: 0, stress: 1, happiness: -1 }),
    );
  });

  it('applies suitcase offer reputation trade-offs', () => {
    const accept = defaultEffectRegistry.resolve({
      definitionId: DEMO_SUITCASE_OFFER_DEFINITION_ID,
      optionId: DEMO_SUITCASE_OPTION_ACCEPT,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(accept.personalValues.reputation).toBe(-1);

    const refuse = defaultEffectRegistry.resolve({
      definitionId: DEMO_SUITCASE_OFFER_DEFINITION_ID,
      optionId: DEMO_SUITCASE_OPTION_REFUSE,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(refuse.personalValues.reputation).toBe(1);

    const ask = defaultEffectRegistry.resolve({
      definitionId: DEMO_SUITCASE_OFFER_DEFINITION_ID,
      optionId: DEMO_SUITCASE_OPTION_ASK_CONTENTS,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(ask.personalValues.reputation).toBeLessThanOrEqual(0);
  });

  it('applies found wallet return vs keep cash trade-off', () => {
    const returnWallet = defaultEffectRegistry.resolve({
      definitionId: DEMO_FOUND_WALLET_DEFINITION_ID,
      optionId: DEMO_FOUND_WALLET_OPTION_RETURN,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(returnWallet.personalValues.reputation).toBe(1);
    expect(returnWallet.economic).toEqual({ kind: 'none' });

    const keep = defaultEffectRegistry.resolve({
      definitionId: DEMO_FOUND_WALLET_DEFINITION_ID,
      optionId: DEMO_FOUND_WALLET_OPTION_KEEP,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(keep.personalValues.reputation).toBe(-2);
    expect(keep.economic.kind).toBe('cash_delta');
    if (keep.economic.kind === 'cash_delta') {
      expect(keep.economic.deltaMinor).toBe(DEMO_FOUND_WALLET_KEEP_CASH_DELTA_MINOR);
    }
  });
});
