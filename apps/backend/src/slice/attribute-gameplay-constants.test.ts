import { describe, expect, it } from 'vitest';
import {
  checkAttributeRequirements,
  normalizeAttributeMap,
  projectAttributePreview,
} from './attribute-gameplay-constants.js';
import { getTaskAttributeEffects } from './task-attribute-effects-constants.js';

describe('attribute gameplay', () => {
  it('normalizes italian aliases to canonical keys', () => {
    const map = normalizeAttributeMap({ cultura: 10, reputazione: 5 });
    expect(map.culture).toBe(10);
    expect(map.reputation).toBe(5);
  });

  it('detects missing requirements', () => {
    const result = checkAttributeRequirements({ culture: 30 }, { culture: 50 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missing[0]?.required).toBe(50);
      expect(result.missing[0]?.available).toBe(30);
    }
  });

  it('projects preview after costs and deltas', () => {
    const preview = projectAttributePreview(
      { culture: 120, sympathy: 10 },
      { culture: 50 },
      { sympathy: 5, culture: 8 },
    );
    expect(preview.culture?.before).toBe(120);
    expect(preview.culture?.after).toBe(78);
    expect(preview.sympathy?.after).toBe(15);
  });

  it('loads demo task attribute effects', () => {
    const spec = getTaskAttributeEffects('DEMO_NPC_MARCO_LEAK', 'help');
    expect(spec?.costs?.freeTime).toBe(15);
    expect(spec?.relationship?.unlockContact).toBe(true);
  });
});
