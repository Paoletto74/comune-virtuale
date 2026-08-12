import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { GlobalOverlays } from '@/components/game/GlobalOverlays';
import { HomeProgressBars } from '@/components/game/HomeProgressBars';
import { useHome, useMe } from '@/hooks/useSession';
import { useHorizontalPageSwipe } from '@/hooks/useHorizontalPageSwipe';

type NavIconName = 'home' | 'gazzetta' | 'attivita' | 'mercato' | 'profilo' | 'notifiche' | 'comune';

function NavIcon({ name }: { name: NavIconName }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, 'aria-hidden': true as const };

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M4 10.5 L12 4 L20 10.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 10 V20 H18 V10" strokeLinejoin="round" />
          <path d="M10 20 V14 H14 V20" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'gazzetta':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinejoin="round" />
        </svg>
      );
    case 'attivita':
      return (
        <svg {...common}>
          <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" />
        </svg>
      );
    case 'mercato':
      return (
        <svg {...common}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" strokeLinejoin="round" />
          <path d="M3 6h18 M16 10a4 4 0 0 1-8 0" strokeLinecap="round" />
        </svg>
      );
    case 'profilo':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20c1.5-3.5 4-5 6-5s4.5 1.5 6 5" strokeLinecap="round" />
        </svg>
      );
    case 'notifiche':
      return (
        <svg {...common}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
        </svg>
      );
    case 'comune':
      return (
        <svg {...common}>
          <path d="M4 10 L12 4 L20 10 V20 H4 Z" strokeLinejoin="round" />
          <path d="M9 20 V14 H15 V20" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

const NAV_ITEMS: Array<{ to: string; icon: NavIconName; label: string; ariaLabel: string }> = [
  { to: '/home', icon: 'home', label: 'HOME', ariaLabel: 'Home' },
  { to: '/gazzetta', icon: 'gazzetta', label: 'Gazzetta', ariaLabel: 'Gazzetta' },
  { to: '/attivita', icon: 'attivita', label: 'Attività', ariaLabel: 'Attività' },
  { to: '/mercato', icon: 'mercato', label: 'Mercato', ariaLabel: 'Mercato' },
  { to: '/profilo', icon: 'profilo', label: 'Profilo', ariaLabel: 'Profilo' },
  { to: '/notifiche', icon: 'notifiche', label: 'Notifiche', ariaLabel: 'Notifiche' },
  { to: '/comune', icon: 'comune', label: 'Comune', ariaLabel: 'Comune' },
];

const GAME_PATHS = new Set([
  '/home',
  '/profilo',
  '/gazzetta',
  '/attivita',
  '/mercato',
  '/notifiche',
  '/comune',
  '/dashboard',
  '/status',
]);

const SWIPE_NAV_ROUTES = NAV_ITEMS.map((item) => item.to);

export function ShellLayout() {
  const location = useLocation();
  const { data: me } = useMe();
  const { onTouchStart, onTouchEnd } = useHorizontalPageSwipe(SWIPE_NAV_ROUTES);
  const isGamePage =
    GAME_PATHS.has(location.pathname) ||
    location.pathname.startsWith('/profilo/');

  const showNav = me && !me.needsCitizenCreation && isGamePage;
  const { data: home, refetch } = useHome(Boolean(showNav));

  return (
    <div className="app">
      <main
        className={isGamePage ? 'main mainGame' : 'main mainScroll'}
        onTouchStart={showNav ? onTouchStart : undefined}
        onTouchEnd={showNav ? (event) => onTouchEnd(event, location.pathname) : undefined}
      >
        <Outlet />
      </main>
      {showNav && home ? (
        <GlobalOverlays key={home.citizenId} home={home} refetch={refetch} />
      ) : null}
      {showNav && (
        <div className="bottomGameChrome">
          <HomeProgressBars />
          <nav className="navBottom navBottom--seven" aria-label="Navigazione principale">
            <div className="navBottomInner">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/profilo'}
                  className={({ isActive }) =>
                    isActive ? 'navBottomLink navBottomLinkActive' : 'navBottomLink'
                  }
                  aria-label={item.ariaLabel}
                >
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}
      <InstallPrompt />
    </div>
  );
}
