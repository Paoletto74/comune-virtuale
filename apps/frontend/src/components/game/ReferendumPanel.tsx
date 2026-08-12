import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ApiError, api, type ReferendumItem } from '@/api/client';
import { randomUUID } from '@/api/uuid';
import { FeedListIcon } from '@/components/FeedListIcon';
import { VisualHeroSlot } from '@/components/visual/VisualHeroSlot';
import { useReferenda } from '@/hooks/useGameApi';
import { formatShiftRemaining } from '@/utils/formatWork';
import { resolveErrorMessage } from '@/utils/errorCopy';
import { referendumListIcon } from '@/utils/feedItemIconMap';

function isReferendumVotable(item: ReferendumItem): boolean {
  if (item.status !== 'active') return false;
  if (item.remainingMs != null && item.remainingMs <= 0) return false;
  return true;
}

function ReferendumCard({ item }: { item: ReferendumItem }) {
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [thankYou, setThankYou] = useState(false);
  const voted = item.userVote != null;

  const approveOption = item.options.find((o) => o.optionId === 'a') ?? item.options[0];
  const rejectOption = item.options.find((o) => o.optionId === 'b') ?? item.options[1];

  async function submitVote(optionId: 'a' | 'b') {
    setActing(true);
    setVoteError(null);
    try {
      const fresh = await queryClient.fetchQuery({
        queryKey: ['referenda'],
        queryFn: () => api.referenda(),
      });
      const current = fresh.referendums.find((r) => r.referendumId === item.referendumId);
      if (!current || !isReferendumVotable(current)) {
        setVoteError('Questo referendum non è più disponibile.');
        await queryClient.invalidateQueries({ queryKey: ['referenda'] });
        return;
      }

      await api.voteReferendum(item.referendumId, optionId, randomUUID());
      setThankYou(true);
      await queryClient.invalidateQueries({ queryKey: ['referenda'] });
    } catch (err) {
      setVoteError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Errore durante il voto',
      );
    } finally {
      setActing(false);
    }
  }

  return (
    <article className="referendumCard card" aria-label={item.question}>
      <VisualHeroSlot imageKey={item.heroImageKey ?? 'referendum'} label="Hero referendum" />
      <div className="feedListItemRow">
        <FeedListIcon kind={referendumListIcon()} />
        <div className="feedListItemContent">
          <div className="referendumCardHeader">
            <h3 className="referendumTitle">{item.question}</h3>
            <span className={`referendumStatus referendumStatus--${item.status}`}>
              {item.status === 'active' ? 'Attivo' : item.status === 'scheduled' ? 'In arrivo' : 'Chiuso'}
            </span>
          </div>
          <p className="referendumDescription">{item.context}</p>

          {item.problem && (
            <div className="referendumDetailBlock">
              <h4 className="referendumDetailTitle">Il problema</h4>
              <p>{item.problem}</p>
            </div>
          )}
          {item.votingGuide && (
            <div className="referendumDetailBlock">
              <h4 className="referendumDetailTitle">Cosa significa votare</h4>
              <p>{item.votingGuide}</p>
            </div>
          )}
          {item.impactSummary && (
            <div className="referendumDetailBlock">
              <h4 className="referendumDetailTitle">Possibili conseguenze</h4>
              <p>{item.impactSummary}</p>
            </div>
          )}

          {approveOption && rejectOption && (
            <p className="gazzettaVoteCount" aria-label="Conteggio voti">
              APPROVO {approveOption.votes} · NON APPROVO {rejectOption.votes}
            </p>
          )}

          {thankYou && (
            <p className="referendumVoted">
              Voto registrato. La democrazia prende nota. Più o meno.
            </p>
          )}

          {isReferendumVotable(item) && !voted && !thankYou && (
            <div className="referendumVoteActions">
              <button
                type="button"
                className="feedButton feedButtonPrimary"
                disabled={acting}
                onClick={() => void submitVote('a')}
              >
                {acting ? '…' : 'Approvo'}
              </button>
              <button
                type="button"
                className="feedButton feedButtonOption"
                disabled={acting}
                onClick={() => void submitVote('b')}
              >
                {acting ? '…' : 'Non approvo'}
              </button>
            </div>
          )}

          {voted && !thankYou && (
            <p className="referendumVoted">
              HAI VOTATO
              {item.remainingMs != null ? ` · resta visibile per ${formatShiftRemaining(item.remainingMs)}` : ''}
            </p>
          )}
          {voteError && <p className="error">{voteError}</p>}
        </div>
      </div>
    </article>
  );
}

export function ReferendumPanel() {
  const { data, isLoading, error } = useReferenda();
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (isLoading) return <p className="loading">Caricamento referendum…</p>;
  if (error) return <p className="error">Impossibile caricare i referendum.</p>;
  if (data && !data.enabled) {
    return (
      <p className="emptyState">
        Referendum non disponibili. Applica la migration del database per abilitarli.
      </p>
    );
  }

  const active = data?.referendums.filter(isReferendumVotable) ?? [];

  if (active.length === 0) {
    return <p className="emptyState">Nessun referendum attivo. Respira. Dura poco.</p>;
  }

  return (
    <div className="referendumList" aria-label="Referendum attivi">
      {active.map((item) => (
        <ReferendumCard key={item.referendumId} item={item} />
      ))}
    </div>
  );
}
