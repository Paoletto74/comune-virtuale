import { useQuery } from '@tanstack/react-query';
import { GameShell } from '@/components/game/GameShell';
import { apiFetch } from '@/api/client';

interface AssetStatusResponse {
  summary: {
    total: number;
    present: number;
    missing: number;
    error: number;
    categories: Record<string, { present: number; missing: number }>;
  };
  assets: Array<{
    assetKey: string;
    category: string;
    filename: string;
    aspect: string;
    recommendedPx?: { width: number; height: number };
    label?: string;
    presence: 'present' | 'missing' | 'error';
    resolvedUrl?: string;
    timePhased?: boolean;
    phaseVariants?: Record<string, { presence: string; url?: string }>;
    resolved: { primaryUrl: string; timePhased?: boolean };
  }>;
}

export function DevAssetStatusPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dev', 'asset-status'],
    queryFn: () => apiFetch<AssetStatusResponse>('/api/v1/dev/asset-status'),
    staleTime: 30_000,
  });

  return (
    <GameShell>
      <header className="pageHeader">
        <h1 className="pageTitle">Dev — Asset Status</h1>
        <p className="pageSubtitle muted">MEGA 4/4 catalog vs filesystem (development only)</p>
      </header>

      {isLoading && <p className="muted">Scansione catalogo…</p>}
      {error && <p className="errorText">Impossibile caricare lo stato asset.</p>}

      {data && (
        <>
          <section className="card assetStatusSummary">
            <div className="assetStatusSummaryGrid">
              <div>
                <span className="assetStatusMetricLabel">Catalogo</span>
                <strong className="assetStatusMetricValue">{data.summary.total}</strong>
              </div>
              <div>
                <span className="assetStatusMetricLabel assetStatusMetricLabel--present">Presenti</span>
                <strong className="assetStatusMetricValue assetStatusMetricValue--present">
                  {data.summary.present}
                </strong>
              </div>
              <div>
                <span className="assetStatusMetricLabel assetStatusMetricLabel--missing">Mancanti</span>
                <strong className="assetStatusMetricValue assetStatusMetricValue--missing">
                  {data.summary.missing}
                </strong>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="sectionTitle">Per categoria</h2>
            <ul className="assetStatusCategoryList">
              {Object.entries(data.summary.categories).map(([category, stats]) => (
                <li key={category}>
                  <span className="assetStatusCategoryName">{category}</span>
                  <span className="assetStatusCategoryStats">
                    {stats.present}/{stats.present + stats.missing}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2 className="sectionTitle">Dettaglio</h2>
            <div className="assetStatusTableWrap">
              <table className="assetStatusTable">
                <thead>
                  <tr>
                    <th>Stato</th>
                    <th>Chiave</th>
                    <th>File atteso</th>
                    <th>Fasi</th>
                    <th>Aspect</th>
                    <th>Export</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assets.map((row) => (
                    <tr key={row.assetKey} className={`assetStatusRow--${row.presence}`}>
                      <td>
                        <span className={`assetStatusBadge assetStatusBadge--${row.presence}`}>
                          {row.presence === 'present'
                            ? 'PRESENTE'
                            : row.presence === 'error'
                              ? 'ERROR'
                              : 'MANCANTE'}
                        </span>
                      </td>
                      <td>{row.assetKey}</td>
                      <td className="assetStatusMono">{row.resolved.primaryUrl}</td>
                      <td className="assetStatusMono">
                        {row.timePhased || row.resolved.timePhased
                          ? Object.entries(row.phaseVariants ?? {})
                              .map(([phase, status]) => `${phase}:${status.presence === 'present' ? '✓' : '—'}`)
                              .join(' ')
                          : '—'}
                      </td>
                      <td>{row.aspect}</td>
                      <td className="assetStatusMono">
                        {row.recommendedPx
                          ? `${row.recommendedPx.width}×${row.recommendedPx.height}`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </GameShell>
  );
}
