import type { HomeResponse } from '@/api/client';
import { ComuneMessage } from '@/components/visual/ComuneMessage';
import { FlashBoltIcon } from '@/components/visual/FlashBoltIcon';

type FlashState = HomeResponse['flash'];

interface WorldSidebarProps {
  flash?: FlashState;
  flashNotice?: string | null;
  comuneLine?: string | null;
}

export function WorldSidebar({ flash, flashNotice, comuneLine }: WorldSidebarProps) {
  const anticipation = flash?.enabled ? flash.anticipation : undefined;
  const showAnticipation = anticipation?.active && anticipation.progress < 1;

  return (
    <div className="worldSidebar" aria-label="Il mondo del Comune">
      {showAnticipation && (
        <section className="worldSidebarCard worldSidebarCard--flash" aria-label="Opportunità in arrivo">
          <div className="worldSidebarCardHeader">
            <FlashBoltIcon className="worldSidebarFlashIcon" />
            <span className="worldSidebarCardTitle">Opportunità lampo</span>
          </div>
          {anticipation.label && (
            <p className="worldSidebarCardBody">{anticipation.label}</p>
          )}
          <div className="worldSidebarProgressTrack">
            <div
              className="worldSidebarProgressFill"
              style={{ transform: `scaleX(${Math.max(0.02, anticipation.progress)})` }}
            />
          </div>
        </section>
      )}

      {comuneLine && (
        <ComuneMessage variant="default" title="Il Comune dice" className="worldSidebarComune">
          <p>{comuneLine}</p>
        </ComuneMessage>
      )}

      {flashNotice && (
        <ComuneMessage variant="flash" title="Occasione persa" className="worldSidebarComune">
          <p>{flashNotice}</p>
        </ComuneMessage>
      )}
    </div>
  );
}
