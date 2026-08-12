import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { HomeResponse } from '@/api/client';
import { buildTestCareerView, buildTestGlobalProgression } from '@/utils/progressionView';
import { TaskFeedPanel } from '@/components/game/TaskFeedPanel';

const homeFixture: HomeResponse = {
  citizenId: 'citizen-1',
  displayName: 'Paolo',
  age: 30,
  gender: 'male',
  portraitId: null,
  level: { levelId: 'level_2', level: 2 },
  globalProgression: buildTestGlobalProgression({ level: 2, levelId: 'level_2', globalXp: 150 }),
  career: buildTestCareerView(),
  balance: {
    availableCash: { amountMinor: '10000', currency: 'EUR' },
    asOf: '2026-01-01T00:00:00.000Z',
  },
  personalValues: { sympathy: 50, reputation: 40, happiness: 35 },
  citizenProfile: {
    levelLabel: 'Cittadino attivo',
    ageBand: 'Adulto',
    progression: { levelId: 'level_2', level: 2, label: 'Cittadino attivo', globalXp: 150 },
    unlocked: {},
    locked: [],
  },
  activeTasks: [],
  knownNpcs: [],
  gameTime: {
    worldTimeMs: 0,
    timeScale: 1,
    realTimestampMs: 0,
  },
  gameDate: { day: 1, hour: 14, minute: 0, second: 0, label: 'Giorno 1, 14:00:00' },
  correlationId: 'test-correlation',
};

const useHomeMock = vi.fn();

vi.mock('@/hooks/useSession', () => ({
  useHome: (...args: unknown[]) => useHomeMock(...args),
  useMe: () => ({ data: { accountId: 'test' } }),
}));

function renderTaskFeed() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TaskFeedPanel />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TaskFeedPanel hooks order', () => {
  it('renders loading then loaded without hook order violations', () => {
    useHomeMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { rerender, getByText } = renderTaskFeed();
    expect(getByText('Caricamento attività…')).toBeTruthy();

    useHomeMock.mockReturnValue({
      data: homeFixture,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    expect(() => {
      rerender(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <MemoryRouter>
            <TaskFeedPanel />
          </MemoryRouter>
        </QueryClientProvider>,
      );
    }).not.toThrow();

    expect(getByText('I tuoi incarichi')).toBeTruthy();
  });
});
