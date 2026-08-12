import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ManualModal, MANUAL_INTRO, MANUAL_SECTIONS } from '@/components/visual/ManualModal';

describe('ManualModal', () => {
  it('describes only implemented mechanics with Comune tone', () => {
    render(<ManualModal open onClose={vi.fn()} />);

    expect(screen.getByText(/Manuale del Comune/)).toBeTruthy();
    expect(screen.getByText(/Benvenuto nel Comune Virtuale/)).toBeTruthy();
    expect(screen.getByText(/solo ciò che funziona adesso/)).toBeTruthy();
  });

  it('lists progression and career sections without future-only promises', () => {
    render(<ManualModal open onClose={vi.fn()} />);

    const deepenButtons = screen.getAllByRole('button', { name: 'Approfondisci' });
    fireEvent.click(deepenButtons[0]!);

    const titles = MANUAL_SECTIONS.map((section) => section.title);
    expect(titles).toContain('Progressione globale');
    expect(titles).toContain('Carriera (struttura)');
    expect(titles).toContain('Relazioni e chat libera');
    expect(titles).toContain('Asset visivi');
    expect(titles).toContain('Cosa NON c’è (ancora)');

    expect(screen.getByText(/offline, rule-based/)).toBeTruthy();
    expect(screen.getByText(/economia dinamica/)).toBeTruthy();
    expect(screen.getByText(/affinità dominante/)).toBeTruthy();
  });
});
