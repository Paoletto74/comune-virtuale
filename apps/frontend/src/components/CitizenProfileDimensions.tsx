import type { HomeResponse } from '@/api/client';

type CitizenProfile = HomeResponse['citizenProfile'];

interface CitizenProfileDimensionsProps {
  profile: CitizenProfile;
  highlightUnlockIds?: string[];
  /** When set, only locked dimensions are shown (unlocked ones live elsewhere). */
  lockedOnly?: boolean;
}

type UnlockedDimension = {
  id: 'work' | 'living' | 'personal';
  label: string;
  value: string;
};

function unlockedEntries(profile: CitizenProfile): UnlockedDimension[] {
  const entries: UnlockedDimension[] = [];
  if (profile.unlocked.work) {
    entries.push({ id: 'work', ...profile.unlocked.work });
  }
  if (profile.unlocked.living) {
    entries.push({ id: 'living', ...profile.unlocked.living });
  }
  if (profile.unlocked.personal) {
    entries.push({ id: 'personal', ...profile.unlocked.personal });
  }
  return entries;
}

export function CitizenProfileDimensions({
  profile,
  highlightUnlockIds = [],
  lockedOnly = false,
}: CitizenProfileDimensionsProps) {
  const visible = lockedOnly ? [] : unlockedEntries(profile);
  const hasLocked = profile.locked.length > 0;

  if (visible.length === 0 && !hasLocked) {
    return null;
  }

  return (
    <section
      className="citizenProfileDimensions"
      aria-label={lockedOnly ? 'Prossimi sblocchi' : 'Chi sei nel Comune'}
    >
      {visible.map((dimension) => (
        <div
          key={dimension.id}
          className={`profileDimension${
            highlightUnlockIds.includes(dimension.id) ? ' profileDimension--new' : ''
          }`}
        >
          <span className="profileDimensionLabel">{dimension.label}</span>
          <span className="profileDimensionValue">{dimension.value}</span>
        </div>
      ))}

      {profile.locked.map((dimension) => (
        <div key={dimension.id} className="profileDimension profileDimension--locked">
          <span className="profileDimensionLabel">{dimension.label}</span>
          <span className="profileDimensionValue profileDimensionValue--unknown" aria-hidden="true">
            ???
          </span>
          <p className="profileDimensionHint">{dimension.hint}</p>
        </div>
      ))}
    </section>
  );
}
