import type { NpcConsequenceType } from '../../slice/npc-relationship-consequences-constants.js';
import type { NpcRecord } from '../../domain/ports/repositories.js';
import type { KnownRelationshipSnapshot } from './npc-relationship-query.js';

function buildMemoryLine(
  npc: NpcRecord,
  relationship: KnownRelationshipSnapshot | null,
): string | undefined {
  if (!relationship?.lastOutcomeSummary || relationship.interactionCount === 0) {
    return undefined;
  }

  const name = npc.displayName ?? 'Qualcuno';
  const summary = relationship.lastOutcomeSummary.toLowerCase();

  if (summary.startsWith('lo ')) {
    return `${name} ricorda che ${summary.replace(/^lo /, 'lo avevi ')}.`;
  }
  if (summary.startsWith('hai ')) {
    return `${name} ricorda che ${summary.replace(/^hai /, 'avevi ')}.`;
  }
  if (summary.startsWith('haj ')) {
    return `${name} ricorda che ${summary}.`;
  }

  return `${name} si ricorda che ${summary}.`;
}

function buildConsequenceLine(
  consequenceType: NpcConsequenceType,
  displayName: string,
  sentiment: 'positive' | 'negative' | 'neutral',
): string {
  switch (consequenceType) {
    case 'opportunity':
      return 'Un favore torna indietro. Il Comune prende atto che, occasionalmente, fare qualcosa per gli altri può avere conseguenze utili.';
    case 'favor':
      return sentiment === 'positive'
        ? `${displayName} sembra disposto a ricambiare. Una novità, in generale.`
        : `${displayName} chiede un altro favore. Il passato, per fortuna, non sempre pesa.`;
    case 'refusal':
      return `${displayName} non sembra incline ad aiutarti. Strano, considerato come vi siete lasciati l'ultima volta.`;
    case 'introduction':
      return `${displayName} ti presenta qualcuno. Le presentazioni funzionano meglio quando non devi scusarti per l'ultima volta che vi siete visti.`;
    case 'warning':
      return `${displayName} non ha dimenticato. Che memoria straordinaria. Peccato che sia stata utilizzata contro di te.`;
    case 'social_reaction':
      if (sentiment === 'positive') {
        return `${displayName} si fida ancora di te. Una scelta sorprendentemente sensata da parte sua.`;
      }
      if (sentiment === 'negative') {
        return `${displayName} si ricorda di te. Purtroppo anche di quello che hai fatto.`;
      }
      return `${displayName} ti riconosce. Non entusiasta, non ostile: la zona grigia delle relazioni di vicinato.`;
    default:
      return `${displayName} ti riconosce. Il passato pesa, ma almeno pesa con stile.`;
  }
}

export function buildNpcConsequencePresentation(input: {
  npc: NpcRecord;
  relationship: KnownRelationshipSnapshot | null;
  consequenceType?: NpcConsequenceType;
}): { memoryLine?: string; consequenceLine?: string } {
  const displayName = input.npc.displayName ?? 'Qualcuno';
  const sentiment = input.relationship?.sentiment ?? 'neutral';
  const memoryLine = buildMemoryLine(input.npc, input.relationship);
  const consequenceLine = input.consequenceType
    ? buildConsequenceLine(input.consequenceType, displayName, sentiment)
    : undefined;

  return { memoryLine, consequenceLine };
}
