import { describe, expect, it } from 'vitest';
import {
  applyGangCriminalTaskWeights,
  isCriminalTaskDefinition,
  isGangMemberFromEmployment,
} from './gang-task-boost.js';

describe('gang task boost', () => {
  it('detects criminal task definitions', () => {
    expect(isCriminalTaskDefinition('DEMO_SHADY_OFFER')).toBe(true);
    expect(isCriminalTaskDefinition('DEMO_NEIGHBOR_FAVOR')).toBe(false);
  });

  it('detects gang membership from employment', () => {
    expect(isGangMemberFromEmployment('job_gang_v1')).toBe(true);
    expect(isGangMemberFromEmployment('job_barista_v1')).toBe(false);
    expect(isGangMemberFromEmployment(null)).toBe(false);
  });

  it('boosts criminal task weights for gang members', () => {
    const entries = [
      { definitionId: 'DEMO_SHADY_OFFER', adjustedWeight: 10 },
      { definitionId: 'DEMO_NEIGHBOR_FAVOR', adjustedWeight: 10 },
    ];
    const boosted = applyGangCriminalTaskWeights(entries, true);
    expect(boosted[0]!.adjustedWeight).toBe(25);
    expect(boosted[1]!.adjustedWeight).toBe(10);
  });

  it('leaves weights unchanged for non-gang members', () => {
    const entries = [{ definitionId: 'DEMO_SHADY_OFFER', adjustedWeight: 10 }];
    expect(applyGangCriminalTaskWeights(entries, false)[0]!.adjustedWeight).toBe(10);
  });
});
