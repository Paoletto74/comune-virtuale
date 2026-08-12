/**
 * V1-CONTENT-VARIETY-2 — runtime slice tasks (NOT content pack modifications).
 */

export interface VarietyV2StandardTaskDef {
  definitionId: string;
  title: string;
  description: string;
  options: ReadonlyArray<{ optionId: string; label: string }>;
  messageKeys: Record<string, string>;
  effects: Record<
    string,
    { sympathy?: number; reputation?: number; cashDeltaMinor?: bigint; cashReason?: string }
  >;
}

const TX_REWARD = { transactionType: 'taskReward', transactionClass: 'money_creation' as const };
const TX_SPEND = { transactionType: 'taskSpending', transactionClass: 'money_transfer' as const };

export const VARIETY_V2_STANDARD_TASKS: readonly VarietyV2StandardTaskDef[] = [
  {
    definitionId: 'DEMO_V2_WORK_CLIENT_ANGER',
    title: 'Cliente furioso',
    description:
      'Un cliente insiste che gli avete fatto aspettare troppo. Vuole una risposta adesso, davanti a tutti.',
    options: [
      { optionId: 'calm', label: 'Lo calmi e gli offri una soluzione' },
      { optionId: 'defer', label: 'Chiedi di parlarne in privato più tardi' },
      { optionId: 'dismiss', label: 'Lo mandi via senza mezzi termini' },
    ],
    messageKeys: {
      calm: 'slice.task.v2.work.client.calm.completed',
      defer: 'slice.task.v2.work.client.defer.completed',
      dismiss: 'slice.task.v2.work.client.dismiss.completed',
    },
    effects: {
      calm: { reputation: 1 },
      defer: {},
      dismiss: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V2_WORK_BOSS_CRITICISM',
    title: 'Nota del superiore',
    description:
      'Il tuo superiore ti ferma un momento: dice che l\'ultima consegna non era all\'altezza.',
    options: [
      { optionId: 'accept', label: 'Accetti la critica e chiedi come migliorare' },
      { optionId: 'deflect', label: 'Spieghi che dipendeva da fattori esterni' },
      { optionId: 'apologize', label: 'Ti scusi senza aggiungere altro' },
    ],
    messageKeys: {
      accept: 'slice.task.v2.work.boss.accept.completed',
      deflect: 'slice.task.v2.work.boss.deflect.completed',
      apologize: 'slice.task.v2.work.boss.apologize.completed',
    },
    effects: {
      accept: { reputation: 1 },
      deflect: { reputation: -1 },
      apologize: {},
    },
  },
  {
    definitionId: 'DEMO_V2_WORK_ERROR_FOUND',
    title: 'Errore sul lavoro',
    description: 'Ti accorgi di aver inviato un documento sbagliato a un fornitore importante.',
    options: [
      { optionId: 'fix_now', label: 'Correggi subito e avvisi tutti' },
      { optionId: 'hide', label: 'Speri che nessuno se ne accorga' },
      { optionId: 'blame_system', label: 'Dici che è colpa del software' },
    ],
    messageKeys: {
      fix_now: 'slice.task.v2.work.error.fix.completed',
      hide: 'slice.task.v2.work.error.hide.completed',
      blame_system: 'slice.task.v2.work.error.blame.completed',
    },
    effects: {
      fix_now: { reputation: 1 },
      hide: { reputation: -1 },
      blame_system: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V2_WORK_DEADLINE_HELP',
    title: 'Scadenza stretta',
    description:
      'Un collega è in difficoltà con una scadenza di stasera e chiede il tuo aiuto.',
    options: [
      { optionId: 'help', label: 'Lo aiuti a finire' },
      { optionId: 'partial', label: 'Prendi solo una parte del lavoro' },
      { optionId: 'refuse', label: 'Rifiuti: hai già i tuoi impegni' },
    ],
    messageKeys: {
      help: 'slice.task.v2.work.deadline.help.completed',
      partial: 'slice.task.v2.work.deadline.partial.completed',
      refuse: 'slice.task.v2.work.deadline.refuse.completed',
    },
    effects: {
      help: { sympathy: 1 },
      partial: { reputation: 1 },
      refuse: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V2_WORK_TIP_JAR',
    title: 'Ringraziamento inaspettato',
    description:
      'Dopo aver risolto una piccola emergenza, qualcuno lascia un contributo spontaneo sul bancone.',
    options: [
      { optionId: 'accept', label: 'Accetti con gratitudine' },
      { optionId: 'share', label: 'Lo condividi con chi ha aiutato' },
      { optionId: 'decline', label: 'Rifiuti educatamente' },
    ],
    messageKeys: {
      accept: 'slice.task.v2.work.tip.accept.completed',
      share: 'slice.task.v2.work.tip.share.completed',
      decline: 'slice.task.v2.work.tip.decline.completed',
    },
    effects: {
      accept: { cashDeltaMinor: 6n, cashReason: 'DEMO_V2_WORK_TIP_CASH' },
      share: { sympathy: 1, cashDeltaMinor: 3n, cashReason: 'DEMO_V2_WORK_TIP_SHARE_CASH' },
      decline: { reputation: 1 },
    },
  },
  {
    definitionId: 'DEMO_V2_FAMILY_UNEXPECTED_VISIT',
    title: 'Visita a sorpresa',
    description: 'Un familiare suona alla porta senza preavviso, con le valigie in mano.',
    options: [
      { optionId: 'welcome', label: 'Lo accogli' },
      { optionId: 'reschedule', label: 'Proponi di vedervi un\'altra volta' },
      { optionId: 'avoid', label: 'Fai finta di non essere in casa' },
    ],
    messageKeys: {
      welcome: 'slice.task.v2.family.visit.welcome.completed',
      reschedule: 'slice.task.v2.family.visit.reschedule.completed',
      avoid: 'slice.task.v2.family.visit.avoid.completed',
    },
    effects: {
      welcome: { sympathy: 1 },
      reschedule: { reputation: 1 },
      avoid: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V2_FAMILY_HOME_REPAIR',
    title: 'Problema in casa',
    description: 'Trovi una perdita d\'acqua nel bagno proprio mentre stai uscendo.',
    options: [
      { optionId: 'fix', label: 'Cerchi di sistemare tu' },
      { optionId: 'call_pro', label: 'Chiami un tecnico' },
      { optionId: 'ignore', label: 'Lo lasci per dopo' },
    ],
    messageKeys: {
      fix: 'slice.task.v2.family.repair.fix.completed',
      call_pro: 'slice.task.v2.family.repair.call_pro.completed',
      ignore: 'slice.task.v2.family.repair.ignore.completed',
    },
    effects: {
      fix: {},
      call_pro: { cashDeltaMinor: -12n, cashReason: 'DEMO_V2_FAMILY_REPAIR_CASH' },
      ignore: {},
    },
  },
  {
    definitionId: 'DEMO_V2_SOCIAL_NEIGHBOR_NOISE',
    title: 'Rumori dal piano di sopra',
    description: 'Sono le undici di sera e dal piano di sopra arriva musica alta.',
    options: [
      { optionId: 'knock', label: 'Salire a chiedere di abbassare' },
      { optionId: 'tolerate', label: 'Aspettare che finisca' },
      { optionId: 'complain', label: 'Lasci un biglietto aggressivo' },
    ],
    messageKeys: {
      knock: 'slice.task.v2.social.noise.knock.completed',
      tolerate: 'slice.task.v2.social.noise.tolerate.completed',
      complain: 'slice.task.v2.social.noise.complain.completed',
    },
    effects: {
      knock: { sympathy: 1 },
      tolerate: {},
      complain: { sympathy: -1, reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V2_SOCIAL_STRANGER_BAG',
    title: 'Favore sospetto',
    description:
      'Uno sconosciuto ti chiede di guardare la sua borsa «solo un minuto» mentre va in bagno.',
    options: [
      { optionId: 'watch', label: 'Accetti' },
      { optionId: 'refuse', label: 'Rifiuti' },
      { optionId: 'ask', label: 'Chiedi cosa contiene' },
    ],
    messageKeys: {
      watch: 'slice.task.v2.social.bag.watch.completed',
      refuse: 'slice.task.v2.social.bag.refuse.completed',
      ask: 'slice.task.v2.social.bag.ask.completed',
    },
    effects: {
      watch: { reputation: -1 },
      refuse: {},
      ask: { reputation: 1 },
    },
  },
  {
    definitionId: 'DEMO_V2_SOCIAL_OLD_FRIEND',
    title: 'Incontro casuale',
    description: 'In coda al bar riconosci un vecchio amico che non vedi da anni.',
    options: [
      { optionId: 'coffee', label: 'Offri un caffè e parlate' },
      { optionId: 'rain_check', label: 'Scambiate i contatti per dopo' },
      { optionId: 'ignore', label: 'Fai finta di non averlo visto' },
    ],
    messageKeys: {
      coffee: 'slice.task.v2.social.friend.coffee.completed',
      rain_check: 'slice.task.v2.social.friend.rain_check.completed',
      ignore: 'slice.task.v2.social.friend.ignore.completed',
    },
    effects: {
      coffee: { sympathy: 1, cashDeltaMinor: -5n, cashReason: 'DEMO_V2_SOCIAL_COFFEE_CASH' },
      rain_check: {},
      ignore: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V2_ECON_BILL_SHOCK',
    title: 'Bolletta salata',
    description: 'Arriva una bolletta molto più alta del previsto.',
    options: [
      { optionId: 'pay', label: 'Paghi subito' },
      { optionId: 'delay', label: 'Rimandi al prossimo mese' },
      { optionId: 'dispute', label: 'Contesti l\'importo' },
    ],
    messageKeys: {
      pay: 'slice.task.v2.econ.bill.pay.completed',
      delay: 'slice.task.v2.econ.bill.delay.completed',
      dispute: 'slice.task.v2.econ.bill.dispute.completed',
    },
    effects: {
      pay: { cashDeltaMinor: -55n, cashReason: 'DEMO_V2_ECON_BILL_CASH' },
      delay: {},
      dispute: {},
    },
  },
  {
    definitionId: 'DEMO_V2_ECON_FLIP_OFFER',
    title: 'Offerta lampo',
    description: 'Qualcuno ti propone di comprare subito un oggetto che avevi dimenticato di vendere.',
    options: [
      { optionId: 'sell', label: 'Accetti l\'offerta' },
      { optionId: 'negotiate', label: 'Provi a trattare' },
      { optionId: 'decline', label: 'Rifiuti: non ti fida' },
    ],
    messageKeys: {
      sell: 'slice.task.v2.econ.flip.sell.completed',
      negotiate: 'slice.task.v2.econ.flip.negotiate.completed',
      decline: 'slice.task.v2.econ.flip.decline.completed',
    },
    effects: {
      sell: { cashDeltaMinor: 12n, cashReason: 'DEMO_V2_ECON_FLIP_CASH' },
      negotiate: { cashDeltaMinor: 9n, cashReason: 'DEMO_V2_ECON_FLIP_CASH' },
      decline: {},
    },
  },
  {
    definitionId: 'DEMO_V2_ECON_CASH_REQUEST',
    title: 'Richiesta di denaro',
    description: 'Un conoscente ti scrive chiedendo trenta fino a fine settimana.',
    options: [
      { optionId: 'lend', label: 'Gli presti i soldi' },
      { optionId: 'partial', label: 'Offri metà' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      lend: 'slice.task.v2.econ.request.lend.completed',
      partial: 'slice.task.v2.econ.request.partial.completed',
      refuse: 'slice.task.v2.econ.request.refuse.completed',
    },
    effects: {
      lend: { sympathy: 1, cashDeltaMinor: -30n, cashReason: 'DEMO_V2_ECON_LEND_CASH' },
      partial: { cashDeltaMinor: -15n, cashReason: 'DEMO_V2_ECON_LEND_CASH' },
      refuse: {},
    },
  },
  {
    definitionId: 'DEMO_V2_WEIRD_FLYER',
    title: 'Volantino bizzarro',
    description:
      'Un signore in costume ti spinge un volantino per un «circolo della fortuna interdimensionale».',
    options: [
      { optionId: 'curious', label: 'Prendi il volantino e leggi' },
      { optionId: 'laugh', label: 'Ridi e te ne vai' },
      { optionId: 'report', label: 'Lo segnali come sospetto' },
    ],
    messageKeys: {
      curious: 'slice.task.v2.weird.flyer.curious.completed',
      laugh: 'slice.task.v2.weird.flyer.laugh.completed',
      report: 'slice.task.v2.weird.flyer.report.completed',
    },
    effects: {
      curious: { sympathy: 1 },
      laugh: { reputation: -1 },
      report: { reputation: 1 },
    },
  },
  {
    definitionId: 'DEMO_V2_FOUND_PHONE',
    title: 'Telefono abbandonato',
    description: 'Trovi un telefono su una panchina, ancora acceso.',
    options: [
      { optionId: 'return', label: 'Cerchi il proprietario' },
      { optionId: 'keep', label: 'Lo tieni' },
      { optionId: 'police', label: 'Lo porti in commissariato' },
    ],
    messageKeys: {
      return: 'slice.task.v2.found.phone.return.completed',
      keep: 'slice.task.v2.found.phone.keep.completed',
      police: 'slice.task.v2.found.phone.police.completed',
    },
    effects: {
      return: { reputation: 1 },
      keep: { reputation: -2, cashDeltaMinor: 8n, cashReason: 'DEMO_V2_FOUND_PHONE_CASH' },
      police: { reputation: 1 },
    },
  },
  {
    definitionId: 'DEMO_V2_PARKING_TICKET',
    title: 'Multa sul parabrezza',
    description: 'Trovi una multa sul parabrezza. Il posto sembrava libero.',
    options: [
      { optionId: 'pay', label: 'Paghi' },
      { optionId: 'toss', label: 'Getti via il foglio' },
      { optionId: 'appeal', label: 'Presenti ricorso' },
    ],
    messageKeys: {
      pay: 'slice.task.v2.parking.pay.completed',
      toss: 'slice.task.v2.parking.toss.completed',
      appeal: 'slice.task.v2.parking.appeal.completed',
    },
    effects: {
      pay: { cashDeltaMinor: -20n, cashReason: 'DEMO_V2_PARKING_CASH' },
      toss: { reputation: -1 },
      appeal: {},
    },
  },
];

export const VARIETY_V2_STANDARD_DEFINITION_IDS = VARIETY_V2_STANDARD_TASKS.map(
  (task) => task.definitionId,
);

export function varietyV2CashEffect(
  deltaMinor: bigint,
  reasonCode: string,
  kind: 'reward' | 'spend' = deltaMinor >= 0n ? 'reward' : 'spend',
) {
  const tx = kind === 'reward' ? TX_REWARD : TX_SPEND;
  return {
    kind: 'cash_delta' as const,
    deltaMinor,
    transactionType: tx.transactionType,
    transactionClass: tx.transactionClass,
    reasonCode,
  };
}
