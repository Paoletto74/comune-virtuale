import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DayNightSelector } from '@/components/visual/DayNightSelector';

describe('DayNightSelector', () => {
  it('shows only the active phase', () => {
    render(
      <DayNightSelector
        gameDate={{ day: 3, hour: 14, minute: 22, label: 'Giorno 3, 14:22:05' }}
      />,
    );

    expect(screen.getByText('Pomeriggio')).toBeTruthy();
    expect(screen.queryByText('Alba')).toBeNull();
    expect(screen.queryByText('Tramonto')).toBeNull();
    expect(screen.queryByText('Notte')).toBeNull();
  });

  it('marks the indicator with the active phase class', () => {
    const { container } = render(
      <DayNightSelector
        gameDate={{ day: 1, hour: 22, minute: 0, label: 'Giorno 1, 22:00:00' }}
      />,
    );

    expect(container.querySelector('.dayNightIndicator--night')).toBeTruthy();
    expect(container.querySelectorAll('.dayNightIndicatorLabel')).toHaveLength(1);
  });
});
