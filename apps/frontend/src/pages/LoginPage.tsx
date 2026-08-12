import { DevPreviewPanel, isDevUiVisible } from '@/components/dev/DevPreviewPanel';
import { LoginOpeningBackground } from '@/components/visual/LoginOpeningBackground';
import { LoginOpeningLogo } from '@/components/visual/LoginOpeningLogo';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const OFFICIAL_MOTTO = `Diventa quello che vuoi.
Se sei abbastanza bravo nel tuo percorso, puoi arrivare al livello massimo.`;

const LOGIN_QUERY_ERRORS: Record<string, string> = {
  google_not_configured:
    'Accesso Google non configurato. Il Comune non ha finito la burocrazia. Contatta l’amministratore.',
  google_auth_failed: 'Accesso Google fallito. Riprova — il Comune non giudica, almeno non subito.',
};

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const queryError = searchParams.get('error');
    if (queryError) {
      setError(LOGIN_QUERY_ERRORS[queryError] ?? 'Accesso non riuscito. Riprova.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function handleGoogleLogin() {
    window.location.href = '/api/v1/auth/google';
  }

  return (
    <section className="loginEntrance" aria-label="Ingresso al Comune Virtuale">
      <LoginOpeningBackground />
      <div className="loginEntranceContent">
        <LoginOpeningLogo />
        <p className="loginEntranceMotto">{OFFICIAL_MOTTO}</p>
        <p className="loginEntranceTagline">
          Qui si lavora, si spende, si vota e si finge di sorridere. Il Comune osserva. Sempre.
        </p>

        <div className="card loginEntranceCard">
          <button type="button" className="buttonSecondary loginGoogleButton" onClick={handleGoogleLogin}>
            Accedi con Google
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        {isDevUiVisible() && <DevPreviewPanel />}
      </div>
    </section>
  );
}

export { OFFICIAL_MOTTO };
