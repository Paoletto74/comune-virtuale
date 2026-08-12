import { ComuneMessage } from '@/components/visual/ComuneMessage';

export interface JobApplicationMessage {
  title: string;
  body: string;
  decision: 'accepted' | 'rejected';
}

interface JobApplicationOverlayProps {
  message: JobApplicationMessage;
  onDismiss: () => void;
}

export function JobApplicationOverlay({ message, onDismiss }: JobApplicationOverlayProps) {
  return (
    <div
      className="worldEventOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-application-title"
    >
      <ComuneMessage
        variant="editorial"
        title="Comunicazione lavorativa"
        className="worldEventNoticePanel"
        onDismiss={onDismiss}
        dismissLabel="Chiudi lettera lavorativa"
        footer={
          <button type="button" className="comuneMessageAction" onClick={onDismiss}>
            Chiudi
          </button>
        }
      >
        <p id="job-application-title" className="worldEventNoticeTitle">
          {message.title}
        </p>
        <p className="worldEventNoticeBody">{message.body}</p>
      </ComuneMessage>
    </div>
  );
}
