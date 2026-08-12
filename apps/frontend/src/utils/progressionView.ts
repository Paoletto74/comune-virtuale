/** Shared career view — mirrors backend CitizenCareerViewDto. */
export interface CareerView {
  currentCareerId: string | null;
  currentCareerLabel: string | null;
  currentGradeIndex: number;
  currentGradeLabel: string | null;
  affinities: Array<{ careerId: string; label: string; affinity: number }>;
  history: Array<{
    historyId: string;
    careerId: string;
    careerLabel: string;
    gradeIndex: number;
    gradeLabel: string | null;
    changeType: string;
    reason: string | null;
    recordedAt: string;
  }>;
  switchRules: {
    minAffinityDelta: number;
    minSignificantActions: number;
  };
  pendingSwitchCareerId?: string | null;
  pendingSwitchCareerLabel?: string | null;
  pendingSwitchStreak?: number;
  pendingSwitchRequired?: number;
}

export interface GlobalProgressionView {
  level: number;
  levelId: string;
  globalXp: number;
}

export const EMPTY_CAREER_VIEW: CareerView = {
  currentCareerId: null,
  currentCareerLabel: null,
  currentGradeIndex: 1,
  currentGradeLabel: null,
  affinities: [],
  history: [],
  switchRules: { minAffinityDelta: 15, minSignificantActions: 5 },
  pendingSwitchCareerId: null,
  pendingSwitchCareerLabel: null,
  pendingSwitchStreak: 0,
  pendingSwitchRequired: 5,
};

export const EMPTY_GLOBAL_PROGRESSION: GlobalProgressionView = {
  level: 1,
  levelId: 'main_L01',
  globalXp: 0,
};

export function buildTestGlobalProgression(
  overrides: Partial<GlobalProgressionView> = {},
): GlobalProgressionView {
  return { ...EMPTY_GLOBAL_PROGRESSION, ...overrides };
}

export function buildTestCareerView(overrides: Partial<CareerView> = {}): CareerView {
  return { ...EMPTY_CAREER_VIEW, ...overrides };
}
