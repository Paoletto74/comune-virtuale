/**
 * Metadata for dynamic NPC profile portraits.
 * Images are NOT generated yet — paths are reserved for future assets.
 */
import { INITIAL_NPC_ROSTER } from './initial-npc-roster.js';
import {
  isValidNpcPoolPortraitId,
  npcPoolPortraitImagePath,
} from './npc-portrait-pool-constants.js';

export type NpcPortraitVariantId =
  | 'primary'
  | 'casual'
  | 'work'
  | 'evening'
  | 'vacation'
  | 'event';

export interface NpcPortraitVariantMeta {
  variantId: NpcPortraitVariantId;
  /** Future asset path under /public, e.g. /npc-portraits/neighbor_marco/work.webp */
  imagePath: string;
}

export interface NpcPortraitProfile {
  npcTemplateId: string;
  displayName: string;
  primary: NpcPortraitVariantMeta;
  variants: Partial<Record<Exclude<NpcPortraitVariantId, 'primary'>, NpcPortraitVariantMeta>>;
}

const OPTIONAL_VARIANTS: Exclude<NpcPortraitVariantId, 'primary'>[] = [
  'casual',
  'work',
  'evening',
  'vacation',
  'event',
];

function portraitPath(templateId: string, variantId: NpcPortraitVariantId): string {
  return `/npc-portraits/${templateId}/${variantId}.webp`;
}

function buildProfile(templateId: string, displayName: string, occupation?: string): NpcPortraitProfile {
  const primary: NpcPortraitVariantMeta = {
    variantId: 'primary',
    imagePath: portraitPath(templateId, 'primary'),
  };

  const variants: NpcPortraitProfile['variants'] = {
    casual: { variantId: 'casual', imagePath: portraitPath(templateId, 'casual') },
  };

  if (occupation) {
    variants.work = { variantId: 'work', imagePath: portraitPath(templateId, 'work') };
  }

  variants.evening = { variantId: 'evening', imagePath: portraitPath(templateId, 'evening') };

  return { npcTemplateId: templateId, displayName, primary, variants };
}

/** Central portrait catalog — one entry per roster NPC (30). */
export const NPC_PORTRAIT_PROFILES: Readonly<Record<string, NpcPortraitProfile>> = Object.fromEntries(
  INITIAL_NPC_ROSTER.map((npc) => [
    npc.templateId,
    buildProfile(npc.templateId, npc.displayName, npc.occupation),
  ]),
);

export const NPC_PORTRAIT_VARIANT_COUNT_ESTIMATE = INITIAL_NPC_ROSTER.length * 3;

export function getNpcPortraitProfile(templateId: string): NpcPortraitProfile | null {
  return NPC_PORTRAIT_PROFILES[templateId] ?? null;
}

/** Resolves the image path for an NPC, preferring a DB-assigned pool portrait when present. */
export function resolveNpcPortraitImagePath(
  templateId: string,
  assignedPortraitId?: string | null,
): string {
  if (assignedPortraitId && isValidNpcPoolPortraitId(assignedPortraitId)) {
    return npcPoolPortraitImagePath(assignedPortraitId);
  }
  return portraitPath(templateId, 'primary');
}

function assignedPoolPortraitMeta(assignedPortraitId: string): NpcPortraitVariantMeta {
  return {
    variantId: 'primary',
    imagePath: npcPoolPortraitImagePath(assignedPortraitId),
  };
}

/** Deterministic variant selection — stable until context bucket changes. */
export function resolveNpcPortraitVariant(input: {
  templateId: string;
  assignedPortraitId?: string | null;
  gameTimeMs: number;
  context?: 'work' | 'evening' | 'vacation' | 'event' | 'default';
}): NpcPortraitVariantMeta {
  if (input.assignedPortraitId && isValidNpcPoolPortraitId(input.assignedPortraitId)) {
    return assignedPoolPortraitMeta(input.assignedPortraitId);
  }

  const profile = getNpcPortraitProfile(input.templateId);
  if (!profile) {
    return {
      variantId: 'primary',
      imagePath: `/npc-portraits/generic/primary.webp`,
    };
  }

  if (input.context && input.context !== 'default') {
    const contextual = profile.variants[input.context];
    if (contextual) return contextual;
  }

  // Stable rotation every ~7 game days among optional variants
  const bucket = Math.floor(input.gameTimeMs / (7 * 24 * 60 * 60 * 1000));
  const pool = [profile.primary, ...OPTIONAL_VARIANTS.map((id) => profile.variants[id]).filter(Boolean)] as NpcPortraitVariantMeta[];
  if (pool.length === 0) return profile.primary;
  const idx = Math.abs(hashString(`${input.templateId}:${bucket}`)) % pool.length;
  return pool[idx] ?? profile.primary;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}
