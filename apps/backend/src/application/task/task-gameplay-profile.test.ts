import { describe, expect, it } from 'vitest';
import { defaultEffectRegistry } from '../effects/effect-registry.js';
import { ALL_POOL_ENTRY_DEFINITION_IDS } from './task-pool-registry.js';
import { FEED_VISIBLE_SIZE, MAX_CONCURRENT_STANDARD_TASKS } from '../../slice/feed-constants.js';
import {
  DEMO_FOUND_WALLET_DEFINITION_ID,
  DEMO_FOUND_WALLET_OPTION_KEEP,
} from '../../slice/c3-pilot-tasks-constants.js';
import {
  SLICE_DEMO_TASK_DEFINITION_ID,
  SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
} from '../../slice/constants.js';
import {
  getAllTaskGameplayProfiles,
  getTaskGameplayProfile,
  summarizeGameplayProfiles,
} from './task-gameplay-profile.js';
import { resolveSliceDemoOptionCashDelta } from '../effects/effect-registry.js';

describe('V1-GAMEPLAY-INTEREST-1 task gameplay profiles', () => {
  it('builds profiles for all pool entries without duplicates', () => {
    expect(getAllTaskGameplayProfiles()).toHaveLength(ALL_POOL_ENTRY_DEFINITION_IDS.length);
    expect(new Set(ALL_POOL_ENTRY_DEFINITION_IDS).size).toBe(ALL_POOL_ENTRY_DEFINITION_IDS.length);
    expect(ALL_POOL_ENTRY_DEFINITION_IDS.length).toBeGreaterThanOrEqual(98);
    expect(ALL_POOL_ENTRY_DEFINITION_IDS.length).toBeLessThanOrEqual(115);
  });

  it('keeps feed and multi-task constants unchanged', () => {
    expect(FEED_VISIBLE_SIZE).toBe(7);
    expect(MAX_CONCURRENT_STANDARD_TASKS).toBe(3);
  });

  it('marks steal_wallet as risky and economic without changing effects', () => {
    const profile = getTaskGameplayProfile(SLICE_DEMO_TASK_DEFINITION_ID);
    expect(profile?.tags).toContain('risky');
    expect(profile?.tags).toContain('economic');
    expect(profile?.maxGainMinor).toBe('10');

    const unchanged = resolveSliceDemoOptionCashDelta(SLICE_DEMO_TASK_OPTION_STEAL_WALLET);
    expect(unchanged).toBe(10n);
  });

  it('marks found wallet keep as economic upside without changing effects', () => {
    const profile = getTaskGameplayProfile(DEMO_FOUND_WALLET_DEFINITION_ID);
    expect(profile?.tags).toContain('economic');
    expect(profile?.tags).toContain('risky');
    expect(profile?.maxGainMinor).toBe('8');

    const bundle = defaultEffectRegistry.resolve({
      definitionId: DEMO_FOUND_WALLET_DEFINITION_ID,
      optionId: DEMO_FOUND_WALLET_OPTION_KEEP,
      taskInstanceId: 'test',
      citizenId: 'test',
      context: {},
    });
    expect(bundle.economic.kind).toBe('cash_delta');
    if (bundle.economic.kind === 'cash_delta') {
      expect(bundle.economic.deltaMinor).toBe(8n);
    }
  });

  it('recognizes positive, urgent and ambiguous tasks from existing content', () => {
    const summary = summarizeGameplayProfiles();
    expect(summary.positive).toBeGreaterThan(10);
    expect(summary.urgent).toBeGreaterThan(5);
    expect(summary.risky).toBeGreaterThan(5);
    expect(summary.economic).toBeGreaterThan(10);
    expect(summary.high_gain).toBeGreaterThan(1);
    expect(summary.ambiguous).toBeGreaterThan(10);
    expect(summary.normal).toBeGreaterThan(0);
  });
});
