import type { FeedCategory } from '@/utils/feedTaskTheme';

interface FeedCategoryIconProps {
  category: FeedCategory;
}

export function FeedCategoryIcon({ category }: FeedCategoryIconProps) {
  return (
    <span className={`feedIcon feedIcon--${category}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        {category === 'conversation' && (
          <>
            <path d="M8 10h8M8 14h5" strokeLinecap="round" />
            <path
              d="M6 6h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4l-3 3v-3H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
              strokeLinejoin="round"
            />
          </>
        )}
        {category === 'good' && (
          <>
            <path d="M12 20s-6.5-4.5-6.5-9a4.5 4.5 0 0 1 8.2-2.6" strokeLinecap="round" />
            <path d="M12 20s6.5-4.5 6.5-9a4.5 4.5 0 0 0-8.2-2.6" strokeLinecap="round" />
          </>
        )}
        {category === 'work' && (
          <>
            <path d="M4 9h16v10H4z" strokeLinejoin="round" />
            <path d="M9 9V7a3 3 0 0 1 6 0v2" strokeLinecap="round" />
          </>
        )}
        {category === 'family' && (
          <>
            <circle cx="9" cy="9" r="2.5" />
            <circle cx="16" cy="10" r="2" />
            <path d="M5 19c.8-2.5 2.8-4 4-4s3.2 1.5 4 4" strokeLinecap="round" />
            <path d="M14 19c.5-1.8 1.8-3 3-3s2.5 1.2 3 3" strokeLinecap="round" />
          </>
        )}
        {category === 'social' && (
          <>
            <circle cx="8" cy="9" r="2.5" />
            <circle cx="16" cy="9" r="2.5" />
            <path d="M4 18c1.2-2.5 3.4-4 6-4s4.8 1.5 6 4" strokeLinecap="round" />
          </>
        )}
        {category === 'economy' && (
          <>
            <rect x="5" y="7" width="14" height="10" rx="2" />
            <path d="M8 11h8M8 14h5" strokeLinecap="round" />
          </>
        )}
        {category === 'unexpected' && (
          <>
            <path d="M12 4v4" strokeLinecap="round" />
            <path d="M12 16v4" strokeLinecap="round" />
            <path d="M4 12h4" strokeLinecap="round" />
            <path d="M16 12h4" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3.5" />
          </>
        )}
        {category === 'risky' && (
          <>
            <path d="M12 5l7 12H5z" strokeLinejoin="round" />
            <path d="M12 10v3" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    </span>
  );
}
