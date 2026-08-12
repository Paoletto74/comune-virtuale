import type { SVGProps } from 'react';
import {
  taskIllustrationLabel,
  type TaskIllustrationKind,
} from '@/utils/taskIllustrationKind';

interface TaskIllustrationProps {
  kind: TaskIllustrationKind;
  size?: 'sm' | 'md';
  className?: string;
}

function KindSvg({ kind, ...props }: { kind: TaskIllustrationKind } & SVGProps<SVGSVGElement>) {
  const accent = '#d4a853';

  switch (kind) {
    case 'work':
      return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
          <rect x="8" y="18" width="32" height="22" rx="3" fill="#283347" stroke={accent} strokeWidth="1" />
          <path d="M16 18 V14 Q24 10 32 14 V18" stroke={accent} strokeWidth="1.5" fill="none" />
          <rect x="20" y="26" width="8" height="6" rx="1" fill={accent} opacity="0.4" />
        </svg>
      );
    case 'family':
      return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
          <circle cx="18" cy="18" r="6" fill="#d4a574" />
          <circle cx="32" cy="20" r="5" fill="#c4956a" />
          <path d="M10 38 Q18 28 26 32 Q34 36 38 38" stroke="#a88fd4" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'social':
      return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
          <circle cx="16" cy="20" r="7" fill="#d4a574" />
          <circle cx="32" cy="20" r="7" fill="#c4956a" />
          <path d="M8 40 Q16 30 24 34 Q32 38 40 36" stroke="#5db8a8" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'economic':
      return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
          <rect x="10" y="14" width="28" height="20" rx="3" fill="#2a3548" stroke={accent} strokeWidth="1" />
          <circle cx="24" cy="24" r="6" stroke={accent} strokeWidth="1.5" fill="none" />
          <path d="M24 20 V28 M21 24 H27" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'unexpected':
      return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
          <circle cx="24" cy="24" r="14" stroke="#e09860" strokeWidth="1.5" fill="none" />
          <path d="M24 16 V28 M24 32 V34" stroke="#e09860" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'risky':
      return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
          <path d="M24 8 L38 38 H10 Z" stroke="#d48080" strokeWidth="1.5" fill="#c96a6a" fillOpacity="0.2" />
          <path d="M24 18 V28" stroke="#d48080" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="32" r="1.5" fill="#d48080" />
        </svg>
      );
    case 'dialogue':
      return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
          <path
            d="M10 14 H38 A4 4 0 0 1 42 18 V28 A4 4 0 0 1 38 32 H22 L14 38 V32 H10 A4 4 0 0 1 6 28 V18 A4 4 0 0 1 10 14"
            stroke="#7ba8f0"
            strokeWidth="1.5"
            fill="#283347"
          />
          <path d="M16 22 H32 M16 26 H26" stroke="#7ba8f0" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'living':
      return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
          <path d="M8 36 L24 14 L40 36" stroke="#6db88a" strokeWidth="1.5" fill="#283347" />
          <rect x="18" y="28" width="12" height="10" fill="#2a3548" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" {...props}>
          <circle cx="24" cy="24" r="14" stroke={accent} strokeWidth="1.5" fill="#283347" />
          <path d="M24 16 V32 M16 24 H32" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      );
  }
}

export function TaskIllustration({ kind, size = 'md', className = '' }: TaskIllustrationProps) {
  const label = taskIllustrationLabel(kind);

  return (
    <div
      className={`taskIllustration taskIllustration--${kind} taskIllustration--${size} ${className}`.trim()}
      role="img"
      aria-label={label}
    >
      <KindSvg kind={kind} className="taskIllustrationSvg" />
    </div>
  );
}

export { taskIllustrationLabel };
