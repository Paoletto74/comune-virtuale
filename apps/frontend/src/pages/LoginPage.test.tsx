import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '@/pages/LoginPage';
import { VisualTimeProvider } from '@/context/VisualTimeProvider';

function renderLoginAtHour(hour: number) {
  vi.setSystemTime(new Date(2026, 7, 12, hour, 0, 0));
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <VisualTimeProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </VisualTimeProvider>
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows the official motto prominently', () => {
    renderLoginAtHour(10);
    const motto = document.querySelector('.loginEntranceMotto');
    expect(motto?.textContent).toContain('Diventa quello che vuoi');
    expect(motto?.textContent).toContain('livello massimo');
  });

  it('shows the official opening logo above the background', () => {
    renderLoginAtHour(10);
    const logo = screen.getByRole('img', { name: 'Comune Virtuale' });
    expect(logo.getAttribute('src')).toBe('/assets/logo/comune-virtuale-logo.png');
    expect(logo.classList.contains('loginEntranceLogo')).toBe(true);
  });

  it.each([
    { hour: 8, file: 'home-morning.webp' },
    { hour: 14, file: 'home-day.webp' },
    { hour: 19, file: 'home-sunset.webp' },
    { hour: 23, file: 'home-night.webp' },
  ] as const)('shows $file at hour $hour', ({ hour, file }) => {
    renderLoginAtHour(hour);
    const img = document.querySelector('.loginEntranceBackdropImg') as HTMLImageElement | null;
    expect(img?.getAttribute('src')).toBe(`/assets/hero/${file}`);
  });

  it('keeps login UI above the background layer', () => {
    renderLoginAtHour(10);
    const content = document.querySelector('.loginEntranceContent');
    const backdrop = document.querySelector('.loginEntranceBackdrop');
    expect(content).toBeTruthy();
    expect(backdrop).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Accedi con Google' })).toHaveLength(1);
  });

  it('does not show the dev preview panel in normal UI', () => {
    renderLoginAtHour(10);
    expect(screen.queryByLabelText('Modalità preview locale')).toBeNull();
    expect(screen.queryByText(/solo development/i)).toBeNull();
  });
});
