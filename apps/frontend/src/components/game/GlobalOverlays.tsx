import { useEffect, useMemo, useRef, useState } from 'react';
import type { QueryObserverResult } from '@tanstack/react-query';
import { ApiError, api, type HomeResponse } from '@/api/client';
import { randomUUID } from '@/api/uuid';
import { LifeReviewPanel } from '@/components/LifeReviewPanel';
import { FlashOpportunityOverlay } from '@/components/FlashOpportunityPanel';
import { resolveErrorMessage } from '@/utils/errorCopy';

interface GlobalOverlaysProps {
  home: HomeResponse;
  refetch: () => Promise<QueryObserverResult<HomeResponse>>;
}

const POPUP_INITIAL_DELAY_MS = 3500;
const POPUP_COOLDOWN_MS = 30_000;
const DISMISSED_LIFE_REVIEW_KEY = 'cv-dismissed-life-review';
const LAST_POPUP_AT_KEY = 'cv-last-popup-at';

type OverlayPriority = 'flash' | 'life_review' | null;

export function GlobalOverlays({ home, refetch }: GlobalOverlaysProps) {
  const [flashActing, setFlashActing] = useState(false);
  const [flashNotice, setFlashNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [dismissedReviewId, setDismissedReviewId] = useState<string | null>(() =>
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(`${DISMISSED_LIFE_REVIEW_KEY}:${home.citizenId}`)
      : null,
  );
  const [popupsReady, setPopupsReady] = useState(false);
  const [cooldownReady, setCooldownReady] = useState(false);
  const lastPopupMarkedRef = useRef(false);

  useEffect(() => {
    setDismissedReviewId(sessionStorage.getItem(`${DISMISSED_LIFE_REVIEW_KEY}:${home.citizenId}`));
  }, [home.citizenId]);

  useEffect(() => {
    setPopupsReady(false);
    const timer = window.setTimeout(() => setPopupsReady(true), POPUP_INITIAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [home.citizenId]);

  useEffect(() => {
    const lastAt = Number(sessionStorage.getItem(LAST_POPUP_AT_KEY) ?? '0');
    const elapsed = Date.now() - lastAt;
    if (elapsed >= POPUP_COOLDOWN_MS) {
      setCooldownReady(true);
      return;
    }
    setCooldownReady(false);
    const timer = window.setTimeout(() => setCooldownReady(true), POPUP_COOLDOWN_MS - elapsed);
    return () => window.clearTimeout(timer);
  }, [home.citizenId]);

  useEffect(() => {
    if (!home.flash?.flashOpportunity) return;
    const timer = window.setInterval(() => {
      void refetch();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [home.flash?.flashOpportunity, refetch]);

  useEffect(() => {
    if (!home.flash?.expiredNotice) return;
    setFlashNotice(home.flash.expiredNotice);
    const timer = window.setTimeout(() => setFlashNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [home.flash?.expiredNotice]);

  async function handleAcceptFlash(opportunityId: string) {
    setFlashActing(true);
    setActionError(null);
    try {
      await api.acceptFlashOpportunity(opportunityId, randomUUID());
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Errore opportunità lampo',
      );
    } finally {
      setFlashActing(false);
    }
  }

  async function handleDeclineFlash(opportunityId: string) {
    setFlashActing(true);
    setActionError(null);
    try {
      await api.declineFlashOpportunity(opportunityId, randomUUID());
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Errore opportunità lampo',
      );
    } finally {
      setFlashActing(false);
    }
  }

  const showLifeReview =
    home.lifeReview && home.lifeReview.reviewId !== dismissedReviewId ? home.lifeReview : null;
  const showFlash = home.flash?.flashOpportunity ?? null;

  const activeOverlay: OverlayPriority = useMemo(() => {
    if (!popupsReady || !cooldownReady) return null;
    if (showFlash) return 'flash';
    if (showLifeReview) return 'life_review';
    return null;
  }, [popupsReady, cooldownReady, showFlash, showLifeReview]);

  useEffect(() => {
    if (!activeOverlay) {
      lastPopupMarkedRef.current = false;
      return;
    }
    if (lastPopupMarkedRef.current) return;
    sessionStorage.setItem(LAST_POPUP_AT_KEY, String(Date.now()));
    lastPopupMarkedRef.current = true;
  }, [activeOverlay]);

  return (
    <>
      {activeOverlay === 'life_review' && showLifeReview && (
        <div className="globalOverlay globalOverlay--inline">
          <LifeReviewPanel
            review={showLifeReview}
            onDismiss={() => {
              sessionStorage.setItem(`${DISMISSED_LIFE_REVIEW_KEY}:${home.citizenId}`, showLifeReview.reviewId);
              sessionStorage.setItem(LAST_POPUP_AT_KEY, String(Date.now()));
              setDismissedReviewId(showLifeReview.reviewId);
            }}
          />
        </div>
      )}

      {flashNotice && (
        <p className="globalOverlayFlashNotice" role="status" aria-live="polite">
          {flashNotice}
        </p>
      )}

      {actionError && (
        <p className="globalOverlayError error" role="alert">
          {actionError}
        </p>
      )}

      {activeOverlay === 'flash' && showFlash && (
        <FlashOpportunityOverlay
          opportunity={showFlash}
          onAccept={() => handleAcceptFlash(showFlash.opportunityId)}
          onDecline={() => handleDeclineFlash(showFlash.opportunityId)}
          acting={flashActing}
        />
      )}
    </>
  );
}
