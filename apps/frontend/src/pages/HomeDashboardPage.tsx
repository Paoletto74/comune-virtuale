import { Link } from 'react-router-dom';
import { GameShell } from '@/components/game/GameShell';
import { ComuneMessage } from '@/components/visual/ComuneMessage';
import { CitizenIllustration } from '@/components/visual/CitizenIllustration';
import { WorldSidebar } from '@/components/visual/WorldSidebar';
import { FeedListIcon } from '@/components/FeedListIcon';
import {
  useGazzetta,
  useMarketplace,
  useMunicipality,
  useReferenda,
  useRelazioni,
  useWorkJobs,
} from '@/hooks/useGameApi';
import { useHome } from '@/hooks/useSession';
import { buildHomeDashboardContextLine } from '@/utils/homeDashboardContext';
import {
  countKnownRelationships,
  formatInflationLabel,
  formatPoliticsLabel,
  resolveWorkDashboardState,
  selectPriorityTasks,
  selectVotableReferenda,
  taskStatusLabel,
} from '@/utils/homeDashboardSelectors';
import { formatEuro } from '@/utils/formatCash';
import { formatGameTimeMs } from '@/utils/formatGameTime';
import { formatShiftRemaining } from '@/utils/formatWork';
import { gazzettaCategoryToIcon, referendumListIcon } from '@/utils/feedItemIconMap';

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inlineStat">
      <span className="inlineStatLabel">{label}</span>
      <span className="inlineStatValue">{value}</span>
    </span>
  );
}

function HomePlayerHero() {
  const { data: home } = useHome(true);
  if (!home) return null;

  const progression = home.citizenProfile.progression;
  const progressPercent = Math.round((progression.progressToNextLevel ?? 0) * 100);
  const occupation = home.citizenProfile.unlocked.work?.value;
  const roleLine = [home.citizenProfile.levelLabel, occupation].filter(Boolean).join(' · ');

  return (
    <section className="homeDashboardHero" aria-label="Il tuo cittadino">
      <div className="composeRow composeRow--profile">
        <div className="composeRowVisual">
          <div className="composePortrait">
            <CitizenIllustration
              citizenId={home.citizenId}
              portraitId={home.portraitId}
              age={home.age}
              gender={home.gender}
              ageBand={home.citizenProfile.ageBand}
              occupation={occupation}
              size="lg"
            />
          </div>
        </div>

        <div className="composeRowContent">
          <p className="homeDashboardEyebrow">Home · {home.gameDate?.label ?? 'Oggi'}</p>
          <h1 className="homeDashboardPlayerName">{home.displayName}</h1>
          {roleLine && <p className="homeDashboardPlayerRole">{roleLine}</p>}

          <div className="inlineStats" aria-label="Statistiche principali">
            <InlineStat label="XP" value={String(progression.globalXp ?? home.globalProgression.globalXp)} />
            <InlineStat label="Saldo" value={formatEuro(home.balance.availableCash.amountMinor)} />
            <InlineStat label="Consenso" value={`${home.personalValues.reputation}%`} />
            <InlineStat label="Liv." value={String(home.level.level)} />
          </div>

          {progression.nextLevel != null && (
            <div className="homeDashboardProgress profileHeroProgressBar" aria-label="Progressione">
              <div className="homeDashboardProgressLabel">
                <span>Livello {progression.nextLevel}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="homeDashboardProgressTrack">
                <div
                  className="homeDashboardProgressFill"
                  style={{ transform: `scaleX(${Math.max(0.02, progression.progressToNextLevel ?? 0)})` }}
                />
              </div>
            </div>
          )}

          <Link to="/profilo" className="homeDashboardTextLink">
            Apri profilo completo
          </Link>
        </div>
      </div>
    </section>
  );
}

function HomeComuneInlineStats() {
  const { data: municipality } = useMunicipality();
  const { data: referenda } = useReferenda();
  const { data: home } = useHome(true);

  const votable = selectVotableReferenda(referenda?.referendums);
  const worldEvents = home?.worldEvents?.activeEvents ?? [];
  const highSeverity = worldEvents.filter(
    (event) => event.severity === 'high' || event.severity === 'critical',
  ).length;

  const inflationLabel =
    municipality?.enabled != null && municipality.enabled
      ? formatInflationLabel(municipality.inflationRateBps)
      : '—';

  const politicsLabel = formatPoliticsLabel({
    activeReferenda: votable.length,
    activeWorldEvents: worldEvents.length,
    highSeverityEvents: highSeverity,
  });

  return (
    <div className="inlineStats inlineStats--comune" aria-label="Stato del Comune">
      <InlineStat label="Economia" value={inflationLabel} />
      <InlineStat label="Bilancio" value={municipality?.enabled ? formatEuro(municipality.treasuryMinor) : '—'} />
      <InlineStat
        label="Cittadini"
        value={municipality?.enabled ? municipality.citizenCount.toLocaleString('it-IT') : '—'}
      />
      <InlineStat label="Politica" value={politicsLabel} />
    </div>
  );
}

function HomeWorkPreview() {
  const { data: work, isLoading } = useWorkJobs();
  const workState = resolveWorkDashboardState(work);

  if (isLoading) return <p className="loading">Caricamento lavoro…</p>;
  if (workState.kind === 'disabled') {
    return <p className="emptyState">Lavoro non disponibile.</p>;
  }

  let headline = 'Lavoro';
  let body = 'Consulta le offerte disponibili.';
  let ctaLabel = 'Vai al lavoro';
  let ctaTo = '/attivita?tab=lavoro';
  let asideLabel = 'Stato';
  let asideValue = 'Disponibile';
  let urgent = false;

  switch (workState.kind) {
    case 'needs_clock_in':
      headline = 'Nuovo giorno — timbra il cartellino';
      body = `${workState.title}: la giornata non è ancora iniziata.`;
      ctaLabel = 'Timbra ora';
      asideLabel = 'Azione';
      asideValue = 'Timbratura';
      urgent = true;
      break;
    case 'shift_active':
      headline = 'Turno in corso';
      body = workState.title;
      ctaLabel = 'Dettagli';
      asideLabel = 'Tempo';
      asideValue =
        workState.remainingShiftMs != null
          ? formatShiftRemaining(workState.remainingShiftMs)
          : 'In corso';
      break;
    case 'day_done':
      headline = 'Giornata terminata';
      body = `${workState.title}: riposo fino al prossimo turno.`;
      ctaLabel = 'Lavoro';
      asideLabel = 'Stato';
      asideValue = 'Chiuso';
      break;
    case 'seeking_work':
      headline = 'Non timbrato';
      body = 'Nessun impiego attivo. Esplora le offerte.';
      ctaLabel = 'Cerca lavoro';
      ctaTo = '/mercato';
      asideLabel = 'Stato';
      asideValue = 'Libero';
      break;
    case 'available':
      headline = 'Lavoro attivo';
      body = workState.title;
      asideValue = 'Assunto';
      break;
  }

  return (
    <section
      className={`composeSection composeSection--panel homeDashboardWork${urgent ? ' homeDashboardWork--urgent' : ''}`}
      aria-label="Lavoro"
    >
      <div className="composeSplit">
        <div className="composeMain">
          <h2 className="composeSectionTitle">{headline}</h2>
          <p className="composeSectionBody">{body}</p>
        </div>
        <aside className="composeAside composeAside--stats" aria-label="Stato lavoro">
          <InlineStat label={asideLabel} value={asideValue} />
          <Link to={ctaTo} className="homeDashboardTextLink homeDashboardTextLink--cta">
            {ctaLabel}
          </Link>
        </aside>
      </div>
    </section>
  );
}

function HomeTasksPreview() {
  const { data: home } = useHome(true);
  const tasks = selectPriorityTasks(home?.activeTasks, 3);

  return (
    <section className="composeSection" aria-label="Task">
      <div className="composeSectionHead">
        <h2 className="composeSectionTitle">Task</h2>
        <Link to="/attivita?tab=task" className="homeDashboardTextLink">
          Tutti
        </Link>
      </div>
      {tasks.length === 0 ? (
        <p className="composeSectionBody muted">Nessun incarico attivo.</p>
      ) : (
        <ul className="composeList">
          {tasks.map((task) => (
            <li key={task.taskInstanceId} className="composeListItem">
              <span className="composeListTitle">{task.title}</span>
              <span className="composeListMeta">{taskStatusLabel(task)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function HomeReferendumPreview() {
  const { data, isLoading } = useReferenda();
  const votable = selectVotableReferenda(data?.referendums);
  const preview = votable.slice(0, 2);

  return (
    <section className="composeSection" aria-label="Referendum">
      <div className="composeSectionHead">
        <h2 className="composeSectionTitle">Referendum</h2>
        <Link to="/gazzetta?tab=referendum" className="homeDashboardTextLink">
          {votable.length > 0 ? `${votable.length} attivi` : 'Apri'}
        </Link>
      </div>
      {isLoading && <p className="loading">Caricamento…</p>}
      {!isLoading && preview.length === 0 && (
        <p className="composeSectionBody muted">Nessun referendum attivo.</p>
      )}
      {!isLoading && preview.length > 0 && (
        <ul className="composeList">
          {preview.map((item) => (
            <li key={item.referendumId} className="composeListItem composeListItem--row">
              <FeedListIcon kind={referendumListIcon()} />
              <div className="composeListContent">
                <span className="composeListTitle">{item.question}</span>
                {item.remainingMs != null && item.remainingMs > 0 && (
                  <span className="composeListMeta">
                    {formatShiftRemaining(item.remainingMs)} rimasti
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function HomeGazzettaPreview() {
  const { data, isLoading } = useGazzetta();
  const articles = data?.enabled ? data.articles.slice(0, 2) : [];

  return (
    <section className="composeSection composeSection--panel composeSection--featured" aria-label="Gazzetta">
      <div className="composeSectionHead">
        <h2 className="composeSectionTitle">Gazzetta</h2>
        <Link to="/gazzetta" className="homeDashboardTextLink">
          Leggi tutto
        </Link>
      </div>
      {isLoading && <p className="loading">Caricamento cronaca…</p>}
      {!isLoading && articles.length === 0 && (
        <p className="composeSectionBody muted">Nessuna notizia recente.</p>
      )}
      {!isLoading && articles.length > 0 && (
        <ul className="gazzettaList">
          {articles.map((article) => (
            <li key={article.articleId}>
              <article className="gazzettaCard card">
                <div className="feedListItemRow">
                  <FeedListIcon kind={gazzettaCategoryToIcon(article.category)} />
                  <div className="feedListItemContent">
                    <div className="gazzettaCardMeta">
                      <span className="gazzettaCategory">{article.category ?? 'cronaca'}</span>
                      <time className="gazzettaTimestamp">
                        {formatGameTimeMs(article.publishedAtGameMs)}
                      </time>
                    </div>
                    <h3 className="gazzettaHeadline">{article.title}</h3>
                    <p className="gazzettaBody">{article.summary ?? article.body}</p>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function HomeEventsPreview() {
  const { data: home } = useHome(true);
  const { data: municipality } = useMunicipality();

  const worldEvents = home?.worldEvents?.enabled ? (home.worldEvents.activeEvents ?? []) : [];
  const chronicle = municipality?.recentChronicle?.slice(0, 2) ?? [];
  const hasContent = worldEvents.length > 0 || chronicle.length > 0;

  return (
    <section className="composeSection composeSection--panel" aria-label="Eventi">
      <div className="composeSectionHead">
        <h2 className="composeSectionTitle">Eventi</h2>
        <Link to="/notifiche" className="homeDashboardTextLink">
          Notifiche
        </Link>
      </div>
      {!hasContent && <p className="composeSectionBody muted">Nessun evento rilevante.</p>}
      {worldEvents.length > 0 && (
        <ul className="composeList">
          {worldEvents.slice(0, 2).map((event) => (
            <li key={event.eventId} className="composeListItem">
              <span className="composeListTitle">{event.title}</span>
              <span className="composeListMeta">{event.comuneLine ?? event.body}</span>
            </li>
          ))}
        </ul>
      )}
      {chronicle.length > 0 && (
        <ul className="composeList composeList--spaced">
          {chronicle.map((entry) => (
            <li key={entry.entryId} className="composeListItem">
              <span className="composeListTitle">{entry.title}</span>
              <span className="composeListMeta">{formatGameTimeMs(entry.recordedAtGameMs)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function HomeQuickLinks() {
  const { data: home } = useHome(true);
  const { data: marketplace } = useMarketplace();
  const { data: relazioni } = useRelazioni();

  const ownedCount =
    marketplace?.items.filter((item) => item.owned && item.possessionStatus !== 'rented').length ?? 0;
  const knownCount = countKnownRelationships(home);
  const messagesCount = relazioni?.spontaneousInbox.length ?? 0;

  return (
    <nav className="homeQuickLinks" aria-label="Approfondisci">
        <Link to="/profilo#conoscenze" className="homeQuickLink">
        <span className="homeQuickLinkLabel">Conoscenze</span>
        <span className="homeQuickLinkValue">{knownCount} persone</span>
        {messagesCount > 0 && (
          <span className="homeQuickLinkHint">{messagesCount} messaggi</span>
        )}
      </Link>
      <Link to="/mercato" className="homeQuickLink">
        <span className="homeQuickLinkLabel">Marketplace</span>
        <span className="homeQuickLinkValue">{ownedCount} posseduti</span>
      </Link>
      <Link to="/comune" className="homeQuickLink">
        <span className="homeQuickLinkLabel">Comune</span>
        <span className="homeQuickLinkValue">Panoramica</span>
      </Link>
      <Link to="/profilo" className="homeQuickLink">
        <span className="homeQuickLinkLabel">Patrimonio</span>
        <span className="homeQuickLinkValue">
          {home ? formatEuro(home.balance.availableCash.amountMinor) : '—'}
        </span>
      </Link>
    </nav>
  );
}

function HomeDashboardContent() {
  const { data: home } = useHome(true);
  const { data: work } = useWorkJobs();
  const { data: referenda } = useReferenda();
  const { data: gazzetta } = useGazzetta();
  const { data: relazioni } = useRelazioni();

  const workState = resolveWorkDashboardState(work);

  if (!home) return null;

  const votable = selectVotableReferenda(referenda?.referendums);
  const worldEvents = home.worldEvents?.activeEvents ?? [];
  const contextLine = buildHomeDashboardContextLine({
    home,
    votableReferendaCount: votable.length,
    workState,
    activeWorldEvents: worldEvents.length,
    latestGazzettaTitle: gazzetta?.articles[0]?.title,
    spontaneousMessages: relazioni?.spontaneousInbox.length ?? 0,
  });

  const showWorldAside =
    home.flash?.enabled ||
    home.flash?.expiredNotice ||
    worldEvents[0]?.comuneLine ||
    home.lifeReview?.body;

  return (
    <div className="homeDashboard">
      <HomePlayerHero />
      <HomeComuneInlineStats />

      <ComuneMessage variant="editorial" title="Situazione" className="homeDashboardContext">
        <p>{contextLine}</p>
      </ComuneMessage>

      {showWorldAside && (
        <WorldSidebar
          flash={home.flash}
          flashNotice={home.flash?.expiredNotice ?? null}
          comuneLine={worldEvents[0]?.comuneLine ?? home.lifeReview?.body ?? null}
        />
      )}

      <div className="homeDashboardBody">
        <HomeWorkPreview />

        <div className="composeSplit composeSplit--duo">
          <div className="composeMain">
            <HomeTasksPreview />
          </div>
          <div className="composeMain">
            <HomeReferendumPreview />
          </div>
        </div>

        <HomeGazzettaPreview />
        <HomeEventsPreview />
        <HomeQuickLinks />
      </div>
    </div>
  );
}

export function HomeDashboardPage() {
  return (
    <GameShell>
      <HomeDashboardContent />
    </GameShell>
  );
}
