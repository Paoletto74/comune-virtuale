import { personalValueFillPercent, PERSONAL_VALUE_MAX, PERSONAL_VALUE_MIN } from '@/utils/personalValueRange';

interface PersonalValueMetricProps {
  label: string;
  value: number;
}

export function PersonalValueMetric({ label, value }: PersonalValueMetricProps) {
  const fillPercent = personalValueFillPercent(value);

  return (
    <div className="metric metricLife">
      <span className="metricLabel">{label}</span>
      <span className="metricValue">{value}</span>
      <div
        className="metricBar"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={PERSONAL_VALUE_MIN}
        aria-valuemax={PERSONAL_VALUE_MAX}
        aria-label={`${label}: ${value} su ${PERSONAL_VALUE_MAX}`}
      >
        <div className="metricBarFill" style={{ width: `${fillPercent}%` }} />
      </div>
    </div>
  );
}

interface ProfileMetricsProps {
  sympathy: number;
  reputation: number;
  cashDisplay: string;
  levelLabel?: string;
}

export function ProfileMetrics({
  sympathy,
  reputation,
  cashDisplay,
  levelLabel,
}: ProfileMetricsProps) {
  return (
    <section className="profileMetrics profileMetricsLife" aria-label="La tua vita">
      <div className="metric metricHighlight metricBalance">
        <span className="metricLabel">Saldo</span>
        <span className="metricValue">{cashDisplay}</span>
      </div>
      <PersonalValueMetric label="Simpatia" value={sympathy} />
      <PersonalValueMetric label="Reputazione" value={reputation} />
      {levelLabel && (
        <div className="metric metricLife">
          <span className="metricLabel">Progressione</span>
          <span className="metricValue metricValue--text">{levelLabel}</span>
        </div>
      )}
    </section>
  );
}
