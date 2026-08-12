import { useId, useMemo, useState } from 'react';
import {
  CHART_PERIOD_OPTIONS,
  DEFAULT_CHART_PERIOD,
  filterPointsByPeriod,
  GAME_MS_PER_DAY,
  type ChartPeriod,
  type TemporalChartPoint,
} from '@/utils/chartPeriods';

export interface TemporalLineChartSeriesPoint extends TemporalChartPoint {
  value: number;
}

interface TemporalLineChartProps {
  title: string;
  ariaLabel: string;
  points: TemporalLineChartSeriesPoint[];
  currentGameTimeMs: number;
  formatValue: (value: number) => string;
  formatTime: (gameTimeMs: number) => string;
  emptyMessage?: string;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;
const PADDING = { top: 16, right: 12, bottom: 28, left: 12 };
const CHART_ACCENT = '#ffb800';
const CHART_BG = '#0a0c14';

function resolveChartPoints(
  points: TemporalLineChartSeriesPoint[],
  period: ChartPeriod,
  currentGameTimeMs: number,
): TemporalLineChartSeriesPoint[] {
  const sorted = [...points].sort((a, b) => a.recordedAtGameMs - b.recordedAtGameMs);
  if (sorted.length === 0) return [];

  const filtered = filterPointsByPeriod(sorted, period, currentGameTimeMs);
  if (filtered.length > 0) return filtered;

  if (period !== 'total') {
    const total = filterPointsByPeriod(sorted, 'total', currentGameTimeMs);
    if (total.length > 0) return total;
  }

  return sorted;
}

function resolveChartXRange(points: TemporalLineChartSeriesPoint[]): { minX: number; maxX: number } {
  if (points.length === 0) {
    return { minX: 0, maxX: 1 };
  }

  if (points.length === 1) {
    const center = points[0]!.recordedAtGameMs;
    return { minX: center - GAME_MS_PER_DAY, maxX: center + GAME_MS_PER_DAY };
  }

  return {
    minX: points[0]!.recordedAtGameMs,
    maxX: points[points.length - 1]!.recordedAtGameMs,
  };
}

function buildPath(
  values: TemporalLineChartSeriesPoint[],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
): string {
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const xSpan = maxX - minX || 1;
  const ySpan = maxY - minY || 1;

  return values
    .map((point, index) => {
      const x = PADDING.left + ((point.recordedAtGameMs - minX) / xSpan) * innerWidth;
      const y =
        PADDING.top + innerHeight - ((point.value - minY) / ySpan) * innerHeight;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildAreaPath(
  linePath: string,
  values: TemporalLineChartSeriesPoint[],
  minX: number,
  maxX: number,
): string {
  if (values.length === 0) return '';
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const xSpan = maxX - minX || 1;
  const last = values[values.length - 1]!;
  const first = values[0]!;
  const lastX = PADDING.left + ((last.recordedAtGameMs - minX) / xSpan) * innerWidth;
  const firstX = PADDING.left + ((first.recordedAtGameMs - minX) / xSpan) * innerWidth;
  const baseY = CHART_HEIGHT - PADDING.bottom;
  return `${linePath} L ${lastX.toFixed(2)} ${baseY} L ${firstX.toFixed(2)} ${baseY} Z`;
}

export function TemporalLineChart({
  title,
  ariaLabel,
  points,
  currentGameTimeMs,
  formatValue,
  formatTime,
  emptyMessage = 'Storico non ancora disponibile.',
}: TemporalLineChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>(DEFAULT_CHART_PERIOD);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const descId = useId();
  const gradientId = useId();

  const filteredPoints = useMemo(
    () => resolveChartPoints(points, period, currentGameTimeMs),
    [currentGameTimeMs, period, points],
  );

  const chartGeometry = useMemo(() => {
    if (filteredPoints.length === 0) return null;

    const values = filteredPoints.map((point) => point.value);
    const minY = Math.min(...values);
    const maxY = Math.max(...values);
    const paddedMinY = minY === maxY ? minY - 1 : minY;
    const paddedMaxY = minY === maxY ? maxY + 1 : maxY;
    const { minX, maxX } = resolveChartXRange(filteredPoints);
    const linePath = buildPath(filteredPoints, minX, maxX, paddedMinY, paddedMaxY);
    const areaPath = buildAreaPath(linePath, filteredPoints, minX, maxX);

    return { linePath, areaPath, minX, maxX, minY: paddedMinY, maxY: paddedMaxY };
  }, [filteredPoints]);

  const activePoint =
    activeIndex != null && filteredPoints[activeIndex] ? filteredPoints[activeIndex] : null;

  return (
    <section className="temporalChart" aria-label={ariaLabel}>
      <div className="temporalChartHeader">
        <h3 className="temporalChartTitle">{title}</h3>
        <div className="temporalChartPeriods" role="tablist" aria-label="Periodo grafico">
          {CHART_PERIOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={period === option.id}
              className={
                period === option.id
                  ? 'temporalChartPeriod temporalChartPeriodActive'
                  : 'temporalChartPeriod'
              }
              onClick={() => {
                setPeriod(option.id);
                setActiveIndex(null);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {filteredPoints.length === 0 || !chartGeometry ? (
        <p className="temporalChartEmpty emptyState">{emptyMessage}</p>
      ) : (
        <div className="temporalChartBody">
          <svg
            className="temporalChartSvg"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-labelledby={descId}
            onMouseLeave={() => setActiveIndex(null)}
            onTouchEnd={() => setActiveIndex(null)}
          >
            <title id={descId}>{ariaLabel}</title>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_ACCENT} stopOpacity="0.35" />
                <stop offset="100%" stopColor={CHART_ACCENT} stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1={PADDING.left}
              y1={CHART_HEIGHT - PADDING.bottom}
              x2={CHART_WIDTH - PADDING.right}
              y2={CHART_HEIGHT - PADDING.bottom}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={1}
            />
            <path d={chartGeometry.areaPath} fill={`url(#${gradientId})`} />
            <path
              d={chartGeometry.linePath}
              fill="none"
              stroke={CHART_ACCENT}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {filteredPoints.map((point, index) => {
              const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
              const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
              const xSpan = chartGeometry.maxX - chartGeometry.minX || 1;
              const ySpan = chartGeometry.maxY - chartGeometry.minY || 1;
              const x =
                PADDING.left +
                ((point.recordedAtGameMs - chartGeometry.minX) / xSpan) * innerWidth;
              const y =
                PADDING.top +
                innerHeight -
                ((point.value - chartGeometry.minY) / ySpan) * innerHeight;
              const isActive = activeIndex === index;

              return (
                <g key={`${point.recordedAtGameMs}-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 5 : 3}
                    fill={isActive ? CHART_ACCENT : CHART_BG}
                    stroke={CHART_ACCENT}
                    strokeWidth={2}
                  />
                  <rect
                    x={x - 14}
                    y={PADDING.top}
                    width={28}
                    height={innerHeight}
                    fill="transparent"
                    className="temporalChartHit"
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onTouchStart={() => setActiveIndex(index)}
                    tabIndex={0}
                    aria-label={`${formatTime(point.recordedAtGameMs)}: ${formatValue(point.value)}`}
                  />
                </g>
              );
            })}
          </svg>

          {activePoint && (
            <div className="temporalChartTooltip" role="status">
              <span className="temporalChartTooltipTime">
                {formatTime(activePoint.recordedAtGameMs)}
              </span>
              <span className="temporalChartTooltipValue">{formatValue(activePoint.value)}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
