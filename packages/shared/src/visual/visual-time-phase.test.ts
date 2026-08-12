import { describe, expect, it } from 'vitest';
import {
  isVisualNightHeader,
  resolveVisualTimePhase,
  visualTimePhaseLabel,
} from './visual-time-phase.js';

describe('visual-time-phase', () => {
  function at(hour: number, minute = 0): Date {
    return new Date(2026, 7, 12, hour, minute, 0, 0);
  }

  it('maps official phase boundaries', () => {
    expect(resolveVisualTimePhase(at(5, 59))).toBe('night');
    expect(resolveVisualTimePhase(at(6, 0))).toBe('morning');
    expect(resolveVisualTimePhase(at(11, 59))).toBe('morning');
    expect(resolveVisualTimePhase(at(12, 0))).toBe('day');
    expect(resolveVisualTimePhase(at(16, 59))).toBe('day');
    expect(resolveVisualTimePhase(at(17, 0))).toBe('sunset');
    expect(resolveVisualTimePhase(at(20, 59))).toBe('sunset');
    expect(resolveVisualTimePhase(at(21, 0))).toBe('night');
    expect(resolveVisualTimePhase(at(0, 0))).toBe('night');
  });

  it('exposes Italian labels', () => {
    expect(visualTimePhaseLabel('morning')).toBe('Mattino');
    expect(visualTimePhaseLabel('day')).toBe('Giorno');
    expect(visualTimePhaseLabel('sunset')).toBe('Tramonto');
    expect(visualTimePhaseLabel('night')).toBe('Notte');
  });

  it('shows moon only at night in header', () => {
    expect(isVisualNightHeader('morning')).toBe(false);
    expect(isVisualNightHeader('day')).toBe(false);
    expect(isVisualNightHeader('sunset')).toBe(false);
    expect(isVisualNightHeader('night')).toBe(true);
  });
});
