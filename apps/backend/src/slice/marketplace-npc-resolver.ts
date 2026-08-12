import { createHash } from 'node:crypto';
import { INITIAL_NPC_ROSTER } from './initial-npc-roster.js';

const NPC_TEMPLATE_PREFIX = 'npc_template:';

/** Deterministic NPC template pick from roster for marketplace automation. */
export function pickMarketplaceNpcTemplateId(seed: string): string {
  const hash = createHash('sha256').update(seed).digest();
  const index = hash[0]! % INITIAL_NPC_ROSTER.length;
  return INITIAL_NPC_ROSTER[index]!.templateId;
}

export function marketplaceNpcTemplateRef(templateId: string): string {
  return `${NPC_TEMPLATE_PREFIX}${templateId}`;
}

export function parseMarketplaceNpcTemplateRef(ref: string): string | null {
  if (!ref.startsWith(NPC_TEMPLATE_PREFIX)) return null;
  return ref.slice(NPC_TEMPLATE_PREFIX.length);
}

export function marketplaceNpcDisplayName(templateRef: string): string {
  const templateId = parseMarketplaceNpcTemplateRef(templateRef);
  const def = INITIAL_NPC_ROSTER.find((entry) => entry.templateId === templateId);
  return def?.displayName ?? 'Un cittadino del Comune';
}
