import { describe, expect, it } from 'vitest';
import {
  CAREER_DEFINITIONS,
  MAX_CAREER_GRADE,
  clampAffinity,
  resolveCareerGradeLabel,
} from './career-constants.js';

describe('career constants', () => {
  it('defines three demo careers with twenty grades each', () => {
    expect(Object.keys(CAREER_DEFINITIONS)).toEqual(['medicina', 'motorsport', 'criminalita']);
    for (const def of Object.values(CAREER_DEFINITIONS)) {
      expect(def.grades).toHaveLength(MAX_CAREER_GRADE);
      expect(def.label.length).toBeGreaterThan(0);
    }
  });

  it('resolves grade labels per career', () => {
    expect(resolveCareerGradeLabel('medicina', 5)).toBe('PRIMARIO');
    expect(resolveCareerGradeLabel('motorsport', 1)).toBe('APPASSIONATO');
    expect(resolveCareerGradeLabel('criminalita', 20)).toBe('MITO DEL SOTTOBOSCO');
  });

  it('clamps affinity to 0–100', () => {
    expect(clampAffinity(-5)).toBe(0);
    expect(clampAffinity(150)).toBe(100);
    expect(clampAffinity(42.6)).toBe(43);
  });
});
