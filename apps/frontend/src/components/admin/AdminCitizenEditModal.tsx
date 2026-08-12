import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ApiError, api, type AdminCitizenEditable } from '@/api/client';
import { resolveErrorMessage } from '@/utils/errorCopy';

interface AdminCitizenEditModalProps {
  citizenId: string;
  onClose: () => void;
}

export function AdminCitizenEditModal({ citizenId, onClose }: AdminCitizenEditModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminCitizenEditable | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    api
      .adminGetCitizen(citizenId)
      .then((response) => {
        if (!cancelled) setForm(response.citizen);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Caricamento non riuscito',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [citizenId]);

  const save = useMutation({
    mutationFn: () =>
      api.adminPatchCitizen(citizenId, {
        displayName: form?.displayName,
        mainLevel: form?.mainLevel,
        sympathy: form?.sympathy,
        reputation: form?.reputation,
        happiness: form?.happiness,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['municipalityCitizens'] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      onClose();
    },
    onError: (err) => {
      setSaveError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Salvataggio non riuscito',
      );
    },
  });

  return (
    <div className="manualModalBackdrop" role="presentation" onClick={onClose}>
      <div
        className="manualModal adminCitizenEditModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-citizen-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="manualModalHeader">
          <h2 id="admin-citizen-edit-title" className="manualModalTitle">
            Modifica cittadino
          </h2>
          <button type="button" className="manualModalClose" aria-label="Chiudi" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="manualModalBody">
          {loadError && <p className="error">{loadError}</p>}
          {!form && !loadError && <p className="loading">Caricamento…</p>}
          {form && (
            <div className="adminCitizenEditForm">
              <label className="adminFormField">
                <span>Nome</span>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(event) => setForm({ ...form, displayName: event.target.value })}
                />
              </label>
              <label className="adminFormField">
                <span>Livello</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.mainLevel}
                  onChange={(event) =>
                    setForm({ ...form, mainLevel: Number.parseInt(event.target.value, 10) || 1 })
                  }
                />
              </label>
              <label className="adminFormField">
                <span>Simpatia</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.sympathy}
                  onChange={(event) =>
                    setForm({ ...form, sympathy: Number.parseInt(event.target.value, 10) || 0 })
                  }
                />
              </label>
              <label className="adminFormField">
                <span>Reputazione</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.reputation}
                  onChange={(event) =>
                    setForm({ ...form, reputation: Number.parseInt(event.target.value, 10) || 0 })
                  }
                />
              </label>
              <label className="adminFormField">
                <span>Felicità</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.happiness}
                  onChange={(event) =>
                    setForm({ ...form, happiness: Number.parseInt(event.target.value, 10) || 0 })
                  }
                />
              </label>
            </div>
          )}
          {saveError && <p className="error">{saveError}</p>}
          <div className="avatarPickerActions">
            <button type="button" className="feedButton feedButtonOption" onClick={onClose}>
              Annulla
            </button>
            <button
              type="button"
              className="buttonPrimary"
              disabled={!form || save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? 'Salvataggio…' : 'Salva modifiche'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
