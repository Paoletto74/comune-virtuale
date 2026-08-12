import { describe, expect, it } from 'vitest';
import {
  dayNightPhaseLabel,
  formatGameTimeAccessibilityLabel,
  resolveDayNightPhase,
} from '@/utils/dayNightPhase';

describe('resolveDayNightPhase', () => {
  it('returns dawn between 5 and 7', () => {
    expect(resolveDayNightPhase({ hour: 5 })).toBe('dawn');
    expect(resolveDayNightPhase({ hour: 7 })).toBe('dawn');
  });

  it('returns day between 8 and 12', () => {
    expect(resolveDayNightPhase({ hour: 8 })).toBe('day');
    expect(resolveDayNightPhase({ hour: 12 })).toBe('day');
  });

  it('returns afternoon between 13 and 17', () => {
    expect(resolveDayNightPhase({ hour: 13 })).toBe('afternoon');
    expect(resolveDayNightPhase({ hour: 14 })).toBe('afternoon');
    expect(resolveDayNightPhase({ hour: 17 })).toBe('afternoon');
  });

  it('returns sunset between 18 and 20', () => {
    expect(resolveDayNightPhase({ hour: 18 })).toBe('sunset');
    expect(resolveDayNightPhase({ hour: 20 })).toBe('sunset');
  });

  it('returns night otherwise', () => {
    expect(resolveDayNightPhase({ hour: 21 })).toBe('night');
    expect(resolveDayNightPhase({ hour: 2 })).toBe('night');
    expect(resolveDayNightPhase({ hour: 4 })).toBe('night');
  });

  it('wraps negative and overflow hours', () => {
    expect(resolveDayNightPhase({ hour: 34 })).toBe('day');
    expect(resolveDayNightPhase({ hour: -1 })).toBe('night');
  });
});

describe('dayNightPhaseLabel', () => {
  it('returns Italian labels for all five phases', () => {
    expect(dayNightPhaseLabel('dawn')).toBe('Alba');
    expect(dayNightPhaseLabel('day')).toBe('Giorno');
    expect(dayNightPhaseLabel('afternoon')).toBe('Pomeriggio');
    expect(dayNightPhaseLabel('sunset')).toBe('Tramonto');
    expect(dayNightPhaseLabel('night')).toBe('Notte');
  });
});

describe('formatGameTimeAccessibilityLabel', () => {
  it('includes phase and label when provided', () => {
    const label = formatGameTimeAccessibilityLabel({
      day: 3,
      hour: 14,
      minute: 22,
      label: 'Giorno 3, 14:22:05',
    });
    expect(label).toContain('Pomeriggio');
    expect(label).toContain('Giorno 3, 14:22:05');
  });
});
