import type { ReactNode } from 'react';
import { GamePageLayout } from '@/components/visual/GamePageLayout';
import { GameHeader } from '@/components/visual/GameHeader';
import { useHome } from '@/hooks/useSession';

interface GameShellProps {
  children: ReactNode;
}

export function GameShell({ children }: GameShellProps) {
  const { data: home, isLoading, error } = useHome(true);

  if (isLoading) {
    return <p className="loading">Il Comune si sta svegliando…</p>;
  }

  if (error || !home) {
    return <p className="error">Impossibile caricare i dati di gioco.</p>;
  }

  return (
    <GamePageLayout
      header={
        home.gameDate ? (
          <GameHeader
            gameDate={home.gameDate}
            cashAmountMinor={home.balance.availableCash.amountMinor}
          />
        ) : undefined
      }
    >
      {children}
    </GamePageLayout>
  );
}
