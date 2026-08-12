import { describe, expect, it } from 'vitest';
import { defaultEffectRegistry } from '../application/effects/effect-registry.js';
import { defaultTaskDefinitionCatalog } from '../application/task/task-definition-catalog.js';
import '../application/task/register-slice-task-definitions.js';
import {
  ALL_POOL_ENTRY_DEFINITION_IDS,
  defaultTaskPoolRegistry,
  LEGACY_SLICE_POOL_ENTRIES,
} from '../application/task/task-pool-registry.js';
import { TaskPoolResolver } from '../application/task/task-pool-resolver.js';
import { DEMO_BOSS_DIALOGUE_TERMINAL_OPTION } from '../slice/boss-dialogue-constants.js';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../slice/boss-constants.js';
import { getDialogueNext, isDialogueTerminal } from '../slice/dialogue-routing.js';
import { POOL_AFTER_TASK, POOL_START } from '../slice/task-pool-constants.js';
import {
  VARIETY_V2_STANDARD_DEFINITION_IDS,
  VARIETY_V2_STANDARD_TASKS,
} from '../slice/variety-content-v2-constants.js';
import { NPC_CONSEQUENCE_TASK_DEFINITION_IDS } from '../slice/npc-relationship-consequences-constants.js';
import { MEGA1_DEMO_TASK_DEFINITION_IDS } from '../slice/mega1-demo-tasks-constants.js';
import {
  DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE,
  DEMO_V2_DIALOGUE_SCAM_GREETING,
  DEMO_V2_DIALOGUE_SUPERVISOR_END_POSITIVE,
  DEMO_V2_DIALOGUE_SUPERVISOR_GREETING,
  SCAM_DIALOGUE_PATH_NEGATIVE,
  SCAM_DIALOGUE_PATH_POSITIVE,
  VARIETY_V2_DIALOGUE_ROOT_IDS,
  VARIETY_V2_DIALOGUE_STEP_IDS,
  VARIETY_V2_DIALOGUE_TERMINAL_IDS,
} from '../slice/variety-dialogue-v2-constants.js';
import {
  VARIETY_STANDARD_DEFINITION_IDS,
} from '../slice/variety-content-constants.js';
import {
  VARIETY_DIALOGUE_ROOT_IDS,
} from '../slice/variety-dialogue-constants.js';

const V2_NEW_CONTENT_COUNT = VARIETY_V2_STANDARD_DEFINITION_IDS.length + VARIETY_V2_DIALOGUE_ROOT_IDS.length;

describe('V1-CONTENT-VARIETY-2', () => {
  it('registers all v2 standard tasks in catalog', () => {
    for (const definitionId of VARIETY_V2_STANDARD_DEFINITION_IDS) {
      expect(defaultTaskDefinitionCatalog.isSupported(definitionId)).toBe(true);
      const definition = defaultTaskDefinitionCatalog.get(definitionId);
      expect(definition?.taskKind).toBe('standard');
      expect(definition?.options.length).toBeGreaterThanOrEqual(3);
      expect(definition?.options.length).toBeLessThanOrEqual(5);
    }
  });

  it('registers v2 dialogue roots, steps and terminals', () => {
    for (const definitionId of VARIETY_V2_DIALOGUE_ROOT_IDS) {
      const definition = defaultTaskDefinitionCatalog.get(definitionId);
      expect(definition?.taskKind).toBe('dialogue_step');
      expect(definition?.options.length).toBeGreaterThanOrEqual(3);
      expect(definition?.options.length).toBeLessThanOrEqual(5);
    }
    for (const definitionId of VARIETY_V2_DIALOGUE_STEP_IDS) {
      expect(defaultTaskDefinitionCatalog.isSupported(definitionId)).toBe(true);
    }
    for (const definitionId of VARIETY_V2_DIALOGUE_TERMINAL_IDS) {
      const definition = defaultTaskDefinitionCatalog.get(definitionId);
      expect(definition?.taskKind).toBe('dialogue_terminal');
    }
  });

  it('extends pool with v2 once entries and no duplicates', () => {
    const pool = defaultTaskPoolRegistry.get(POOL_START);
    const expectedLength =
      LEGACY_SLICE_POOL_ENTRIES.length +
      VARIETY_STANDARD_DEFINITION_IDS.length +
      VARIETY_DIALOGUE_ROOT_IDS.length +
      V2_NEW_CONTENT_COUNT +
      69 +
      8 +
      NPC_CONSEQUENCE_TASK_DEFINITION_IDS.length +
      MEGA1_DEMO_TASK_DEFINITION_IDS.length;
    expect(pool?.entries).toHaveLength(expectedLength);
    expect(pool?.entries.every((entry) => entry.repeatPolicy === 'once')).toBe(true);
    expect(new Set(ALL_POOL_ENTRY_DEFINITION_IDS).size).toBe(ALL_POOL_ENTRY_DEFINITION_IDS.length);
  });

  it('routes supervisor dialogue through distinct paths to different terminals', () => {
    const step2 = getDialogueNext(DEMO_V2_DIALOGUE_SUPERVISOR_GREETING, 'humble');
    expect(step2).toBe('DEMO_V2_DIALOGUE_SUPERVISOR_S2A');
    const terminal = getDialogueNext(step2!, 'commit');
    expect(terminal).toBe(DEMO_V2_DIALOGUE_SUPERVISOR_END_POSITIVE);
    expect(isDialogueTerminal(terminal!)).toBe(true);
  });

  it('applies scam dialogue terminal economic effect only at conclusion', () => {
    let node = DEMO_V2_DIALOGUE_SCAM_GREETING;
    for (const optionId of SCAM_DIALOGUE_PATH_NEGATIVE.slice(0, -1)) {
      node = getDialogueNext(node, optionId)!;
    }
    expect(node).toBe(DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE);

    const negative = defaultEffectRegistry.resolve({
      definitionId: DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE,
      optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(negative.economic.kind).toBe('cash_delta');
    if (negative.economic.kind === 'cash_delta') {
      expect(negative.economic.deltaMinor).toBe(-35n);
    }

    let positiveNode = DEMO_V2_DIALOGUE_SCAM_GREETING;
    for (const optionId of SCAM_DIALOGUE_PATH_POSITIVE.slice(0, -1)) {
      positiveNode = getDialogueNext(positiveNode, optionId)!;
    }
    const positive = defaultEffectRegistry.resolve({
      definitionId: positiveNode,
      optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      taskInstanceId: 't2',
      citizenId: 'c1',
      context: {},
    });
    expect(positive.economic.kind).toBe('none');
    expect(positive.personalValues.reputation).toBe(1);
  });

  it('does not register effects for v2 dialogue intermediate steps', () => {
    expect(() =>
      defaultEffectRegistry.resolve({
        definitionId: DEMO_V2_DIALOGUE_SUPERVISOR_GREETING,
        optionId: 'humble',
        taskInstanceId: 't1',
        citizenId: 'c1',
        context: {},
      }),
    ).toThrow();
  });

  it('applies v2 standard task economy where defined', () => {
    const billTask = VARIETY_V2_STANDARD_TASKS.find((t) => t.definitionId === 'DEMO_V2_ECON_BILL_SHOCK');
    expect(billTask).toBeDefined();
    const pay = defaultEffectRegistry.resolve({
      definitionId: 'DEMO_V2_ECON_BILL_SHOCK',
      optionId: 'pay',
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(pay.economic.kind).toBe('cash_delta');
    if (pay.economic.kind === 'cash_delta') {
      expect(pay.economic.deltaMinor).toBe(-55n);
    }

    const weird = defaultEffectRegistry.resolve({
      definitionId: 'DEMO_V2_WEIRD_FLYER',
      optionId: 'laugh',
      taskInstanceId: 't2',
      citizenId: 'c1',
      context: {},
    });
    expect(weird.personalValues).toEqual(expect.objectContaining({ reputation: -1 }));
    expect(weird.economic.kind).toBe('none');
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
