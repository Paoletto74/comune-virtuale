import type { DrizzleCitizenCareerRepository } from '../../infrastructure/db/repositories/citizen-career-repository.js';
import {
  CAREER_DEFINITIONS,
  CAREER_SWITCH_MIN_AFFINITY_DELTA,
  CAREER_SWITCH_MIN_SIGNIFICANT_ACTIONS,
  resolveCareerDefinition,
  resolveCareerGradeLabel,
  type DemoCareerId,
} from '../../slice/career-constants.js';

export interface CareerAffinityViewDto {
  careerId: DemoCareerId;
  label: string;
  affinity: number;
}

export interface CareerHistoryEntryDto {
  historyId: string;
  careerId: string;
  careerLabel: string;
  gradeIndex: number;
  gradeLabel: string | null;
  changeType: string;
  reason: string | null;
  recordedAt: string;
}

export interface CitizenCareerViewDto {
  currentCareerId: string | null;
  currentCareerLabel: string | null;
  currentGradeIndex: number;
  currentGradeLabel: string | null;
  affinities: CareerAffinityViewDto[];
  history: CareerHistoryEntryDto[];
  pendingSwitchCareerId: string | null;
  pendingSwitchCareerLabel: string | null;
  pendingSwitchStreak: number;
  pendingSwitchRequired: number;
  switchRules: {
    minAffinityDelta: number;
    minSignificantActions: number;
  };
}

export class CitizenCareerService {
  constructor(private readonly careers: DrizzleCitizenCareerRepository) {}

  async ensureSeeded(citizenId: string): Promise<void> {
    await this.careers.ensureSeeded(citizenId);
  }

  async getCareerView(citizenId: string): Promise<CitizenCareerViewDto> {
    await this.ensureSeeded(citizenId);

    const [state, affinities, history] = await Promise.all([
      this.careers.getState(citizenId),
      this.careers.listAffinities(citizenId),
      this.careers.listHistory(citizenId, 10),
    ]);

    const currentCareerId = state?.currentCareerId ?? null;
    const currentGradeIndex = state?.currentGradeIndex ?? 1;
    const currentDef = currentCareerId ? resolveCareerDefinition(currentCareerId) : null;
    const pendingSwitchCareerId = state?.pendingSwitchCareerId ?? null;
    const pendingSwitchDef = pendingSwitchCareerId
      ? resolveCareerDefinition(pendingSwitchCareerId)
      : null;

    const affinityViews: CareerAffinityViewDto[] = Object.values(CAREER_DEFINITIONS).map((def) => {
      const row = affinities.find((entry) => entry.careerId === def.careerId);
      return {
        careerId: def.careerId,
        label: def.label,
        affinity: row?.affinity ?? 0,
      };
    });

    return {
      currentCareerId,
      currentCareerLabel: currentDef?.label ?? null,
      currentGradeIndex,
      currentGradeLabel: currentCareerId
        ? resolveCareerGradeLabel(currentCareerId, currentGradeIndex)
        : null,
      affinities: affinityViews,
      history: history.map((entry) => {
        const def = resolveCareerDefinition(entry.careerId);
        return {
          historyId: entry.historyId,
          careerId: entry.careerId,
          careerLabel: def?.label ?? entry.careerId.toUpperCase(),
          gradeIndex: entry.gradeIndex,
          gradeLabel: resolveCareerGradeLabel(entry.careerId, entry.gradeIndex),
          changeType: entry.changeType,
          reason: entry.reason,
          recordedAt: entry.recordedAt.toISOString(),
        };
      }),
      pendingSwitchCareerId,
      pendingSwitchCareerLabel: pendingSwitchDef?.label ?? null,
      pendingSwitchStreak: state?.pendingSwitchStreak ?? 0,
      pendingSwitchRequired: CAREER_SWITCH_MIN_SIGNIFICANT_ACTIONS,
      switchRules: {
        minAffinityDelta: CAREER_SWITCH_MIN_AFFINITY_DELTA,
        minSignificantActions: CAREER_SWITCH_MIN_SIGNIFICANT_ACTIONS,
      },
    };
  }
}
