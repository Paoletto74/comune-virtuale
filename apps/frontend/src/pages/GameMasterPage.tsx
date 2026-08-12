import { useCallback, useEffect, useState } from 'react';
import { useHome } from '@/hooks/useSession';
import { isGameAudioEnabled, playGameSound, setGameAudioEnabled } from '@/utils/gameAudio';

type AdminTimeState = {
  worldTimeMs: number;
  timeScale: number;
  paused: boolean;
};

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Admin API ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function GameMasterPage() {
  const { data: home } = useHome(true);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [timeState, setTimeState] = useState<AdminTimeState | null>(null);
  const [flashEnabled, setFlashEnabled] = useState<boolean | null>(null);
  const [audioOn, setAudioOn] = useState(isGameAudioEnabled());
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const time = await adminFetch<AdminTimeState>('/api/v1/admin/time');
      const flash = await adminFetch<{ enabled: boolean }>('/api/v1/admin/flash/config');
      setTimeState(time);
      setFlashEnabled(flash.enabled);
      setAvailable(true);
    } catch {
      setAvailable(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(label: string, action: () => Promise<unknown>) {
    setStatus(null);
    setError(null);
    try {
      await action();
      setStatus(label);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore admin');
    }
  }

  if (available === null) {
    return <p className="loading">Verifica accesso Game Master…</p>;
  }

  if (!available) {
    return (
      <div className="card">
        <h1 className="pageTitle">Game Master</h1>
        <p className="emptyState">
          Pannello non disponibile. Richiede ambiente dev con enableDevAuth attivo.
        </p>
      </div>
    );
  }

  return (
    <div className="gameMasterPanel">
      <header className="pageHeader">
        <h1 className="pageTitle">Game Master</h1>
        <p className="pageSubtitle">Controlli mondo — solo sviluppo</p>
      </header>

      <section className="card" aria-label="Game clock">
        <h2 className="cardTitle">Game clock</h2>
        {timeState && (
          <p className="gameMasterStatus">
            Tempo: <code>{timeState.worldTimeMs}</code> · Scala:{' '}
            <code>{timeState.timeScale}</code> ·{' '}
            {timeState.paused ? 'In pausa' : 'In esecuzione'}
          </p>
        )}
        <div className="gameMasterControls">
          <button
            type="button"
            className="feedButton feedButtonPrimary"
            onClick={() =>
              void runAction('Tempo avanzato di 2 ore', () =>
                adminFetch('/api/v1/admin/time/advance', {
                  method: 'POST',
                  body: JSON.stringify({ deltaMs: 2 * 60 * 60 * 1000 }),
                }),
              )
            }
          >
            +2 ore gioco
          </button>
          <button
            type="button"
            className="feedButton feedButtonOption"
            onClick={() =>
              void runAction(timeState?.paused ? 'Ripreso' : 'Pausa', () =>
                adminFetch('/api/v1/admin/time/pause', {
                  method: 'POST',
                  body: JSON.stringify({ paused: !timeState?.paused }),
                }),
              )
            }
          >
            {timeState?.paused ? 'Riprendi' : 'Pausa'}
          </button>
        </div>
      </section>

      <section className="card" aria-label="Flash">
        <h2 className="cardTitle">Flash Opportunities</h2>
        <p className="gameMasterStatus">
          Stato: {flashEnabled ? 'abilitate' : 'disabilitate'}
        </p>
        <div className="gameMasterControls">
          <button
            type="button"
            className="feedButton feedButtonPrimary"
            disabled={!home?.citizenId}
            onClick={() =>
              void runAction('Flash valutata', () =>
                adminFetch('/api/v1/admin/flash/evaluate', {
                  method: 'POST',
                  body: JSON.stringify({
                    citizenId: home!.citizenId,
                    nowMs: Date.now(),
                  }),
                }),
              )
            }
          >
            Valuta Flash ora
          </button>
          <button
            type="button"
            className="feedButton feedButtonOption"
            onClick={() =>
              void runAction('Config Flash reset', () =>
                adminFetch('/api/v1/admin/flash/config/reset', { method: 'POST' }),
              )
            }
          >
            Reset config Flash
          </button>
        </div>
      </section>

      <section className="card" aria-label="Audio">
        <h2 className="cardTitle">Audio feedback</h2>
        <div className="gameMasterControls">
          <button
            type="button"
            className="feedButton feedButtonOption"
            onClick={() => {
              const next = !audioOn;
              setAudioOn(next);
              setGameAudioEnabled(next);
              if (next) playGameSound('notification');
            }}
          >
            Audio: {audioOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </section>

      {status && <p className="taskStatus taskStatusReady">{status}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
