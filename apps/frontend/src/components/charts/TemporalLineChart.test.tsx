import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TemporalLineChart } from '@/components/charts/TemporalLineChart';
import { GAME_MS_PER_DAY } from '@/utils/chartPeriods';

describe('TemporalLineChart', () => {
  afterEach(() => {
    cleanup();
  });

  const now = 10 * GAME_MS_PER_DAY;
  const points = [
    { recordedAtGameMs: now - 5 * GAME_MS_PER_DAY, value: 1000 },
    { recordedAtGameMs: now - 2 * GAME_MS_PER_DAY, value: 1500 },
    { recordedAtGameMs: now - GAME_MS_PER_DAY, value: 2000 },
  ];

  it('defaults to SETTIMANA period selected', () => {
    render(
      <TemporalLineChart
        title="Patrimonio"
        ariaLabel="Grafico patrimonio"
        currentGameTimeMs={now}
        points={points}
        formatValue={(value) => `${value}€`}
        formatTime={() => 'Giorno 1'}
      />,
    );

    const defaultTab = screen.getByRole('tab', { name: 'SETTIMANA' });
    expect(defaultTab.getAttribute('aria-selected')).toBe('true');
  });

  it('falls back to available history when selected period has no points', () => {
    render(
      <TemporalLineChart
        title="Inflazione"
        ariaLabel="Grafico inflazione"
        currentGameTimeMs={now}
        points={[{ recordedAtGameMs: now - 40 * GAME_MS_PER_DAY, value: 2 }]}
        formatValue={(value) => `${value}%`}
        formatTime={() => 'Giorno 1'}
        emptyMessage="Nessun dato"
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: '24 ORE' }));
    expect(screen.getByRole('img', { name: 'Grafico inflazione' })).toBeTruthy();
    expect(screen.queryByText('Nessun dato')).toBeNull();
  });

  it('updates chart when period changes', () => {
    render(
      <TemporalLineChart
        title="Patrimonio"
        ariaLabel="Grafico patrimonio"
        currentGameTimeMs={now}
        points={points}
        formatValue={(value) => `${value}€`}
        formatTime={() => 'Giorno 1'}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'SETTIMANA' }));
    expect(screen.getByRole('tab', { name: 'SETTIMANA' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('img', { name: 'Grafico patrimonio' })).toBeTruthy();
  });
});
