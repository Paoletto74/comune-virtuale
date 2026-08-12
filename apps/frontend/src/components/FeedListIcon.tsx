import type { FeedListIconKind } from '@/utils/feedItemIconMap';

interface FeedListIconProps {
  kind: FeedListIconKind;
}

export function FeedListIcon({ kind }: FeedListIconProps) {
  return (
    <span className={`feedIcon feedIcon--${kind}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        {(kind === 'conversation' || kind === 'social' || kind === 'community') && (
          <>
            <path d="M8 10h8M8 14h5" strokeLinecap="round" />
            <path
              d="M6 6h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4l-3 3v-3H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
              strokeLinejoin="round"
            />
          </>
        )}
        {kind === 'good' && (
          <>
            <path d="M12 20s-6.5-4.5-6.5-9a4.5 4.5 0 0 1 8.2-2.6" strokeLinecap="round" />
            <path d="M12 20s6.5-4.5 6.5-9a4.5 4.5 0 0 0-8.2-2.6" strokeLinecap="round" />
          </>
        )}
        {kind === 'work' && (
          <>
            <path d="M4 9h16v10H4z" strokeLinejoin="round" />
            <path d="M9 9V7a3 3 0 0 1 6 0v2" strokeLinecap="round" />
          </>
        )}
        {kind === 'family' && (
          <>
            <circle cx="9" cy="9" r="2.5" />
            <circle cx="16" cy="10" r="2" />
            <path d="M5 19c.8-2.5 2.8-4 4-4s3.2 1.5 4 4" strokeLinecap="round" />
            <path d="M14 19c.5-1.8 1.8-3 3-3s2.5 1.2 3 3" strokeLinecap="round" />
          </>
        )}
        {kind === 'economy' && (
          <>
            <rect x="5" y="7" width="14" height="10" rx="2" />
            <path d="M8 11h8M8 14h5" strokeLinecap="round" />
          </>
        )}
        {kind === 'unexpected' && (
          <>
            <path d="M12 4v4" strokeLinecap="round" />
            <path d="M12 16v4" strokeLinecap="round" />
            <path d="M4 12h4" strokeLinecap="round" />
            <path d="M16 12h4" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3.5" />
          </>
        )}
        {kind === 'risky' && (
          <>
            <path d="M12 5l7 12H5z" strokeLinejoin="round" />
            <path d="M12 10v3" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
          </>
        )}
        {kind === 'news' && (
          <>
            <path d="M6 6h12v14H6z" strokeLinejoin="round" />
            <path d="M9 10h6M9 13h6M9 16h4" strokeLinecap="round" />
          </>
        )}
        {kind === 'referendum' && (
          <>
            <rect x="5" y="4" width="14" height="16" rx="2" strokeLinejoin="round" />
            <path d="M9 9h6M9 12h6M9 15h4" strokeLinecap="round" />
            <path d="M12 4v3" strokeLinecap="round" />
          </>
        )}
        {kind === 'marketplace' && (
          <>
            <path d="M5 8h14l-1.5 11H6.5L5 8z" strokeLinejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
          </>
        )}
        {kind === 'milestone' && (
          <>
            <path d="M12 4l2.2 4.5 4.9.7-3.5 3.4.8 4.9L12 15.8 7.6 17.5l.8-4.9L5 9.2l4.9-.7z" strokeLinejoin="round" />
          </>
        )}
        {kind === 'life' && (
          <>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" strokeLinecap="round" />
          </>
        )}
        {kind === 'level' && (
          <>
            <path d="M12 4v16" strokeLinecap="round" />
            <path d="M6 10l6-4 6 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 18l6 4 6-4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
    </span>
  );
}
