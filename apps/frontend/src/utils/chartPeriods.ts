export type ChartPeriod = '24h' | 'week' | 'month' | 'total';

export const CHART_PERIOD_OPTIONS: Array<{ id: ChartPeriod; label: string }> = [
  { id: '24h', label: '24 ORE' },
  { id: 'week', label: 'SETTIMANA' },
  { id: 'month', label: 'MESE' },
  { id: 'total', label: 'TOTALE' },
];

export const DEFAULT_CHART_PERIOD: ChartPeriod = 'week';

export const GAME_MS_PER_HOUR = 60 * 60 * 1000;
export const GAME_MS_PER_DAY = 24 * GAME_MS_PER_HOUR;
export const GAME_MS_PER_WEEK = 7 * GAME_MS_PER_DAY;
export const GAME_MS_PER_MONTH = 30 * GAME_MS_PER_DAY;

export interface TemporalChartPoint {
  recordedAtGameMs: number;
}

export function filterPointsByPeriod<T extends TemporalChartPoint>(
  points: T[],
  period: ChartPeriod,
  currentGameTimeMs: number,
): T[] {
  const sorted = [...points].sort((a, b) => a.recordedAtGameMs - b.recordedAtGameMs);
  if (period === 'total') return sorted;

  const cutoffByPeriod: Record<Exclude<ChartPeriod, 'total'>, number> = {
    '24h': currentGameTimeMs - GAME_MS_PER_DAY,
    week: currentGameTimeMs - GAME_MS_PER_WEEK,
    month: currentGameTimeMs - GAME_MS_PER_MONTH,
  };

  const cutoff = cutoffByPeriod[period];
  return sorted.filter((point) => point.recordedAtGameMs >= cutoff);
}
