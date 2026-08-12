import { useState, type SVGProps } from 'react';
import { VisualAssetImage } from '@/components/visual/VisualAssetImage';
import { resolveNpcPortrait, type NpcPortraitContext } from '@/utils/npcPortrait';
import { npcVisualLabel, resolveNpcVisualId, type KnownNpcVisualId } from '@/utils/npcVisual';

interface NpcIllustrationProps {
  npcId: string;
  displayName?: string;
  size?: 'sm' | 'md';
  className?: string;
  gameTimeMs?: number;
  portraitContext?: NpcPortraitContext;
  occupation?: string;
  assignedPortraitId?: string | null;
  portraitStatus?: 'present' | 'missing' | 'error';
}

function NpcSvg({ visualId, ...props }: { visualId: KnownNpcVisualId } & SVGProps<SVGSVGElement>) {
  const configs: Record<KnownNpcVisualId, { skin: string; hair: string; shirt: string }> = {
    marco: { skin: '#c4956a', hair: '#2a2018', shirt: '#283347' },
    laura: { skin: '#d4a574', hair: '#4a3028', shirt: '#4a3a58' },
    giulia: { skin: '#e0b888', hair: '#1a1818', shirt: '#3d5040' },
    generic: { skin: '#c4956a', hair: '#3d3028', shirt: '#2a3548' },
  };

  const { skin, hair, shirt } = configs[visualId];

  return (
    <svg viewBox="0 0 56 56" fill="none" {...props}>
      <ellipse cx="28" cy="50" rx="14" ry="3" fill="#000" opacity="0.15" />
      <path d="M18 50 L18 34 Q18 26 28 26 Q38 26 38 34 L38 50" fill={shirt} />
      <circle cx="28" cy="18" r="9" fill={skin} />
      <path d="M19 16 Q28 8 37 16 Q35 12 28 10 Q21 12 19 16" fill={hair} />
      {visualId === 'marco' && (
        <path d="M22 22 Q28 26 34 22" stroke="#2a2018" strokeWidth="1" fill="none" />
      )}
      {visualId === 'laura' && (
        <path d="M19 14 Q28 6 37 14" stroke={hair} strokeWidth="3" fill="none" />
      )}
      {visualId === 'giulia' && <circle cx="28" cy="12" r="2" fill="#d4a853" />}
    </svg>
  );
}

export function NpcIllustration({
  npcId,
  displayName,
  size = 'md',
  className = '',
  gameTimeMs = 0,
  portraitContext = 'default',
  occupation,
  assignedPortraitId,
  portraitStatus,
}: NpcIllustrationProps) {
  const visualId = resolveNpcVisualId(npcId, displayName);
  const label = displayName ?? npcVisualLabel(visualId);
  const portrait = resolveNpcPortrait({
    templateId: npcId,
    assignedPortraitId,
    gameTimeMs,
    context: portraitContext,
    occupation,
  });
  const [useFallback, setUseFallback] = useState(portrait.useSvgFallback);

  if (portraitStatus === 'missing' || portraitStatus === 'error') {
    return (
      <div
        className={`npcIllustration npcIllustration--placeholder npcIllustration--${portraitStatus} npcIllustration--${size} ${className}`.trim()}
        role="img"
        aria-label={label}
      >
        <span className="npcIllustrationPlaceholderLabel">
          {portraitStatus === 'error' ? 'ASSET ERROR' : 'ASSET DA CREARE'}
        </span>
      </div>
    );
  }

  if (assignedPortraitId) {
    return (
      <div className={`npcIllustration npcIllustration--${visualId} npcIllustration--${size} ${className}`.trim()}>
        <VisualAssetImage
          imageKey={assignedPortraitId}
          aspect="1:1"
          label={label}
          className="npcIllustrationAsset"
          lazy
        />
      </div>
    );
  }

  return (
    <div
      className={`npcIllustration npcIllustration--${visualId} npcIllustration--${size} ${className}`.trim()}
      role="img"
      aria-label={label}
    >
      {!useFallback ? (
        <img
          src={portrait.imagePath}
          alt=""
          className="npcIllustrationPhoto"
          loading="lazy"
          decoding="async"
          onError={() => setUseFallback(true)}
        />
      ) : (
        <NpcSvg visualId={visualId} className="npcIllustrationSvg" />
      )}
    </div>
  );
}

export { resolveNpcVisualId, npcVisualLabel };
