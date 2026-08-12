import { resolveCharacterPortraitAsset } from '@comune-virtuale/shared';

export type NpcPortraitVariantId =
  | 'primary'
  | 'casual'
  | 'work'
  | 'evening'
  | 'vacation'
  | 'event';

export type NpcPortraitContext = 'work' | 'evening' | 'vacation' | 'event' | 'default';

export interface ResolvedNpcPortrait {
  variantId: NpcPortraitVariantId;
  imagePath: string;
  useSvgFallback: boolean;
}

/** Frontend mirror of backend portrait resolution (deterministic, no random refresh). */
export function resolveNpcPortrait(input: {
  templateId: string;
  assignedPortraitId?: string | null;
  gameTimeMs: number;
  context?: NpcPortraitContext;
  occupation?: string;
}): ResolvedNpcPortrait {
  if (input.assignedPortraitId) {
    const resolved = resolveCharacterPortraitAsset(input.assignedPortraitId);
    return {
      variantId: 'primary',
      imagePath: resolved.primaryUrl,
      useSvgFallback: false,
    };
  }

  if (input.context === 'work' && input.occupation) {
    return {
      variantId: 'work',
      imagePath: `/npc-portraits/${input.templateId}/work.webp`,
      useSvgFallback: true,
    };
  }

  if (input.context === 'evening') {
    return {
      variantId: 'evening',
      imagePath: `/npc-portraits/${input.templateId}/evening.webp`,
      useSvgFallback: true,
    };
  }

  const bucket = Math.floor(input.gameTimeMs / (7 * 24 * 60 * 60 * 1000));
  const variants: NpcPortraitVariantId[] = ['primary', 'casual', 'evening'];
  const idx = Math.abs(hashString(`${input.templateId}:${bucket}`)) % variants.length;
  const variantId = variants[idx] ?? 'primary';

  return {
    variantId,
    imagePath: `/npc-portraits/${input.templateId}/${variantId}.webp`,
    useSvgFallback: true,
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}
