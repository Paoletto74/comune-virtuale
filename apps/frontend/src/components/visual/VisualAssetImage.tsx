import { useCallback, useEffect, useState } from 'react';
import {
  allCandidateUrls,
  aspectToCssRatio,
  resolveSemanticImageKey,
  type AssetAspect,
  type AssetPresence,
  type ResolvedAsset,
} from '@comune-virtuale/shared';
import { useVisualTimePhase } from '@/context/VisualTimeProvider';

export interface VisualAssetImageProps {
  /** Semantic key from gameplay (heroImageKey, portrait id, etc.) */
  imageKey?: string;
  /** Explicit resolved asset — overrides imageKey */
  asset?: ResolvedAsset;
  /** Direct URL override (marketplace legacy paths) */
  src?: string | null;
  /** Override catalog aspect — prefer catalog-declared ratio when omitted */
  aspect?: AssetAspect;
  label?: string;
  className?: string;
  /** Force placeholder state from server-side validation */
  presence?: AssetPresence;
  /** Optional overlay for text-on-image readability */
  overlay?: boolean;
  lazy?: boolean;
}

export function VisualAssetImage({
  imageKey,
  asset,
  src,
  aspect,
  label,
  className = '',
  presence,
  overlay = false,
  lazy = true,
}: VisualAssetImageProps) {
  const { phase } = useVisualTimePhase();
  const resolved = asset ?? (imageKey ? resolveSemanticImageKey(imageKey) : null);
  const effectiveAspect: AssetAspect = aspect ?? resolved?.aspect ?? '3:1';
  const candidates = src ? [src] : resolved ? allCandidateUrls(resolved, { timePhase: phase }) : [];
  const displayLabel = label ?? resolved?.label ?? imageKey ?? 'Asset';
  const [urlIndex, setUrlIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(presence === 'error' || presence === 'missing');

  useEffect(() => {
    setUrlIndex(0);
    setLoaded(false);
    setFailed(presence === 'error' || presence === 'missing');
  }, [src, imageKey, asset?.assetKey, presence, phase]);

  const currentUrl = candidates[urlIndex] ?? null;

  const handleError = useCallback(() => {
    if (urlIndex + 1 < candidates.length) {
      setUrlIndex((i) => i + 1);
      return;
    }
    setFailed(true);
  }, [candidates.length, urlIndex]);

  const showImage = Boolean(currentUrl) && !failed && presence !== 'missing' && presence !== 'error';
  const placeholderKind: AssetPresence =
    presence === 'error' ? 'error' : presence === 'missing' || failed ? 'missing' : 'present';

  return (
    <div
      className={`visualAssetImage visualAssetImage--${placeholderKind} ${overlay ? 'visualAssetImage--overlay' : ''} ${className}`.trim()}
      style={{ aspectRatio: aspectToCssRatio(effectiveAspect) }}
      data-image-key={imageKey ?? resolved?.assetKey ?? 'direct'}
      data-aspect={effectiveAspect}
      data-time-phased={resolved?.timePhased ? 'true' : 'false'}
      role="img"
      aria-label={displayLabel}
    >
      {showImage ? (
        <img
          src={currentUrl!}
          alt=""
          className={`visualAssetImageImg ${loaded ? 'visualAssetImageImg--loaded' : ''}`.trim()}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      ) : (
        <span className="visualAssetImagePlaceholderLabel">
          {placeholderKind === 'error' ? 'ASSET ERROR' : 'ASSET DA CREARE'}
        </span>
      )}
    </div>
  );
}
