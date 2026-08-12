import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CitizenIllustration } from '@/components/visual/CitizenIllustration';
import { TaskIllustration } from '@/components/visual/TaskIllustration';
import { NpcIllustration } from '@/components/visual/NpcIllustration';

describe('CitizenIllustration', () => {
  it('renders with occupation-based aria label', () => {
    render(<CitizenIllustration occupation="Studente" />);
    expect(screen.getByRole('img', { name: /Studente/i })).toBeTruthy();
  });
});

describe('TaskIllustration', () => {
  it('renders work illustration with label', () => {
    render(<TaskIllustration kind="work" />);
    expect(screen.getByRole('img', { name: 'Lavoro' })).toBeTruthy();
  });
});

describe('NpcIllustration', () => {
  it('renders Marco with display name', () => {
    render(<NpcIllustration npcId="marco" displayName="Marco" />);
    expect(screen.getByRole('img', { name: 'Marco' })).toBeTruthy();
  });

  it('loads assigned pool portrait as WebP', () => {
    const { container } = render(
      <NpcIllustration
        npcId="elderly_signora_rossi"
        displayName="Antonella Romano"
        assignedPortraitId="npc_006"
      />,
    );
    const photo = container.querySelector('.npcIllustrationAsset img') as HTMLImageElement | null;
    expect(photo).toBeTruthy();
    expect(photo?.getAttribute('src')).toBe('/assets/characters/npc_006.webp');
    expect(container.querySelector('.npcIllustrationSvg')).toBeNull();
  });
});
