import { useEffect, useState, type SVGProps } from 'react';
import {
  citizenArchetypeLabel,
  resolveCitizenArchetype,
  type CitizenArchetype,
  type CitizenVisualInput,
} from '@/utils/citizenArchetype';
import { resolveCitizenPortrait } from '@/utils/citizenPortrait';

interface CitizenIllustrationProps extends CitizenVisualInput {
  citizenId?: string;
  portraitId?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function ArchetypeSvg({
  archetype,
  ...props
}: { archetype: CitizenArchetype } & SVGProps<SVGSVGElement>) {
  const skin = '#d4a574';
  const hair = '#3d3028';
  const shirt = archetypeShirtColor(archetype);

  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <ellipse cx="32" cy="58" rx="18" ry="4" fill="#000" opacity="0.2" />
      <path d="M22 58 L22 38 Q22 28 32 28 Q42 28 42 38 L42 58" fill={shirt} />
      <circle cx="32" cy="22" r="10" fill={skin} />
      <path
        d="M22 20 Q32 10 42 20 Q40 14 32 12 Q24 14 22 20"
        fill={hair}
      />
      {archetype === 'professional' && (
        <path d="M26 34 L38 34 L36 30 L28 30 Z" fill="#283347" />
      )}
      {archetype === 'student' && (
        <rect x="28" y="14" width="8" height="4" rx="1" fill="#6db88a" />
      )}
      {archetype === 'teacher' && (
        <rect x="24" y="32" width="16" height="6" rx="1" fill="#f5f0e6" opacity="0.3" />
      )}
      {archetype === 'merchant' && (
        <rect x="26" y="36" width="12" height="8" rx="2" fill="#d4a853" opacity="0.5" />
      )}
      {archetype === 'technician' && (
        <rect x="38" y="40" width="6" height="10" rx="1" fill="#9aa3b2" />
      )}
      {archetype === 'retiree' && (
        <path d="M24 24 Q32 30 40 24" stroke="#9aa3b2" strokeWidth="1.5" fill="none" />
      )}
      {archetype === 'unemployed' && (
        <path d="M28 40 L36 40" stroke="#6b7585" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

function archetypeShirtColor(archetype: CitizenArchetype): string {
  const colors: Record<CitizenArchetype, string> = {
    professional: '#283347',
    worker: '#4a5568',
    student: '#3d5a80',
    teacher: '#5a4a6a',
    merchant: '#5a4a30',
    technician: '#3d5040',
    retiree: '#4a5058',
    unemployed: '#3a3a42',
    generic: '#2a3548',
  };
  return colors[archetype];
}

export function CitizenIllustration({
  citizenId,
  portraitId,
  size = 'md',
  className = '',
  ...input
}: CitizenIllustrationProps) {
  const archetype = resolveCitizenArchetype(input);
  const label = citizenArchetypeLabel(archetype);
  const portrait = resolveCitizenPortrait(citizenId, portraitId);
  const [useFallback, setUseFallback] = useState(portrait.useSvgFallback);

  useEffect(() => {
    setUseFallback(portrait.useSvgFallback);
  }, [portrait.useSvgFallback, portrait.imagePath]);

  return (
    <div
      className={`citizenIllustration citizenIllustration--${size} citizenIllustration--${archetype} ${className}`.trim()}
      role="img"
      aria-label={`Cittadino: ${label}`}
    >
      {!useFallback ? (
        <img
          src={portrait.imagePath}
          alt=""
          className="citizenIllustrationPhoto"
          loading="lazy"
          decoding="async"
          onError={() => setUseFallback(true)}
        />
      ) : (
        <ArchetypeSvg archetype={archetype} className="citizenIllustrationSvg" />
      )}
    </div>
  );
}

export { resolveCitizenArchetype, citizenArchetypeLabel };
