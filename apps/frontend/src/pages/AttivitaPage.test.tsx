import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AttivitaPage } from '@/pages/AttivitaPage';

vi.mock('@/components/game/GameShell', () => ({
  GameShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/game/TaskFeedPanel', () => ({
  TaskFeedPanel: () => <div>Task feed</div>,
}));

vi.mock('@/components/game/LavoroPanel', () => ({
  LavoroPanel: () => <div>Lavoro panel</div>,
}));

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AttivitaPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AttivitaPage', () => {
  afterEach(() => cleanup());

  it('shows Lavori as first tab and active by default', () => {
    renderPage();
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]?.textContent).toBe('Lavori');
    expect(tabs[1]?.textContent).toBe('Task');
    expect(screen.getByText('Lavoro panel')).toBeTruthy();
  });

  it('switches to Task tab on click', () => {
    renderPage();
    fireEvent.click(screen.getAllByRole('tab', { name: 'Task' })[0]!);
    expect(screen.getByText('Task feed')).toBeTruthy();
  });

  it('switches back to Lavori tab on click', () => {
    renderPage();
    fireEvent.click(screen.getAllByRole('tab', { name: 'Task' })[0]!);
    fireEvent.click(screen.getAllByRole('tab', { name: 'Lavori' })[0]!);
    expect(screen.getByText('Lavoro panel')).toBeTruthy();
  });
});
