export type KnownNpcVisualId = 'marco' | 'laura' | 'giulia' | 'generic';

const NPC_ID_MAP: Record<string, KnownNpcVisualId> = {
  marco: 'marco',
  laura: 'laura',
  giulia: 'giulia',
};

export function resolveNpcVisualId(npcId: string, displayName?: string): KnownNpcVisualId {
  const normalizedId = npcId.toLowerCase().replace(/[^a-z]/g, '');
  const mapped = NPC_ID_MAP[normalizedId];
  if (mapped) {
    return mapped;
  }

  const normalizedName = displayName?.toLowerCase().trim();
  if (normalizedName) {
    if (normalizedName.includes('marco')) return 'marco';
    if (normalizedName.includes('laura')) return 'laura';
    if (normalizedName.includes('giulia')) return 'giulia';
  }

  return 'generic';
}

export function npcVisualLabel(visualId: KnownNpcVisualId): string {
  const labels: Record<KnownNpcVisualId, string> = {
    marco: 'Marco',
    laura: 'Laura',
    giulia: 'Giulia',
    generic: 'Conoscente',
  };
  return labels[visualId];
}
