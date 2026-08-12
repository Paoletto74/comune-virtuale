import { listNpcPoolPortraitIds, npcPoolPortraitPath } from '@/utils/adminHelpers';

interface NpcPortraitPickerProps {
  selectedPortraitId: string | null;
  onSelect: (portraitId: string) => void;
  title?: string;
}

export function NpcPortraitPicker({
  selectedPortraitId,
  onSelect,
  title = 'Scegli ritratto NPC',
}: NpcPortraitPickerProps) {
  const portraitIds = listNpcPoolPortraitIds();

  return (
    <div className="npcPortraitPicker">
      <p className="npcPortraitPickerTitle">{title}</p>
      <div className="npcPortraitPickerGrid" role="listbox" aria-label={title}>
        {portraitIds.map((portraitId) => {
          const selected = selectedPortraitId === portraitId;
          return (
            <button
              key={portraitId}
              type="button"
              role="option"
              aria-selected={selected}
              className={`npcPortraitPickerOption${selected ? ' npcPortraitPickerOption--selected' : ''}`}
              onClick={() => onSelect(portraitId)}
              title={portraitId}
            >
              <img
                src={npcPoolPortraitPath(portraitId)}
                alt=""
                className="npcPortraitPickerImage"
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.style.visibility = 'hidden';
                }}
              />
              <span className="npcPortraitPickerLabel">{portraitId.replace('npc_', '#')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
