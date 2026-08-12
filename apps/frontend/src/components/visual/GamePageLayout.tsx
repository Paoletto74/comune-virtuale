import type { ReactNode } from 'react';

interface GamePageLayoutProps {
  header?: ReactNode;
  children: ReactNode;
}

export function GamePageLayout({ header, children }: GamePageLayoutProps) {
  return (
    <div className="gamePage">
      {header}
      <div className="gameScrollArea">
        <div className="gameScrollContent">{children}</div>
      </div>
    </div>
  );
}
