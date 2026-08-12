/**
 * V1-CONTENT-VARIETY-1 — runtime slice tasks (NOT content pack modifications).
 * Generic work/social/unexpected situations — no profession system required.
 */

export const VARIETY_POOL_WEIGHT = 25;

/** Work — generic workplace situations (no specific profession). */
export const DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID = 'DEMO_WORK_COLLEAGUE_COVER';
export const DEMO_WORK_COLLEAGUE_OPTION_COVER = 'cover';
export const DEMO_WORK_COLLEAGUE_OPTION_DECLINE = 'decline';
export const DEMO_WORK_COLLEAGUE_OPTION_REPORT = 'report';

export const DEMO_WORK_COLLEAGUE_COVER_CONTENT = {
  taskId: DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID,
  title: 'Al lavoro',
  description:
    'Un collega ti chiede di coprire un impegno al posto suo: un cliente attende risposta entro oggi.',
  optionLabels: {
    [DEMO_WORK_COLLEAGUE_OPTION_COVER]: 'Accetti di coprirlo',
    [DEMO_WORK_COLLEAGUE_OPTION_DECLINE]: 'Rifiuti educatamente',
    [DEMO_WORK_COLLEAGUE_OPTION_REPORT]: 'Segnali al responsabile',
  },
} as const;

export const DEMO_WORK_COLLEAGUE_COVER_OPTIONS = [
  DEMO_WORK_COLLEAGUE_OPTION_COVER,
  DEMO_WORK_COLLEAGUE_OPTION_DECLINE,
  DEMO_WORK_COLLEAGUE_OPTION_REPORT,
] as const;

export const DEMO_WORK_COLLEAGUE_COVER_MESSAGE_KEYS = {
  [DEMO_WORK_COLLEAGUE_OPTION_COVER]: 'slice.task.demo_work.colleague.cover.completed',
  [DEMO_WORK_COLLEAGUE_OPTION_DECLINE]: 'slice.task.demo_work.colleague.decline.completed',
  [DEMO_WORK_COLLEAGUE_OPTION_REPORT]: 'slice.task.demo_work.colleague.report.completed',
} as const;

export const DEMO_WORK_SUPPLIER_DELAY_DEFINITION_ID = 'DEMO_WORK_SUPPLIER_DELAY';
export const DEMO_WORK_SUPPLIER_OPTION_FOLLOW_UP = 'follow_up';
export const DEMO_WORK_SUPPLIER_OPTION_WAIT = 'wait';
export const DEMO_WORK_SUPPLIER_OPTION_BLAME = 'blame';

export const DEMO_WORK_SUPPLIER_DELAY_CONTENT = {
  taskId: DEMO_WORK_SUPPLIER_DELAY_DEFINITION_ID,
  title: 'Fornitore in ritardo',
  description:
    'Un fornitore non ha consegnato quanto promesso. Ti chiedono come gestire la situazione con chi aspetta.',
  optionLabels: {
    [DEMO_WORK_SUPPLIER_OPTION_FOLLOW_UP]: 'Contatti subito il fornitore',
    [DEMO_WORK_SUPPLIER_OPTION_WAIT]: 'Chiedi ancora un po\' di tempo',
    [DEMO_WORK_SUPPLIER_OPTION_BLAME]: 'Scarichi la colpa sul fornitore',
  },
} as const;

export const DEMO_WORK_SUPPLIER_DELAY_OPTIONS = [
  DEMO_WORK_SUPPLIER_OPTION_FOLLOW_UP,
  DEMO_WORK_SUPPLIER_OPTION_WAIT,
  DEMO_WORK_SUPPLIER_OPTION_BLAME,
] as const;

export const DEMO_WORK_SUPPLIER_DELAY_MESSAGE_KEYS = {
  [DEMO_WORK_SUPPLIER_OPTION_FOLLOW_UP]: 'slice.task.demo_work.supplier.follow_up.completed',
  [DEMO_WORK_SUPPLIER_OPTION_WAIT]: 'slice.task.demo_work.supplier.wait.completed',
  [DEMO_WORK_SUPPLIER_OPTION_BLAME]: 'slice.task.demo_work.supplier.blame.completed',
} as const;

/** Social / personal. */
export const DEMO_FAMILY_CHECKIN_DEFINITION_ID = 'DEMO_FAMILY_CHECKIN';
export const DEMO_FAMILY_OPTION_ANSWER = 'answer';
export const DEMO_FAMILY_OPTION_CALLBACK = 'callback_later';
export const DEMO_FAMILY_OPTION_IGNORE = 'ignore';

export const DEMO_FAMILY_CHECKIN_CONTENT = {
  taskId: DEMO_FAMILY_CHECKIN_DEFINITION_ID,
  title: 'Chiamata da casa',
  description: 'Un familiare ti chiama: ha bisogno di un consiglio su una questione pratica.',
  optionLabels: {
    [DEMO_FAMILY_OPTION_ANSWER]: 'Rispondi e lo aiuti',
    [DEMO_FAMILY_OPTION_CALLBACK]: 'Prometti di richiamare più tardi',
    [DEMO_FAMILY_OPTION_IGNORE]: 'Non rispondi',
  },
} as const;

export const DEMO_FAMILY_CHECKIN_OPTIONS = [
  DEMO_FAMILY_OPTION_ANSWER,
  DEMO_FAMILY_OPTION_CALLBACK,
  DEMO_FAMILY_OPTION_IGNORE,
] as const;

export const DEMO_FAMILY_CHECKIN_MESSAGE_KEYS = {
  [DEMO_FAMILY_OPTION_ANSWER]: 'slice.task.demo_family.answer.completed',
  [DEMO_FAMILY_OPTION_CALLBACK]: 'slice.task.demo_family.callback.completed',
  [DEMO_FAMILY_OPTION_IGNORE]: 'slice.task.demo_family.ignore.completed',
} as const;

export const DEMO_ACQUAINTANCE_FAVOR_DEFINITION_ID = 'DEMO_ACQUAINTANCE_FAVOR';
export const DEMO_ACQUAINTANCE_OPTION_HELP = 'help';
export const DEMO_ACQUAINTANCE_OPTION_POLITE_NO = 'polite_no';
export const DEMO_ACQUAINTANCE_OPTION_RUDE_NO = 'rude_no';

export const DEMO_ACQUAINTANCE_FAVOR_CONTENT = {
  taskId: DEMO_ACQUAINTANCE_FAVOR_DEFINITION_ID,
  title: 'Un conoscente',
  description: 'In strada ti ferma qualcuno che conosci poco: chiede un piccolo favore inaspettato.',
  optionLabels: {
    [DEMO_ACQUAINTANCE_OPTION_HELP]: 'Lo aiuti',
    [DEMO_ACQUAINTANCE_OPTION_POLITE_NO]: 'Rifiuti con gentilezza',
    [DEMO_ACQUAINTANCE_OPTION_RUDE_NO]: 'Lo mandi via bruscamente',
  },
} as const;

export const DEMO_ACQUAINTANCE_FAVOR_OPTIONS = [
  DEMO_ACQUAINTANCE_OPTION_HELP,
  DEMO_ACQUAINTANCE_OPTION_POLITE_NO,
  DEMO_ACQUAINTANCE_OPTION_RUDE_NO,
] as const;

export const DEMO_ACQUAINTANCE_FAVOR_MESSAGE_KEYS = {
  [DEMO_ACQUAINTANCE_OPTION_HELP]: 'slice.task.demo_acquaintance.help.completed',
  [DEMO_ACQUAINTANCE_OPTION_POLITE_NO]: 'slice.task.demo_acquaintance.polite_no.completed',
  [DEMO_ACQUAINTANCE_OPTION_RUDE_NO]: 'slice.task.demo_acquaintance.rude_no.completed',
} as const;

/** Unexpected / morally ambiguous. */
export const DEMO_SHADY_OFFER_DEFINITION_ID = 'DEMO_SHADY_OFFER';
export const DEMO_SHADY_OPTION_BUY = 'buy';
export const DEMO_SHADY_OPTION_REFUSE = 'refuse';
export const DEMO_SHADY_OPTION_REPORT = 'report';

export const DEMO_SHADY_OFFER_CONTENT = {
  taskId: DEMO_SHADY_OFFER_DEFINITION_ID,
  title: 'Offerta sospetta',
  description:
    'Uno sconosciuto ti propone di comprare a prezzo stracciato oggetti che sembrano rubati. Succede mentre vai per i fatti tuoi.',
  optionLabels: {
    [DEMO_SHADY_OPTION_BUY]: 'Accetti l\'affare',
    [DEMO_SHADY_OPTION_REFUSE]: 'Rifiuti e te ne vai',
    [DEMO_SHADY_OPTION_REPORT]: 'Segnali la cosa alle autorità',
  },
} as const;

export const DEMO_SHADY_OFFER_OPTIONS = [
  DEMO_SHADY_OPTION_BUY,
  DEMO_SHADY_OPTION_REFUSE,
  DEMO_SHADY_OPTION_REPORT,
] as const;

export const DEMO_SHADY_OFFER_MESSAGE_KEYS = {
  [DEMO_SHADY_OPTION_BUY]: 'slice.task.demo_shady.buy.completed',
  [DEMO_SHADY_OPTION_REFUSE]: 'slice.task.demo_shady.refuse.completed',
  [DEMO_SHADY_OPTION_REPORT]: 'slice.task.demo_shady.report.completed',
} as const;

export const DEMO_SHADY_BUY_CASH_DELTA_MINOR = 10n;
export const DEMO_SHADY_BUY_CASH_REASON = 'DEMO_SHADY_BUY_CASH';
export const DEMO_SHADY_BUY_CASH_TRANSACTION_TYPE = 'taskReward';
export const DEMO_SHADY_BUY_CASH_TRANSACTION_CLASS = 'money_creation';

/** Economic — charity donation. */
export const DEMO_CHARITY_COLLECTOR_DEFINITION_ID = 'DEMO_CHARITY_COLLECTOR';
export const DEMO_CHARITY_OPTION_DONATE = 'donate';
export const DEMO_CHARITY_OPTION_DECLINE = 'decline_politely';
export const DEMO_CHARITY_OPTION_IGNORE = 'ignore';

export const DEMO_CHARITY_COLLECTOR_CONTENT = {
  taskId: DEMO_CHARITY_COLLECTOR_DEFINITION_ID,
  title: 'Colletta in strada',
  description: 'Un volontario ti chiede una piccola donazione per una causa locale.',
  optionLabels: {
    [DEMO_CHARITY_OPTION_DONATE]: 'Doni qualcosa',
    [DEMO_CHARITY_OPTION_DECLINE]: 'Rifiuti con educazione',
    [DEMO_CHARITY_OPTION_IGNORE]: 'Passi oltre senza rispondere',
  },
} as const;

export const DEMO_CHARITY_COLLECTOR_OPTIONS = [
  DEMO_CHARITY_OPTION_DONATE,
  DEMO_CHARITY_OPTION_DECLINE,
  DEMO_CHARITY_OPTION_IGNORE,
] as const;

export const DEMO_CHARITY_COLLECTOR_MESSAGE_KEYS = {
  [DEMO_CHARITY_OPTION_DONATE]: 'slice.task.demo_charity.donate.completed',
  [DEMO_CHARITY_OPTION_DECLINE]: 'slice.task.demo_charity.decline.completed',
  [DEMO_CHARITY_OPTION_IGNORE]: 'slice.task.demo_charity.ignore.completed',
} as const;

export const DEMO_CHARITY_DONATE_CASH_DELTA_MINOR = -10n;
export const DEMO_CHARITY_DONATE_CASH_REASON = 'DEMO_CHARITY_DONATE_CASH';
export const DEMO_CHARITY_DONATE_CASH_TRANSACTION_TYPE = 'donation';
export const DEMO_CHARITY_DONATE_CASH_TRANSACTION_CLASS = 'money_transfer';

export const VARIETY_STANDARD_DEFINITION_IDS = [
  DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID,
  DEMO_WORK_SUPPLIER_DELAY_DEFINITION_ID,
  DEMO_FAMILY_CHECKIN_DEFINITION_ID,
  DEMO_ACQUAINTANCE_FAVOR_DEFINITION_ID,
  DEMO_SHADY_OFFER_DEFINITION_ID,
  DEMO_CHARITY_COLLECTOR_DEFINITION_ID,
] as const;
