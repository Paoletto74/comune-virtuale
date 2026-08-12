import { ComuneMessage } from '@/components/visual/ComuneMessage';
import type { HomeResponse } from '@/api/client';

type LevelUpNotice = NonNullable<HomeResponse['levelUpNotice']>;

interface LevelUpNoticePanelProps {
  notice: LevelUpNotice;
  onDismiss: () => void;
}

export function LevelUpNoticePanel({ notice, onDismiss }: LevelUpNoticePanelProps) {
  return (
    <ComuneMessage
      variant="editorial"
      title={notice.title}
      className="levelUpNoticePanel"
      onDismiss={onDismiss}
      dismissLabel="Chiudi avviso di livello"
      footer={
        <button type="button" className="comuneMessageAction" onClick={onDismiss}>
          Chiudi
        </button>
      }
    >
      <p>{notice.body}</p>
    </ComuneMessage>
  );
}
