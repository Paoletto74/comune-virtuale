import type { SVGProps } from 'react';
import {
  dayNightPhaseLabel,
  formatGameTimeAccessibilityLabel,
  resolveDayNightPhase,
  type DayNightPhase,
} from '@/utils/dayNightPhase';

interface DayNightHeaderProps {
  gameDate: {
    day: number;
    hour: number;
    minute: number;
    second?: number;
    label?: string;
  };
  displayName?: string;
  subtitle?: string;
}

function PhaseIcon({ phase, ...props }: { phase: DayNightPhase } & SVGProps<SVGSVGElement>) {
  const common = {
    viewBox: '0 0 80 80',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    ...props,
  };

  if (phase === 'dawn') {
    return (
      <svg {...common} aria-hidden="true">
        <defs>
          <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d3555" />
            <stop offset="100%" stopColor="#2a2438" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" rx="16" fill="url(#dawnSky)" />
        <path d="M0 58 Q20 48 40 52 Q60 56 80 50 L80 80 L0 80 Z" fill="#1a2230" opacity="0.7" />
        <circle cx="58" cy="48" r="14" fill="#f0c060" opacity="0.9" />
        <path d="M58 48 L58 28" stroke="#f5d080" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M58 48 L72 48" stroke="#f5d080" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M58 48 L48 38" stroke="#f5d080" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      </svg>
    );
  }

  if (phase === 'day') {
    return (
      <svg {...common} aria-hidden="true">
        <defs>
          <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a3548" />
            <stop offset="100%" stopColor="#1e2838" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" rx="16" fill="url(#daySky)" />
        <ellipse cx="40" cy="62" rx="36" ry="8" fill="#151b24" opacity="0.5" />
        <circle cx="52" cy="28" r="16" fill="#f0c060" />
        <circle cx="52" cy="28" r="20" fill="#f0c060" opacity="0.15" />
        <path d="M20 50 Q30 44 40 46 Q50 48 60 44" stroke="#283347" strokeWidth="1.5" fill="none" opacity="0.6" />
      </svg>
    );
  }

  if (phase === 'afternoon') {
    return (
      <svg {...common} aria-hidden="true">
        <defs>
          <linearGradient id="afternoonSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#243448" />
            <stop offset="100%" stopColor="#1e2838" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" rx="16" fill="url(#afternoonSky)" />
        <ellipse cx="40" cy="62" rx="36" ry="8" fill="#151b24" opacity="0.5" />
        <circle cx="48" cy="26" r="14" fill="#f0c060" />
        <path d="M22 34 Q32 28 42 32 Q52 36 58 32" stroke="#283347" strokeWidth="2" fill="#222c3d" opacity="0.7" />
      </svg>
    );
  }

  if (phase === 'sunset') {
    return (
      <svg {...common} aria-hidden="true">
        <defs>
          <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d2838" />
            <stop offset="100%" stopColor="#2a2028" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" rx="16" fill="url(#sunsetSky)" />
        <path d="M0 55 Q25 45 40 50 Q55 55 80 48 L80 80 L0 80 Z" fill="#1a2230" opacity="0.8" />
        <circle cx="40" cy="52" r="12" fill="#e09860" />
        <path d="M40 52 L40 36" stroke="#f0c060" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <rect width="80" height="80" rx="16" fill="#0d1117" />
      <circle cx="22" cy="18" r="1" fill="#f5f0e6" opacity="0.6" />
      <circle cx="58" cy="14" r="1" fill="#f5f0e6" opacity="0.5" />
      <circle cx="68" cy="28" r="0.8" fill="#f5f0e6" opacity="0.4" />
      <circle cx="14" cy="32" r="0.8" fill="#f5f0e6" opacity="0.45" />
      <path d="M0 58 Q20 50 40 54 Q60 58 80 52 L80 80 L0 80 Z" fill="#151b24" opacity="0.9" />
      <path
        d="M48 28 C48 18 58 14 58 24 C58 14 68 18 68 28 C68 36 58 40 58 40 C58 40 48 36 48 28 Z"
        fill="#e8e0d0"
        opacity="0.9"
      />
    </svg>
  );
}

export function DayNightHeader({ gameDate, displayName, subtitle }: DayNightHeaderProps) {
  const phase = resolveDayNightPhase(gameDate);
  const phaseLabel = dayNightPhaseLabel(phase);
  const ariaLabel = formatGameTimeAccessibilityLabel(gameDate);

  return (
    <header className={`dayNightHeader dayNightHeader--${phase}`} aria-label={ariaLabel}>
      <div className="dayNightHeaderVisual">
        <PhaseIcon phase={phase} className="dayNightIcon" />
        <span className="dayNightPhaseLabel">{phaseLabel}</span>
      </div>
      <div className="dayNightHeaderMeta">
        {displayName && <h1 className="dayNightCitizenName">{displayName}</h1>}
        {subtitle && <p className="dayNightSubtitle">{subtitle}</p>}
        <span className="visuallyHidden">{gameDate.label}</span>
      </div>
    </header>
  );
}
