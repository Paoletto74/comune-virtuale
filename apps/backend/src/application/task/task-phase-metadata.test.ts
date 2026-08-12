import { describe, expect, it } from 'vitest';
import { DEMO_SUITCASE_OFFER_DEFINITION_ID } from '../../slice/c3-pilot-tasks-constants.js';
import { DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID } from '../../slice/variety-content-constants.js';
import { ALL_POOL_ENTRY_DEFINITION_IDS } from './task-pool-registry.js';
import {
  activePhaseAffinitiesForDayPhase,
  getTaskPhaseAffinity,
  isTaskCompatibleWithDayPhase,
  resolvePhasePoolId,
} from './task-phase-metadata.js';

describe('task phase metadata', () => {
  it('classifies work tasks as DAY', () => {
    expect(getTaskPhaseAffinity('DEMO_V2_WORK_CLIENT_ANGER')).toBe('DAY');
    expect(getTaskPhaseAffinity(DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID)).toBe('DAY');
  });

  it('classifies risky tasks as NIGHT', () => {
    expect(getTaskPhaseAffinity(DEMO_SUITCASE_OFFER_DEFINITION_ID)).toBe('NIGHT');
    expect(getTaskPhaseAffinity('DEMO_V3_RISKY_BRIBE_OFFER')).toBe('NIGHT');
  });

  it('classifies social evening tasks as EVENING', () => {
    expect(getTaskPhaseAffinity('DEMO_V3_SOCIAL_FRIEND_PARTY')).toBe('EVENING');
    expect(getTaskPhaseAffinity('DEMO_V3_UNEXPECTED_STREET_PARADE')).toBe('EVENING');
  });

  it('classifies family and unexpected tasks as ALL_DAY', () => {
    expect(getTaskPhaseAffinity('DEMO_V3_FAMILY_SIBLING_CALL')).toBe('ALL_DAY');
    expect(getTaskPhaseAffinity('DEMO_V3_UNEXPECTED_POWER_OUTAGE')).toBe('ALL_DAY');
  });

  it('maps visual phases to pool buckets', () => {
    expect(activePhaseAffinitiesForDayPhase('afternoon')).toEqual(new Set(['ALL_DAY', 'DAY']));
    expect(activePhaseAffinitiesForDayPhase('sunset')).toEqual(new Set(['ALL_DAY', 'EVENING']));
    expect(activePhaseAffinitiesForDayPhase('night')).toEqual(new Set(['ALL_DAY', 'NIGHT']));
  });

  it('resolves phase pool ids', () => {
    expect(resolvePhasePoolId('day')).toBe('POOL_PHASE_DAY');
    expect(resolvePhasePoolId('sunset')).toBe('POOL_PHASE_EVENING');
    expect(resolvePhasePoolId('night')).toBe('POOL_PHASE_NIGHT');
  });

  it('checks compatibility without touching in-progress semantics', () => {
    expect(isTaskCompatibleWithDayPhase('DEMO_V2_WORK_CLIENT_ANGER', 'afternoon')).toBe(true);
    expect(isTaskCompatibleWithDayPhase('DEMO_V2_WORK_CLIENT_ANGER', 'night')).toBe(false);
    expect(isTaskCompatibleWithDayPhase('DEMO_V3_FAMILY_SIBLING_CALL', 'night')).toBe(true);
  });

  it('assigns every pool entry to a phase affinity', () => {
    for (const definitionId of ALL_POOL_ENTRY_DEFINITION_IDS) {
      expect(['DAY', 'EVENING', 'NIGHT', 'ALL_DAY']).toContain(getTaskPhaseAffinity(definitionId));
    }
  });
});
