import { describe, expect, it } from 'vitest';
import './register-slice-task-definitions.js';
import {
  getAllTaskPersonalizationMetadata,
  getTaskPersonalizationMetadata,
  summarizePersonalizationCoverage,
} from './task-personalization-metadata.js';
import { ALL_POOL_ENTRY_DEFINITION_IDS } from './task-pool-registry.js';

describe('task personalization metadata', () => {
  it('covers every pool entry with inferred metadata', () => {
    const metadata = getAllTaskPersonalizationMetadata();
    expect(metadata).toHaveLength(ALL_POOL_ENTRY_DEFINITION_IDS.length);
    expect(new Set(metadata.map((entry) => entry.definitionId)).size).toBe(
      ALL_POOL_ENTRY_DEFINITION_IDS.length,
    );
  });

  it('classifies work tasks with work context', () => {
    const meta = getTaskPersonalizationMetadata('DEMO_V2_WORK_CLIENT_ANGER');
    expect(meta.contexts).toContain('work');
    expect(meta.primaryContext).toBe('work');
    expect(meta.generic).toBe(false);
  });

  it('marks broadly applicable tasks as generic', () => {
    const elderly = getTaskPersonalizationMetadata('DEMO_ELDERLY_CROSSING');
    expect(elderly.generic).toBe(true);
    expect(elderly.primaryContext).toBe('generic');
  });

  it('assigns family and living contexts from id patterns', () => {
    const family = getTaskPersonalizationMetadata('DEMO_V3_FAMILY_KID_SCHOOL');
    expect(family.contexts).toContain('family');

    const living = getTaskPersonalizationMetadata('DEMO_V3_NEIGHBORHOOD_PARKING_DISPUTE');
    expect(living.contexts).toContain('living');
  });

  it('summarizes context distribution across the pool', () => {
    const summary = summarizePersonalizationCoverage();
    expect(summary.work).toBeGreaterThan(0);
    expect(summary.social).toBeGreaterThan(0);
    expect(summary.economic).toBeGreaterThan(0);
    expect(summary.generic).toBeGreaterThan(0);
  });
});
