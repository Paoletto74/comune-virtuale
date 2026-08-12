import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { AnimatedBalance, resetAnimatedBalanceTracking } from '@/components/visual/AnimatedBalance';
import { DayPhaseHeaderIcon, visualPhaseHeaderAriaLabel } from '@/components/visual/DayPhaseHeaderIcon';
import { LoginOpeningLogo } from '@/components/visual/LoginOpeningLogo';
import { ManualModal } from '@/components/visual/ManualModal';
import { useVisualTimePhase } from '@/context/VisualTimeProvider';

interface GameHeaderProps {
  gameDate: {
    day: number;
    hour: number;
    minute: number;
    second?: number;
    label?: string;
  };
  cashAmountMinor: string;
}

export function GameHeader({ cashAmountMinor }: GameHeaderProps) {
  const [manualOpen, setManualOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { phase: visualPhase } = useVisualTimePhase();

  const logout = useMutation({
    mutationFn: api.logout,
    onSuccess: async () => {
      resetAnimatedBalanceTracking();
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.removeQueries({ queryKey: ['home'] });
      navigate('/login', { replace: true });
    },
  });

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: 'Comune Virtuale',
      text: 'Unisciti al Comune Virtuale — il Comune osserva. Sempre.',
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user cancelled or share failed — fall through to copy
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareNotice('Link copiato negli appunti.');
    } catch {
      setShareNotice('Impossibile condividere. Copia l\'URL dalla barra del browser.');
    }

    window.setTimeout(() => setShareNotice(null), 3000);
  }

  return (
    <>
      <header className="gameHeader">
        <div className="gameHeaderInner">
          <div className="gameHeaderLeft">
            <Link to="/home" className="gameHeaderLogo" aria-label="Vai alla Home">
              <LoginOpeningLogo className="gameHeaderLogoImg" />
            </Link>
          </div>

          <Link
            to="/profilo"
            className="gameHeaderSaldo gameHeaderSaldo--center"
            aria-label={`Saldo: vai al Profilo`}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="gameHeaderSaldoIcon">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" />
              <path d="M8 5 V11 M6 8 H10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
            <AnimatedBalance amountMinor={cashAmountMinor} className="gameHeaderSaldoValue" />
          </Link>

          <div className="gameHeaderRightIcons" aria-label="Azioni rapide">
            <Link
              to="/attivita"
              className="gameHeaderIconButton gameHeaderIconButton--phase"
              aria-label={visualPhaseHeaderAriaLabel(visualPhase)}
              title={visualPhaseHeaderAriaLabel(visualPhase)}
            >
              <DayPhaseHeaderIcon className="gameHeaderPhaseIcon" />
            </Link>

            <button
              type="button"
              className="gameHeaderIconButton"
              onClick={() => setManualOpen(true)}
              aria-label="Manuale del gioco"
              title="Manuale"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              className="gameHeaderIconButton"
              onClick={() => void handleShare()}
              aria-label="Condividi"
              title="Condividi"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51 L15.42 17.49 M15.41 6.51 L8.59 10.49" strokeLinecap="round" />
              </svg>
            </button>

            <button
              type="button"
              className="gameHeaderIconButton gameHeaderIconButton--exit"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              aria-label="Esci"
              title="Esci"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
                <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        {shareNotice && (
          <p className="gameHeaderShareNotice" role="status" aria-live="polite">
            {shareNotice}
          </p>
        )}
      </header>

      <ManualModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </>
  );
}
