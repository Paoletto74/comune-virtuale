import { resolveOpeningBackgroundUrl } from '@comune-virtuale/shared';
import { useVisualTimePhase } from '@/context/VisualTimeProvider';

/** Full-screen 9:16 opening background driven by real-world visual time phase. */
export function LoginOpeningBackground() {
  const { phase } = useVisualTimePhase();
  const src = resolveOpeningBackgroundUrl(phase);

  return (
    <div className="loginEntranceBackdrop" aria-hidden="true">
      <img
        src={src}
        alt=""
        className="loginEntranceBackdropImg"
        decoding="async"
      />
      <div className="loginEntranceBackdropScrim" />
    </div>
  );
}
