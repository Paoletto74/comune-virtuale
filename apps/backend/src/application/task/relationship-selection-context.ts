import type { CitizenNpcRelationshipRepository } from '../../domain/ports/repositories.js';
import type { KnownRelationshipSnapshot } from '../npc/npc-relationship-query.js';

function readAppliedConsequenceKeys(metadata: Record<string, unknown>): Set<string> {
  const raw = metadata.appliedConsequenceKeys;
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.filter((entry): entry is string => typeof entry === 'string'));
}

export async function buildRelationshipSelectionContext(
  relationships: CitizenNpcRelationshipRepository,
  citizenId: string,
): Promise<Map<string, KnownRelationshipSnapshot>> {
  const known = await relationships.findKnownByCitizen(citizenId);
  const byTemplate = new Map<string, KnownRelationshipSnapshot>();

  for (const entry of known) {
    const templateId = entry.npc.npcTemplateId;
    if (!templateId) continue;

    byTemplate.set(templateId, {
      templateId,
      npcId: entry.npcId,
      category: entry.npc.category ?? 'unknown',
      sentiment: entry.sentiment,
      relationshipLevel: entry.relationshipLevel,
      interactionCount: entry.interactionCount,
      lastOutcomeSummary: entry.lastOutcomeSummary,
      appliedConsequenceKeys: readAppliedConsequenceKeys(entry.metadata),
    });
  }

  return byTemplate;
}
