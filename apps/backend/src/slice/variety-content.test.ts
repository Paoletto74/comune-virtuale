import { describe, expect, it } from 'vitest';
import { defaultEffectRegistry } from '../application/effects/effect-registry.js';
import { defaultTaskDefinitionCatalog } from '../application/task/task-definition-catalog.js';
import '../application/task/register-slice-task-definitions.js';
import {
  ALL_POOL_ENTRY_DEFINITION_IDS,
  defaultTaskPoolRegistry,
} from '../application/task/task-pool-registry.js';
import { TaskPoolResolver } from '../application/task/task-pool-resolver.js';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../slice/boss-constants.js';
import { POOL_AFTER_TASK, POOL_START } from '../slice/task-pool-constants.js';
import {
  DEMO_CHARITY_COLLECTOR_DEFINITION_ID,
  DEMO_CHARITY_DONATE_CASH_DELTA_MINOR,
  DEMO_CHARITY_OPTION_DONATE,
  DEMO_SHADY_BUY_CASH_DELTA_MINOR,
  DEMO_SHADY_OFFER_DEFINITION_ID,
  DEMO_SHADY_OPTION_BUY,
  DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID,
  DEMO_WORK_COLLEAGUE_OPTION_COVER,
  VARIETY_STANDARD_DEFINITION_IDS,
} from '../slice/variety-content-constants.js';
import {
  DEMO_FRIEND_DEBT_END_LEND,
  DEMO_FRIEND_DEBT_GREETING_DEFINITION_ID,
  DEMO_FRIEND_LEND_FULL_CASH_DELTA_MINOR,
  DEMO_LANDLORD_GREETING_DEFINITION_ID,
  VARIETY_DIALOGUE_ROOT_IDS,
} from '../slice/variety-dialogue-constants.js';

describe('V1-CONTENT-VARIETY-1', () => {
  it('registers all variety standard tasks in catalog', () => {
    for (const definitionId of VARIETY_STANDARD_DEFINITION_IDS) {
      expect(defaultTaskDefinitionCatalog.isSupported(definitionId)).toBe(true);
      const definition = defaultTaskDefinitionCatalog.get(definitionId);
      expect(definition?.taskKind).toBe('standard');
      expect(definition?.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('registers variety dialogue roots and nodes', () => {
    for (const definitionId of VARIETY_DIALOGUE_ROOT_IDS) {
      expect(defaultTaskDefinitionCatalog.isSupported(definitionId)).toBe(true);
      const definition = defaultTaskDefinitionCatalog.get(definitionId);
      expect(definition?.taskKind).toBe('dialogue_step');
      expect(definition?.options.length).toBeGreaterThanOrEqual(3);
      expect(definition?.options.length).toBeLessThanOrEqual(5);
    }
    expect(defaultTaskDefinitionCatalog.isSupported(DEMO_LANDLORD_GREETING_DEFINITION_ID)).toBe(true);
    expect(defaultTaskDefinitionCatalog.isSupported(DEMO_FRIEND_DEBT_GREETING_DEFINITION_ID)).toBe(true);
  });

  it('extends POOL_START with legacy plus variety entries (once each)', () => {
    const pool = defaultTaskPoolRegistry.get(POOL_START);
    expect(pool?.entries).toHaveLength(ALL_POOL_ENTRY_DEFINITION_IDS.length);
    expect(pool?.entries.every((entry) => entry.repeatPolicy === 'once')).toBe(true);
    expect(new Set(ALL_POOL_ENTRY_DEFINITION_IDS).size).toBe(ALL_POOL_ENTRY_DEFINITION_IDS.length);
  });

  it('resolves variety task completion to POOL_AFTER_TASK', () => {
    const resolver = new TaskPoolResolver();
    expect(
      resolver.resolvePoolId({
        trigger: 'task_completed',
        citizenId: 'c1',
        completedTaskInstanceId: 't1',
        completedDefinitionId: DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID,
      }),
    ).toBe(POOL_AFTER_TASK);
    expect(
      resolver.resolvePoolId({
        trigger: 'task_completed',
        citizenId: 'c1',
        completedTaskInstanceId: 't2',
        completedDefinitionId: DEMO_LANDLORD_GREETING_DEFINITION_ID,
      }),
    ).toBe(POOL_AFTER_TASK);
  });

  it('applies work colleague cover effects', () => {
    const cover = defaultEffectRegistry.resolve({
      definitionId: DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID,
      optionId: DEMO_WORK_COLLEAGUE_OPTION_COVER,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(cover.personalValues).toEqual(
      expect.objectContaining({ sympathy: 1, reputation: 0, experience: 1, reliability: 1 }),
    );
  });

  it('applies shady buy cash reward and charity donation debit', () => {
    const buy = defaultEffectRegistry.resolve({
      definitionId: DEMO_SHADY_OFFER_DEFINITION_ID,
      optionId: DEMO_SHADY_OPTION_BUY,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(buy.personalValues.reputation).toBe(-2);
    expect(buy.economic.kind).toBe('cash_delta');
    if (buy.economic.kind === 'cash_delta') {
      expect(buy.economic.deltaMinor).toBe(DEMO_SHADY_BUY_CASH_DELTA_MINOR);
    }

    const donate = defaultEffectRegistry.resolve({
      definitionId: DEMO_CHARITY_COLLECTOR_DEFINITION_ID,
      optionId: DEMO_CHARITY_OPTION_DONATE,
      taskInstanceId: 't2',
      citizenId: 'c1',
      context: {},
    });
    expect(donate.economic.kind).toBe('cash_delta');
    if (donate.economic.kind === 'cash_delta') {
      expect(donate.economic.deltaMinor).toBe(DEMO_CHARITY_DONATE_CASH_DELTA_MINOR);
    }
  });

  it('applies friend debt lend terminal economic effect only at conclusion', () => {
    const lend = defaultEffectRegistry.resolve({
      definitionId: DEMO_FRIEND_DEBT_END_LEND,
      optionId: 'conclude',
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(lend.economic.kind).toBe('cash_delta');
    if (lend.economic.kind === 'cash_delta') {
      expect(lend.economic.deltaMinor).toBe(DEMO_FRIEND_LEND_FULL_CASH_DELTA_MINOR);
    }
  });

  it('still resolves boss completion to POOL_AFTER_TASK', () => {
    const resolver = new TaskPoolResolver();
    expect(
      resolver.resolvePoolId({
        trigger: 'task_completed',
        citizenId: 'c1',
        completedTaskInstanceId: 'boss',
        completedDefinitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
      }),
    ).toBe(POOL_AFTER_TASK);
  });
});
