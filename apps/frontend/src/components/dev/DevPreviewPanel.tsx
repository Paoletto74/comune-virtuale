import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, api } from '@/api/client';
import { randomUUID } from '@/api/uuid';
import { resolveErrorMessage } from '@/utils/errorCopy';

export const PREVIEW_DEMO_ACCOUNT_ID = 'preview-demo';

const PREVIEW_CITIZEN = {
  displayName: 'Cittadino Preview',
  gender: 'male',
  age: 34,
} as const;

export function DevPreviewPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [devAccountId, setDevAccountId] = useState(PREVIEW_DEMO_ACCOUNT_ID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enterPreview(withBootstrap: boolean) {
    setLoading(true);
    setError(null);
    try {
      const login = await api.devLogin(devAccountId.trim());
      if (login.needsCitizenCreation) {
        await api.createCitizen(PREVIEW_CITIZEN, randomUUID());
      }
      if (withBootstrap) {
        await api.previewBootstrap(randomUUID());
      }
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({ queryKey: ['home'] });
      navigate(login.needsCitizenCreation || withBootstrap ? '/gazzetta' : '/gazzetta', { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Accesso preview non riuscito.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="devPreviewPanel" aria-label="Modalità preview locale">
      <p className="devPreviewLabel">Preview locale (solo development)</p>
      <label className="devPreviewField">
        <span>Account dev</span>
        <input
          type="text"
          value={devAccountId}
          onChange={(event) => setDevAccountId(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <div className="devPreviewActions">
        <button
          type="button"
          className="buttonSecondary devPreviewButton"
          disabled={loading || !devAccountId.trim()}
          onClick={() => void enterPreview(true)}
        >
          {loading ? '…' : 'Entra in preview demo'}
        </button>
        <button
          type="button"
          className="devPreviewLinkButton"
          disabled={loading || !devAccountId.trim()}
          onClick={() => void enterPreview(false)}
        >
          Solo login dev
        </button>
      </div>
      <p className="devPreviewHint">
        La preview demo crea un cittadino con attributi, carriera, NPC, relazioni, gruppi e task MEGA 1/2.
      </p>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export function isDevPreviewEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_AUTH !== 'false';
}

/** Dev preview panel in normal UI — opt-in only via VITE_SHOW_DEV_UI=true. */
export function isDevUiVisible(): boolean {
  return import.meta.env.VITE_SHOW_DEV_UI === 'true';
}
