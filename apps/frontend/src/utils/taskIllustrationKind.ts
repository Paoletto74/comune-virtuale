import type { FeedCategory } from '@/utils/feedTaskTheme';

export type TaskIllustrationKind =
  | 'work'
  | 'family'
  | 'living'
  | 'social'
  | 'economic'
  | 'unexpected'
  | 'risky'
  | 'dialogue'
  | 'generic';

export function feedCategoryToIllustrationKind(category: FeedCategory): TaskIllustrationKind {
  switch (category) {
    case 'work':
      return 'work';
    case 'family':
      return 'family';
    case 'social':
      return 'social';
    case 'economy':
      return 'economic';
    case 'unexpected':
      return 'unexpected';
    case 'risky':
      return 'risky';
    case 'conversation':
      return 'dialogue';
    case 'good':
      return 'living';
    default:
      return 'generic';
  }
}

export function taskIllustrationLabel(kind: TaskIllustrationKind): string {
  const labels: Record<TaskIllustrationKind, string> = {
    work: 'Lavoro',
    family: 'Famiglia',
    living: 'Vita quotidiana',
    social: 'Sociale',
    economic: 'Economia',
    unexpected: 'Imprevisto',
    risky: 'Rischio',
    dialogue: 'Dialogo',
    generic: 'Attività',
  };
  return labels[kind];
}
