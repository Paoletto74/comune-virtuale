import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import {
  C3_POOL_START_WEIGHT,
  DEMO_FOUND_WALLET_DEFINITION_ID,
  DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
  DEMO_SUITCASE_OFFER_DEFINITION_ID,
} from '../../slice/c3-pilot-tasks-constants.js';
import { SLICE_DEMO_TASK_DEFINITION_ID } from '../../slice/constants.js';
import { POOL_AFTER_ELDERLY, POOL_AFTER_TASK, POOL_ANTI_STALL, POOL_PHASE_DAY, POOL_PHASE_EVENING, POOL_PHASE_NIGHT, POOL_START } from '../../slice/task-pool-constants.js';
import {
  VARIETY_POOL_WEIGHT,
  VARIETY_STANDARD_DEFINITION_IDS,
} from '../../slice/variety-content-constants.js';
import { VARIETY_V2_STANDARD_DEFINITION_IDS } from '../../slice/variety-content-v2-constants.js';
import { VARIETY_DIALOGUE_ROOT_IDS } from '../../slice/variety-dialogue-constants.js';
import { VARIETY_V3_STANDARD_DEFINITION_IDS } from '../../slice/variety-content-v3-constants.js';
import { VARIETY_V2_DIALOGUE_ROOT_IDS } from '../../slice/variety-dialogue-v2-constants.js';
import { VARIETY_V3_DIALOGUE_ROOT_IDS } from '../../slice/variety-dialogue-v3-constants.js';
import { NPC_CONSEQUENCE_TASK_DEFINITION_IDS } from '../../slice/npc-relationship-consequences-constants.js';
import { MEGA1_DEMO_TASK_DEFINITION_IDS } from '../../slice/mega1-demo-tasks-constants.js';
import {
  ANTI_STALL_POOL_WEIGHT,
  ANTI_STALL_TASK_DEFINITION_IDS,
} from '../../slice/anti-stall-tasks-constants.js';
import type { TaskPoolDefinition, TaskPoolEntry } from './task-pool-types.js';
import { getTaskPhaseAffinity, isTaskInPhasePool } from './task-phase-metadata.js';

function buildPhasePoolEntries(
  bucket: 'DAY' | 'EVENING' | 'NIGHT',
): readonly TaskPoolEntry[] {
  return POOL_REMAINING_TASK_ENTRIES.filter((entry) =>
    isTaskInPhasePool(getTaskPhaseAffinity(entry.definitionId), bucket),
  );
}

/** Original V1 slice pool — used by regression tests with elderly-only onboarding. */
export const LEGACY_SLICE_POOL_ENTRIES: readonly TaskPoolEntry[] = [
  {
    definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
    weight: C3_POOL_START_WEIGHT,
    repeatPolicy: 'once',
    enabled: true,
  },
  {
    definitionId: DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
    weight: C3_POOL_START_WEIGHT,
    repeatPolicy: 'once',
    enabled: true,
  },
  {
    definitionId: DEMO_SUITCASE_OFFER_DEFINITION_ID,
    weight: C3_POOL_START_WEIGHT,
    repeatPolicy: 'once',
    enabled: true,
  },
  {
    definitionId: DEMO_FOUND_WALLET_DEFINITION_ID,
    weight: C3_POOL_START_WEIGHT,
    repeatPolicy: 'once',
    enabled: true,
  },
];

const VARIETY_POOL_ENTRIES: readonly TaskPoolEntry[] = [
  ...VARIETY_STANDARD_DEFINITION_IDS.map((definitionId) => ({
    definitionId,
    weight: VARIETY_POOL_WEIGHT,
    repeatPolicy: 'once' as const,
    enabled: true,
  })),
  ...VARIETY_DIALOGUE_ROOT_IDS.map((definitionId) => ({
    definitionId,
    weight: VARIETY_POOL_WEIGHT,
    repeatPolicy: 'once' as const,
    enabled: true,
  })),
  ...VARIETY_V2_STANDARD_DEFINITION_IDS.map((definitionId) => ({
    definitionId,
    weight: VARIETY_POOL_WEIGHT,
    repeatPolicy: 'once' as const,
    enabled: true,
  })),
  ...VARIETY_V2_DIALOGUE_ROOT_IDS.map((definitionId) => ({
    definitionId,
    weight: VARIETY_POOL_WEIGHT,
    repeatPolicy: 'once' as const,
    enabled: true,
  })),
  ...VARIETY_V3_STANDARD_DEFINITION_IDS.map((definitionId) => ({
    definitionId,
    weight: VARIETY_POOL_WEIGHT,
    repeatPolicy: 'once' as const,
    enabled: true,
  })),
  ...VARIETY_V3_DIALOGUE_ROOT_IDS.map((definitionId) => ({
    definitionId,
    weight: VARIETY_POOL_WEIGHT,
    repeatPolicy: 'once' as const,
    enabled: true,
  })),
  ...NPC_CONSEQUENCE_TASK_DEFINITION_IDS.map((definitionId) => ({
    definitionId,
    weight: VARIETY_POOL_WEIGHT,
    repeatPolicy: 'once' as const,
    enabled: true,
  })),
  ...MEGA1_DEMO_TASK_DEFINITION_IDS.map((definitionId) => ({
    definitionId,
    weight: VARIETY_POOL_WEIGHT,
    repeatPolicy: 'once' as const,
    enabled: true,
  })),
];

export const POOL_REMAINING_TASK_ENTRIES: readonly TaskPoolEntry[] = [
  ...LEGACY_SLICE_POOL_ENTRIES,
  ...VARIETY_POOL_ENTRIES,
];

export const ALL_POOL_ENTRY_DEFINITION_IDS = POOL_REMAINING_TASK_ENTRIES.map(
  (entry) => entry.definitionId,
);

const POOL_START_DEFINITION: TaskPoolDefinition = {
  poolId: POOL_START,
  entries: POOL_REMAINING_TASK_ENTRIES,
};

const POOL_AFTER_ELDERLY_DEFINITION: TaskPoolDefinition = {
  poolId: POOL_AFTER_ELDERLY,
  entries: [
    {
      definitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
      weight: 100,
      repeatPolicy: 'once',
      enabled: true,
    },
  ],
};

const POOL_AFTER_TASK_DEFINITION: TaskPoolDefinition = {
  poolId: POOL_AFTER_TASK,
  entries: POOL_REMAINING_TASK_ENTRIES,
};

const POOL_PHASE_DAY_DEFINITION: TaskPoolDefinition = {
  poolId: POOL_PHASE_DAY,
  entries: buildPhasePoolEntries('DAY'),
};

const POOL_PHASE_EVENING_DEFINITION: TaskPoolDefinition = {
  poolId: POOL_PHASE_EVENING,
  entries: buildPhasePoolEntries('EVENING'),
};

const POOL_PHASE_NIGHT_DEFINITION: TaskPoolDefinition = {
  poolId: POOL_PHASE_NIGHT,
  entries: buildPhasePoolEntries('NIGHT'),
};

const POOL_ANTI_STALL_DEFINITION: TaskPoolDefinition = {
  poolId: POOL_ANTI_STALL,
  entries: ANTI_STALL_TASK_DEFINITION_IDS.map((definitionId) => ({
    definitionId,
    weight: ANTI_STALL_POOL_WEIGHT,
    repeatPolicy: 'repeatable' as const,
    enabled: true,
  })),
};

export class TaskPoolRegistry {
  private readonly pools = new Map<string, TaskPoolDefinition>();

  constructor() {
    this.register(POOL_START_DEFINITION);
    this.register(POOL_AFTER_ELDERLY_DEFINITION);
    this.register(POOL_AFTER_TASK_DEFINITION);
    this.register(POOL_PHASE_DAY_DEFINITION);
    this.register(POOL_PHASE_EVENING_DEFINITION);
    this.register(POOL_PHASE_NIGHT_DEFINITION);
    this.register(POOL_ANTI_STALL_DEFINITION);
  }

  register(pool: TaskPoolDefinition): void {
    this.pools.set(pool.poolId, pool);
  }

  get(poolId: string): TaskPoolDefinition | null {
    return this.pools.get(poolId) ?? null;
  }
}

export const defaultTaskPoolRegistry = new TaskPoolRegistry();

/** Regression tests — force elderly at onboarding while keeping legacy follow-up pool. */
export function createElderlyOnlyPoolRegistry(): TaskPoolRegistry {
  const registry = new TaskPoolRegistry();
  registry.register({
    poolId: POOL_START,
    entries: [
      {
        definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
        weight: 100,
        repeatPolicy: 'once',
        enabled: true,
      },
    ],
  });
  registry.register({
    poolId: POOL_AFTER_TASK,
    entries: LEGACY_SLICE_POOL_ENTRIES,
  });
  return registry;
}
