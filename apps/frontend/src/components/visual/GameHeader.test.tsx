import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameHeader } from '@/components/visual/GameHeader';
import { VisualTimeProvider } from '@/context/VisualTimeProvider';
import { formatEuro } from '@/utils/formatCash';

vi.mock('@/api/client', () => ({
  api: { logout: vi.fn() },
}));

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function renderHeader(hour: number) {
  const queryClient = new QueryClient();
  vi.setSystemTime(new Date(2026, 7, 12, hour, 0, 0));
  return render(
    <QueryClientProvider client={queryClient}>
      <VisualTimeProvider>
        <MemoryRouter>
          <GameHeader gameDate={{ day: 1, hour, minute: 0 }} cashAmountMinor="12450" />
        </MemoryRouter>
      </VisualTimeProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('GameHeader', () => {
  it('links logo to Home', () => {
    renderHeader(10);
    const logo = screen.getByLabelText('Vai alla Home');
    expect(logo.getAttribute('href')).toBe('/home');
    expect(screen.getByRole('img', { name: 'Comune Virtuale' })).toBeTruthy();
  });

  it('shows prominent saldo linking to Profilo', () => {
    renderHeader(10);
    const saldoLinks = screen.getAllByLabelText('Saldo: vai al Profilo');
    const saldo = saldoLinks[0]!;
    expect(saldo.getAttribute('href')).toBe('/profilo');
    expect(saldo.textContent).toContain(formatEuro('12450'));
    expect(saldo.className).toContain('gameHeaderSaldo');
  });

  it('links compact phase icon to Attività', () => {
    renderHeader(14);
    const phaseLinks = screen.getAllByRole('link');
    const phaseLink = phaseLinks.find((link) => link.getAttribute('href') === '/attivita');
    expect(phaseLink).toBeTruthy();
  });

  it('updates phase icon aria-label by real visual time', () => {
    renderHeader(22);
    expect(screen.getByLabelText('Notte — Vai alle Attività')).toBeTruthy();
  });
});
