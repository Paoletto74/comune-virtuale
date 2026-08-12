/** Game clock schema version — bump when world_clock shape changes. */
export const WORLD_CLOCK_SCHEMA_VERSION = 1;

/** Life review frequency — configurable, intentionally rare. */
export const LIFE_REVIEW_CONFIG = {
  minTasksSinceLastReview: 5,
  /** One game day between reviews (ms in game time). */
  minGameTimeBetweenReviewsMs: 24 * 60 * 60 * 1000,
  /** Minimum game time before first review. */
  minWorldTimeForFirstReviewMs: 2 * 60 * 60 * 1000,
} as const;

export type TemporalEventType = 'milestone' | 'life_update' | 'city_update' | 'reflection' | 'life_review';

export type TemporalEventStatus = 'pending' | 'applied' | 'cancelled';

export type EmploymentState = 'employed' | 'unemployed' | 'seeking' | 'unknown';

/** Admin time scale bounds. */
export const ADMIN_TIME_SCALE_MIN = 0;
export const ADMIN_TIME_SCALE_MAX = 10;
