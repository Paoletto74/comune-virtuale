import type {
  CitizenPublicProfileResponse,
  MunicipalityCitizenItem,
  ProfileDetailResponse,
} from '@/api/client';
import { EMPTY_CAREER_VIEW } from '@/utils/progressionView';

const EMPTY_BALANCE: ProfileDetailResponse['balance'] = {
  availableCash: { amountMinor: '0', currency: 'EUR' },
  asOf: new Date(0).toISOString(),
};

function baseProfileDetail(
  partial: Pick<ProfileDetailResponse, 'citizenId' | 'displayName' | 'gender' | 'age' | 'portraitId' | 'personalValues'> & {
    level: number;
    levelLabel: string;
    employment?: ProfileDetailResponse['employment'];
  },
): ProfileDetailResponse {
  return {
    enabled: true,
    citizenId: partial.citizenId,
    displayName: partial.displayName,
    gender: partial.gender,
    age: partial.age,
    portraitId: partial.portraitId,
    citizenProfile: {
      levelLabel: partial.levelLabel,
      ageBand: '',
      progression: {
        levelId: `main_L${String(partial.level).padStart(2, '0')}`,
        level: partial.level,
        label: partial.levelLabel,
        globalXp: 0,
      },
      unlocked: {},
      locked: [],
    },
    globalProgression: {
      level: partial.level,
      levelId: `main_L${String(partial.level).padStart(2, '0')}`,
      globalXp: 0,
    },
    career: EMPTY_CAREER_VIEW,
    balance: EMPTY_BALANCE,
    personalValues: partial.personalValues,
    employment: partial.employment ?? null,
    inventory: [],
    patrimonioSnapshots: [],
    correlationId: '',
  };
}

export function profileDetailFromDirectoryEntry(
  entry: MunicipalityCitizenItem,
): ProfileDetailResponse {
  return baseProfileDetail({
    citizenId: entry.citizenId,
    displayName: entry.displayName,
    gender: 'unknown',
    age: 0,
    portraitId: null,
    level: entry.level,
    levelLabel: 'Cittadino del Comune',
    personalValues: {
      sympathy: entry.sympathy,
      reputation: entry.reputation,
      happiness: 50,
    },
  });
}

export function profileDetailFromPublicProfile(
  profile: CitizenPublicProfileResponse,
): ProfileDetailResponse {
  return baseProfileDetail({
    citizenId: profile.citizenId,
    displayName: profile.displayName,
    gender: profile.gender,
    age: profile.age,
    portraitId: profile.portraitId,
    level: profile.level,
    levelLabel: profile.levelLabel,
    personalValues: {
      sympathy: profile.sympathy,
      reputation: profile.reputation,
      happiness: 50,
    },
    employment: profile.employmentState
      ? { employmentState: profile.employmentState }
      : null,
  });
}
