import { describe, expect, it } from 'vitest';
import { enrichTaskPersonalValues, personalValueCoverageFromEffects, type PersonalValuePartial } from './task-personal-value-enrichment.js';
import { PERSONAL_VALUE_KEYS } from './personal-values-constants.js';
import { ALL_POOL_ENTRY_DEFINITION_IDS } from '../application/task/task-pool-registry.js';
import { getTaskOptionStatEffects, type TaskOptionStatEffects } from '../application/task/task-gameplay-profile.js';
import { DEMO_BOSS_DIALOGUE_TERMINAL_OPTION } from './boss-dialogue-constants.js';
import { isDialogueRootDefinition } from './dialogue-routing.js';
import { defaultTaskDefinitionCatalog } from '../application/task/task-definition-catalog.js';

describe('task personal value enrichment', () => {
  it('adds thematic stats beyond sympathy/reputation/happiness', () => {
    const enriched = enrichTaskPersonalValues('DEMO_V2_WORK_CLIENT_ANGER', 'calm', {
      reputation: 1,
    });
    expect(enriched.experience).toBe(1);
    expect(enriched.reliability).toBe(1);
  });

  it('covers all 14 personal values across the task pool', () => {
    const entries: Array<{ definitionId: string; optionId: string; effects: PersonalValuePartial }> = [];

    const toPersonalPartial = (effects: TaskOptionStatEffects): PersonalValuePartial => {
      const partial: PersonalValuePartial = {};
      for (const key of PERSONAL_VALUE_KEYS) {
        const value = effects[key];
        if (value != null) partial[key] = value;
      }
      return partial;
    };

    for (const definitionId of ALL_POOL_ENTRY_DEFINITION_IDS) {
      if (isDialogueRootDefinition(definitionId)) {
        const effects = getTaskOptionStatEffects(definitionId, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION);
        if (effects) {
          entries.push({
            definitionId,
            optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
            effects: toPersonalPartial(effects),
          });
        }
        continue;
      }

      const definition = defaultTaskDefinitionCatalog.get(definitionId);
      if (!definition) continue;
      for (const option of definition.options) {
        const effects = getTaskOptionStatEffects(definitionId, option.optionId);
        if (effects) {
          entries.push({ definitionId, optionId: option.optionId, effects: toPersonalPartial(effects) });
        }
      }
    }

    const covered = personalValueCoverageFromEffects(entries);
    for (const key of PERSONAL_VALUE_KEYS) {
      expect(covered.has(key), `missing coverage for ${key}`).toBe(true);
    }
  });
});
