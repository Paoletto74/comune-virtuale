import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AvatarPicker } from '@/components/visual/AvatarPicker';

describe('AvatarPicker', () => {
  it('renders portrait options and reports selection', () => {
    const onSelect = vi.fn();
    render(<AvatarPicker selectedPortraitId="profile_001" onSelect={onSelect} />);

    expect(screen.getByRole('listbox', { name: 'Avatar disponibili' })).toBeTruthy();
    expect(screen.getAllByRole('option').length).toBe(50);

    fireEvent.click(screen.getByRole('option', { name: 'profile_002' }));
    expect(onSelect).toHaveBeenCalledWith('profile_002');
  });
});
