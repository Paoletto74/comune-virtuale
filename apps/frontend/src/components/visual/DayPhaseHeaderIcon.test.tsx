import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { DayPhaseHeaderIcon, visualPhaseHeaderAriaLabel } from '@/components/visual/DayPhaseHeaderIcon';

describe('DayPhaseHeaderIcon', () => {
  it('renders compact icon for each visual phase', () => {
    const phases = ['morning', 'day', 'sunset', 'night'] as const;

    for (const phase of phases) {
      const { container, unmount } = render(
        <DayPhaseHeaderIcon phaseOverride={phase} className="gameHeaderPhaseIcon" />,
      );
      const svg = container.querySelector('svg.gameHeaderPhaseIcon');
      expect(svg).toBeTruthy();
      expect(svg?.querySelector('circle, path')).toBeTruthy();
      unmount();
    }
  });

  it('uses sun for morning, day and sunset; moon for night', () => {
    const day = render(<DayPhaseHeaderIcon phaseOverride="day" />).container.innerHTML;
    const night = render(<DayPhaseHeaderIcon phaseOverride="night" />).container.innerHTML;

    expect(day).not.toEqual(night);
    expect(day.includes('circle')).toBe(true);
    expect(night.includes('path')).toBe(true);
  });

  it('builds aria label from visual phase', () => {
    expect(visualPhaseHeaderAriaLabel('morning')).toContain('Mattino');
    expect(visualPhaseHeaderAriaLabel('night')).toContain('Notte');
  });
});
