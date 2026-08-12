import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, api } from '@/api/client';
import { NpcPortraitPicker } from '@/components/admin/NpcPortraitPicker';
import { NpcIllustration } from '@/components/visual/NpcIllustration';
import { resolveErrorMessage } from '@/utils/errorCopy';

export function AdminNpcPortraitPanel() {
  const queryClient = useQueryClient();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'npcs'],
    queryFn: () => api.adminListNpcs(),
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [draftPortraitId, setDraftPortraitId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const savePortrait = useMutation({
    mutationFn: (input: { templateId: string; portraitId: string }) =>
      api.adminSetNpcPortrait(input.templateId, input.portraitId),
    onSuccess: async (response) => {
      setActionError(null);
      setSelectedTemplateId(null);
      setDraftPortraitId(null);

      queryClient.setQueryData(
        ['admin', 'npcs'],
        (current: Awaited<ReturnType<typeof api.adminListNpcs>> | undefined) => {
          if (!current) return current;
          return {
            ...current,
            npcs: current.npcs.map((npc) =>
              npc.templateId === response.npc.templateId ? response.npc : npc,
            ),
          };
        },
      );

      await queryClient.invalidateQueries({ queryKey: ['municipality', 'citizens'] });
    },
    onError: (err) => {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Salvataggio non riuscito',
      );
    },
  });

  const selectedNpc = data?.npcs.find((npc) => npc.templateId === selectedTemplateId) ?? null;
  const modalOpen = Boolean(selectedNpc && draftPortraitId);

  const closeModal = useCallback(() => {
    if (savePortrait.isPending) return;
    setSelectedTemplateId(null);
    setDraftPortraitId(null);
    setActionError(null);
  }, [savePortrait.isPending]);

  useEffect(() => {
    if (!modalOpen) return;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeModal();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, closeModal]);

  return (
    <>
      <section className="profileSection card adminToolsSection" aria-label="Gestione NPC">
        <h2 className="cardTitle profileSectionTitleCompact">Gestione NPC</h2>
        <p className="muted adminToolsHint">
          Assegna un ritratto dal pool condiviso. Le immagini vanno in <code>/npc-portraits/</code>.
        </p>

        {isLoading && <p className="loading">Caricamento NPC…</p>}
        {error && <p className="error">Impossibile caricare gli NPC.</p>}

        {!isLoading && !error && data && (
          <ul className="adminNpcList">
            {data.npcs.map((npc) => (
              <li key={npc.templateId} className="adminNpcListItem">
                <div className="adminNpcListMain">
                  <NpcIllustration
                    key={`${npc.templateId}:${npc.portraitId ?? ''}`}
                    npcId={npc.templateId}
                    displayName={npc.displayName}
                    size="sm"
                    assignedPortraitId={npc.portraitId}
                  />
                  <div>
                    <strong>{npc.displayName}</strong>
                    <span className="muted adminNpcMeta">
                      {npc.templateId}
                      {npc.occupation ? ` · ${npc.occupation}` : ''}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="feedButton feedButtonOption adminNpcPortraitBtn"
                  onClick={() => {
                    setSelectedTemplateId(npc.templateId);
                    setDraftPortraitId(npc.portraitId ?? 'npc_001');
                    setActionError(null);
                  }}
                >
                  Cambia ritratto
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalOpen && selectedNpc && draftPortraitId && (
        <div className="manualModalBackdrop" role="presentation" onClick={closeModal}>
          <div
            className="manualModal npcPortraitModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="npc-portrait-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="manualModalHeader">
              <h2 id="npc-portrait-modal-title" className="manualModalTitle">
                Ritratto per {selectedNpc.displayName}
              </h2>
              <button
                ref={closeRef}
                type="button"
                className="manualModalClose"
                aria-label="Chiudi"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <div className="manualModalBody npcPortraitModalBody">
              <NpcPortraitPicker
                selectedPortraitId={draftPortraitId}
                onSelect={setDraftPortraitId}
                title="Scegli ritratto NPC"
              />
              {actionError && <p className="error">{actionError}</p>}
            </div>
            <div className="npcPortraitModalFooter avatarPickerActions">
              <button
                type="button"
                className="feedButton feedButtonOption"
                disabled={savePortrait.isPending}
                onClick={closeModal}
              >
                Annulla
              </button>
              <button
                type="button"
                className="buttonPrimary"
                disabled={savePortrait.isPending}
                onClick={() =>
                  savePortrait.mutate({
                    templateId: selectedNpc.templateId,
                    portraitId: draftPortraitId,
                  })
                }
              >
                {savePortrait.isPending ? 'Salvataggio…' : 'Salva ritratto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
