import { ComuneMessage } from '@/components/visual/ComuneMessage';
import type { HomeResponse } from '@/api/client';

type LifeReview = NonNullable<HomeResponse['lifeReview']>;

interface LifeReviewPanelProps {
  review: LifeReview;
  onDismiss: () => void;
}

export function LifeReviewPanel({ review, onDismiss }: LifeReviewPanelProps) {
  const paragraphs = review.body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line, index, all) => all.indexOf(line) === index);

  return (
    <ComuneMessage
      variant="editorial"
      title={review.title}
      className={`lifeReviewPanel lifeReviewPanel--${review.severity}`}
      onDismiss={onDismiss}
      dismissLabel="Chiudi revisione di vita"
      footer={
        <button type="button" className="comuneMessageAction" onClick={onDismiss}>
          Chiudi
        </button>
      }
    >
      {paragraphs.map((paragraph, index) => (
        <p
          key={`${index}-${paragraph.slice(0, 24)}`}
          className={index === paragraphs.length - 1 && paragraphs.length > 1 ? 'comuneMessageIronic' : undefined}
        >
          {paragraph}
        </p>
      ))}
    </ComuneMessage>
  );
}
