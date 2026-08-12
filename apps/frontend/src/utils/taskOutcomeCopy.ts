import type { CompleteTaskResponse } from '@/api/client';

/** Client-side narrative copy for slice messageKeys — no backend/content changes. */
const OUTCOME_MESSAGES: Record<string, string> = {
  'slice.task.demo_elderly.help.completed':
    'Hai aiutato la signora ad attraversare la strada.',
  'slice.task.demo_elderly.ignore.completed': 'Hai ignorato la signora.',
  'slice.task.demo_elderly.steal_wallet.completed': 'Hai rubato il portafoglio.',
  'slice.task.demo_elderly.steal_wallet.risk.witnessed':
    'Qualcuno ha visto quello che hai fatto.',
  'slice.task.demo_elderly.steal_wallet.risk.identified':
    'Ti hanno riconosciuto: la cosa non è passata inosservata.',
  'slice.task.demo_boss.late.end_positive.completed':
    'Il capo accetta le tue spiegazioni. Il rapporto migliora.',
  'slice.task.demo_boss.late.end_neutral.completed':
    'La conversazione si chiude senza grandi conseguenze.',
  'slice.task.demo_boss.late.end_negative.completed':
    'Il capo non è soddisfatto. La tua reputazione ne risente.',
  'slice.task.demo_boss.late.end_negative.risk.witnessed':
    'Qualcuno in ufficio ha notato il tono della conversazione.',
  'slice.task.demo_neighbor.help.completed': 'Hai aiutato il vicino.',
  'slice.task.demo_neighbor.ignore.completed': 'Hai ignorato la richiesta del vicino.',
  'slice.task.demo_suitcase.accept.completed': 'Hai accettato la valigia.',
  'slice.task.demo_suitcase.refuse.completed': 'Hai rifiutato la valigia.',
  'slice.task.demo_suitcase.ask_contents.completed': 'Hai chiesto cosa contiene la valigia.',
  'slice.task.demo_found_wallet.return.completed': 'Hai restituito il portafoglio.',
  'slice.task.demo_found_wallet.keep.completed': 'Hai tenuto il portafoglio trovato.',
  'slice.task.demo_work.colleague.cover.completed': 'Hai coperto il collega. Il cliente è stato aiutato.',
  'slice.task.demo_work.colleague.decline.completed': 'Hai rifiutato di coprire il collega.',
  'slice.task.demo_work.colleague.report.completed': 'Hai segnalato la situazione al responsabile.',
  'slice.task.demo_work.supplier.follow_up.completed': 'Hai contattato il fornitore per sbloccare la consegna.',
  'slice.task.demo_work.supplier.wait.completed': 'Hai chiesto ancora un po\' di tempo a chi aspetta.',
  'slice.task.demo_work.supplier.blame.completed': 'Hai scaricato la colpa sul fornitore.',
  'slice.task.demo_family.answer.completed': 'Hai risposto al familiare e lo hai aiutato.',
  'slice.task.demo_family.callback.completed': 'Hai promesso di richiamare più tardi.',
  'slice.task.demo_family.ignore.completed': 'Non hai risposto alla chiamata di famiglia.',
  'slice.task.demo_acquaintance.help.completed': 'Hai aiutato il conoscente.',
  'slice.task.demo_acquaintance.polite_no.completed': 'Hai rifiutato con gentilezza.',
  'slice.task.demo_acquaintance.rude_no.completed': 'Hai mandato via il conoscente bruscamente.',
  'slice.task.demo_shady.buy.completed': 'Hai accettato l\'affare sospetto.',
  'slice.task.demo_shady.refuse.completed': 'Hai rifiutato l\'offerta e te ne sei andato.',
  'slice.task.demo_shady.report.completed': 'Hai segnalato l\'offerta sospetta.',
  'slice.task.demo_charity.donate.completed': 'Hai donato alla causa.',
  'slice.task.demo_charity.decline.completed': 'Hai rifiutato educatamente la colletta.',
  'slice.task.demo_charity.ignore.completed': 'Sei passato oltre senza rispondere.',
  'slice.task.demo_landlord.end_positive.completed': 'Hai trovato un accordo con il padrone di casa.',
  'slice.task.demo_landlord.end_neutral.completed': 'La questione con il padrone di casa resta in sospeso.',
  'slice.task.demo_landlord.end_negative.completed': 'Il rapporto con il padrone di casa è peggiorato.',
  'slice.task.demo_friend_debt.end_lend.completed': 'Hai prestato i soldi al tuo amico.',
  'slice.task.demo_friend_debt.end_partial.completed': 'Hai prestato una parte della somma.',
  'slice.task.demo_friend_debt.end_positive.completed': 'Hai aiutato l\'amico senza prestare soldi.',
  'slice.task.demo_friend_debt.end_neutral.completed': 'La conversazione si è chiusa senza prestito.',
  'slice.task.demo_friend_debt.end_negative.completed': 'Hai rifiutato nettamente l\'amico.',
  'slice.task.v2.work.client.calm.completed': 'Hai calmato il cliente e trovato una soluzione.',
  'slice.task.v2.work.client.defer.completed': 'Hai rimandato la conversazione in privato.',
  'slice.task.v2.work.client.dismiss.completed': 'Hai mandato via il cliente bruscamente.',
  'slice.task.v2.work.boss.accept.completed': 'Hai accettato la critica e chiesto come migliorare.',
  'slice.task.v2.work.boss.deflect.completed': 'Hai scaricato la colpa su fattori esterni.',
  'slice.task.v2.work.boss.apologize.completed': 'Ti sei scusato e hai chiuso lì.',
  'slice.task.v2.work.error.fix.completed': 'Hai corretto l\'errore e avvisato tutti.',
  'slice.task.v2.work.error.hide.completed': 'Hai sperato che nessuno se ne accorgesse.',
  'slice.task.v2.work.error.blame.completed': 'Hai dato la colpa al software.',
  'slice.task.v2.work.deadline.help.completed': 'Hai aiutato il collega a rispettare la scadenza.',
  'slice.task.v2.work.deadline.partial.completed': 'Hai preso solo una parte del lavoro.',
  'slice.task.v2.work.deadline.refuse.completed': 'Hai rifiutato: avevi già i tuoi impegni.',
  'slice.task.v2.work.tip.accept.completed': 'Hai accettato il ringraziamento spontaneo.',
  'slice.task.v2.work.tip.share.completed': 'Hai condiviso il contributo con chi ha aiutato.',
  'slice.task.v2.work.tip.decline.completed': 'Hai rifiutato educatamente il contributo.',
  'slice.task.v2.family.visit.welcome.completed': 'Hai accolto il familiare a sorpresa.',
  'slice.task.v2.family.visit.reschedule.completed': 'Hai proposto di vedervi un\'altra volta.',
  'slice.task.v2.family.visit.avoid.completed': 'Hai fatto finta di non essere in casa.',
  'slice.task.v2.family.repair.fix.completed': 'Hai cercato di sistemare la perdita da solo.',
  'slice.task.v2.family.repair.call_pro.completed': 'Hai chiamato un tecnico per la perdita.',
  'slice.task.v2.family.repair.ignore.completed': 'Hai lasciato la perdita per dopo.',
  'slice.task.v2.social.noise.knock.completed': 'Sei salito a chiedere di abbassare la musica.',
  'slice.task.v2.social.noise.tolerate.completed': 'Hai aspettato che la musica finisse.',
  'slice.task.v2.social.noise.complain.completed': 'Hai lasciato un biglietto aggressivo.',
  'slice.task.v2.social.bag.watch.completed': 'Hai accettato di guardare la borsa.',
  'slice.task.v2.social.bag.refuse.completed': 'Hai rifiutato di guardare la borsa.',
  'slice.task.v2.social.bag.ask.completed': 'Hai chiesto cosa contiene la borsa.',
  'slice.task.v2.social.friend.coffee.completed': 'Hai offerto un caffè al vecchio amico.',
  'slice.task.v2.social.friend.rain_check.completed': 'Avete scambiato i contatti per dopo.',
  'slice.task.v2.social.friend.ignore.completed': 'Hai fatto finta di non averlo visto.',
  'slice.task.v2.econ.bill.pay.completed': 'Hai pagato la bolletta salata.',
  'slice.task.v2.econ.bill.delay.completed': 'Hai rimandato il pagamento al prossimo mese.',
  'slice.task.v2.econ.bill.dispute.completed': 'Hai contestato l\'importo della bolletta.',
  'slice.task.v2.econ.flip.sell.completed': 'Hai accettato l\'offerta lampo.',
  'slice.task.v2.econ.flip.negotiate.completed': 'Hai trattato e venduto a un prezzo migliore.',
  'slice.task.v2.econ.flip.decline.completed': 'Hai rifiutato l\'offerta: non ti fidavi.',
  'slice.task.v2.econ.request.lend.completed': 'Hai prestato i soldi al conoscente.',
  'slice.task.v2.econ.request.partial.completed': 'Hai offerto metà della somma richiesta.',
  'slice.task.v2.econ.request.refuse.completed': 'Hai rifiutato la richiesta di denaro.',
  'slice.task.v2.weird.flyer.curious.completed': 'Hai letto il volantino bizzarro.',
  'slice.task.v2.weird.flyer.laugh.completed': 'Hai riso e te ne sei andato.',
  'slice.task.v2.weird.flyer.report.completed': 'Hai segnalato lo sconosciuto come sospetto.',
  'slice.task.v2.found.phone.return.completed': 'Hai restituito il telefono trovato.',
  'slice.task.v2.found.phone.keep.completed': 'Hai tenuto il telefono abbandonato.',
  'slice.task.v2.found.phone.police.completed': 'Hai portato il telefono in commissariato.',
  'slice.task.v2.parking.pay.completed': 'Hai pagato la multa.',
  'slice.task.v2.parking.toss.completed': 'Hai gettato via il foglio della multa.',
  'slice.task.v2.parking.appeal.completed': 'Hai presentato ricorso contro la multa.',
  'slice.task.v2.dialogue.supervisor.end_positive.completed': 'Il superiore apprezza il tuo approccio.',
  'slice.task.v2.dialogue.supervisor.end_neutral.completed': 'La valutazione si chiude senza slanci.',
  'slice.task.v2.dialogue.supervisor.end_negative.completed': 'Il superiore non è soddisfatto del colloquio.',
  'slice.task.v2.dialogue.family.end_positive.completed': 'La lite in famiglia si attenua.',
  'slice.task.v2.dialogue.family.end_neutral.completed': 'La tensione cala, ma niente è risolto.',
  'slice.task.v2.dialogue.family.end_negative.completed': 'La situazione familiare peggiora.',
  'slice.task.v2.dialogue.neighbor.end_positive.completed': 'Hai trovato un accordo con il vicino.',
  'slice.task.v2.dialogue.neighbor.end_neutral.completed': 'Tregua incerta con il vicino.',
  'slice.task.v2.dialogue.neighbor.end_negative.completed': 'Il rapporto con il vicino è rovinato.',
  'slice.task.v2.dialogue.scam.end_positive.completed': 'Hai evitato la truffa telefonica.',
  'slice.task.v2.dialogue.scam.end_neutral.completed': 'La chiamata sospetta finisce senza danni.',
  'slice.task.v2.dialogue.scam.end_negative.completed': 'Sei caduto nella truffa telefonica.',
};

export function resolveOutcomeMessage(messageKey: string): string {
  return OUTCOME_MESSAGES[messageKey] ?? 'Hai completato la scelta.';
}

function formatDelta(value: number): string | null {
  if (value === 0) return null;
  return value > 0 ? `+${value}` : `${value}`;
}

function formatCashDelta(deltaMinor: string): string | null {
  const n = Number(deltaMinor);
  if (!Number.isFinite(n) || n === 0) return null;
  return n > 0 ? `+${deltaMinor}` : deltaMinor;
}

export interface TaskOutcomeDisplay {
  summary: string;
  sympathyDelta: string | null;
  reputationDelta: string | null;
  cashDelta: string | null;
  riskMessage?: string;
  profileUnlocks?: string[];
}

export function buildTaskOutcome(result: CompleteTaskResponse): TaskOutcomeDisplay {
  const { effectsApplied, messageKey } = result;
  const risk = effectsApplied.risk?.outcome;
  let riskMessage: string | undefined;
  if (risk?.visibility === 'visible' && risk.messageKey) {
    riskMessage = resolveOutcomeMessage(risk.messageKey);
  }

  return {
    summary: resolveOutcomeMessage(messageKey),
    sympathyDelta: formatDelta(effectsApplied.personalValues.sympathy),
    reputationDelta: formatDelta(effectsApplied.personalValues.reputation),
    cashDelta: formatCashDelta(effectsApplied.economic.cash.deltaMinor),
    riskMessage,
    profileUnlocks: result.profileUnlocks?.map((unlock) => unlock.label),
  };
}

const SECONDARY_OPTION_IDS = new Set([
  'ignore',
  'refuse',
  'return_wallet',
  'go_to_desk',
  'ask_contents',
  'steal_wallet',
  'ask_directly',
  'accept',
  'keep_wallet',
  'conclude',
  'decline',
  'report',
  'blame',
  'rude_no',
  'buy',
  'refuse_immediately',
  'deny',
  'get_angry',
  'walk_away',
  'refuse_firm',
]);

export function optionButtonClass(option: {
  optionId: string;
  presentationHint?: string;
}): string {
  if (option.presentationHint === 'dialogue_line') return 'buttonSecondary';
  if (SECONDARY_OPTION_IDS.has(option.optionId)) return 'buttonSecondary';
  return 'buttonPrimary';
}
