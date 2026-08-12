import type { ReactNode } from 'react';

interface DashboardGridProps {
  sidebar: ReactNode;
  main: ReactNode;
  aside?: ReactNode;
}

export function DashboardGrid({ sidebar, main, aside }: DashboardGridProps) {
  return (
    <div className="dashboardGrid">
      <aside className="dashboardSidebar">{sidebar}</aside>
      <div className="dashboardMain">{main}</div>
      {aside && <aside className="dashboardAside">{aside}</aside>}
    </div>
  );
}
