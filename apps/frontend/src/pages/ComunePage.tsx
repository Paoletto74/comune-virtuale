import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CitizenIllustration } from '@/components/visual/CitizenIllustration';
import { NpcIllustration } from '@/components/visual/NpcIllustration';
import { AdminCitizenEditModal } from '@/components/admin/AdminCitizenEditModal';
import { GameShell } from '@/components/game/GameShell';
import { TemporalLineChart } from '@/components/charts/TemporalLineChart';
import { SectionPanel, SectionSwitch } from '@/components/game/SectionSwitch';
import { useMunicipality, useMunicipalityCitizens, useRankings } from '@/hooks/useGameApi';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { formatEuro } from '@/utils/formatCash';
import { formatGameTimeMs } from '@/utils/formatGameTime';
import { isRealPlayerCitizenId } from '@/utils/adminHelpers';
import type { RankingEntry } from '@/api/client';

type ComuneSection = 'panoramica' | 'cittadini' | 'classifiche';

const SECTION_OPTIONS = [
  { id: 'panoramica' as const, label: 'Panoramica' },
  { id: 'cittadini' as const, label: 'Cittadini' },
  { id: 'classifiche' as const, label: 'Classifiche' },
];

function PanoramicaPanel() {
  const { data, isLoading, error } = useMunicipality();

  if (isLoading) return <p className="loading">Caricamento comune…</p>;
  if (error) return <p className="error">Impossibile caricare le informazioni del comune.</p>;
  if (!data) return null;

  if (!data.enabled) {
    return (
      <p className="emptyState">
        Panoramica comunale non disponibile. Applica la migration del database per abilitarla.
      </p>
    );
  }

  const inflationPercent = (data.inflationRateBps / 100).toFixed(1);
  const priceIndexPercent = data.priceIndexBps != null ? (data.priceIndexBps / 100).toFixed(1) : null;

  return (
    <div className="comuneOverview">
      <section className="card comuneInfoCard" aria-label="Informazioni comune">
        <h2 className="cardTitle">Comune Virtuale</h2>
        <dl className="profileDl">
          <div className="profileDlRow">
            <dt>Cittadini</dt>
            <dd>{data.citizenCount.toLocaleString('it-IT')}</dd>
          </div>
          <div className="profileDlRow">
            <dt>Inflazione</dt>
            <dd>{inflationPercent}%</dd>
          </div>
          {priceIndexPercent != null && (
            <div className="profileDlRow">
              <dt>Indice prezzi</dt>
              <dd>{priceIndexPercent}%</dd>
            </div>
          )}
          <div className="profileDlRow">
            <dt>Cassa comunale</dt>
            <dd>{formatEuro(data.treasuryMinor)}</dd>
          </div>
          <div className="profileDlRow">
            <dt>Aggiornato</dt>
            <dd>{formatGameTimeMs(data.updatedAtGameMs)}</dd>
          </div>
        </dl>
      </section>

      <section className="card" aria-label="Andamento inflazione">
        <h2 className="cardTitle">Inflazione</h2>
        <TemporalLineChart
          title="Evoluzione inflazione"
          ariaLabel="Grafico evoluzione inflazione comunale"
          currentGameTimeMs={data.updatedAtGameMs}
          points={(data.inflationHistory ?? []).map((snapshot) => ({
            recordedAtGameMs: snapshot.recordedAtGameMs,
            value: snapshot.inflationRateBps / 100,
          }))}
          formatValue={(value) => `${value.toFixed(1)}%`}
          formatTime={formatGameTimeMs}
          emptyMessage="Storico inflazione non ancora disponibile."
        />
      </section>
    </div>
  );
}

function CittadiniPanel() {
  const { data, isLoading, error } = useMunicipalityCitizens();
  const isAdmin = useIsAdmin();
  const [editCitizenId, setEditCitizenId] = useState<string | null>(null);

  if (isLoading) return <p className="loading">Caricamento cittadini…</p>;
  if (error) return <p className="error">Impossibile caricare l'elenco cittadini.</p>;
  if (data && !data.enabled) {
    return <p className="emptyState">Elenco cittadini non disponibile.</p>;
  }

  const citizens = data?.citizens ?? [];

  if (citizens.length === 0) {
    return <p className="emptyState">Nessun cittadino visibile.</p>;
  }

  return (
    <>
      <ul className="citizenList" aria-label="Elenco cittadini">
        {citizens.map((citizen) => {
          const isNpc = citizen.kind === 'npc' || !isRealPlayerCitizenId(citizen.citizenId);
          return (
            <li key={citizen.citizenId} className="citizenListItem">
              <div className="citizenListRow">
                <Link
                  to={`/profilo/${citizen.citizenId}`}
                  className="citizenListAvatarLink"
                  aria-label={`Profilo di ${citizen.displayName}`}
                >
                  {isNpc ? (
                    <NpcIllustration
                      npcId={citizen.templateId ?? citizen.citizenId}
                      displayName={citizen.displayName}
                      size="md"
                      assignedPortraitId={citizen.portraitId}
                    />
                  ) : (
                    <CitizenIllustration
                      citizenId={citizen.citizenId}
                      portraitId={citizen.portraitId}
                      size="md"
                    />
                  )}
                </Link>
                <div className="citizenListBand card">
                  <Link to={`/profilo/${citizen.citizenId}`} className="citizenListLink">
                    <span className="citizenListName">{citizen.displayName}</span>
                    <span className="citizenListLevel">Livello {citizen.level}</span>
                  </Link>
                  {isAdmin && isRealPlayerCitizenId(citizen.citizenId) && (
                    <button
                      type="button"
                      className="feedButton feedButtonOption citizenListAdminBtn"
                      onClick={() => setEditCitizenId(citizen.citizenId)}
                    >
                      Modifica
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {editCitizenId && (
        <AdminCitizenEditModal citizenId={editCitizenId} onClose={() => setEditCitizenId(null)} />
      )}
    </>
  );
}

function RankingTable({ title, entries }: { title: string; entries: RankingEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="card" aria-label={title}>
      <h2 className="cardTitle">{title}</h2>
      <table className="rankingTable">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Cittadino</th>
            <th scope="col">Punteggio</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={`${title}-${entry.citizenId}`}>
              <td>{entry.rank}</td>
              <td>
                <Link to={`/profilo/${entry.citizenId}`}>{entry.displayName}</Link>
              </td>
              <td>{entry.value.toLocaleString('it-IT')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function RankingPanel() {
  const { data, isLoading, error } = useRankings();

  if (isLoading) return <p className="loading">Caricamento classifiche…</p>;
  if (error) return <p className="error">Impossibile caricare le classifiche.</p>;
  if (data && !data.enabled) {
    return <p className="emptyState">Classifiche non disponibili.</p>;
  }

  if (!data) return null;

  const hasAny =
    data.wealth.length +
      data.poverty.length +
      data.sympathy.length +
      data.reputation.length >
    0;

  if (!hasAny) {
    return <p className="emptyState">Classifica non disponibile.</p>;
  }

  return (
    <div className="comuneRankings">
      <RankingTable title="Ricchezza" entries={data.wealth} />
      <RankingTable title="Povertà" entries={data.poverty} />
      <RankingTable title="Simpatia" entries={data.sympathy} />
      <RankingTable title="Reputazione" entries={data.reputation} />
    </div>
  );
}

export function ComunePage() {
  const [section, setSection] = useState<ComuneSection>('panoramica');

  return (
    <GameShell>
      <header className="pageHeader">
        <h1 className="pageTitle">Comune</h1>
        <p className="pageSubtitle">Panoramica, cittadini e classifiche</p>
      </header>

      <SectionSwitch
        options={SECTION_OPTIONS}
        value={section}
        onChange={setSection}
        ariaLabel="Sezione comune"
      />

      {section === 'panoramica' && (
        <SectionPanel id="section-panel-panoramica" labelledBy="section-tab-panoramica">
          <PanoramicaPanel />
        </SectionPanel>
      )}

      {section === 'cittadini' && (
        <SectionPanel id="section-panel-cittadini" labelledBy="section-tab-cittadini">
          <CittadiniPanel />
        </SectionPanel>
      )}

      {section === 'classifiche' && (
        <SectionPanel id="section-panel-classifiche" labelledBy="section-tab-classifiche">
          <RankingPanel />
        </SectionPanel>
      )}
    </GameShell>
  );
}
