import { describe, expect, it } from 'vitest';
import {
  ALL_POOL_ENTRY_DEFINITION_IDS,
  defaultTaskPoolRegistry,
} from './task-pool-registry.js';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import { POOL_AFTER_ELDERLY, POOL_AFTER_TASK, POOL_START } from '../../slice/task-pool-constants.js';

describe('TaskPoolRegistry', () => {
  it('registers POOL_START with legacy plus variety once entries', () => {
    const pool = defaultTaskPoolRegistry.get(POOL_START);
    expect(pool?.entries).toHaveLength(ALL_POOL_ENTRY_DEFINITION_IDS.length);
    expect(pool?.entries.map((entry) => entry.definitionId)).toEqual(ALL_POOL_ENTRY_DEFINITION_IDS);
    expect(pool?.entries.every((entry) => entry.repeatPolicy === 'once')).toBe(true);
  });

  it('registers POOL_AFTER_TASK with same entries as POOL_START (no boss)', () => {
    const pool = defaultTaskPoolRegistry.get(POOL_AFTER_TASK);
    expect(pool?.entries).toHaveLength(ALL_POOL_ENTRY_DEFINITION_IDS.length);
    expect(pool?.entries.map((entry) => entry.definitionId)).toEqual(ALL_POOL_ENTRY_DEFINITION_IDS);
  });

  it('registers POOL_AFTER_ELDERLY with boss once entry', () => {
    const pool = defaultTaskPoolRegistry.get(POOL_AFTER_ELDERLY);
    expect(pool?.entries).toEqual([
      {
        definitionId: DEMO_BOSS_GREETING_DEFINITION_ID,
        weight: 100,
        repeatPolicy: 'once',
        enabled: true,
      },
    ]);
  });
});
