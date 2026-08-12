import { VisualAssetImage } from './VisualAssetImage';

interface VisualHeroSlotProps {
  imageKey?: string;
  label?: string;
  className?: string;
  overlay?: boolean;
}

/** Hero / editorial slot — aspect ratio from catalog (typically 3:1). */
export function VisualHeroSlot({
  imageKey,
  label = 'Immagine in arrivo',
  className = '',
  overlay = true,
}: VisualHeroSlotProps) {
  return (
    <VisualAssetImage
      imageKey={imageKey}
      label={label}
      className={`visualHeroSlot ${className}`.trim()}
      overlay={overlay}
    />
  );
}
