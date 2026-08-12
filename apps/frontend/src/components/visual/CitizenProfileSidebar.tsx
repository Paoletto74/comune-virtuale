import type { HomeResponse } from '@/api/client';
import { ProgressionCareerBlock } from '@/components/ProgressionCareerBlock';
import { EMPTY_CAREER_VIEW, EMPTY_GLOBAL_PROGRESSION } from '@/utils/progressionView';
import { CitizenIllustration } from '@/components/visual/CitizenIllustration';
import { CitizenProfileDimensions } from '@/components/CitizenProfileDimensions';
import { personalValueFillPercent, PERSONAL_VALUE_MAX, PERSONAL_VALUE_MIN } from '@/utils/personalValueRange';

type CitizenProfile = HomeResponse['citizenProfile'];

interface CitizenProfileSidebarProps {
  citizenId?: string;
  displayName: string;
  age: number;
  gender?: string;
  profile: CitizenProfile;
  globalProgression?: HomeResponse['globalProgression'];
  career?: HomeResponse['career'];
  sympathy: number;
  reputation: number;
  cashDisplay: string;
  highlightUnlockIds?: string[];
}

function StatRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: 'reputation' | 'sympathy' | 'cash' | 'level';
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`profileStatRow${highlight ? ' profileStatRow--highlight' : ''}`}>
      <div className="profileStatRowLeft">
        <span className={`profileStatIcon profileStatIcon--${icon}`} aria-hidden="true">
          {icon === 'reputation' && (
            <svg viewBox="0 0 16 16" fill="none"><path d="M8 2 L9.5 6 L14 6.5 L10.5 9.5 L11.5 14 L8 11.5 L4.5 14 L5.5 9.5 L2 6.5 L6.5 6 Z" stroke="currentColor" strokeWidth="1" /></svg>
          )}
          {icon === 'sympathy' && (
            <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" /><circle cx="6" cy="7" r="0.6" fill="currentColor" /><circle cx="10" cy="7" r="0.6" fill="currentColor" /><path d="M6 10 Q8 11.5 10 10" stroke="currentColor" strokeWidth="0.75" /></svg>
          )}
          {icon === 'cash' && (
            <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.25" /><path d="M5 8 H11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
          )}
          {icon === 'level' && (
            <svg viewBox="0 0 16 16" fill="none"><path d="M3 12 L8 4 L13 12 Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" /></svg>
          )}
        </span>
        <span className="profileStatLabel">{label}</span>
      </div>
      <span className="profileStatValue">{value}</span>
    </div>
  );
}

function SympathyBar({ value }: { value: number }) {
  const fill = personalValueFillPercent(value);
  return (
    <div
      className="profileStatBar"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={PERSONAL_VALUE_MIN}
      aria-valuemax={PERSONAL_VALUE_MAX}
      aria-label={`Simpatia: ${value}`}
    >
      <div className="profileStatBarFill" style={{ width: `${fill}%` }} />
    </div>
  );
}

export function CitizenProfileSidebar({
  citizenId,
  displayName,
  age,
  gender,
  profile,
  globalProgression,
  career,
  sympathy,
  reputation,
  cashDisplay,
  highlightUnlockIds = [],
}: CitizenProfileSidebarProps) {
  const occupation = profile.unlocked.work?.value;

  return (
    <section className="profileSidebar" aria-label="Il tuo cittadino">
      <div className="profileSidebarHeader">
        <div className="profileSidebarAvatar">
          <CitizenIllustration
            citizenId={citizenId}
            age={age}
            ageBand={profile.ageBand}
            occupation={occupation}
            gender={gender}
            size="lg"
          />
        </div>
        <h2 className="profileSidebarName">{displayName}</h2>
        <p className="profileSidebarMeta">
          {age} anni · {profile.progression.label}
        </p>
      </div>

      <div className="profileSidebarStats">
        <StatRow icon="cash" label="Saldo" value={cashDisplay} highlight />
        <StatRow icon="sympathy" label="Simpatia" value={String(sympathy)} />
        <SympathyBar value={sympathy} />
        <StatRow icon="reputation" label="Reputazione" value={String(reputation)} />
        <ProgressionCareerBlock
          globalProgression={globalProgression ?? {
            level: profile.progression.level,
            levelId: profile.progression.levelId,
            globalXp: profile.progression.globalXp ?? 0,
          }}
          career={career ?? EMPTY_CAREER_VIEW}
          progressPercent={profile.progression.progressToNextLevel}
          compact
        />
      </div>

      <CitizenProfileDimensions profile={profile} highlightUnlockIds={highlightUnlockIds} />
    </section>
  );
}
