import type { HomeResponse } from '@/api/client';
import { CitizenIllustration } from '@/components/visual/CitizenIllustration';
import { ProfileMetrics } from '@/components/ProfileMetrics';
import { CitizenProfileDimensions } from '@/components/CitizenProfileDimensions';

type CitizenProfile = HomeResponse['citizenProfile'];

interface CitizenLifeSectionProps {
  citizenId?: string;
  displayName: string;
  age: number;
  gender?: string;
  profile: CitizenProfile;
  sympathy: number;
  reputation: number;
  cashDisplay: string;
  highlightUnlockIds?: string[];
}

export function CitizenLifeSection({
  citizenId,
  displayName,
  age,
  gender,
  profile,
  sympathy,
  reputation,
  cashDisplay,
  highlightUnlockIds = [],
}: CitizenLifeSectionProps) {
  const occupation = profile.unlocked.work?.value;

  return (
    <section className="citizenLifeSection" aria-label="Il tuo cittadino">
      <div className="citizenLifeHero">
        <CitizenIllustration
          citizenId={citizenId}
          age={age}
          ageBand={profile.ageBand}
          occupation={occupation}
          gender={gender}
          size="lg"
        />
        <div className="citizenLifeIdentity">
          <h2 className="citizenLifeName">{displayName}</h2>
          <p className="citizenLifeMeta">
            {age} anni · {profile.progression.label}
          </p>
        </div>
      </div>

      <ProfileMetrics
        sympathy={sympathy}
        reputation={reputation}
        cashDisplay={cashDisplay}
        levelLabel={profile.progression.label}
      />

      <CitizenProfileDimensions profile={profile} highlightUnlockIds={highlightUnlockIds} />
    </section>
  );
}
