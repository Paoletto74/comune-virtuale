import { ComuneMessage } from '@/components/visual/ComuneMessage';
import type { HomeResponse } from '@/api/client';

type WorldEventNotice = NonNullable<HomeResponse['worldEvents']>['activeEvents'][number];

interface WorldEventNoticePanelProps {
  notice: WorldEventNotice;
  onDismiss: () => void;
}

export function WorldEventNoticePanel({ notice, onDismiss }: WorldEventNoticePanelProps) {
  const subtitle = notice.comuneLine ?? notice.body;

  return (
    <div
      className="worldEventOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`world-event-title-${notice.eventId}`}
    >
      <ComuneMessage
        variant="editorial"
        title="Evento del Comune"
        className="worldEventNoticePanel"
        onDismiss={onDismiss}
        dismissLabel="Chiudi avviso evento del Comune"
        footer={
          <button type="button" className="comuneMessageAction" onClick={onDismiss}>
            Chiudi
          </button>
        }
      >
        <p id={`world-event-title-${notice.eventId}`} className="worldEventNoticeTitle">
          {notice.title}
        </p>
        <p className="worldEventNoticeBody">{subtitle}</p>
      </ComuneMessage>
    </div>
  );
}
