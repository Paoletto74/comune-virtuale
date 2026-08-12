import { describe, expect, it } from 'vitest';
import {
  LEVEL_POINT_THRESHOLDS,
  MAX_MAIN_LEVEL,
  resolveLevelFromPoints,
  resolveMainLevelId,
  resolveProgressToNextLevel,
  resolveLevelUpMessage,
  resolveProgressionFloorForLevel,
} from '../../slice/citizen-progression-constants.js';
import { computeTaskProgressionPoints } from './citizen-progression-service.js';

describe('citizen progression constants', () => {
  it('maps points to configured level thresholds (1–20)', () => {
    expect(resolveLevelFromPoints(0)).toBe(1);
    expect(resolveLevelFromPoints(99)).toBe(1);
    expect(resolveLevelFromPoints(100)).toBe(2);
    expect(resolveLevelFromPoints(299)).toBe(2);
    expect(resolveLevelFromPoints(300)).toBe(3);
    expect(resolveLevelFromPoints(10_999)).toBe(9);
    expect(resolveLevelFromPoints(11_000)).toBe(10);
    expect(resolveLevelFromPoints(13_999)).toBe(10);
    expect(resolveLevelFromPoints(14_000)).toBe(11);
    expect(resolveLevelFromPoints(74_999)).toBe(19);
    expect(resolveLevelFromPoints(75_000)).toBe(20);
    expect(resolveLevelFromPoints(999_999)).toBe(20);
  });

  it('supports twenty main levels', () => {
    expect(MAX_MAIN_LEVEL).toBe(20);
    expect(LEVEL_POINT_THRESHOLDS[20]).toBe(75_000);
  });

  it('resolves main level ids through L20', () => {
    expect(resolveMainLevelId(2)).toBe('main_L02');
    expect(resolveMainLevelId(10)).toBe('main_L10');
    expect(resolveMainLevelId(20)).toBe('main_L20');
  });

  it('computes progress toward next level', () => {
    expect(resolveProgressToNextLevel(0, 1)).toBe(0);
    expect(resolveProgressToNextLevel(50, 1)).toBe(50);
    expect(resolveProgressToNextLevel(100, 2)).toBe(0);
    expect(resolveProgressToNextLevel(LEVEL_POINT_THRESHOLDS[20]!, 20)).toBeNull();
    expect(resolveProgressToNextLevel(12_000, 10)).toBeGreaterThan(0);
  });

  it('preserves legacy level floors for migration', () => {
    expect(resolveProgressionFloorForLevel(10)).toBe(11_000);
    expect(resolveProgressionFloorForLevel(5)).toBe(1_300);
    expect(resolveProgressionFloorForLevel(6)).toBe(2_100);
  });

  it('picks deterministic editorial level-up copy', () => {
    const first = resolveLevelUpMessage('citizen-a', 2);
    const second = resolveLevelUpMessage('citizen-a', 2);
    const other = resolveLevelUpMessage('citizen-b', 2);
    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(10);
    expect(other.length).toBeGreaterThan(10);
    expect(resolveLevelUpMessage('citizen-a', 11).length).toBeGreaterThan(10);
  });
});

describe('computeTaskProgressionPoints', () => {
  it('awards more for demanding tasks than everyday tasks', () => {
    const everyday = computeTaskProgressionPoints({
      definitionId: 'DEMO_ELDERLY_CROSSING',
      optionId: 'help',
      sympathyDelta: 1,
      reputationDelta: 1,
      hadRiskOutcome: false,
    });
    const demanding = computeTaskProgressionPoints({
      definitionId: 'DEMO_BOSS_GREETING_S1',
      optionId: 'positive',
      sympathyDelta: 1,
      reputationDelta: 1,
      hadRiskOutcome: false,
    });
    expect(demanding).toBeGreaterThan(everyday);
  });

  it('adds a small bonus for clearly positive outcomes', () => {
    const baseline = computeTaskProgressionPoints({
      definitionId: 'DEMO_ELDERLY_CROSSING',
      optionId: 'help',
      sympathyDelta: 0,
      reputationDelta: 0,
      hadRiskOutcome: false,
    });
    const boosted = computeTaskProgressionPoints({
      definitionId: 'DEMO_ELDERLY_CROSSING',
      optionId: 'help',
      sympathyDelta: 3,
      reputationDelta: 2,
      hadRiskOutcome: false,
    });
    expect(boosted).toBeGreaterThan(baseline);
  });
});
