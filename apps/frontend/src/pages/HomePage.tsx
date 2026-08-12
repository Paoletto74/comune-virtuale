import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export function HomePage() {
  const health = useQuery({ queryKey: ['health'], queryFn: api.health });
  const time = useQuery({ queryKey: ['time'], queryFn: api.time, refetchInterval: 5000 });

  return (
    <div>
      <article className="card">
        <h2 className="cardTitle">Benvenuto</h2>
        <p>Frontend UNTRUSTED — presentation only. Phase 1 Foundation.</p>
      </article>

      <article className="card">
        <h2 className="cardTitle">Sistema</h2>
        {health.isLoading && <p className="loading">Verifica in corso...</p>}
        {health.error && <p className="error">Backend non raggiungibile</p>}
        {health.data && (
          <p className="mono">
            Status: {health.data.status} · correlation: {health.data.correlationId}
          </p>
        )}
      </article>

      <article className="card">
        <h2 className="cardTitle">Game Time</h2>
        {time.isLoading && <p className="loading">Caricamento...</p>}
        {time.data && (
          <p className="mono">
            worldTimeMs: {time.data.worldTimeMs} · scale: {time.data.timeScale}
          </p>
        )}
      </article>
    </div>
  );
}
