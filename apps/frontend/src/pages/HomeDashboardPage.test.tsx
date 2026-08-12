import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { HomeResponse } from '@/api/client';
import { ShellLayout } from '@/components/shell/ShellLayout';
import { HomeDashboardPage } from '@/pages/HomeDashboardPage';
import { buildTestCareerView, buildTestGlobalProgression } from '@/utils/progressionView';

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
  personalValues: { sympathy: 50, reputation: 72, happiness: 35 },
  citizenProfile: {
    levelLabel: 'Cittadino attivo',
    ageBand: 'Adulto',
    progression: {
      levelId: 'level_2',
      level: 2,
      label: 'Cittadino attivo',
      globalXp: 150,
      nextLevel: 3,
      progressToNextLevel: 0.25,
    },
    unlocked: {},
    locked: [],
  },
  activeTasks: [],
  knownNpcs: [],
  gameTime: { worldTimeMs: 0, timeScale: 1, realTimestampMs: 0 },
  gameDate: { day: 1, hour: 14, minute: 0, second: 0, label: 'Giorno 1, 14:00:00' },
  correlationId: 'test-correlation',
};

vi.mock('@/hooks/useSession', () => ({
  useHome: vi.fn(),
  useMe: vi.fn(),
}));

vi.mock('@/hooks/useGameApi', () => ({
  useGazzetta: () => ({ data: { enabled: true, articles: [], correlationId: 'g' }, isLoading: false }),
  useReferenda: () => ({ data: { enabled: true, referendums: [], correlationId: 'r' }, isLoading: false }),
  useWorkJobs: () => ({
    data: { enabled: true, offers: [], employment: null, correlationId: 'w' },
    isLoading: false,
  }),
  useMunicipality: () => ({
    data: {
      enabled: true,
      treasuryMinor: '1000000',
      inflationRateBps: 150,
      citizenCount: 42,
      updatedAtGameMs: 0,
      inflationHistory: [],
      correlationId: 'm',
    },
    isLoading: false,
  }),
  useMarketplace: () => ({ data: { enabled: true, items: [], correlationId: 'mp' }, isLoading: false }),
  useRelazioni: () => ({ data: { people: [], groups: [], spontaneousInbox: [] }, isLoading: false }),
  useProfileDetail: vi.fn(),
  useNotifications: vi.fn(),
  useMunicipalityCitizens: vi.fn(),
  useRankings: vi.fn(),
}));

import { useHome, useMe } from '@/hooks/useSession';

function renderApp(initialEntry = '/home') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<ShellLayout />}>
            <Route path="home" element={<HomeDashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Home dashboard integration', () => {
  beforeEach(() => {
    vi.mocked(useMe).mockReturnValue({
      data: { accountId: 'acc', needsCitizenCreation: false },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useMe>);
    vi.mocked(useHome).mockReturnValue({
      data: homeFixture,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useHome>);
  });

  it('renders dashboard with real home metrics', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'Paolo' })).toBeTruthy();
    expect(screen.getAllByText('72%').length).toBeGreaterThan(0);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('shows HOME as first nav item with exact label', () => {
    renderApp();
    const nav = screen.getAllByRole('navigation', { name: 'Navigazione principale' })[0]!;
    const firstLink = nav.querySelector('a');
    expect(firstLink?.textContent).toBe('HOME');
    expect(firstLink?.getAttribute('href')).toBe('/home');
  });

  it('links previews to full section routes', () => {
    renderApp();
    const links = screen.getAllByRole('link');
    expect(links.some((link) => link.getAttribute('href') === '/attivita?tab=task')).toBe(true);
    expect(links.some((link) => link.getAttribute('href') === '/gazzetta')).toBe(true);
    expect(links.some((link) => link.getAttribute('href') === '/profilo#conoscenze')).toBe(true);
  });
});
