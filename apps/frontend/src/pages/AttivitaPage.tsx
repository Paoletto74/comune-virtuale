import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GameShell } from '@/components/game/GameShell';
import { LavoroPanel } from '@/components/game/LavoroPanel';
import { SectionPanel, SectionSwitch } from '@/components/game/SectionSwitch';
import { TaskFeedPanel } from '@/components/game/TaskFeedPanel';
import { VisualHeroSlot } from '@/components/visual/VisualHeroSlot';

type AttivitaSection = 'lavoro' | 'task';

const SECTION_OPTIONS = [
  { id: 'lavoro' as const, label: 'Lavori' },
  { id: 'task' as const, label: 'Task' },
];

export function AttivitaPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialSection: AttivitaSection =
    tabParam === 'task' ? 'task' : tabParam === 'lavoro' ? 'lavoro' : 'lavoro';
  const [section, setSection] = useState<AttivitaSection>(initialSection);

  return (
    <GameShell>
      <header className="pageHeader">
        <h1 className="pageTitle">Attività</h1>
        <p className="pageSubtitle">Lavoro e incarichi — il Comune ti osserva con interesse.</p>
      </header>

      <VisualHeroSlot
        imageKey={section === 'lavoro' ? 'jobs-hero' : 'tasks-hero'}
        label={section === 'lavoro' ? 'Hero lavori' : 'Hero task'}
      />

      <SectionSwitch
        options={SECTION_OPTIONS}
        value={section}
        onChange={setSection}
        ariaLabel="Sezione attività"
      />

      {section === 'lavoro' && (
        <SectionPanel id="section-panel-lavoro" labelledBy="section-tab-lavoro">
          <LavoroPanel />
        </SectionPanel>
      )}

      {section === 'task' && (
        <SectionPanel id="section-panel-task" labelledBy="section-tab-task">
          <TaskFeedPanel />
        </SectionPanel>
      )}
    </GameShell>
  );
}
