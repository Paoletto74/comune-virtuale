import { useState } from 'react';
import { GameShell } from '@/components/game/GameShell';
import { MarketplacePanel } from '@/components/game/MarketplacePanel';
import { OccasioniPanel } from '@/components/game/OccasioniPanel';
import { SectionPanel, SectionSwitch } from '@/components/game/SectionSwitch';
import { VisualHeroSlot } from '@/components/visual/VisualHeroSlot';

type MercatoSection = 'marketplace' | 'occasioni';

const SECTION_OPTIONS = [
  { id: 'marketplace' as const, label: 'Marketplace' },
  { id: 'occasioni' as const, label: 'Occasioni' },
];

export function MercatoPage() {
  const [section, setSection] = useState<MercatoSection>('marketplace');

  return (
    <GameShell>
      <header className="pageHeader">
        <h1 className="pageTitle">Mercato</h1>
        <p className="pageSubtitle">Catalogo ufficiale e mercato secondario — le trattative sono reali.</p>
      </header>

      <VisualHeroSlot imageKey="marketplace-hero" label="Hero marketplace" />

      <SectionSwitch
        options={SECTION_OPTIONS}
        value={section}
        onChange={setSection}
        ariaLabel="Sezione mercato"
      />

      {section === 'marketplace' && (
        <SectionPanel id="section-panel-marketplace" labelledBy="section-tab-marketplace">
          <MarketplacePanel />
        </SectionPanel>
      )}

      {section === 'occasioni' && (
        <SectionPanel id="section-panel-occasioni" labelledBy="section-tab-occasioni">
          <OccasioniPanel />
        </SectionPanel>
      )}
    </GameShell>
  );
}
