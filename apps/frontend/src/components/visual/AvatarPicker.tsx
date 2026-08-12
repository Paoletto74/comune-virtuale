import {
  CITIZEN_PROFILE_PORTRAIT_IDS,
  citizenProfilePortraitPathFromId,
  isValidPortraitId,
  portraitIdFromSlot,
} from '@/utils/citizenPortrait';

interface AvatarPickerProps {
  selectedPortraitId: string | null;
  onSelect: (portraitId: string) => void;
  title?: string;
  description?: string;
}

export function AvatarPicker({
  selectedPortraitId,
  onSelect,
  title = 'Scegli il tuo profilo',
  description,
}: AvatarPickerProps) {
  const resolvedSelection =
    selectedPortraitId && isValidPortraitId(selectedPortraitId)
      ? selectedPortraitId
      : portraitIdFromSlot(1);

  return (
    <section className="avatarPicker" aria-label={title}>
      <h3 className="avatarPickerTitle">{title}</h3>
      {description ? <p className="muted avatarPickerDescription">{description}</p> : null}
      <div className="avatarPickerGrid" role="listbox" aria-label="Avatar disponibili">
        {CITIZEN_PROFILE_PORTRAIT_IDS.map((portraitId) => {
          const selected = portraitId === resolvedSelection;
          return (
            <button
              key={portraitId}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={portraitId}
              className={`avatarPickerOption${selected ? ' avatarPickerOption--selected' : ''}`}
              onClick={() => onSelect(portraitId)}
            >
              <span className="avatarPickerPreview">
                <img
                  src={citizenProfilePortraitPathFromId(portraitId)}
                  alt=""
                  className="avatarPickerPhoto"
                  loading="lazy"
                  decoding="async"
                />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
