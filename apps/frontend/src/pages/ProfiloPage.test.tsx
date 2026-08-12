import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HomeResponse, ProfileDetailResponse } from '@/api/client';
import { buildTestCareerView, buildTestGlobalProgression } from '@/utils/progressionView';
import { ProfiloPage } from '@/pages/ProfiloPage';
import { api } from '@/api/client';
import { useProfileDetail, useRelazioni } from '@/hooks/useGameApi';
import { useHome } from '@/hooks/useSession';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({}),
  };
});

vi.mock('@/hooks/useGameApi', () => ({
  useProfileDetail: vi.fn(),
  useRelazioni: vi.fn(),
}));

vi.mock('@/hooks/useSession', () => ({
  useHome: vi.fn(),
  useMe: () => ({ data: { accountId: 'test-account' } }),
}));

vi.mock('@/hooks/useIsAdmin', () => ({
  useIsAdmin: () => false,
}));

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const actualApi = actual.api as typeof api;
  return {
    ...actual,
    api: {
      ...actualApi,
      deleteAccount: vi.fn(),
    },
  };
});

const homeFixture: HomeResponse = {
  citizenId: 'citizen-1',
  displayName: 'Paolo',
  age: 30,
  gender: 'male',
  portraitId: 'profile_001',
  level: { levelId: 'main_L01', level: 1 },
  globalProgression: buildTestGlobalProgression(),
  career: buildTestCareerView(),
  balance: {
    availableCash: { amountMinor: '10000', currency: 'EUR' },
    asOf: '2026-01-01T00:00:00.000Z',
  },
  personalValues: { sympathy: 50, reputation: 40, happiness: 35 },
  citizenProfile: {
    levelLabel: 'Cittadino attivo',
    ageBand: 'Adulto',
    progression: { levelId: 'main_L01', level: 1, label: 'Cittadino attivo', globalXp: 0 },
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

const profileFixture: ProfileDetailResponse = {
  enabled: true,
  citizenId: 'citizen-1',
  displayName: 'Paolo',
  gender: 'male',
  age: 30,
  portraitId: 'profile_001',
  citizenProfile: homeFixture.citizenProfile,
  globalProgression: homeFixture.globalProgression,
  career: homeFixture.career,
  balance: homeFixture.balance,
  personalValues: homeFixture.personalValues,
  employment: null,
  inventory: [],
  patrimonioSnapshots: [],
  correlationId: 'test-correlation',
};

function renderProfiloPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProfiloPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function openDeleteDialog() {
  fireEvent.click(screen.getByRole('button', { name: 'Cancella account' }));
}

describe('ProfiloPage progression display', () => {
  beforeEach(() => {
    vi.mocked(useRelazioni).mockReturnValue({
      data: { people: [], groups: [], spontaneousInbox: [] },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRelazioni>);
    vi.mocked(useHome).mockReturnValue({
      data: homeFixture,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useHome>);
    vi.mocked(useProfileDetail).mockReturnValue({
      data: {
        ...profileFixture,
        globalProgression: buildTestGlobalProgression({ level: 8, levelId: 'main_L08', globalXp: 6300 }),
        career: buildTestCareerView({
          currentCareerId: 'medicina',
          currentCareerLabel: 'MEDICINA',
          currentGradeIndex: 5,
          currentGradeLabel: 'PRIMARIO',
        }),
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProfileDetail>);
  });

  afterEach(() => {
    cleanup();
  });

  it('shows global level, XP, career and grade', () => {
    renderProfiloPage();
    expect(screen.getByText(/LIVELLO 8 · 6[.\s]?300 XP/)).toBeTruthy();
    expect(screen.getByText('MEDICINA')).toBeTruthy();
    expect(screen.getByText('PRIMARIO')).toBeTruthy();
  });
});

describe('ProfiloPage delete account confirmation', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    vi.mocked(useRelazioni).mockReturnValue({
      data: { people: [], groups: [], spontaneousInbox: [] },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRelazioni>);
    vi.mocked(useHome).mockReturnValue({
      data: homeFixture,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useHome>);
    vi.mocked(useProfileDetail).mockReturnValue({
      data: profileFixture,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProfileDetail>);
    vi.mocked(api.deleteAccount).mockReset();
    vi.mocked(api.deleteAccount).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    cleanup();
  });

  it('advances through four confirmation steps before deleting', async () => {
    renderProfiloPage();

    openDeleteDialog();
    expect(screen.getByRole('heading', { name: 'Vuoi davvero cancellare il tuo account?' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Conferma cancellazione' }));
    expect(api.deleteAccount).not.toHaveBeenCalled();

    expect(screen.getByRole('heading', { name: 'Sei davvero sicuro?' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Conferma ancora' }));
    expect(api.deleteAccount).not.toHaveBeenCalled();

    expect(screen.getByRole('heading', { name: 'Attenzione' })).toBeTruthy();
    expect(screen.getByText('Attenzione: stai per eliminare definitivamente il tuo personaggio.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }));
    expect(api.deleteAccount).not.toHaveBeenCalled();

    expect(screen.getByRole('heading', { name: 'ULTIMA CONFERMA' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'ELIMINA DEFINITIVAMENTE' }));

    await waitFor(() => {
      expect(api.deleteAccount).toHaveBeenCalledTimes(1);
    });
  });

  it('does not delete when cancelling at an intermediate step', async () => {
    renderProfiloPage();

    openDeleteDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Conferma cancellazione' }));
    fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(api.deleteAccount).not.toHaveBeenCalled();
  });

  it('does not delete when closing the dialog from the backdrop', async () => {
    renderProfiloPage();

    openDeleteDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Conferma cancellazione' }));
    fireEvent.click(document.querySelector('.manualModalBackdrop')!);

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(api.deleteAccount).not.toHaveBeenCalled();
  });

  it('redirects to create-citizen after a successful delete', async () => {
    renderProfiloPage();

    openDeleteDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Conferma cancellazione' }));
    fireEvent.click(screen.getByRole('button', { name: 'Conferma ancora' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }));
    fireEvent.click(screen.getByRole('button', { name: 'ELIMINA DEFINITIVAMENTE' }));

    await waitFor(() => {
      expect(api.deleteAccount).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/create-citizen', { replace: true });
    });
  });
});
