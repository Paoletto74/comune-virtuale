import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveSemanticImageKey } from '@comune-virtuale/shared';
import { VisualAssetImage } from '@/components/visual/VisualAssetImage';

describe('VisualAssetImage', () => {
  it('shows missing placeholder when presence is missing', () => {
    render(<VisualAssetImage imageKey="hero:test" label="Test hero" presence="missing" />);
    expect(screen.getByText('ASSET DA CREARE')).toBeTruthy();
  });

  it('shows error placeholder when presence is error', () => {
    render(<VisualAssetImage imageKey="hero:test" label="Test hero" presence="error" />);
    expect(screen.getByText('ASSET ERROR')).toBeTruthy();
  });

  it('uses catalog aspect ratio on container via data-aspect', () => {
    const { container } = render(
      <VisualAssetImage imageKey="marketplace-hero" label="Hero" presence="missing" />,
    );
    expect(container.querySelector('[data-aspect="3:1"]')).toBeTruthy();
  });
});
