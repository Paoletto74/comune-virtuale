import { describe, expect, it } from 'vitest';
import {
  BOSS_DIALOGUE_NODES,
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
} from './boss-dialogue-constants.js';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from './boss-constants.js';
import { defaultTaskDefinitionCatalog } from '../application/task/task-definition-catalog.js';
import '../application/task/register-slice-task-definitions.js';

describe('task definition catalog (slice)', () => {
  it('registers boss dialogue entry and terminals', () => {
    expect(defaultTaskDefinitionCatalog.isSupported(DEMO_BOSS_GREETING_DEFINITION_ID)).toBe(true);
    expect(
      defaultTaskDefinitionCatalog.isAllowedOption(
        DEMO_BOSS_GREETING_DEFINITION_ID,
        'sincere_apology',
      ),
    ).toBe(true);
    expect(
      defaultTaskDefinitionCatalog.isAllowedOption(
        DEMO_BOSS_GREETING_DEFINITION_ID,
        'invented_option',
      ),
    ).toBe(false);
    expect(
      defaultTaskDefinitionCatalog.get(DEMO_BOSS_GREETING_DEFINITION_ID)?.taskKind,
    ).toBe('dialogue_step');
    expect(
      defaultTaskDefinitionCatalog.isAllowedOption(
        'DEMO_BOSS_LATE_END_POSITIVE',
        DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      ),
    ).toBe(true);
  });

  it('registers dialogue node copy from constants', () => {
    const s1 = defaultTaskDefinitionCatalog.get(DEMO_BOSS_GREETING_DEFINITION_ID);
    expect(s1?.description).toBe(BOSS_DIALOGUE_NODES[DEMO_BOSS_GREETING_DEFINITION_ID]?.description);
  });
});
