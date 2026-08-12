import type { HomeResponse, ReferendumItem, WorkJobsResponse } from '@/api/client';
import type { FeedTask } from '@/utils/feedTaskTheme';

export type WorkDashboardState =
  | { kind: 'disabled' }
  | { kind: 'shift_active'; title: string; remainingShiftMs?: number }
  | { kind: 'needs_clock_in'; title: string }
  | { kind: 'day_done'; title: string }
  | { kind: 'seeking_work' }
  | { kind: 'available'; title: string };

function isReferendumVotable(item: ReferendumItem): boolean {
  if (item.status !== 'active') return false;
  if (item.remainingMs != null && item.remainingMs <= 0) return false;
  return true;
}

function taskPriority(task: FeedTask): number {
  const tags = task.gameplayHints?.tags ?? [];
  if (tags.includes('urgent')) return 0;
  if (task.feedState === 'ready') return 1;
  if (tags.includes('risky')) return 2;
  if (task.feedState === 'interactive') return 3;
  if (task.feedState === 'in_progress') return 4;
  if (task.feedState === 'dialogue') return 5;
  return 6;
}

function isTaskVisibleInFeed(task: FeedTask): boolean {
  if (task.feedState !== 'in_progress' && task.feedState !== 'ready') {
    return true;
  }
  if (!task.readyAt) return true;
  const readyMs = Date.parse(task.readyAt);
  return !(Number.isFinite(readyMs) && Date.now() >= readyMs);
}

export function selectPriorityTasks(tasks: FeedTask[] | undefined, limit = 3): FeedTask[] {
  if (!tasks?.length) return [];
  return [...tasks]
    .filter(isTaskVisibleInFeed)
    .sort((a, b) => taskPriority(a) - taskPriority(b))
    .slice(0, limit);
}

export function selectVotableReferenda(referendums: ReferendumItem[] | undefined): ReferendumItem[] {
  if (!referendums?.length) return [];
  return referendums.filter(isReferendumVotable);
}

export function resolveWorkDashboardState(work: WorkJobsResponse | undefined): WorkDashboardState {
  if (!work?.enabled) return { kind: 'disabled' };

  const activeShift = work.offers.find((offer) => offer.engagementStatus === 'shift_active');
  if (activeShift) {
    return {
      kind: 'shift_active',
      title: activeShift.title,
      remainingShiftMs: activeShift.remainingShiftMs,
    };
  }

  const hiredOffer = work.offers.find((offer) => offer.engagementStatus === 'hired');
  if (hiredOffer) {
    return { kind: 'needs_clock_in', title: hiredOffer.title };
  }

  const blockedOffer = work.offers.find((offer) => offer.engagementStatus === 'blocked_today');
  if (blockedOffer) {
    return { kind: 'day_done', title: blockedOffer.title };
  }

  if (work.employment?.employmentState === 'employed') {
    const current = work.offers.find((offer) => offer.offerId === work.employment?.currentOfferId);
    return { kind: 'available', title: current?.title ?? 'Lavoro attivo' };
  }

  return { kind: 'seeking_work' };
}

export function formatInflationLabel(inflationRateBps: number): string {
  const percent = inflationRateBps / 100;
  if (percent <= 1.5) return 'Stabile';
  if (percent <= 3.5) return 'In crescita';
  return 'Elevata';
}

export function formatPoliticsLabel(input: {
  activeReferenda: number;
  activeWorldEvents: number;
  highSeverityEvents: number;
}): string {
  if (input.highSeverityEvents > 0) return 'Tensione alta';
  if (input.activeWorldEvents > 0 || input.activeReferenda >= 2) return 'Dibattito attivo';
  if (input.activeReferenda === 1) return 'Referendum in corso';
  return 'Calma apparente';
}

export function countKnownRelationships(home: HomeResponse | undefined): number {
  return home?.knownNpcs.length ?? 0;
}

export function taskStatusLabel(task: FeedTask): string {
  if (task.feedState === 'ready') return 'Pronto';
  if (task.feedState === 'in_progress') return 'In corso';
  if (task.feedState === 'interactive' || task.feedState === 'dialogue') return 'Interattivo';
  if (task.gameplayHints?.tags.includes('urgent')) return 'Urgente';
  return 'Disponibile';
}
