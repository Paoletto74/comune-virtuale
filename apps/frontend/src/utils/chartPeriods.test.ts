import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CHART_PERIOD,
  filterPointsByPeriod,
  GAME_MS_PER_DAY,
  GAME_MS_PER_MONTH,
  GAME_MS_PER_WEEK,
} from '@/utils/chartPeriods';

describe('chartPeriods', () => {
  const now = 1_000_000;
  const points = [
    { recordedAtGameMs: now - GAME_MS_PER_MONTH - 1, value: 1 },
    { recordedAtGameMs: now - GAME_MS_PER_WEEK - 1, value: 2 },
    { recordedAtGameMs: now - GAME_MS_PER_DAY - 1, value: 3 },
    { recordedAtGameMs: now - 1, value: 4 },
  ];

  it('defaults to week period constant', () => {
    expect(DEFAULT_CHART_PERIOD).toBe('week');
  });

  it('returns all points for total', () => {
    expect(filterPointsByPeriod(points, 'total', now)).toHaveLength(4);
  });

  it('filters last 24 game hours', () => {
    expect(filterPointsByPeriod(points, '24h', now)).toEqual([{ recordedAtGameMs: now - 1, value: 4 }]);
  });

  it('filters last game week', () => {
    const filtered = filterPointsByPeriod(points, 'week', now);
    expect(filtered.map((point) => point.value)).toEqual([3, 4]);
  });

  it('filters last game month', () => {
    const filtered = filterPointsByPeriod(points, 'month', now);
    expect(filtered.map((point) => point.value)).toEqual([2, 3, 4]);
  });
});
