import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { AnimatedBalance, resetAnimatedBalanceTracking } from '@/components/visual/AnimatedBalance';
import { formatEuro } from '@/utils/formatCash';

describe('AnimatedBalance', () => {
  afterEach(() => {
    cleanup();
    resetAnimatedBalanceTracking();
  });

  beforeEach(() => {
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

  it('renders formatted balance without animating on first mount', () => {
    render(<AnimatedBalance amountMinor="1250" />);
    expect(screen.getByLabelText(`Saldo: ${formatEuro('1250')}`)).toBeTruthy();
  });

  it('updates to new value when amount changes', () => {
    const { rerender } = render(<AnimatedBalance amountMinor="1000" />);
    rerender(<AnimatedBalance amountMinor="1250" />);
    expect(screen.getByLabelText(`Saldo: ${formatEuro('1250')}`)).toBeTruthy();
  });

  it('does not animate when value is unchanged on rerender', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    const { rerender } = render(<AnimatedBalance amountMinor="1250" />);
    rerender(<AnimatedBalance amountMinor="1250" />);
    expect(rafSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
  });

  it('respects reduced motion with instant update', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    const { rerender } = render(<AnimatedBalance amountMinor="1000" />);
    rerender(<AnimatedBalance amountMinor="2000" />);
    expect(screen.getByLabelText(`Saldo: ${formatEuro('2000')}`)).toBeTruthy();
    expect(rafSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
  });
});
