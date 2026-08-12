import type { FeedCategory } from '@/utils/feedTaskTheme';

/** Extended icon kinds — reuses feedIcon CSS from the task feed system. */
export type FeedListIconKind =
  | FeedCategory
  | 'news'
  | 'referendum'
  | 'community'
  | 'marketplace'
  | 'milestone'
  | 'life'
  | 'level';

export function gazzettaCategoryToIcon(category?: string | null): FeedListIconKind {
  switch ((category ?? 'cronaca').toLowerCase()) {
    case 'economia':
    case 'marketplace':
      return 'economy';
    case 'politica':
      return 'social';
    case 'referendum':
      return 'referendum';
    case 'milestone':
      return 'milestone';
    case 'city':
      return 'community';
    case 'cronaca':
    default:
      return 'news';
  }
}

export function notificationTypeToIcon(
  type: string,
  scope: 'personal' | 'global',
): FeedListIconKind {
  if (scope === 'global' || type.startsWith('world_')) {
    return 'community';
  }

  switch (type) {
    case 'level_up':
      return 'level';
    case 'life_review':
    case 'life_update':
      return 'life';
    case 'milestone':
      return 'milestone';
    case 'job_application':
    case 'job_payroll':
      return 'work';
    case 'marketplace_purchase':
    case 'marketplace_sale':
    case 'marketplace_rent':
      return 'marketplace';
    case 'flash_outcome':
      return 'unexpected';
    default:
      if (type.includes('marketplace')) return 'marketplace';
      if (type.includes('job')) return 'work';
      if (type.includes('econom')) return 'economy';
      return 'social';
  }
}

export function referendumListIcon(): FeedListIconKind {
  return 'referendum';
}
