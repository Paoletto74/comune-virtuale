import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, act } from '@testing-library/react';
import { GlobalOverlays } from '@/components/game/GlobalOverlays';
import type { HomeResponse } from '@/api/client';
import { buildTestCareerView, buildTestGlobalProgression } from '@/utils/progressionView';

function buildHome(): HomeResponse {
  return {
    citizenId: 'citizen-1',
    displayName: 'Paolo',
    gender: 'male',
    age: 30,
    portraitId: null,
    level: { levelId: 'main_L01', level: 1 },
    globalProgression: buildTestGlobalProgression(),
    career: buildTestCareerView(),
    personalValues: { sympathy: 0, reputation: 0, happiness: 0 },
    citizenProfile: {
      levelLabel: 'Nuovo',
      ageBand: 'adult',
      progression: { levelId: 'main_L01', level: 1, label: 'Nuovo', globalXp: 0 },
      unlocked: {},
      locked: [],
    },
    knownNpcs: [],
    balance: {
      availableCash: { amountMinor: '1000', currency: 'EUR' },
      asOf: new Date().toISOString(),
    },
    activeTasks: [],
    gameTime: { worldTimeMs: 1_000_000, timeScale: 1, realTimestampMs: Date.now() },
    gameDate: { day: 1, hour: 10, minute: 0, second: 0, label: 'Giorno 1' },
    worldEvents: {
      enabled: true,
      activeEvents: [
        {
          eventId: 'event-a',
          type: 'weather',
          scope: 'global',
          severity: 'moderate',
          title: 'Ondata di caldo',
          body: 'Caldo',
          comuneLine: 'Il Comune suda.',
          startedAtGameMs: 900_000,
          endsAtGameMs: 2_000_000,
          remainingGameMs: 1_000_000,
        },
      ],
    },
    flash: { enabled: false, flashOpportunity: null, anticipation: null, expiredNotice: null },
    correlationId: 'test-correlation',
  };
}

describe('GlobalOverlays personal-only popups', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    sessionStorage.clear();
  });

  it('does not show popup for general world events', () => {
    render(<GlobalOverlays home={buildHome()} refetch={vi.fn().mockResolvedValue({})} />);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('Ondata di caldo')).toBeNull();
  });
});
