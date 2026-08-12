import type { HomeResponse } from '@/api/client';

export type FeedTask = HomeResponse['activeTasks'][number];
export type GameplayHintTag = NonNullable<FeedTask['gameplayHints']>['tags'][number];

export type FeedCategory =
  | 'conversation'
  | 'good'
  | 'work'
  | 'family'
  | 'social'
  | 'economy'
  | 'unexpected'
  | 'risky';

export type FeedAccentBorder = 'risk' | 'opportunity' | 'urgent';

export interface FeedTaskTheme {
  category: FeedCategory;
  categoryLabel: string;
  accentBorder?: FeedAccentBorder;
}

const RISKY_PATTERNS = [
  'STEAL',
  'SHADY',
  'SCAM',
  'RISKY',
  'SUITCASE',
  'CRIME',
  'SHADY_DEAL',
] as const;

const DIALOGUE_PATTERNS = ['DIALOGUE', 'BOSS_GREETING', 'LANDLORD', 'FRIEND_DEBT'] as const;

const FAMILY_PATTERNS = ['FAMILY'] as const;

const WORK_PATTERNS = [
  'WORK',
  'BOSS',
  'SUPPLIER',
  'CLIENT',
  'COLLEAGUE',
  'DEADLINE',
  'MEETING',
  'SHIFT',
  'SUPERVISOR',
] as const;

const ECONOMY_PATTERNS = ['ECON', 'WALLET', 'FOUND', 'BILL', 'TIP', 'FLIP', 'PARKING'] as const;

const SOCIAL_PATTERNS = [
  'SOCIAL',
  'FRIEND',
  'NEIGHBOR',
  'LANDLORD',
  'ACQUAINTANCE',
  'CHARITY',
  'ELDERLY',
] as const;

const GOOD_PATTERNS = ['CHARITY'] as const;

const UNEXPECTED_PATTERNS = ['UNEXPECTED', 'WEIRD'] as const;

function matchesAny(id: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => id.includes(pattern));
}

function resolveCategory(task: FeedTask): FeedCategory {
  const id = task.taskId.toUpperCase();
  const tags = task.gameplayHints?.tags ?? [];

  if (tags.includes('risky') || matchesAny(id, RISKY_PATTERNS)) return 'risky';
  if (task.taskKind === 'dialogue_step' || task.taskKind === 'dialogue_terminal') {
    return 'conversation';
  }
  if (matchesAny(id, DIALOGUE_PATTERNS)) return 'conversation';
  if (tags.includes('positive') || matchesAny(id, GOOD_PATTERNS)) return 'good';
  if (matchesAny(id, FAMILY_PATTERNS)) return 'family';
  if (matchesAny(id, WORK_PATTERNS)) return 'work';
  if (tags.includes('economic') || tags.includes('high_gain') || matchesAny(id, ECONOMY_PATTERNS)) {
    return 'economy';
  }
  if (matchesAny(id, UNEXPECTED_PATTERNS)) return 'unexpected';
  if (matchesAny(id, SOCIAL_PATTERNS)) return 'social';

  return 'social';
}

const CATEGORY_LABELS: Record<FeedCategory, string> = {
  conversation: 'Conversazione',
  good: 'Buona azione',
  work: 'Lavoro',
  family: 'Famiglia',
  social: 'Vita sociale',
  economy: 'Economia',
  unexpected: 'Imprevisto',
  risky: 'Rischio',
};

function resolveAccentBorder(task: FeedTask, category: FeedCategory): FeedAccentBorder | undefined {
  const tags = task.gameplayHints?.tags ?? [];

  if (tags.includes('risky') || category === 'risky') return 'risk';
  if (tags.includes('high_gain') || tags.includes('economic')) return 'opportunity';
  if (tags.includes('urgent')) return 'urgent';

  return undefined;
}

export function resolveFeedTaskTheme(task: FeedTask): FeedTaskTheme {
  const category = resolveCategory(task);

  return {
    category,
    categoryLabel: CATEGORY_LABELS[category],
    accentBorder: resolveAccentBorder(task, category),
  };
}

export function feedCardClassName(theme: FeedTaskTheme, feedState?: FeedTask['feedState']): string {
  const classes = ['feedCard', `feedCard--${theme.category}`];

  if (theme.accentBorder) {
    classes.push(`feedCard--accent-${theme.accentBorder}`);
  }

  if (feedState === 'ready') {
    classes.push('feedCard--ready');
  }

  if (feedState === 'in_progress') {
    classes.push('feedCard--active');
  }

  if (feedState === 'interactive') {
    classes.push('feedCard--interactive');
  }

  return classes.join(' ');
}

export function isRiskyOption(optionId: string): boolean {
  return ['steal_wallet', 'buy', 'keep_wallet', 'accept', 'join', 'invest'].includes(optionId);
}

export interface FeedGameplayHint {
  key: string;
  label: string;
}

export function buildFeedGameplayHints(task: FeedTask): FeedGameplayHint[] {
  const tags = task.gameplayHints?.tags ?? [];
  const hints: FeedGameplayHint[] = [];

  if (tags.includes('high_gain') && task.gameplayHints?.maxGainMinor) {
    hints.push({
      key: 'high_gain',
      label: `Guadagno fino a ${task.gameplayHints.maxGainMinor}`,
    });
  } else if (tags.includes('economic')) {
    hints.push({ key: 'economic', label: 'Opportunità economica' });
  }

  if (tags.includes('urgent')) {
    hints.push({ key: 'urgent', label: 'Richiede attenzione' });
  }

  if (tags.includes('risky')) {
    hints.push({ key: 'risky', label: 'Scelta rischiosa possibile' });
  }

  if (tags.includes('positive')) {
    hints.push({ key: 'positive', label: 'Esito positivo possibile' });
  }

  if (tags.includes('ambiguous')) {
    hints.push({ key: 'ambiguous', label: 'Esiti contrastanti' });
  }

  return hints;
}
