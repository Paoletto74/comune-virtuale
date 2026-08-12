import type { SVGProps } from 'react';
import {
  isVisualNightHeader,
  visualTimePhaseLabel,
  type VisualTimePhase,
} from '@comune-virtuale/shared';
import { useVisualTimePhase } from '@/context/VisualTimeProvider';

interface DayPhaseHeaderIconProps {
  className?: string;
  /** Test override — uses real visual time when omitted */
  phaseOverride?: VisualTimePhase;
}

/** WhatsApp-style filled sun — immediately recognizable. */
function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path
        d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.4 4.4l1.8 1.8M17.8 17.8l1.8 1.8M4.4 19.6l1.8-1.8M17.8 6.2l1.8-1.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Simple crescent moon — immediately recognizable. */
function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18 14.5a6.5 6.5 0 0 1-9-9 7 7 0 1 0 9 9z" />
    </svg>
  );
}

export function DayPhaseHeaderIcon({ className = '', phaseOverride }: DayPhaseHeaderIconProps) {
  const { phase: livePhase } = useVisualTimePhase();
  const phase = phaseOverride ?? livePhase;
  const phaseClass = `gameHeaderPhaseIcon--${phase}`;

  return isVisualNightHeader(phase) ? (
    <MoonIcon className={`${className} ${phaseClass}`.trim()} />
  ) : (
    <SunIcon className={`${className} ${phaseClass}`.trim()} />
  );
}

export function visualPhaseHeaderAriaLabel(phase: VisualTimePhase): string {
  const mode = isVisualNightHeader(phase) ? 'Notte' : visualTimePhaseLabel(phase);
  return `${mode} — Vai alle Attività`;
}
