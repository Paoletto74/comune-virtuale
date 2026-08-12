/**
 * C.3 RUNTIME — pilot tasks (NOT content pack modifications).
 * Suitcase ID/labels mirror task_main_v1 read-only.
 * requiresTravel on DEMO_SUITCASE_OFFER is ignored at runtime (no mobility system).
 */

export const DEMO_NEIGHBOR_FAVOR_DEFINITION_ID = 'DEMO_NEIGHBOR_FAVOR';
export const DEMO_NEIGHBOR_OPTION_HELP = 'help';
export const DEMO_NEIGHBOR_OPTION_IGNORE = 'ignore';

export const DEMO_NEIGHBOR_FAVOR_CONTENT = {
  taskId: DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
  title: 'Un vicino ti chiede un favore',
  description: 'Il vicino del piano di sopra ha bisogno di aiuto per portare su delle buste.',
  optionLabels: {
    [DEMO_NEIGHBOR_OPTION_HELP]: 'Lo aiuti',
    [DEMO_NEIGHBOR_OPTION_IGNORE]: 'Ignori',
  },
} as const;

export const DEMO_NEIGHBOR_FAVOR_OPTIONS = [
  DEMO_NEIGHBOR_OPTION_HELP,
  DEMO_NEIGHBOR_OPTION_IGNORE,
] as const;

export const DEMO_NEIGHBOR_HELP_MESSAGE_KEY = 'slice.task.demo_neighbor.help.completed';
export const DEMO_NEIGHBOR_IGNORE_MESSAGE_KEY = 'slice.task.demo_neighbor.ignore.completed';

/** C.3 RUNTIME — approved task_main_v1/definitions.yaml + options.yaml mirror. */
export const DEMO_SUITCASE_OFFER_DEFINITION_ID = 'DEMO_SUITCASE_OFFER';
export const DEMO_SUITCASE_OPTION_ACCEPT = 'accept';
export const DEMO_SUITCASE_OPTION_REFUSE = 'refuse';
export const DEMO_SUITCASE_OPTION_ASK_CONTENTS = 'ask_contents';

export const DEMO_SUITCASE_OFFER_CONTENT = {
  taskId: DEMO_SUITCASE_OFFER_DEFINITION_ID,
  title: 'Offerta valigia',
  description: 'Un uomo ti offre denaro per trasportare una valigia.',
  optionLabels: {
    [DEMO_SUITCASE_OPTION_ACCEPT]: 'Accetta',
    [DEMO_SUITCASE_OPTION_REFUSE]: 'Rifiuta',
    [DEMO_SUITCASE_OPTION_ASK_CONTENTS]: 'Chiedi cosa contiene',
  },
} as const;

export const DEMO_SUITCASE_OFFER_OPTIONS = [
  DEMO_SUITCASE_OPTION_ACCEPT,
  DEMO_SUITCASE_OPTION_REFUSE,
  DEMO_SUITCASE_OPTION_ASK_CONTENTS,
] as const;

export const DEMO_SUITCASE_ACCEPT_MESSAGE_KEY = 'slice.task.demo_suitcase.accept.completed';
export const DEMO_SUITCASE_REFUSE_MESSAGE_KEY = 'slice.task.demo_suitcase.refuse.completed';
export const DEMO_SUITCASE_ASK_CONTENTS_MESSAGE_KEY = 'slice.task.demo_suitcase.ask_contents.completed';

export const DEMO_FOUND_WALLET_DEFINITION_ID = 'DEMO_FOUND_WALLET';
export const DEMO_FOUND_WALLET_OPTION_RETURN = 'return_wallet';
export const DEMO_FOUND_WALLET_OPTION_KEEP = 'keep_wallet';

export const DEMO_FOUND_WALLET_CONTENT = {
  taskId: DEMO_FOUND_WALLET_DEFINITION_ID,
  title: 'Portafoglio trovato',
  description: 'Trovi un portafoglio per terra vicino al marciapiede.',
  optionLabels: {
    [DEMO_FOUND_WALLET_OPTION_RETURN]: 'Lo restituisci',
    [DEMO_FOUND_WALLET_OPTION_KEEP]: 'Lo tieni',
  },
} as const;

export const DEMO_FOUND_WALLET_OPTIONS = [
  DEMO_FOUND_WALLET_OPTION_RETURN,
  DEMO_FOUND_WALLET_OPTION_KEEP,
] as const;

export const DEMO_FOUND_WALLET_RETURN_MESSAGE_KEY = 'slice.task.demo_found_wallet.return.completed';
export const DEMO_FOUND_WALLET_KEEP_MESSAGE_KEY = 'slice.task.demo_found_wallet.keep.completed';

export const DEMO_FOUND_WALLET_KEEP_CASH_DELTA_MINOR = 8n;
export const DEMO_FOUND_WALLET_KEEP_CASH_REASON = 'DEMO_FOUND_WALLET_KEEP_CASH';
export const DEMO_FOUND_WALLET_KEEP_CASH_TRANSACTION_TYPE = 'taskReward';
export const DEMO_FOUND_WALLET_KEEP_CASH_TRANSACTION_CLASS = 'money_creation';

export const C3_POOL_START_DEFINITION_IDS = [
  DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
  DEMO_SUITCASE_OFFER_DEFINITION_ID,
  DEMO_FOUND_WALLET_DEFINITION_ID,
] as const;

export const C3_POOL_START_WEIGHT = 25;
