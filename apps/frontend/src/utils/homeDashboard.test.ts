import { describe, expect, it } from 'vitest';
import { buildHomeDashboardContextLine } from '@/utils/homeDashboardContext';
import {
  formatInflationLabel,
  formatPoliticsLabel,
  resolveWorkDashboardState,
  selectPriorityTasks,
  selectVotableReferenda,
} from '@/utils/homeDashboardSelectors';
import type { HomeResponse, ReferendumItem, WorkJobsResponse } from '@/api/client';
import { buildTestCareerView, buildTestGlobalProgression } from '@/utils/progressionView';

const baseHome: HomeResponse = {
  citizenId: 'cit-1',
  displayName: 'Paolo',
  gender: 'male',
  age: 30,
  portraitId: null,
  level: { levelId: 'main_L01', level: 2 },
  globalProgression: buildTestGlobalProgression(),
  career: buildTestCareerView(),
  personalValues: { sympathy: 50, reputation: 72, happiness: 40 },
  citizenProfile: {
    levelLabel: 'Cittadino attivo',
    ageBand: 'Adulto',
    progression: {
      levelId: 'main_L01',
      level: 2,
      label: 'Cittadino attivo',
      globalXp: 100,
      nextLevel: 3,
      progressToNextLevel: 0.4,
    },
    unlocked: {},
    locked: [],
  },
  knownNpcs: [],
  balance: { availableCash: { amountMinor: '50000', currency: 'EUR' }, asOf: '2026-01-01' },
  activeTasks: [
    {
      taskInstanceId: 't1',
      taskId: 'TASK_URGENT',
      title: 'Urgente',
      description: '',
      status: 'active',
      feedState: 'interactive',
      gameplayHints: { tags: ['urgent'] },
      options: [],
    },
    {
      taskInstanceId: 't2',
      taskId: 'TASK_READY',
      title: 'Pronto',
      description: '',
      status: 'active',
      feedState: 'ready',
      options: [],
    },
  ],
  gameTime: { worldTimeMs: 1000, timeScale: 1, realTimestampMs: 0 },
  gameDate: { day: 3, hour: 9, minute: 0, second: 0, label: 'Giorno 3, 09:00:00' },
  correlationId: 'corr',
};

describe('homeDashboardSelectors', () => {
  it('prioritizes urgent and ready tasks', () => {
    const tasks = selectPriorityTasks(baseHome.activeTasks, 2);
    expect(tasks.map((task) => task.title)).toEqual(['Urgente', 'Pronto']);
  });

  it('detects clock-in work state from real job data', () => {
    const work: WorkJobsResponse = {
      enabled: true,
      offers: [
        {
          offerId: 'job-1',
          title: 'Magazziniere',
          engagementStatus: 'hired',
        } as WorkJobsResponse['offers'][number],
      ],
      employment: { employmentState: 'employed', currentOfferId: 'job-1' },
      correlationId: 'corr',
    };

    expect(resolveWorkDashboardState(work)).toEqual({
      kind: 'needs_clock_in',
      title: 'Magazziniere',
    });
  });

  it('filters votable referenda only', () => {
    const referendums: ReferendumItem[] = [
      { referendumId: 'r1', status: 'active', remainingMs: 1000 } as ReferendumItem,
      { referendumId: 'r2', status: 'closed' } as ReferendumItem,
    ];

    expect(selectVotableReferenda(referendums)).toHaveLength(1);
  });

  it('derives inflation and politics labels from real metrics', () => {
    expect(formatInflationLabel(120)).toBe('Stabile');
    expect(
      formatPoliticsLabel({ activeReferenda: 2, activeWorldEvents: 0, highSeverityEvents: 0 }),
    ).toBe('Dibattito attivo');
  });
});

describe('homeDashboardContext', () => {
  it('uses deterministic fallback based on game state', () => {
    const line = buildHomeDashboardContextLine({
      home: baseHome,
      votableReferendaCount: 0,
      workState: { kind: 'needs_clock_in', title: 'Magazziniere' },
      activeWorldEvents: 0,
      spontaneousMessages: 0,
    });

    expect(line).toContain('cartellino');
  });

  it('falls back to player greeting when nothing urgent is pending', () => {
    const line = buildHomeDashboardContextLine({
      home: { ...baseHome, activeTasks: [] },
      votableReferendaCount: 0,
      workState: { kind: 'seeking_work' },
      activeWorldEvents: 0,
      spontaneousMessages: 0,
    });

    expect(line).toContain('Paolo');
  });
});
