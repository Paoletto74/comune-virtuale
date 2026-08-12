import type { SVGProps } from 'react';
import {
  dayNightPhaseLabel,
  formatGameTimeAccessibilityLabel,
  resolveDayNightPhase,
  type DayNightPhase,
} from '@/utils/dayNightPhase';

interface DayNightSelectorProps {
  gameDate: {
    day: number;
    hour: number;
    minute: number;
    second?: number;
    label?: string;
  };
}

function PhaseMiniIcon({ phase, ...props }: { phase: DayNightPhase } & SVGProps<SVGSVGElement>) {
  const common = { viewBox: '0 0 48 32', fill: 'none', ...props };

  const skyline = (
    <path
      d="M0 24 Q8 20 16 22 Q24 24 32 21 Q40 18 48 22 L48 32 L0 32 Z"
      fill="currentColor"
      opacity="0.25"
    />
  );

  if (phase === 'dawn') {
    return (
      <svg {...common} aria-hidden="true">
        <rect width="48" height="32" rx="6" fill="url(#dawnGrad)" opacity="0.6" />
        <defs>
          <linearGradient id="dawnGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d2858" />
            <stop offset="100%" stopColor="#1a1528" />
          </linearGradient>
        </defs>
        {skyline}
        <circle cx="36" cy="14" r="5" fill="#ffb800" opacity="0.9" />
      </svg>
    );
  }

  if (phase === 'day') {
    return (
      <svg {...common} aria-hidden="true">
        <rect width="48" height="32" rx="6" fill="url(#dayGrad)" opacity="0.6" />
        <defs>
          <linearGradient id="dayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2840" />
            <stop offset="100%" stopColor="#141a28" />
          </linearGradient>
        </defs>
        {skyline}
        <circle cx="34" cy="12" r="6" fill="#ffb800" />
        <circle cx="34" cy="12" r="9" fill="#ffb800" opacity="0.15" />
      </svg>
    );
  }

  if (phase === 'afternoon') {
    return (
      <svg {...common} aria-hidden="true">
        <rect width="48" height="32" rx="6" fill="url(#afternoonGrad)" opacity="0.6" />
        <defs>
          <linearGradient id="afternoonGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3048" />
            <stop offset="100%" stopColor="#141a28" />
          </linearGradient>
        </defs>
        {skyline}
        <circle cx="30" cy="11" r="5" fill="#ffb800" />
        <path
          d="M18 14 Q22 10 26 12 Q30 14 34 12"
          stroke="#8b93a8"
          strokeWidth="1.5"
          fill="#283347"
          opacity="0.7"
        />
      </svg>
    );
  }

  if (phase === 'sunset') {
    return (
      <svg {...common} aria-hidden="true">
        <rect width="48" height="32" rx="6" fill="url(#sunsetGrad)" opacity="0.6" />
        <defs>
          <linearGradient id="sunsetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#402028" />
            <stop offset="100%" stopColor="#1a1420" />
          </linearGradient>
        </defs>
        {skyline}
        <circle cx="24" cy="20" r="5" fill="#e09860" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <rect width="48" height="32" rx="6" fill="#080a10" opacity="0.8" />
      <circle cx="12" cy="8" r="0.6" fill="#f0ebe3" opacity="0.5" />
      <circle cx="38" cy="6" r="0.5" fill="#f0ebe3" opacity="0.4" />
      {skyline}
      <path
        d="M30 12 C30 8 34 6 34 10 C34 6 38 8 38 12 C38 15 34 17 34 17 C34 17 30 15 30 12 Z"
        fill="#e8e0d0"
        opacity="0.85"
      />
    </svg>
  );
}

export function DayNightSelector({ gameDate }: DayNightSelectorProps) {
  const activePhase = resolveDayNightPhase(gameDate);
  const phaseLabel = dayNightPhaseLabel(activePhase);
  const ariaLabel = formatGameTimeAccessibilityLabel(gameDate);

  return (
    <div
      className={`dayNightIndicator dayNightIndicator--${activePhase}`}
      role="status"
      aria-label={ariaLabel}
    >
      <PhaseMiniIcon phase={activePhase} className="dayNightIndicatorIcon" />
      <span className="dayNightIndicatorLabel">{phaseLabel}</span>
      <span className="visuallyHidden">{gameDate.label}</span>
    </div>
  );
}

export { resolveDayNightPhase, dayNightPhaseLabel };
