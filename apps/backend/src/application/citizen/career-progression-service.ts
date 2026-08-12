import { randomUUID } from 'node:crypto';
import type { DrizzleCitizenCareerRepository } from '../../infrastructure/db/repositories/citizen-career-repository.js';
import type { CitizenRepository } from '../../domain/ports/repositories.js';
import {
  CAREER_SWITCH_MIN_AFFINITY_DELTA,
  CAREER_SWITCH_MIN_SIGNIFICANT_ACTIONS,
  clampAffinity,
  resolveCareerDefinition,
  resolveCareerGradeIndex,
  type DemoCareerId,
} from '../../slice/career-constants.js';
import { resolveGradeRequirement } from '../../slice/career-grade-requirements.js';
import { personalValuesFromPartial } from '../../slice/personal-values-constants.js';

export class CareerProgressionService {
  constructor(
    private readonly careers: DrizzleCitizenCareerRepository,
    private readonly citizens: CitizenRepository,
  ) {}

  async applyAffinityDeltas(input: {
    citizenId: string;
    deltas: Partial<Record<DemoCareerId, number>>;
    source: string;
  }): Promise<void> {
    if (Object.keys(input.deltas).length === 0) return;
    await this.careers.ensureSeeded(input.citizenId);

    for (const [careerId, delta] of Object.entries(input.deltas)) {
      if (!delta || delta === 0) continue;
      if (!resolveCareerDefinition(careerId)) continue;
      const current = await this.careers.listAffinities(input.citizenId);
      const row = current.find((entry) => entry.careerId === careerId);
      const next = clampAffinity((row?.affinity ?? 0) + delta);
      await this.careers.setAffinity(input.citizenId, careerId, next);
    }

    await this.evaluateCareerSwitch(input.citizenId, input.source);
    await this.tryAdvanceGrade(input.citizenId, input.source);
    await this.ensureInitialCareer(input.citizenId);
  }

  async tryAdvanceGrade(citizenId: string, reason: string): Promise<boolean> {
    await this.careers.ensureSeeded(citizenId);
    const state = await this.careers.getState(citizenId);
    if (!state?.currentCareerId) return false;

    const careerId = state.currentCareerId as DemoCareerId;
    const progression = await this.citizens.getProgression(citizenId);
    const globalXp = progression?.progressionPoints ?? 0;
    const personalValues = personalValuesFromPartial(await this.citizens.getPersonalValues(citizenId));
    const affinities = await this.careers.listAffinities(citizenId);
    const affinity = affinities.find((a) => a.careerId === careerId)?.affinity ?? 0;

    let nextGrade = state.currentGradeIndex;
    for (let grade = state.currentGradeIndex + 1; grade <= 20; grade += 1) {
      const req = resolveGradeRequirement(careerId, grade);
      if (globalXp < req.minGlobalXp) break;
      if (affinity < req.minAffinity) break;
      if (req.minReputation != null && personalValues.reputation < req.minReputation) break;
      nextGrade = grade;
    }

    if (nextGrade <= state.currentGradeIndex) return false;

    await this.careers.updateState({
      citizenId,
      currentGradeIndex: nextGrade,
    });
    await this.careers.appendHistory({
      citizenId,
      careerId,
      gradeIndex: nextGrade,
      changeType: 'grade_up',
      reason,
    });
    return true;
  }

  async evaluateCareerSwitch(citizenId: string, reason: string): Promise<boolean> {
    await this.careers.ensureSeeded(citizenId);
    const state = await this.careers.getState(citizenId);
    const affinities = await this.careers.listAffinities(citizenId);
    if (!state) return false;

    const currentCareerId = state.currentCareerId;
    const currentAffinity = currentCareerId
      ? affinities.find((a) => a.careerId === currentCareerId)?.affinity ?? 0
      : 0;

    let dominant: { careerId: DemoCareerId; affinity: number } | null = null;
    for (const row of affinities) {
      const id = row.careerId as DemoCareerId;
      if (!resolveCareerDefinition(id)) continue;
      if (!dominant || row.affinity > dominant.affinity) {
        dominant = { careerId: id, affinity: row.affinity };
      }
    }
    if (!dominant) return false;

    const beatsCurrent =
      !currentCareerId ||
      dominant.affinity >= currentAffinity + CAREER_SWITCH_MIN_AFFINITY_DELTA;

    if (!beatsCurrent) {
      if (state.pendingSwitchCareerId) {
        await this.careers.updateState({
          citizenId,
          pendingSwitchCareerId: null,
          pendingSwitchStreak: 0,
        });
      }
      return false;
    }

    const pendingId = state.pendingSwitchCareerId;
    const streak =
      pendingId === dominant.careerId ? (state.pendingSwitchStreak ?? 0) + 1 : 1;

    if (streak < CAREER_SWITCH_MIN_SIGNIFICANT_ACTIONS) {
      await this.careers.updateState({
        citizenId,
        pendingSwitchCareerId: dominant.careerId,
        pendingSwitchStreak: streak,
      });
      return false;
    }

    const previousCareerId = currentCareerId;
    const previousGrade = state.currentGradeIndex;

    await this.careers.updateState({
      citizenId,
      currentCareerId: dominant.careerId,
      currentGradeIndex: 1,
      pendingSwitchCareerId: null,
      pendingSwitchStreak: 0,
    });

    if (previousCareerId) {
      await this.careers.appendHistory({
        citizenId,
        careerId: previousCareerId,
        gradeIndex: previousGrade,
        changeType: 'switch_from',
        reason: `Uscita da ${previousCareerId}`,
      });
    }

    await this.careers.appendHistory({
      citizenId,
      careerId: dominant.careerId,
      gradeIndex: 1,
      changeType: 'switch_to',
      reason,
    });

    return true;
  }

  async ensureInitialCareer(citizenId: string, preferredCareerId?: DemoCareerId): Promise<void> {
    await this.careers.ensureSeeded(citizenId);
    const state = await this.careers.getState(citizenId);
    if (state?.currentCareerId) return;

    const affinities = await this.careers.listAffinities(citizenId);
    let pick: DemoCareerId | null = preferredCareerId ?? null;
    if (!pick) {
      const top = [...affinities].sort((a, b) => b.affinity - a.affinity)[0];
      if (top && top.affinity >= 10) pick = top.careerId as DemoCareerId;
    }
    if (!pick) return;

    await this.careers.updateState({
      citizenId,
      currentCareerId: pick,
      currentGradeIndex: 1,
    });
    await this.careers.appendHistory({
      citizenId,
      careerId: pick,
      gradeIndex: 1,
      changeType: 'assigned',
      reason: 'Prima traiettoria riconosciuta dal Comune.',
    });
  }
}

export function careerProgressionIdempotencyKey(
  citizenId: string,
  source: string,
  ref: string,
): string {
  return `career:${citizenId}:${source}:${ref}`;
}
