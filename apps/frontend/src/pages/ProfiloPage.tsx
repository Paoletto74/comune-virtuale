import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GameShell } from '@/components/game/GameShell';
import { TemporalLineChart } from '@/components/charts/TemporalLineChart';
import { ProfileConoscenzeSection } from '@/components/profile/ProfileConoscenzeSection';
import { ProfilePersonalValuesAside } from '@/components/profile/ProfilePersonalValuesAside';
import { CitizenProfileDimensions } from '@/components/CitizenProfileDimensions';
import { AvatarPicker } from '@/components/visual/AvatarPicker';
import { CitizenIllustration } from '@/components/visual/CitizenIllustration';
import { useProfileDetail } from '@/hooks/useGameApi';
import { useHome } from '@/hooks/useSession';
import { AnimatedBalance } from '@/components/visual/AnimatedBalance';
import { formatEuro } from '@/utils/formatCash';
import { formatGameTimeMs } from '@/utils/formatGameTime';
import { formatMonthlySalary, formatShiftRemaining } from '@/utils/formatWork';
import { ApiError, api } from '@/api/client';
import { randomUUID } from '@/api/uuid';
import { resolveErrorMessage } from '@/utils/errorCopy';
import { portraitIdFromSlot } from '@/utils/citizenPortrait';
import {
  canListInventoryItemForRent,
  canListInventoryItemForSale,
  inventoryListingBlockReason,
} from '@/utils/marketplaceHelpers';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AdminNpcPortraitPanel } from '@/components/admin/AdminNpcPortraitPanel';
import { AdminCitizenEditModal } from '@/components/admin/AdminCitizenEditModal';
import { ProgressionCareerBlock } from '@/components/ProgressionCareerBlock';
import { EMPTY_CAREER_VIEW, EMPTY_GLOBAL_PROGRESSION } from '@/utils/progressionView';
import { isRealPlayerCitizenId } from '@/utils/adminHelpers';

function formatPriceIndexBps(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`;
}

function formatInflationBps(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`;
}

function employmentWorkSummary(data: NonNullable<ReturnType<typeof useProfileDetail>['data']>) {
  if (data.employment?.employmentState === 'employed' && data.employment.jobTitle) {
    const parts = [data.employment.jobTitle];
    if (data.employment.employer) {
      parts.push(data.employment.employer);
    }
    return parts.join(' · ');
  }
  return data.citizenProfile.unlocked.work?.value ?? null;
}

function employmentWorkDetail(data: NonNullable<ReturnType<typeof useProfileDetail>['data']>) {
  const employment = data.employment;
  if (!employment || employment.employmentState !== 'employed') {
    return null;
  }

  const details: string[] = [];
  if (employment.salaryHintMinor) {
    details.push(formatMonthlySalary(employment.salaryHintMinor));
  }
  if (employment.engagementStatus === 'shift_active') {
    const shift =
      employment.remainingShiftMs != null
        ? `Turno in corso · ${formatShiftRemaining(employment.remainingShiftMs)}`
        : 'Turno in corso';
    details.push(shift);
  } else if (employment.engagementStatus === 'blocked_today') {
    details.push('Bloccato fino a fine giornata');
  } else if (employment.engagementStatus === 'hired') {
    details.push('Pronto per timbrare in Attività → Lavoro');
  }
  return details.length > 0 ? details.join(' · ') : null;
}

export function ProfiloPage() {
  const { citizenId: routeCitizenId } = useParams<{ citizenId?: string }>();
  const { data, isLoading, error } = useProfileDetail(routeCitizenId);
  const { data: home } = useHome(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isOwnProfile = !routeCitizenId || routeCitizenId === home?.citizenId;
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmationStep, setDeleteConfirmationStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPortraitId, setSelectedPortraitId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [adminEditOpen, setAdminEditOpen] = useState(false);
  const isAdmin = useIsAdmin();

  const listItem = useMutation({
    mutationFn: (input: { itemId: string; listingType?: 'sale' | 'rent' }) =>
      api.marketplaceCreateListing(input.itemId, input.listingType, randomUUID()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });

  const updatePortrait = useMutation({
    mutationFn: (portraitId: string) => api.updateProfilePortrait(portraitId, randomUUID()),
    onSuccess: async () => {
      setAvatarPickerOpen(false);
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['home'] });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Impossibile aggiornare l\'avatar',
      );
    },
  });

  const deleteAccount = useMutation({
    mutationFn: () => api.deleteAccount(),
    onSuccess: async () => {
      setDeleteConfirmOpen(false);
      setDeleteConfirmationStep(1);
      setActionError(null);
      await queryClient.clear();
      navigate('/create-citizen', { replace: true });
    },
    onError: (err) => {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Impossibile cancellare l\'account',
      );
    },
  });

  function openDeleteDialog() {
    setActionError(null);
    setDeleteConfirmationStep(1);
    setDeleteConfirmOpen(true);
  }

  function closeDeleteDialog() {
    if (deleteAccount.isPending) return;
    setDeleteConfirmOpen(false);
    setDeleteConfirmationStep(1);
    setActionError(null);
  }

  function advanceDeleteConfirmation() {
    if (deleteConfirmationStep < 4) {
      setDeleteConfirmationStep((step) => (step + 1) as 1 | 2 | 3 | 4);
      return;
    }
    deleteAccount.mutate();
  }

  const latestSnapshot = data?.patrimonioSnapshots?.[data.patrimonioSnapshots.length - 1];
  const netWorthMinor = latestSnapshot?.netWorthMinor;
  const progression = data?.citizenProfile.progression;
  const globalProgression = data?.globalProgression ?? home?.globalProgression ?? EMPTY_GLOBAL_PROGRESSION;
  const career = data?.career ?? home?.career ?? EMPTY_CAREER_VIEW;
  const progressPercent =
    progression?.progressToNextLevel != null
      ? Math.round(progression.progressToNextLevel * 100)
      : null;
  const workSummary = data ? employmentWorkSummary(data) : null;
  const workDetail = data ? employmentWorkDetail(data) : null;
  const livingValue = data?.citizenProfile.unlocked.living?.value;
  const personalIdentity = data?.citizenProfile.unlocked.personal?.value;
  const hasLockedDimensions = (data?.citizenProfile.locked.length ?? 0) > 0;
  const showWorkEmpty = !workSummary && data?.employment?.employmentState !== 'employed';
  const hasLifeSection = Boolean(workSummary || showWorkEmpty || livingValue || personalIdentity);

  return (
    <GameShell>
      <header className="pageHeader">
        <h1 className="pageTitle">Profilo</h1>
        <p className="pageSubtitle">
          {isOwnProfile ? 'Il tuo cittadino nel Comune' : 'Profilo cittadino del Comune'}
        </p>
      </header>

      {isLoading && <p className="loading">Il Comune sta recuperando il tuo fascicolo…</p>}
      {error && <p className="error">Impossibile caricare il profilo. Il Comune nega responsabilità.</p>}

      {!isLoading && !error && data && (
        <div className="profileDetail">
          <section className="profileBlock profileBlock--hero profileHero" aria-label="Riepilogo cittadino">
            <div className="profileHeroLayout">
              <div className="profileHeroAside">
                <div className="profileHeroAvatar">
                  <CitizenIllustration
                    citizenId={data.citizenId}
                    portraitId={data.portraitId}
                    age={data.age}
                    occupation={data.citizenProfile.unlocked.work?.value}
                    size="lg"
                  />
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    className="feedButton feedButtonOption profileChangePhotoBtn"
                    onClick={() => {
                      setSelectedPortraitId(data.portraitId ?? portraitIdFromSlot(1));
                      setActionError(null);
                      setAvatarPickerOpen(true);
                    }}
                  >
                    Cambia foto
                  </button>
                )}
                <ProfilePersonalValuesAside personalValues={data.personalValues} />
              </div>

              <div className="profileHeroBody">
                <header className="profileHeroIdentity">
                  <h2 className="profileHeroName">{data.displayName}</h2>
                  <p className="profileHeroMeta">
                    {data.age > 0 ? `${data.age} anni` : ''}
                  </p>
                  <ProgressionCareerBlock
                    globalProgression={globalProgression}
                    career={career}
                    progressPercent={progressPercent}
                  />
                </header>

                {data.citizenProfile.progression.label && (
                  <p className="profileHeroStatus">{data.citizenProfile.progression.label}</p>
                )}

                {hasLifeSection && (
                  <div className="profileHeroLife">
                    {workSummary ? (
                      <div className="profileHeroLifeItem">
                        <span className="profileHeroFieldLabel">
                          {data.citizenProfile.unlocked.work?.label ?? 'Lavoro'}
                        </span>
                        <span className="profileHeroFieldValue">{workSummary}</span>
                        {workDetail && (
                          <span className="profileHeroFieldDetail">{workDetail}</span>
                        )}
                      </div>
                    ) : showWorkEmpty ? (
                      <div className="profileHeroLifeItem profileHeroLifeItem--empty">
                        <span className="profileHeroFieldLabel">Lavoro</span>
                        <span className="profileHeroFieldValue muted">Nessun lavoro attivo</span>
                      </div>
                    ) : null}

                    {livingValue && (
                      <div className="profileHeroLifeItem">
                        <span className="profileHeroFieldLabel">
                          {data.citizenProfile.unlocked.living?.label ?? 'Abitazione'}
                        </span>
                        <span className="profileHeroFieldValue">{livingValue}</span>
                      </div>
                    )}

                    {personalIdentity && (
                      <div className="profileHeroLifeItem">
                        <span className="profileHeroFieldLabel">
                          {data.citizenProfile.unlocked.personal?.label ?? 'Vita personale'}
                        </span>
                        <span className="profileHeroFieldValue">{personalIdentity}</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </section>

          {isOwnProfile && (
            <section className="profileBlock profileBlock--primary" aria-label="Economia personale">
              <h2 className="profileBlockTitle profileBlockTitle--accent">Economia</h2>
              <div className="profileEconomyGrid">
                <div className="profileEconomyStat">
                  <span className="profileEconomyLabel">Liquidità</span>
                  <span className="profileEconomyValue profileEconomyValue--accent">
                    <AnimatedBalance amountMinor={data.balance.availableCash.amountMinor} />
                  </span>
                </div>
                {netWorthMinor && (
                  <div className="profileEconomyStat">
                    <span className="profileEconomyLabel">Patrimonio netto</span>
                    <span className="profileEconomyValue profileEconomyValue--accent">
                      {formatEuro(netWorthMinor)}
                    </span>
                  </div>
                )}
                {data.economicOverview && (
                  <>
                    <div className="profileEconomyStat">
                      <span className="profileEconomyLabel">Potere d&apos;acquisto</span>
                      <span className="profileEconomyValue">
                        {data.economicOverview.purchasingPowerIndex} · {data.economicOverview.purchasingPowerLabel}
                      </span>
                    </div>
                    <div className="profileEconomyStat">
                      <span className="profileEconomyLabel">Indice prezzi</span>
                      <span className="profileEconomyValue">
                        {formatPriceIndexBps(data.economicOverview.priceIndexBps)}
                      </span>
                    </div>
                    <div className="profileEconomyStat">
                      <span className="profileEconomyLabel">Inflazione</span>
                      <span className="profileEconomyValue">
                        {formatInflationBps(data.economicOverview.inflationRateBps)}
                      </span>
                    </div>
                    <div className="profileEconomyStat">
                      <span className="profileEconomyLabel">Flusso mensile netto</span>
                      <span className="profileEconomyValue">
                        {formatEuro(data.economicOverview.netRecurringMinor)}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {data.economicOverview && (
                <ul className="profileRecurringFlows">
                  {data.economicOverview.recurringFlows.map((flow) => (
                    <li key={flow.flowId} className="profileRecurringFlowItem">
                      <span>{flow.label}</span>
                      <span className={flow.direction === 'income' ? 'positive' : 'negative'}>
                        {flow.direction === 'income' ? '+' : '−'}
                        {formatEuro(flow.amountMinorPerMonth)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {isOwnProfile && (
            <section className="profileBlock profileBlock--secondary profileChartSection" aria-label="Andamento patrimonio">
              <TemporalLineChart
                title="Evoluzione patrimonio"
                ariaLabel="Grafico evoluzione patrimonio netto"
                currentGameTimeMs={home?.gameTime.worldTimeMs ?? data.patrimonioSnapshots.at(-1)?.recordedAtGameMs ?? 0}
                points={data.patrimonioSnapshots.map((snapshot) => ({
                  recordedAtGameMs: snapshot.recordedAtGameMs,
                  value: Number(snapshot.netWorthMinor),
                }))}
                formatValue={(value) => formatEuro(String(Math.round(value)))}
                formatTime={formatGameTimeMs}
                emptyMessage="Storico patrimonio non ancora disponibile."
              />
            </section>
          )}

          {isOwnProfile && data.inventory.length > 0 && (
            <section className="profileBlock profileBlock--secondary" aria-label="Inventario">
              <h2 className="profileBlockTitle profileBlockTitle--sm">Inventario</h2>
              <ul className="profileInventoryList">
                {data.inventory.map((item) => {
                  const canSell = canListInventoryItemForSale(item);
                  const canRent = canListInventoryItemForRent(item);
                  const blockReason = inventoryListingBlockReason(item);
                  const inventoryKey = `${item.itemId}:${item.possessionStatus ?? 'owned'}`;

                  return (
                    <li key={inventoryKey} className="profileInventoryItem">
                      <div className="profileInventoryItemMain">
                        <strong>{item.name}</strong>
                        <span className="muted">
                          {item.category}
                          {item.currentValueMinor
                            ? ` · valore ${formatEuro(item.currentValueMinor)}`
                            : ` · ${formatEuro(item.priceMinor)}`}
                          {item.purchasePriceMinor && item.currentValueMinor &&
                            item.purchasePriceMinor !== item.currentValueMinor && (
                              <> · acquisto {formatEuro(item.purchasePriceMinor)}</>
                            )}
                        </span>
                        {blockReason && (
                          <span className="profileInventoryHint muted">{blockReason}</span>
                        )}
                      </div>
                      {(canSell || canRent) && (
                        <div className="profileInventoryActions">
                          {canSell && (
                            <button
                              type="button"
                              className="feedButton feedButtonOption"
                              disabled={listItem.isPending}
                              onClick={() => listItem.mutate({ itemId: item.itemId, listingType: 'sale' })}
                            >
                              Metti in vendita
                            </button>
                          )}
                          {canRent && (
                            <button
                              type="button"
                              className="feedButton feedButtonOption"
                              disabled={listItem.isPending}
                              onClick={() => listItem.mutate({ itemId: item.itemId, listingType: 'rent' })}
                            >
                              Metti in affitto
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {listItem.error && (
                <p className="error">
                  {listItem.error instanceof ApiError
                    ? resolveErrorMessage(listItem.error.messageKey)
                    : 'Errore pubblicazione'}
                </p>
              )}
            </section>
          )}

          {hasLockedDimensions && (
            <section className="profileBlock profileBlock--muted profileLockedSection" aria-label="Prossimi sblocchi">
              <h2 className="profileBlockTitle profileBlockTitle--sm">Prossimi sblocchi</h2>
              <CitizenProfileDimensions profile={data.citizenProfile} lockedOnly />
            </section>
          )}

          {isOwnProfile && <ProfileConoscenzeSection />}

          {isAdmin && (
            <section className="profileBlock profileBlock--muted adminToolsSection" aria-label="Strumenti amministratore">
              <h2 className="profileBlockTitle profileBlockTitle--sm">Strumenti amministratore</h2>
              <p className="muted adminToolsHint">
                Strumenti contestuali visibili solo al tuo account admin.
              </p>
              {!isOwnProfile && routeCitizenId && isRealPlayerCitizenId(routeCitizenId) && (
                <button
                  type="button"
                  className="feedButton feedButtonOption"
                  onClick={() => setAdminEditOpen(true)}
                >
                  Modifica questo cittadino
                </button>
              )}
            </section>
          )}

          {isAdmin && <AdminNpcPortraitPanel />}

          {isOwnProfile && (
            <section className="profileBlock profileBlock--danger profileDangerZone" aria-label="Cancella account">
              <h2 className="profileBlockTitle profileBlockTitle--danger">Zona pericolosa</h2>
              <p className="muted profileDangerCopy">
                Elimina definitivamente il tuo personaggio e tutti i progressi associati.
              </p>
              <button
                type="button"
                className="profileDeleteAccountBtn"
                onClick={openDeleteDialog}
              >
                Cancella account
              </button>
            </section>
          )}
        </div>
      )}

      {avatarPickerOpen && selectedPortraitId && (
        <div className="manualModalBackdrop" role="presentation" onClick={() => setAvatarPickerOpen(false)}>
          <div
            className="manualModal avatarPickerModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-picker-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="manualModalHeader">
              <h2 id="avatar-picker-title" className="manualModalTitle">
                Cambia foto profilo
              </h2>
              <button
                type="button"
                className="manualModalClose"
                aria-label="Chiudi"
                onClick={() => setAvatarPickerOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="manualModalBody">
              <AvatarPicker
                selectedPortraitId={selectedPortraitId}
                onSelect={setSelectedPortraitId}
                title="Scegli il tuo profilo"
              />
              {actionError && <p className="error">{actionError}</p>}
              <div className="avatarPickerActions">
                <button
                  type="button"
                  className="feedButton feedButtonOption"
                  onClick={() => setAvatarPickerOpen(false)}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  className="buttonPrimary"
                  disabled={updatePortrait.isPending}
                  onClick={() => updatePortrait.mutate(selectedPortraitId)}
                >
                  {updatePortrait.isPending ? 'Salvataggio…' : 'Salva avatar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminEditOpen && routeCitizenId && (
        <AdminCitizenEditModal citizenId={routeCitizenId} onClose={() => setAdminEditOpen(false)} />
      )}

      {deleteConfirmOpen && (
        <div className="manualModalBackdrop" role="presentation" onClick={closeDeleteDialog}>
          <div
            className="manualModal profileDeleteModal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="manualModalHeader">
              <h2 id="delete-account-title" className="manualModalTitle">
                {deleteConfirmationStep === 1 && 'Vuoi davvero cancellare il tuo account?'}
                {deleteConfirmationStep === 2 && 'Sei davvero sicuro?'}
                {deleteConfirmationStep === 3 && 'Attenzione'}
                {deleteConfirmationStep === 4 && 'ULTIMA CONFERMA'}
              </h2>
            </div>
            <div className="manualModalBody">
              {deleteConfirmationStep === 1 && (
                <p className="profileDeleteConfirmCopy">
                  Questa operazione eliminerà il tuo personaggio e i relativi progressi. Non potrai recuperarlo.
                </p>
              )}
              {deleteConfirmationStep === 2 && (
                <p className="profileDeleteConfirmCopy">
                  Stai per avviare la cancellazione del tuo account. Puoi ancora annullare adesso.
                </p>
              )}
              {deleteConfirmationStep === 3 && (
                <p className="profileDeleteConfirmCopy">
                  Attenzione: stai per eliminare definitivamente il tuo personaggio.
                </p>
              )}
              {deleteConfirmationStep === 4 && (
                <p className="profileDeleteConfirmCopy">
                  Il tuo personaggio verrà eliminato definitivamente. Questa operazione non può essere annullata.
                </p>
              )}
              {actionError && <p className="error">{actionError}</p>}
              <div className="avatarPickerActions">
                <button
                  type="button"
                  className="feedButton feedButtonOption"
                  disabled={deleteAccount.isPending}
                  onClick={closeDeleteDialog}
                >
                  Annulla
                </button>
                {deleteConfirmationStep < 4 ? (
                  <button
                    type="button"
                    className="feedButton feedButtonOption"
                    disabled={deleteAccount.isPending}
                    onClick={advanceDeleteConfirmation}
                  >
                    {deleteConfirmationStep === 1 && 'Conferma cancellazione'}
                    {deleteConfirmationStep === 2 && 'Conferma ancora'}
                    {deleteConfirmationStep === 3 && 'Continua'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="profileDeleteAccountBtn"
                    disabled={deleteAccount.isPending}
                    onClick={advanceDeleteConfirmation}
                  >
                    {deleteAccount.isPending ? 'Cancellazione…' : 'ELIMINA DEFINITIVAMENTE'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
