import type { HomeResponse } from '@/api/client';
import { ComuneMessage } from '@/components/visual/ComuneMessage';
import { FlashBoltIcon } from '@/components/visual/FlashBoltIcon';

type FlashState = NonNullable<HomeResponse['flash']>;
type FlashOpportunity = NonNullable<FlashState['flashOpportunity']>;

interface FlashAnticipationBarProps {
  anticipation: NonNullable<FlashState['anticipation']>;
  trackOnly?: boolean;
}

export function FlashAnticipationBar({ anticipation, trackOnly = false }: FlashAnticipationBarProps) {
  if (!anticipation.active) return null;

  const track = (
    <div className="flashAnticipationTrack">
      <div
        className="flashAnticipationFill"
        style={{ transform: `scaleX(${Math.max(0.02, anticipation.progress)})` }}
      />
    </div>
  );

  if (trackOnly) {
    return track;
  }

  return (
    <div className="flashAnticipationShell flashAnticipationShell--attached" aria-hidden={anticipation.progress >= 1}>
      {track}
    </div>
  );
}

interface FlashOpportunityOverlayProps {
  opportunity: FlashOpportunity;
  onAccept: () => void;
  onDecline: () => void;
  acting: boolean;
}

function formatSeconds(ms: number): string {
  return `${Math.max(1, Math.ceil(ms / 1000))}s`;
}

export function FlashOpportunityOverlay({
  opportunity,
  onAccept,
  onDecline,
  acting,
}: FlashOpportunityOverlayProps) {
  return (
    <section className="flashOpportunityOverlay" aria-live="assertive">
      <ComuneMessage
        variant="flash"
        title={opportunity.title}
        className="flashOpportunityCard"
        footer={
          <>
            <p className="flashOpportunityReward">{opportunity.rewardPreview}</p>
            <p className="flashOpportunityTimer" aria-live="polite">
              <FlashBoltIcon className="flashOpportunityTimerIcon" />
              Disponibile per {formatSeconds(opportunity.remainingMs)}
            </p>
            <div className="flashOpportunityActions">
              <button
                type="button"
                className="flashOpportunityAccept"
                disabled={acting}
                onClick={onAccept}
              >
                {acting ? '…' : 'Accetta'}
              </button>
              <button
                type="button"
                className="flashOpportunityDecline"
                disabled={acting}
                onClick={onDecline}
              >
                Rifiuta
              </button>
            </div>
          </>
        }
      >
        <div className="flashOpportunityBadge">
          <FlashBoltIcon />
          <span>Opportunità lampo</span>
        </div>
        <p className="flashOpportunityBody">{opportunity.body}</p>
        {opportunity.comuneLine && (
          <p className="flashOpportunityComune">{opportunity.comuneLine}</p>
        )}
      </ComuneMessage>
    </section>
  );
}

interface FlashExpiredNoticeProps {
  message: string;
}

export function FlashExpiredNotice({ message }: FlashExpiredNoticeProps) {
  return (
    <ComuneMessage variant="flash" className="flashExpiredNotice" title="Occasione persa">
      <p>{message}</p>
    </ComuneMessage>
  );
}
