import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, api, type JobOfferItem } from '@/api/client';
import { randomUUID } from '@/api/uuid';
import { JobApplicationOverlay } from '@/components/game/JobApplicationOverlay';
import { useWorkJobs } from '@/hooks/useGameApi';
import { formatMonthlySalary, formatShiftRemaining } from '@/utils/formatWork';
import { resolveErrorMessage } from '@/utils/errorCopy';
import { PERSONAL_VALUE_LABELS, PERSONAL_VALUE_KEYS, type PersonalValueKey } from '@/utils/personalValues';

function JobRequirements({ requirements }: { requirements: JobOfferItem['requirements'] }) {
  if (!requirements) return null;
  const entries = [
    ...PERSONAL_VALUE_KEYS.map((key) =>
      requirements[key as PersonalValueKey] != null
        ? { label: PERSONAL_VALUE_LABELS[key], value: requirements[key as PersonalValueKey]! }
        : null,
    ),
    requirements.mainLevel != null ? { label: 'Livello generale', value: requirements.mainLevel } : null,
  ].filter((entry): entry is { label: string; value: number } => entry != null);

  if (entries.length === 0) return null;

  return (
    <div className="workJobRequirements" aria-label="Requisiti">
      {entries.map((entry) => (
        <span key={entry.label} className="workJobRequirement">
          {entry.label}: {entry.value}
        </span>
      ))}
    </div>
  );
}

type ApplicationPopup = {
  title: string;
  body: string;
  decision: 'accepted' | 'rejected';
};

function JobOfferActions({
  offerId,
  engagementStatus,
  remainingShiftMs,
  acting,
  blocked,
  onApply,
  onClockIn,
}: {
  offerId: string;
  engagementStatus: JobOfferItem['engagementStatus'];
  remainingShiftMs?: number;
  acting: string | null;
  blocked?: boolean;
  onApply: (offerId: string) => void;
  onClockIn: (offerId: string) => void;
}) {
  if (engagementStatus === 'shift_active') {
    return (
      <div className="workStatusBlock" aria-live="polite">
        <p className="workStatus workStatusActive">Turno in corso</p>
        {remainingShiftMs != null && (
          <p className="workShiftTimer">Tempo restante: {formatShiftRemaining(remainingShiftMs)}</p>
        )}
      </div>
    );
  }

  if (engagementStatus === 'blocked_today') {
    return <p className="workStatus workStatusBlocked">Bloccato fino a fine giornata</p>;
  }

  if (engagementStatus === 'hired') {
    return (
      <button
        type="button"
        className="feedButton feedButtonPrimary workClockInButton"
        disabled={acting === offerId}
        onClick={() => onClockIn(offerId)}
      >
        {acting === offerId ? '…' : 'Timbra'}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="feedButton feedButtonPrimary"
      disabled={acting === offerId || blocked}
      onClick={() => onApply(offerId)}
    >
      {acting === offerId ? '…' : blocked ? 'Requisiti mancanti' : 'Candidatura'}
    </button>
  );
}

export function LavoroPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useWorkJobs();
  const [acting, setActing] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [applicationPopup, setApplicationPopup] = useState<ApplicationPopup | null>(null);

  const hasActiveShift = data?.offers.some((offer) => offer.engagementStatus === 'shift_active');

  useEffect(() => {
    if (!hasActiveShift) return;
    const timer = window.setInterval(() => {
      void refetch();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hasActiveShift, refetch]);

  async function handleApply(offerId: string) {
    setActing(offerId);
    setActionError(null);
    try {
      const result = await api.workApply(offerId, randomUUID());
      setApplicationPopup(result.message);
      await queryClient.invalidateQueries({ queryKey: ['work'] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err) {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Errore candidatura',
      );
    } finally {
      setActing(null);
    }
  }

  async function handleClockIn(offerId: string) {
    setActing(offerId);
    setActionError(null);
    try {
      await api.workClockIn(offerId, randomUUID());
      await queryClient.invalidateQueries({ queryKey: ['work'] });
    } catch (err) {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Errore timbratura',
      );
    } finally {
      setActing(null);
    }
  }

  if (isLoading) return <p className="loading">Caricamento lavori…</p>;
  if (error) return <p className="error">Impossibile caricare i lavori.</p>;
  if (data && !data.enabled) {
    return (
      <p className="emptyState">
        Mercato del lavoro non disponibile. Applica la migration del database per abilitarlo.
      </p>
    );
  }

  const offers = data?.offers ?? [];

  return (
    <>
      {applicationPopup && (
        <JobApplicationOverlay
          message={applicationPopup}
          onDismiss={() => setApplicationPopup(null)}
        />
      )}

      {offers.length === 0 ? (
        <p className="emptyState">Nessun lavoro disponibile.</p>
      ) : (
        <div className="workJobList" aria-label="Lavori disponibili">
          {offers.map((offer) => (
            <article
              key={offer.offerId}
              className={`workJobCard card${offer.blocked ? ' workJobCard--blocked' : ''}${offer.isCriminalOrg ? ' workJobCard--criminal' : ''}`}
            >
              <div className="workJobCardTop">
                <h3 className="workJobTitle">{offer.title}</h3>
                {offer.tier && offer.tier !== 'entry' && (
                  <span className={`workJobTier workJobTier--${offer.tier}`}>
                    {offer.tier === 'criminal' ? 'Speciale' : offer.tier === 'high' ? 'Alto' : 'Medio'}
                  </span>
                )}
              </div>
              <span className="workJobCategory">{offer.employer}</span>
              <p className="workJobDescription">{offer.description}</p>
              <p className="workSalary">
                {offer.isCriminalOrg && offer.salaryHintMinor === '0'
                  ? 'Compenso: variabile / nessuna busta paga'
                  : `Compenso mensile: ${formatMonthlySalary(offer.salaryHintMinor)}`}
              </p>
              <JobRequirements requirements={offer.requirements} />
              {offer.blocked && offer.blockReason && (
                <p className="workJobBlockedReason">{offer.blockReason}</p>
              )}
              <JobOfferActions
                offerId={offer.offerId}
                engagementStatus={offer.engagementStatus}
                remainingShiftMs={offer.remainingShiftMs}
                acting={acting}
                blocked={offer.blocked}
                onApply={handleApply}
                onClockIn={handleClockIn}
              />
            </article>
          ))}
        </div>
      )}

      {actionError && <p className="error">{actionError}</p>}
    </>
  );
}
