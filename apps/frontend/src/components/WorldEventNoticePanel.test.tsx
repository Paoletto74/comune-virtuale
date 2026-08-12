import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { WorldEventNoticePanel } from '@/components/WorldEventNoticePanel';

describe('WorldEventNoticePanel', () => {
  it('calls the same dismiss handler from X and Chiudi', () => {
    const onDismiss = vi.fn();
    render(
      <WorldEventNoticePanel
        notice={{
          eventId: 'we-1',
          type: 'weather',
          scope: 'global',
          severity: 'moderate',
          title: 'Ondata di caldo',
          body: 'Caldo',
          comuneLine: 'Il Comune suda.',
          startedAtGameMs: 1000,
          endsAtGameMs: 5000,
          remainingGameMs: 4000,
        }}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText('Ondata di caldo')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Chiudi avviso evento del Comune'));
    expect(onDismiss).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }));
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });
});
