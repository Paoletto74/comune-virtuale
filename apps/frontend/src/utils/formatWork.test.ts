import { describe, expect, it } from 'vitest';
import { formatMonthlySalary, formatShiftRemaining } from '@/utils/formatWork';

describe('formatWork', () => {
  it('formats monthly salary with / mese suffix', () => {
    expect(formatMonthlySalary('2500')).toContain('€');
    expect(formatMonthlySalary('2500')).toContain('/ mese');
    expect(formatMonthlySalary('2500')).toContain('2500');
  });

  it('formats shift remaining duration', () => {
    expect(formatShiftRemaining(90 * 60_000)).toBe('1 h 30 min');
    expect(formatShiftRemaining(15 * 60_000)).toBe('15 min');
  });
});
