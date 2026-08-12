import type {
  NpcCategory,
  NpcRelationshipQuery,
} from '../../slice/npc-relationship-constants.js';

export interface KnownRelationshipSnapshot {
  templateId: string;
  npcId: string;
  category: NpcCategory | string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relationshipLevel: number;
  interactionCount: number;
  lastOutcomeSummary: string | null;
  appliedConsequenceKeys: ReadonlySet<string>;
}

function levelMatches(
  relationship: KnownRelationshipSnapshot,
  query: NpcRelationshipQuery,
): boolean {
  if (query.minLevel !== undefined && relationship.relationshipLevel < query.minLevel) {
    return false;
  }
  if (query.maxLevel !== undefined && relationship.relationshipLevel > query.maxLevel) {
    return false;
  }
  return true;
}

function templateMatches(
  relationship: KnownRelationshipSnapshot | null,
  query: NpcRelationshipQuery,
): boolean {
  if (!query.templateId) return true;
  return relationship?.templateId === query.templateId;
}

function categoryMatches(
  relationship: KnownRelationshipSnapshot | null,
  query: NpcRelationshipQuery,
): boolean {
  if (!query.category) return true;
  return relationship?.category === query.category;
}

export function matchesNpcRelationshipQuery(
  query: NpcRelationshipQuery,
  relationship: KnownRelationshipSnapshot | null,
): boolean {
  switch (query.filter) {
    case 'new':
      if (!query.templateId) {
        return !relationship || relationship.interactionCount === 0;
      }
      if (!relationship) {
        return true;
      }
      if (relationship.templateId !== query.templateId) {
        return true;
      }
      return relationship.interactionCount === 0;

    case 'known':
      if (!relationship || relationship.interactionCount === 0) {
        return false;
      }
      return (
        templateMatches(relationship, query) &&
        categoryMatches(relationship, query) &&
        levelMatches(relationship, query)
      );

    case 'positive':
      if (!relationship || relationship.sentiment !== 'positive') {
        return false;
      }
      return (
        templateMatches(relationship, query) &&
        categoryMatches(relationship, query) &&
        levelMatches(relationship, query)
      );

    case 'negative':
      if (!relationship || relationship.sentiment !== 'negative') {
        return false;
      }
      return (
        templateMatches(relationship, query) &&
        categoryMatches(relationship, query) &&
        levelMatches(relationship, query)
      );

    case 'neutral':
      if (!relationship || relationship.sentiment !== 'neutral') {
        return false;
      }
      return (
        templateMatches(relationship, query) &&
        categoryMatches(relationship, query) &&
        levelMatches(relationship, query)
      );

    default:
      return false;
  }
}

export function resolveRelationshipForTemplate(
  relationships: ReadonlyMap<string, KnownRelationshipSnapshot>,
  templateId: string | undefined,
): KnownRelationshipSnapshot | null {
  if (!templateId) return null;
  return relationships.get(templateId) ?? null;
}
