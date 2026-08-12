import { useState, type ReactNode } from 'react';
import { GameShell } from '@/components/game/GameShell';
import { SectionPanel, SectionSwitch } from '@/components/game/SectionSwitch';
import { FeedListIcon } from '@/components/FeedListIcon';
import { useNotifications } from '@/hooks/useGameApi';
import { formatGameTimeMs } from '@/utils/formatGameTime';
import { notificationTypeToIcon } from '@/utils/feedItemIconMap';
import type { NotificationItem } from '@/api/client';

type NotificheSection = 'personali' | 'generali';

function PersonalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c1.5-3.5 4-5 6-5s4.5 1.5 6 5" strokeLinecap="round" />
    </svg>
  );
}

function GeneralIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M4 10 L12 4 L20 10 V20 H4 Z" strokeLinejoin="round" />
      <path d="M9 20 V14 H15 V20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SECTION_OPTIONS: Array<{ id: NotificheSection; label: string; icon: ReactNode }> = [
  { id: 'personali', label: 'Personali', icon: <PersonalIcon /> },
  { id: 'generali', label: 'Generali', icon: <GeneralIcon /> },
];

function NotificationCard({ item }: { item: NotificationItem }) {
  return (
    <article className="notificationCard card" aria-label={item.title}>
      <div className="feedListItemRow">
        <FeedListIcon kind={notificationTypeToIcon(item.type, item.scope)} />
        <div className="feedListItemContent">
          <div className="notificationCardHeader">
            <h3 className="notificationTitle">{item.title}</h3>
          </div>
          <p className="notificationBody">{item.body}</p>
          <footer className="notificationFooter">
            <time className="notificationTime">{formatGameTimeMs(item.worldTimeMs)}</time>
          </footer>
        </div>
      </div>
    </article>
  );
}

function NotificationsList({ scope }: { scope: 'personal' | 'global' }) {
  const { data, isLoading, error } = useNotifications(scope);

  if (isLoading) return <p className="loading">Caricamento notifiche…</p>;
  if (error) return <p className="error">Impossibile caricare le notifiche.</p>;
  if (data && !data.enabled) {
    return <p className="emptyState">Notifiche non disponibili.</p>;
  }

  const items = data?.notifications ?? [];

  if (items.length === 0) {
    return <p className="emptyState">Nessuna notifica.</p>;
  }

  return (
    <div
      className="notificationList"
      aria-label={`Notifiche ${scope === 'personal' ? 'personali' : 'generali'}`}
    >
      {items.map((item) => (
        <NotificationCard key={item.notificationId} item={item} />
      ))}
    </div>
  );
}

export function NotifichePage() {
  const [section, setSection] = useState<NotificheSection>('personali');

  return (
    <GameShell>
      <header className="pageHeader">
        <h1 className="pageTitle">Notifiche</h1>
        <p className="pageSubtitle">Eventi personali e del Comune</p>
      </header>

      <SectionSwitch
        options={SECTION_OPTIONS}
        value={section}
        onChange={setSection}
        ariaLabel="Tipo notifiche"
      />

      {section === 'personali' && (
        <SectionPanel id="section-panel-personali" labelledBy="section-tab-personali">
          <NotificationsList scope="personal" />
        </SectionPanel>
      )}

      {section === 'generali' && (
        <SectionPanel id="section-panel-generali" labelledBy="section-tab-generali">
          <NotificationsList scope="global" />
        </SectionPanel>
      )}
    </GameShell>
  );
}
