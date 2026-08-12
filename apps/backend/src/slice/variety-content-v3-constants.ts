/**
 * V1-MULTI-TASK-FEED-1 — runtime slice batch v3 (NOT content pack).
 */
export interface VarietyV3StandardTaskDef {
  definitionId: string;
  title: string;
  description: string;
  options: ReadonlyArray<{ optionId: string; label: string }>;
  messageKeys: Record<string, string>;
  effects: Record<string, { sympathy?: number; reputation?: number; cashDeltaMinor?: bigint; cashReason?: string }>;
}

const TX_REWARD = { transactionType: 'taskReward', transactionClass: 'money_creation' as const };
const TX_SPEND = { transactionType: 'taskSpending', transactionClass: 'money_transfer' as const };

export const VARIETY_V3_STANDARD_TASKS: readonly VarietyV3StandardTaskDef[] = [
  {
    definitionId: 'DEMO_V3_WORK_SHIFT_SWAP',
    title: 'Turno da scambiare',
    description: 'Un collega chiede di scambiare il turno di domani per un impegno familiare.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'partial', label: 'Accetti parzialmente' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.work.shift_swap.accept.completed',
      partial: 'slice.task.v3.work.shift_swap.partial.completed',
      refuse: 'slice.task.v3.work.shift_swap.refuse.completed',
    },
    effects: {
      accept: { sympathy: 1 },
      partial: { reputation: 1 },
      refuse: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_MEETING_CONFLICT',
    title: 'Riunione sovrapposta',
    description: 'Due riunioni coincidono nello stesso orario e ti chiedono quale preferisci.',
    options: [
      { optionId: 'prioritize_boss', label: 'Dai priorità al capo' },
      { optionId: 'prioritize_team', label: 'Dai priorità al team' },
      { optionId: 'skip_both', label: 'Salti entrambe' },
    ],
    messageKeys: {
      prioritize_boss: 'slice.task.v3.work.meeting_conflict.prioritize_boss.completed',
      prioritize_team: 'slice.task.v3.work.meeting_conflict.prioritize_team.completed',
      skip_both: 'slice.task.v3.work.meeting_conflict.skip_both.completed',
    },
    effects: {
      prioritize_boss: { reputation: 1 },
      prioritize_team: { sympathy: 1 },
      skip_both: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_COPY_MACHINE',
    title: 'Fotocopiatrice bloccata',
    description: 'La fotocopiatrice si è inceppata proprio mentre stavi stampando documenti urgenti.',
    options: [
      { optionId: 'fix', label: 'Provi a sistemare' },
      { optionId: 'call_it', label: 'Chiami assistenza' },
      { optionId: 'leave', label: 'Te ne vai' },
    ],
    messageKeys: {
      fix: 'slice.task.v3.work.copy_machine.fix.completed',
      call_it: 'slice.task.v3.work.copy_machine.call_it.completed',
      leave: 'slice.task.v3.work.copy_machine.leave.completed',
    },
    effects: {
      fix: { reputation: 1 },
      call_it: {  },
      leave: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_LUNCH_DEBT',
    title: 'Pranzo offerto',
    description: 'Un collega ti ricorda che gli devi ancora il pranzo della settimana scorsa.',
    options: [
      { optionId: 'pay_back', label: 'Restituisci subito' },
      { optionId: 'promise', label: 'Prometti di restituire' },
      { optionId: 'deny', label: 'Nega il debito' },
    ],
    messageKeys: {
      pay_back: 'slice.task.v3.work.lunch_debt.pay_back.completed',
      promise: 'slice.task.v3.work.lunch_debt.promise.completed',
      deny: 'slice.task.v3.work.lunch_debt.deny.completed',
    },
    effects: {
      pay_back: { sympathy: 1, cashDeltaMinor: -8n, cashReason: 'DEMO_V3_WORK_LUNCH_CASH' },
      promise: {  },
      deny: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_EMAIL_MISTAKE',
    title: 'Mail inviata per errore',
    description: 'Hai inviato per sbaglio una mail interna a un cliente esterno.',
    options: [
      { optionId: 'apologize', label: 'Ti scusi' },
      { optionId: 'recall', label: 'Chiedi di richiamare' },
      { optionId: 'ignore', label: 'Ignori' },
    ],
    messageKeys: {
      apologize: 'slice.task.v3.work.email_mistake.apologize.completed',
      recall: 'slice.task.v3.work.email_mistake.recall.completed',
      ignore: 'slice.task.v3.work.email_mistake.ignore.completed',
    },
    effects: {
      apologize: { reputation: 1 },
      recall: {  },
      ignore: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_NEW_TOOL',
    title: 'Nuovo strumento',
    description: 'Ti propongono di testare un nuovo software che nessuno conosce ancora.',
    options: [
      { optionId: 'volunteer', label: 'Ti offri volontario' },
      { optionId: 'wait', label: 'Aspetti' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      volunteer: 'slice.task.v3.work.new_tool.volunteer.completed',
      wait: 'slice.task.v3.work.new_tool.wait.completed',
      refuse: 'slice.task.v3.work.new_tool.refuse.completed',
    },
    effects: {
      volunteer: { reputation: 1 },
      wait: {  },
      refuse: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_OVERTIME_ASK',
    title: 'Straordinario',
    description: 'Ti chiedono di restare oltre l\'orario per chiudere un lavoro.',
    options: [
      { optionId: 'stay', label: 'Resti' },
      { optionId: 'negotiate', label: 'Tratti' },
      { optionId: 'leave', label: 'Te ne vai' },
    ],
    messageKeys: {
      stay: 'slice.task.v3.work.overtime_ask.stay.completed',
      negotiate: 'slice.task.v3.work.overtime_ask.negotiate.completed',
      leave: 'slice.task.v3.work.overtime_ask.leave.completed',
    },
    effects: {
      stay: { reputation: 1 },
      negotiate: { cashDeltaMinor: 8n, cashReason: 'DEMO_V3_WORK_OVERTIME_CASH' },
      leave: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_INTERN_QUESTION',
    title: 'Domanda del tirocinante',
    description: 'Un tirocinante ti chiede aiuto su una procedura che dovresti conoscere.',
    options: [
      { optionId: 'help', label: 'Aiuti' },
      { optionId: 'redirect', label: 'Indirizzi altrove' },
      { optionId: 'brush_off', label: 'Liquidaci bruscamente' },
    ],
    messageKeys: {
      help: 'slice.task.v3.work.intern_question.help.completed',
      redirect: 'slice.task.v3.work.intern_question.redirect.completed',
      brush_off: 'slice.task.v3.work.intern_question.brush_off.completed',
    },
    effects: {
      help: { sympathy: 1, reputation: 1 },
      redirect: { reputation: 1 },
      brush_off: { sympathy: -1, reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_CLIENT_GIFT',
    title: 'Regalo dal cliente',
    description: 'Un cliente ti offre un piccolo omaggio dopo un lavoro ben fatto.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'decline', label: 'Rifiuti' },
      { optionId: 'report', label: 'Segnali' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.work.client_gift.accept.completed',
      decline: 'slice.task.v3.work.client_gift.decline.completed',
      report: 'slice.task.v3.work.client_gift.report.completed',
    },
    effects: {
      accept: { reputation: -1 },
      decline: { reputation: 1 },
      report: { reputation: 1 },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_TEAM_LUNCH',
    title: 'Pranzo di squadra',
    description: 'Il team organizza un pranzo fuori sede e ti chiedono se vieni.',
    options: [
      { optionId: 'join', label: 'Partecipi' },
      { optionId: 'maybe', label: 'Forse' },
      { optionId: 'skip', label: 'Salti' },
    ],
    messageKeys: {
      join: 'slice.task.v3.work.team_lunch.join.completed',
      maybe: 'slice.task.v3.work.team_lunch.maybe.completed',
      skip: 'slice.task.v3.work.team_lunch.skip.completed',
    },
    effects: {
      join: { sympathy: 1, cashDeltaMinor: -10n, cashReason: 'DEMO_V3_WORK_TEAM_LUNCH_CASH' },
      maybe: {  },
      skip: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_SECURITY_BADGE',
    title: 'Badge dimenticato',
    description: 'Hai dimenticato il badge e la sicurezza non ti fa entrare.',
    options: [
      { optionId: 'wait', label: 'Aspetti' },
      { optionId: 'borrow', label: 'Chiedi prestito' },
      { optionId: 'force', label: 'Insisti' },
    ],
    messageKeys: {
      wait: 'slice.task.v3.work.security_badge.wait.completed',
      borrow: 'slice.task.v3.work.security_badge.borrow.completed',
      force: 'slice.task.v3.work.security_badge.force.completed',
    },
    effects: {
      wait: {  },
      borrow: { sympathy: 1 },
      force: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_WORK_PROJECT_CREDIT',
    title: 'Merito del progetto',
    description: 'In riunione ti chiedono chi ha guidato l\'ultimo progetto.',
    options: [
      { optionId: 'share_credit', label: 'Condividi il merito' },
      { optionId: 'take_credit', label: 'Prendi il merito' },
      { optionId: 'stay_quiet', label: 'Resti in silenzio' },
    ],
    messageKeys: {
      share_credit: 'slice.task.v3.work.project_credit.share_credit.completed',
      take_credit: 'slice.task.v3.work.project_credit.take_credit.completed',
      stay_quiet: 'slice.task.v3.work.project_credit.stay_quiet.completed',
    },
    effects: {
      share_credit: { sympathy: 1 },
      take_credit: { reputation: -1 },
      stay_quiet: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_FAMILY_SIBLING_CALL',
    title: 'Chiamata del fratello',
    description: 'Tuo fratello ti chiama per chiederti un consiglio su una decisione importante.',
    options: [
      { optionId: 'listen', label: 'Ascolti' },
      { optionId: 'rush', label: 'Rispondi di fretta' },
      { optionId: 'ignore', label: 'Ignori' },
    ],
    messageKeys: {
      listen: 'slice.task.v3.family.sibling_call.listen.completed',
      rush: 'slice.task.v3.family.sibling_call.rush.completed',
      ignore: 'slice.task.v3.family.sibling_call.ignore.completed',
    },
    effects: {
      listen: { sympathy: 1, reputation: 1 },
      rush: { reputation: -1 },
      ignore: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_FAMILY_PARENT_HEALTH',
    title: 'Salute di un genitore',
    description: 'Un genitore ti dice che ha saltato una visita medica.',
    options: [
      { optionId: 'accompany', label: 'Accompagni' },
      { optionId: 'remind', label: 'Ricordi l\'appuntamento' },
      { optionId: 'dismiss', label: 'Minimizzi' },
    ],
    messageKeys: {
      accompany: 'slice.task.v3.family.parent_health.accompany.completed',
      remind: 'slice.task.v3.family.parent_health.remind.completed',
      dismiss: 'slice.task.v3.family.parent_health.dismiss.completed',
    },
    effects: {
      accompany: { sympathy: 1, reputation: 1 },
      remind: { reputation: 1 },
      dismiss: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_FAMILY_KID_SCHOOL',
    title: 'Nota dalla scuola',
    description: 'Arriva una comunicazione dalla scuola che riguarda un nipote.',
    options: [
      { optionId: 'respond', label: 'Rispondi subito' },
      { optionId: 'delegate', label: 'Delega ad altri' },
      { optionId: 'ignore', label: 'Ignori' },
    ],
    messageKeys: {
      respond: 'slice.task.v3.family.kid_school.respond.completed',
      delegate: 'slice.task.v3.family.kid_school.delegate.completed',
      ignore: 'slice.task.v3.family.kid_school.ignore.completed',
    },
    effects: {
      respond: { sympathy: 1, reputation: 1 },
      delegate: { reputation: -1 },
      ignore: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_FAMILY_FAMILY_SECRET',
    title: 'Segreto di famiglia',
    description: 'Un parente ti confida qualcosa che non dovresti sapere.',
    options: [
      { optionId: 'keep', label: 'Tieni il segreto' },
      { optionId: 'advise', label: 'Consigli' },
      { optionId: 'share', label: 'Lo racconti' },
    ],
    messageKeys: {
      keep: 'slice.task.v3.family.family_secret.keep.completed',
      advise: 'slice.task.v3.family.family_secret.advise.completed',
      share: 'slice.task.v3.family.family_secret.share.completed',
    },
    effects: {
      keep: { sympathy: 1 },
      advise: {  },
      share: { sympathy: -1, reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_FAMILY_HOLIDAY_PLAN',
    title: 'Vacanza in famiglia',
    description: 'Ti propongono di organizzare una vacanza con tutta la famiglia.',
    options: [
      { optionId: 'enthusiastic', label: 'Accetti entusiasta' },
      { optionId: 'conditional', label: 'Accetti a condizioni' },
      { optionId: 'decline', label: 'Rifiuti' },
    ],
    messageKeys: {
      enthusiastic: 'slice.task.v3.family.holiday_plan.enthusiastic.completed',
      conditional: 'slice.task.v3.family.holiday_plan.conditional.completed',
      decline: 'slice.task.v3.family.holiday_plan.decline.completed',
    },
    effects: {
      enthusiastic: { sympathy: 1 },
      conditional: { reputation: 1 },
      decline: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_FAMILY_MOVING_HELP',
    title: 'Aiuto al trasloco',
    description: 'Un cugino ti chiede di aiutarlo a traslocare sabato.',
    options: [
      { optionId: 'help', label: 'Aiuti' },
      { optionId: 'partial', label: 'Accetti parzialmente' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      help: 'slice.task.v3.family.moving_help.help.completed',
      partial: 'slice.task.v3.family.moving_help.partial.completed',
      refuse: 'slice.task.v3.family.moving_help.refuse.completed',
    },
    effects: {
      help: { sympathy: 1, reputation: 1 },
      partial: { sympathy: 1 },
      refuse: { sympathy: -1, reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_FAMILY_RECIPE_REQUEST',
    title: 'Ricetta di famiglia',
    description: 'Una zia ti chiede di passarle la ricetta di un piatto tradizionale.',
    options: [
      { optionId: 'send', label: 'Mandi subito' },
      { optionId: 'delay', label: 'Rimandi' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      send: 'slice.task.v3.family.recipe_request.send.completed',
      delay: 'slice.task.v3.family.recipe_request.delay.completed',
      refuse: 'slice.task.v3.family.recipe_request.refuse.completed',
    },
    effects: {
      send: { sympathy: 1 },
      delay: { reputation: -1 },
      refuse: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_FAMILY_PET_SITTING',
    title: 'Custodia animale',
    description: 'Un familiare parte e ti chiede di tenere il suo animale per una settimana.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'short', label: 'Accetti per poco' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.family.pet_sitting.accept.completed',
      short: 'slice.task.v3.family.pet_sitting.short.completed',
      refuse: 'slice.task.v3.family.pet_sitting.refuse.completed',
    },
    effects: {
      accept: { sympathy: 1 },
      short: { reputation: 1 },
      refuse: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_FAMILY_ANNIVERSARY',
    title: 'Anniversario dimenticato',
    description: 'Ti accorgi di aver dimenticato un anniversario importante in famiglia.',
    options: [
      { optionId: 'apologize_gift', label: 'Scusarti con un regalo' },
      { optionId: 'call', label: 'Chiami' },
      { optionId: 'ignore', label: 'Ignori' },
    ],
    messageKeys: {
      apologize_gift: 'slice.task.v3.family.anniversary.apologize_gift.completed',
      call: 'slice.task.v3.family.anniversary.call.completed',
      ignore: 'slice.task.v3.family.anniversary.ignore.completed',
    },
    effects: {
      apologize_gift: { sympathy: 1, cashDeltaMinor: -12n, cashReason: 'DEMO_V3_FAMILY_GIFT_CASH' },
      call: {  },
      ignore: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_FAMILY_HOME_ALONE',
    title: 'Casa da solo',
    description: 'I coinquilini di famiglia partono e ti lasciano da solo per giorni.',
    options: [
      { optionId: 'enjoy', label: 'Goditi la quiete' },
      { optionId: 'invite', label: 'Inviti qualcuno' },
      { optionId: 'worry', label: 'Ti preoccupi' },
    ],
    messageKeys: {
      enjoy: 'slice.task.v3.family.home_alone.enjoy.completed',
      invite: 'slice.task.v3.family.home_alone.invite.completed',
      worry: 'slice.task.v3.family.home_alone.worry.completed',
    },
    effects: {
      enjoy: {  },
      invite: { sympathy: 1 },
      worry: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_SOCIAL_FRIEND_PARTY',
    title: 'Invito a festa',
    description: 'Un amico ti invita a una festa stasera all\'ultimo momento.',
    options: [
      { optionId: 'go', label: 'Ci vai' },
      { optionId: 'maybe', label: 'Forse' },
      { optionId: 'decline', label: 'Rifiuti' },
    ],
    messageKeys: {
      go: 'slice.task.v3.social.friend_party.go.completed',
      maybe: 'slice.task.v3.social.friend_party.maybe.completed',
      decline: 'slice.task.v3.social.friend_party.decline.completed',
    },
    effects: {
      go: { sympathy: 1 },
      maybe: { cashDeltaMinor: -5n, cashReason: 'DEMO_V3_SOCIAL_PARTY_CASH' },
      decline: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_SOCIAL_GROUP_CHAT',
    title: 'Chat di gruppo',
    description: 'In una chat di amici nasce una discussione accesa su politica.',
    options: [
      { optionId: 'mediate', label: 'Ceri di mediare' },
      { optionId: 'mute', label: 'Metti silenzioso' },
      { optionId: 'join', label: 'Partecipi' },
    ],
    messageKeys: {
      mediate: 'slice.task.v3.social.group_chat.mediate.completed',
      mute: 'slice.task.v3.social.group_chat.mute.completed',
      join: 'slice.task.v3.social.group_chat.join.completed',
    },
    effects: {
      mediate: { sympathy: 1 },
      mute: {  },
      join: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_SOCIAL_BORROWED_BOOK',
    title: 'Libro non restituito',
    description: 'Un amico ti ricorda che gli devi un libro da mesi.',
    options: [
      { optionId: 'return', label: 'Restituisci' },
      { optionId: 'buy_new', label: 'Compri uno nuovo' },
      { optionId: 'forget', label: 'Dimentichi' },
    ],
    messageKeys: {
      return: 'slice.task.v3.social.borrowed_book.return.completed',
      buy_new: 'slice.task.v3.social.borrowed_book.buy_new.completed',
      forget: 'slice.task.v3.social.borrowed_book.forget.completed',
    },
    effects: {
      return: { sympathy: 1 },
      buy_new: { cashDeltaMinor: -8n, cashReason: 'DEMO_V3_SOCIAL_BOOK_CASH' },
      forget: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_SOCIAL_WEDDING_INVITE',
    title: 'Invito matrimonio',
    description: 'Ricevi l\'invito al matrimonio di un conoscente.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'send_gift_only', label: 'Mandi solo un regalo' },
      { optionId: 'decline', label: 'Rifiuti' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.social.wedding_invite.accept.completed',
      send_gift_only: 'slice.task.v3.social.wedding_invite.send_gift_only.completed',
      decline: 'slice.task.v3.social.wedding_invite.decline.completed',
    },
    effects: {
      accept: { sympathy: 1, cashDeltaMinor: -20n, cashReason: 'DEMO_V3_SOCIAL_WEDDING_CASH' },
      send_gift_only: { cashDeltaMinor: -15n, cashReason: 'DEMO_V3_SOCIAL_WEDDING_CASH' },
      decline: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_SOCIAL_OLD_RIVAL',
    title: 'Rivale del passato',
    description: 'Incontri per caso qualcuno con cui non andavi d\'accordo a scuola.',
    options: [
      { optionId: 'greet', label: 'Saluti' },
      { optionId: 'avoid', label: 'Eviti' },
      { optionId: 'confront', label: 'Confronti' },
    ],
    messageKeys: {
      greet: 'slice.task.v3.social.old_rival.greet.completed',
      avoid: 'slice.task.v3.social.old_rival.avoid.completed',
      confront: 'slice.task.v3.social.old_rival.confront.completed',
    },
    effects: {
      greet: { sympathy: 1, reputation: 1 },
      avoid: { reputation: -1 },
      confront: { sympathy: -1, reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_SOCIAL_SPORT_BET',
    title: 'Scommessa amichevole',
    description: 'Un amico ti propone una scommessa sulla partita di stasera.',
    options: [
      { optionId: 'bet', label: 'Accetti la scommessa' },
      { optionId: 'watch_only', label: 'Guardi senza scommettere' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      bet: 'slice.task.v3.social.sport_bet.bet.completed',
      watch_only: 'slice.task.v3.social.sport_bet.watch_only.completed',
      refuse: 'slice.task.v3.social.sport_bet.refuse.completed',
    },
    effects: {
      bet: { cashDeltaMinor: -5n, cashReason: 'DEMO_V3_SOCIAL_BET_CASH' },
      watch_only: {  },
      refuse: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_SOCIAL_PHOTO_TAG',
    title: 'Foto sui social',
    description: 'Un amico ti tagga in una foto imbarazzante.',
    options: [
      { optionId: 'laugh', label: 'Ridi' },
      { optionId: 'ask_remove', label: 'Chiedi di rimuoverla' },
      { optionId: 'react', label: 'Reagisci male' },
    ],
    messageKeys: {
      laugh: 'slice.task.v3.social.photo_tag.laugh.completed',
      ask_remove: 'slice.task.v3.social.photo_tag.ask_remove.completed',
      react: 'slice.task.v3.social.photo_tag.react.completed',
    },
    effects: {
      laugh: { sympathy: 1 },
      ask_remove: { reputation: 1 },
      react: { sympathy: -1, reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_SOCIAL_FAVOR_RETURN',
    title: 'Restituire un favore',
    description: 'Qualcuno a cui avevi chiesto aiuto ora vuole qualcosa in cambio.',
    options: [
      { optionId: 'help', label: 'Aiuti' },
      { optionId: 'negotiate', label: 'Tratti' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      help: 'slice.task.v3.social.favor_return.help.completed',
      negotiate: 'slice.task.v3.social.favor_return.negotiate.completed',
      refuse: 'slice.task.v3.social.favor_return.refuse.completed',
    },
    effects: {
      help: { sympathy: 1, reputation: 1 },
      negotiate: { reputation: 1 },
      refuse: { sympathy: -1, reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_SOCIAL_NETWORKING',
    title: 'Contatto utile',
    description: 'Un conoscente ti propone di presentarti a qualcuno del suo settore.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'later', label: 'Chiedi tempo' },
      { optionId: 'decline', label: 'Rifiuti' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.social.networking.accept.completed',
      later: 'slice.task.v3.social.networking.later.completed',
      decline: 'slice.task.v3.social.networking.decline.completed',
    },
    effects: {
      accept: { reputation: 1 },
      later: {  },
      decline: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_SOCIAL_GROUP_TRIP',
    title: 'Viaggio di gruppo',
    description: 'Gli amici organizzano un weekend fuori e ti chiedono l\'acconto per bloccare il posto.',
    options: [
      { optionId: 'join', label: 'Partecipi' },
      { optionId: 'maybe', label: 'Forse' },
      { optionId: 'pass', label: 'Passi' },
    ],
    messageKeys: {
      join: 'slice.task.v3.social.group_trip.join.completed',
      maybe: 'slice.task.v3.social.group_trip.maybe.completed',
      pass: 'slice.task.v3.social.group_trip.pass.completed',
    },
    effects: {
      join: { sympathy: 1, cashDeltaMinor: -60n, cashReason: 'DEMO_V3_SOCIAL_TRIP_CASH' },
      maybe: {  },
      pass: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_NEIGHBORHOOD_ELEVATOR_STUCK',
    title: 'Ascensore fermo',
    description: 'Resti bloccato in ascensore con un vicino che non conosci.',
    options: [
      { optionId: 'talk', label: 'Parli con calma' },
      { optionId: 'call_help', label: 'Chiami aiuto' },
      { optionId: 'panic', label: 'Ti agiti' },
    ],
    messageKeys: {
      talk: 'slice.task.v3.neighborhood.elevator_stuck.talk.completed',
      call_help: 'slice.task.v3.neighborhood.elevator_stuck.call_help.completed',
      panic: 'slice.task.v3.neighborhood.elevator_stuck.panic.completed',
    },
    effects: {
      talk: { sympathy: 1 },
      call_help: {  },
      panic: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_NEIGHBORHOOD_PACKAGE_HOLD',
    title: 'Pacco del vicino',
    description: 'Il corriere consegna un pacco per il vicino assente.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'refuse', label: 'Rifiuti' },
      { optionId: 'leave_note', label: 'Lasci un biglietto' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.neighborhood.package_hold.accept.completed',
      refuse: 'slice.task.v3.neighborhood.package_hold.refuse.completed',
      leave_note: 'slice.task.v3.neighborhood.package_hold.leave_note.completed',
    },
    effects: {
      accept: { sympathy: 1 },
      refuse: {  },
      leave_note: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_NEIGHBORHOOD_PARKING_DISPUTE',
    title: 'Posto auto',
    description: 'Qualcuno ha parcheggiato nel tuo posto riservato.',
    options: [
      { optionId: 'note', label: 'Lasci un biglietto' },
      { optionId: 'wait', label: 'Aspetti' },
      { optionId: 'confront', label: 'Confronti' },
    ],
    messageKeys: {
      note: 'slice.task.v3.neighborhood.parking_dispute.note.completed',
      wait: 'slice.task.v3.neighborhood.parking_dispute.wait.completed',
      confront: 'slice.task.v3.neighborhood.parking_dispute.confront.completed',
    },
    effects: {
      note: {  },
      wait: {  },
      confront: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_NEIGHBORHOOD_BUILDING_MEETING',
    title: 'Assemblea condominiale',
    description: 'Convocazione assemblea per lavori costosi in condominio.',
    options: [
      { optionId: 'attend', label: 'Partecipi' },
      { optionId: 'proxy', label: 'Mandi un delegato' },
      { optionId: 'skip', label: 'Salti' },
    ],
    messageKeys: {
      attend: 'slice.task.v3.neighborhood.building_meeting.attend.completed',
      proxy: 'slice.task.v3.neighborhood.building_meeting.proxy.completed',
      skip: 'slice.task.v3.neighborhood.building_meeting.skip.completed',
    },
    effects: {
      attend: { reputation: 1 },
      proxy: {  },
      skip: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_NEIGHBORHOOD_LOUD_DRILL',
    title: 'Trapano mattutino',
    description: 'Alle sette di mattina qualcuno usa un trapano nel palazzo.',
    options: [
      { optionId: 'knock', label: 'Busserai' },
      { optionId: 'tolerate', label: 'Sopporti' },
      { optionId: 'complain', label: 'Ti lamenti' },
    ],
    messageKeys: {
      knock: 'slice.task.v3.neighborhood.loud_drill.knock.completed',
      tolerate: 'slice.task.v3.neighborhood.loud_drill.tolerate.completed',
      complain: 'slice.task.v3.neighborhood.loud_drill.complain.completed',
    },
    effects: {
      knock: { sympathy: 1 },
      tolerate: {  },
      complain: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_NEIGHBORHOOD_LOST_KEYS',
    title: 'Chiavi perse',
    description: 'Una signora anziana del palazzo ha perso le chiavi.',
    options: [
      { optionId: 'help_search', label: 'Aiuti a cercare' },
      { optionId: 'call_family', label: 'Chiami familiari' },
      { optionId: 'ignore', label: 'Ignori' },
    ],
    messageKeys: {
      help_search: 'slice.task.v3.neighborhood.lost_keys.help_search.completed',
      call_family: 'slice.task.v3.neighborhood.lost_keys.call_family.completed',
      ignore: 'slice.task.v3.neighborhood.lost_keys.ignore.completed',
    },
    effects: {
      help_search: { sympathy: 1, reputation: 1 },
      call_family: {  },
      ignore: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_NEIGHBORHOOD_GARAGE_SALE',
    title: 'Mercatino',
    description: 'Il vicino organizza un mercatino in cortile e ti invita.',
    options: [
      { optionId: 'browse', label: 'Dai un\'occhiata' },
      { optionId: 'buy', label: 'Compri qualcosa' },
      { optionId: 'skip', label: 'Salti' },
    ],
    messageKeys: {
      browse: 'slice.task.v3.neighborhood.garage_sale.browse.completed',
      buy: 'slice.task.v3.neighborhood.garage_sale.buy.completed',
      skip: 'slice.task.v3.neighborhood.garage_sale.skip.completed',
    },
    effects: {
      browse: {  },
      buy: { sympathy: 1, cashDeltaMinor: -6n, cashReason: 'DEMO_V3_NEIGHBOR_SALE_CASH' },
      skip: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_NEIGHBORHOOD_DOG_WALK',
    title: 'Cane sciolto',
    description: 'Il cane del vicino gira libero nel cortile.',
    options: [
      { optionId: 'notify', label: 'Avvisi' },
      { optionId: 'catch', label: 'Lo catturi' },
      { optionId: 'ignore', label: 'Ignori' },
    ],
    messageKeys: {
      notify: 'slice.task.v3.neighborhood.dog_walk.notify.completed',
      catch: 'slice.task.v3.neighborhood.dog_walk.catch.completed',
      ignore: 'slice.task.v3.neighborhood.dog_walk.ignore.completed',
    },
    effects: {
      notify: { sympathy: 1 },
      catch: {  },
      ignore: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_NEIGHBORHOOD_SHARED_GARDEN',
    title: 'Giardino condiviso',
    description: 'Proposta di dividere le spese per sistemare l\'area verde.',
    options: [
      { optionId: 'contribute', label: 'Contribuisci' },
      { optionId: 'defer', label: 'Rimandi' },
      { optionId: 'oppose', label: 'Ti opponi' },
    ],
    messageKeys: {
      contribute: 'slice.task.v3.neighborhood.shared_garden.contribute.completed',
      defer: 'slice.task.v3.neighborhood.shared_garden.defer.completed',
      oppose: 'slice.task.v3.neighborhood.shared_garden.oppose.completed',
    },
    effects: {
      contribute: { sympathy: 1, cashDeltaMinor: -10n, cashReason: 'DEMO_V3_NEIGHBOR_GARDEN_CASH' },
      defer: {  },
      oppose: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_NEIGHBORHOOD_STRANGER_DOOR',
    title: 'Bussera alla porta',
    description: 'Qualcuno suona campanella chiedendo di usare il telefono.',
    options: [
      { optionId: 'help', label: 'Aiuti' },
      { optionId: 'through_door', label: 'Parli dalla porta' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      help: 'slice.task.v3.neighborhood.stranger_door.help.completed',
      through_door: 'slice.task.v3.neighborhood.stranger_door.through_door.completed',
      refuse: 'slice.task.v3.neighborhood.stranger_door.refuse.completed',
    },
    effects: {
      help: { sympathy: 1 },
      through_door: {  },
      refuse: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_ECONOMY_SUBSCRIPTION',
    title: 'Abbonamento dimenticato',
    description: 'Noti un abbonamento che si rinnova automaticamente ogni mese.',
    options: [
      { optionId: 'cancel', label: 'Disdici' },
      { optionId: 'keep', label: 'Tieni il segreto' },
      { optionId: 'forget', label: 'Dimentichi' },
    ],
    messageKeys: {
      cancel: 'slice.task.v3.economy.subscription.cancel.completed',
      keep: 'slice.task.v3.economy.subscription.keep.completed',
      forget: 'slice.task.v3.economy.subscription.forget.completed',
    },
    effects: {
      cancel: { cashDeltaMinor: 8n, cashReason: 'DEMO_V3_ECON_SUB_CASH' },
      keep: {  },
      forget: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_ECONOMY_DISCOUNT_COUPON',
    title: 'Coupon in scadenza',
    description: 'Trovi un coupon sconto che scade oggi.',
    options: [
      { optionId: 'use_now', label: 'Usi subito' },
      { optionId: 'share', label: 'Lo racconti' },
      { optionId: 'ignore', label: 'Ignori' },
    ],
    messageKeys: {
      use_now: 'slice.task.v3.economy.discount_coupon.use_now.completed',
      share: 'slice.task.v3.economy.discount_coupon.share.completed',
      ignore: 'slice.task.v3.economy.discount_coupon.ignore.completed',
    },
    effects: {
      use_now: { cashDeltaMinor: 5n, cashReason: 'DEMO_V3_ECON_COUPON_CASH' },
      share: { sympathy: 1 },
      ignore: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_ECONOMY_ATM_FEE',
    title: 'Commissione bancomat',
    description: 'Il bancomat ti addebita una commissione insolita.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'dispute', label: 'Contesti' },
      { optionId: 'walk_away', label: 'Te ne vai' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.economy.atm_fee.accept.completed',
      dispute: 'slice.task.v3.economy.atm_fee.dispute.completed',
      walk_away: 'slice.task.v3.economy.atm_fee.walk_away.completed',
    },
    effects: {
      accept: { cashDeltaMinor: -3n, cashReason: 'DEMO_V3_ECON_ATM_CASH' },
      dispute: {  },
      walk_away: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_ECONOMY_SIDE_GIG',
    title: 'Lavoro extra',
    description: 'Qualcuno ti propone un piccolo lavoro retribuito nel weekend.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'negotiate', label: 'Tratti' },
      { optionId: 'decline', label: 'Rifiuti' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.economy.side_gig.accept.completed',
      negotiate: 'slice.task.v3.economy.side_gig.negotiate.completed',
      decline: 'slice.task.v3.economy.side_gig.decline.completed',
    },
    effects: {
      accept: { cashDeltaMinor: 14n, cashReason: 'DEMO_V3_ECON_GIG_CASH' },
      negotiate: { cashDeltaMinor: 11n, cashReason: 'DEMO_V3_ECON_GIG_CASH' },
      decline: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_ECONOMY_REPAIR_QUOTE',
    title: 'Preventivo riparazione',
    description: 'Arriva un preventivo più alto del previsto per una riparazione.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'shop_around', label: 'Cerchi altri preventivi' },
      { optionId: 'delay', label: 'Rimandi' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.economy.repair_quote.accept.completed',
      shop_around: 'slice.task.v3.economy.repair_quote.shop_around.completed',
      delay: 'slice.task.v3.economy.repair_quote.delay.completed',
    },
    effects: {
      accept: { cashDeltaMinor: -22n, cashReason: 'DEMO_V3_ECON_REPAIR_CASH' },
      shop_around: {  },
      delay: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_ECONOMY_LOTTERY_TICKET',
    title: 'Biglietto della lotteria',
    description: 'Al bar ti offrono di partecipare a un gratta e vinci di gruppo.',
    options: [
      { optionId: 'join', label: 'Partecipi' },
      { optionId: 'pass', label: 'Passi' },
      { optionId: 'buy_alone', label: 'Compri da solo' },
    ],
    messageKeys: {
      join: 'slice.task.v3.economy.lottery_ticket.join.completed',
      pass: 'slice.task.v3.economy.lottery_ticket.pass.completed',
      buy_alone: 'slice.task.v3.economy.lottery_ticket.buy_alone.completed',
    },
    effects: {
      join: { cashDeltaMinor: -5n, cashReason: 'DEMO_V3_ECON_LOTTERY_CASH' },
      pass: {  },
      buy_alone: { cashDeltaMinor: -5n, cashReason: 'DEMO_V3_ECON_LOTTERY_CASH' },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_BIRD_IN_HOME',
    title: 'Uccello in casa',
    description: 'Un uccello è entrato dalla finestra aperta e vola in soggiorno.',
    options: [
      { optionId: 'guide_out', label: 'Lo guidi fuori' },
      { optionId: 'catch', label: 'Lo catturi' },
      { optionId: 'panic', label: 'Ti agiti' },
    ],
    messageKeys: {
      guide_out: 'slice.task.v3.unexpected.bird_in_home.guide_out.completed',
      catch: 'slice.task.v3.unexpected.bird_in_home.catch.completed',
      panic: 'slice.task.v3.unexpected.bird_in_home.panic.completed',
    },
    effects: {
      guide_out: {  },
      catch: { sympathy: 1 },
      panic: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_WRONG_DELIVERY',
    title: 'Consegna sbagliata',
    description: 'Il fattorino consegna un pacco con il tuo indirizzo ma nome di un altro.',
    options: [
      { optionId: 'notify', label: 'Avvisi' },
      { optionId: 'open', label: 'Apri il pacco' },
      { optionId: 'keep', label: 'Tieni il segreto' },
    ],
    messageKeys: {
      notify: 'slice.task.v3.unexpected.wrong_delivery.notify.completed',
      open: 'slice.task.v3.unexpected.wrong_delivery.open.completed',
      keep: 'slice.task.v3.unexpected.wrong_delivery.keep.completed',
    },
    effects: {
      notify: { reputation: 1 },
      open: { reputation: -1 },
      keep: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_STREET_PERFORMER',
    title: 'Artista di strada',
    description: 'Un artista di strada ti invita a partecipare al numero.',
    options: [
      { optionId: 'join', label: 'Partecipi' },
      { optionId: 'watch', label: 'Guardi' },
      { optionId: 'leave', label: 'Te ne vai' },
    ],
    messageKeys: {
      join: 'slice.task.v3.unexpected.street_performer.join.completed',
      watch: 'slice.task.v3.unexpected.street_performer.watch.completed',
      leave: 'slice.task.v3.unexpected.street_performer.leave.completed',
    },
    effects: {
      join: { sympathy: 1 },
      watch: {  },
      leave: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_POWER_OUTAGE',
    title: 'Blackout',
    description: 'Salta la corrente mentre stavi facendo qualcosa di importante.',
    options: [
      { optionId: 'wait', label: 'Aspetti' },
      { optionId: 'check', label: 'Controlli il quadro elettrico' },
      { optionId: 'complain', label: 'Ti lamenti' },
    ],
    messageKeys: {
      wait: 'slice.task.v3.unexpected.power_outage.wait.completed',
      check: 'slice.task.v3.unexpected.power_outage.check.completed',
      complain: 'slice.task.v3.unexpected.power_outage.complain.completed',
    },
    effects: {
      wait: {  },
      check: { reputation: 1 },
      complain: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_FREE_SAMPLE',
    title: 'Assaggio gratuito',
    description: 'In supermercato ti offrono un assaggio di un prodotto nuovo.',
    options: [
      { optionId: 'try', label: 'Assaggi' },
      { optionId: 'decline', label: 'Rifiuti' },
      { optionId: 'take_more', label: 'Prendi di più' },
    ],
    messageKeys: {
      try: 'slice.task.v3.unexpected.free_sample.try.completed',
      decline: 'slice.task.v3.unexpected.free_sample.decline.completed',
      take_more: 'slice.task.v3.unexpected.free_sample.take_more.completed',
    },
    effects: {
      try: {  },
      decline: {  },
      take_more: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_LOST_DOG',
    title: 'Cane smarrito',
    description: 'Vedi un cane con un collare ma senza padrone nelle vicinanze.',
    options: [
      { optionId: 'help', label: 'Aiuti' },
      { optionId: 'call', label: 'Chiami' },
      { optionId: 'ignore', label: 'Ignori' },
    ],
    messageKeys: {
      help: 'slice.task.v3.unexpected.lost_dog.help.completed',
      call: 'slice.task.v3.unexpected.lost_dog.call.completed',
      ignore: 'slice.task.v3.unexpected.lost_dog.ignore.completed',
    },
    effects: {
      help: { sympathy: 1, reputation: 1 },
      call: {  },
      ignore: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_RAIN_SUDDEN',
    title: 'Pioggia improvvisa',
    description: 'Inizi a piovere forte mentre sei lontano da casa senza ombrello.',
    options: [
      { optionId: 'run', label: 'Corri' },
      { optionId: 'shelter', label: 'Cerchi riparo' },
      { optionId: 'buy_umbrella', label: 'Compri un ombrello' },
    ],
    messageKeys: {
      run: 'slice.task.v3.unexpected.rain_sudden.run.completed',
      shelter: 'slice.task.v3.unexpected.rain_sudden.shelter.completed',
      buy_umbrella: 'slice.task.v3.unexpected.rain_sudden.buy_umbrella.completed',
    },
    effects: {
      run: {  },
      shelter: {  },
      buy_umbrella: { cashDeltaMinor: -8n, cashReason: 'DEMO_V3_WEIRD_UMBRELLA_CASH' },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_MIRROR_CRACK',
    title: 'Specchio rotto',
    description: 'Rompì per sbaglio uno specchio nel bagno di un locale pubblico.',
    options: [
      { optionId: 'report', label: 'Segnali' },
      { optionId: 'leave', label: 'Te ne vai' },
      { optionId: 'hide', label: 'Nascondi' },
    ],
    messageKeys: {
      report: 'slice.task.v3.unexpected.mirror_crack.report.completed',
      leave: 'slice.task.v3.unexpected.mirror_crack.leave.completed',
      hide: 'slice.task.v3.unexpected.mirror_crack.hide.completed',
    },
    effects: {
      report: { reputation: 1 },
      leave: { reputation: -1 },
      hide: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_ELEVATOR_MUSIC',
    title: 'Musica in ascensore',
    description: 'L\'ascensore parte all\'improvviso con musica disco a volume altissimo.',
    options: [
      { optionId: 'enjoy', label: 'Ridi e balli un attimo' },
      { optionId: 'complain', label: 'Chiami l\'amministratore' },
      { optionId: 'record', label: 'Filmi e lo posti online' },
    ],
    messageKeys: {
      enjoy: 'slice.task.v3.unexpected.elevator_music.enjoy.completed',
      complain: 'slice.task.v3.unexpected.elevator_music.complain.completed',
      record: 'slice.task.v3.unexpected.elevator_music.record.completed',
    },
    effects: {
      enjoy: { sympathy: 1 },
      complain: { reputation: 1 },
      record: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_FOUNTAIN_SOAK',
    title: 'Fontana sorpresa',
    description: 'Passi vicino a una fontana che si accende all\'improvviso e ti bagna.',
    options: [
      { optionId: 'laugh', label: 'Ridi di te stesso' },
      { optionId: 'dry_clothes', label: 'Compri qualcosa per asciugarti' },
      { optionId: 'go_home', label: 'Torni a casa a cambiarti' },
    ],
    messageKeys: {
      laugh: 'slice.task.v3.unexpected.fountain_soak.laugh.completed',
      dry_clothes: 'slice.task.v3.unexpected.fountain_soak.dry_clothes.completed',
      go_home: 'slice.task.v3.unexpected.fountain_soak.go_home.completed',
    },
    effects: {
      laugh: { sympathy: 1 },
      dry_clothes: { cashDeltaMinor: -12n, cashReason: 'DEMO_V3_UNEXPECTED_FOUNTAIN_CASH' },
      go_home: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_STREET_PARADE',
    title: 'Corteo improvviso',
    description: 'Un corteo blocca la strada proprio mentre stavi andando da un\'altra parte.',
    options: [
      { optionId: 'wait', label: 'Aspetti con pazienza' },
      { optionId: 'detour', label: 'Trovi un percorso alternativo' },
      { optionId: 'push', label: 'Provi a passare lo stesso' },
    ],
    messageKeys: {
      wait: 'slice.task.v3.unexpected.street_parade.wait.completed',
      detour: 'slice.task.v3.unexpected.street_parade.detour.completed',
      push: 'slice.task.v3.unexpected.street_parade.push.completed',
    },
    effects: {
      wait: { sympathy: 1 },
      detour: {  },
      push: { sympathy: -1, reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_AUTOCORRECT',
    title: 'Autocorrettore traditore',
    description: 'Il telefono corregge da solo un messaggio e lo invia prima che tu possa fermarlo.',
    options: [
      { optionId: 'apologize', label: 'Ti scusi subito' },
      { optionId: 'ignore', label: 'Fai finta di niente' },
      { optionId: 'blame_phone', label: 'Dici che è colpa del telefono' },
    ],
    messageKeys: {
      apologize: 'slice.task.v3.unexpected.autocorrect.apologize.completed',
      ignore: 'slice.task.v3.unexpected.autocorrect.ignore.completed',
      blame_phone: 'slice.task.v3.unexpected.autocorrect.blame_phone.completed',
    },
    effects: {
      apologize: { sympathy: 1 },
      ignore: { reputation: -1 },
      blame_phone: { reputation: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_UNEXPECTED_FLYAWAY_HAT',
    title: 'Cappello al vento',
    description: 'Una raffica di vento ti porta via il cappello in mezzo alla piazza.',
    options: [
      { optionId: 'chase', label: 'Lo rincorri' },
      { optionId: 'let_go', label: 'Lo lasci andare' },
      { optionId: 'ask_help', label: 'Chiedi a qualcuno di recuperarlo' },
    ],
    messageKeys: {
      chase: 'slice.task.v3.unexpected.flyaway_hat.chase.completed',
      let_go: 'slice.task.v3.unexpected.flyaway_hat.let_go.completed',
      ask_help: 'slice.task.v3.unexpected.flyaway_hat.ask_help.completed',
    },
    effects: {
      chase: { sympathy: 1 },
      let_go: {  },
      ask_help: { reputation: 1 },
    },
  },
  {
    definitionId: 'DEMO_V3_RISKY_PARKED_WALLET',
    title: 'Portafoglio in auto',
    description: 'Vedi un portafoglio sul sedile di un\'auto parcheggia con il finestrino abbassato.',
    options: [
      { optionId: 'notify_owner', label: 'Avvisi il proprietario' },
      { optionId: 'take', label: 'Lo prendi' },
      { optionId: 'ignore', label: 'Ignori' },
    ],
    messageKeys: {
      notify_owner: 'slice.task.v3.risky.parked_wallet.notify_owner.completed',
      take: 'slice.task.v3.risky.parked_wallet.take.completed',
      ignore: 'slice.task.v3.risky.parked_wallet.ignore.completed',
    },
    effects: {
      notify_owner: { reputation: 1 },
      take: { reputation: -2, cashDeltaMinor: 10n, cashReason: 'DEMO_V3_RISKY_WALLET_CASH' },
      ignore: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_RISKY_FENCE_GOODS',
    title: 'Merce sospetta',
    description: 'Qualcuno ti propone elettronica a prezzo stracciato in un parcheggio.',
    options: [
      { optionId: 'buy', label: 'Compri qualcosa' },
      { optionId: 'refuse', label: 'Rifiuti' },
      { optionId: 'report', label: 'Segnali' },
    ],
    messageKeys: {
      buy: 'slice.task.v3.risky.fence_goods.buy.completed',
      refuse: 'slice.task.v3.risky.fence_goods.refuse.completed',
      report: 'slice.task.v3.risky.fence_goods.report.completed',
    },
    effects: {
      buy: { reputation: -2, cashDeltaMinor: -20n, cashReason: 'DEMO_V3_RISKY_GOODS_CASH' },
      refuse: { reputation: 1 },
      report: { reputation: 1 },
    },
  },
  {
    definitionId: 'DEMO_V3_RISKY_FAKE_TICKET',
    title: 'Biglietto falsificato',
    description: 'Ti offrono un biglietto per un evento a metà prezzo.',
    options: [
      { optionId: 'buy', label: 'Compri il biglietto' },
      { optionId: 'refuse', label: 'Rifiuti' },
      { optionId: 'warn', label: 'Avverti altri' },
    ],
    messageKeys: {
      buy: 'slice.task.v3.risky.fake_ticket.buy.completed',
      refuse: 'slice.task.v3.risky.fake_ticket.refuse.completed',
      warn: 'slice.task.v3.risky.fake_ticket.warn.completed',
    },
    effects: {
      buy: { reputation: -1, cashDeltaMinor: -12n, cashReason: 'DEMO_V3_RISKY_TICKET_CASH' },
      refuse: {  },
      warn: { reputation: 1 },
    },
  },
  {
    definitionId: 'DEMO_V3_RISKY_OFF_BOOK_JOB',
    title: 'Lavoro in nero',
    description: 'Conoscente propone un lavoro pagato in contanti senza ricevuta.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'negotiate', label: 'Tratti' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.risky.off_book_job.accept.completed',
      negotiate: 'slice.task.v3.risky.off_book_job.negotiate.completed',
      refuse: 'slice.task.v3.risky.off_book_job.refuse.completed',
    },
    effects: {
      accept: { reputation: -1, cashDeltaMinor: 18n, cashReason: 'DEMO_V3_RISKY_CASH_JOB' },
      negotiate: { cashDeltaMinor: 12n, cashReason: 'DEMO_V3_RISKY_CASH_JOB' },
      refuse: { reputation: 1 },
    },
  },
  {
    definitionId: 'DEMO_V3_RISKY_DARE_CHALLENGE',
    title: 'Sfida rischiosa',
    description: 'Amici ti propongono una sfida imbarazzante in pubblico.',
    options: [
      { optionId: 'do_it', label: 'Accetti la sfida' },
      { optionId: 'dare_back', label: 'Rilanci la sfida' },
      { optionId: 'refuse', label: 'Rifiuti' },
    ],
    messageKeys: {
      do_it: 'slice.task.v3.risky.dare_challenge.do_it.completed',
      dare_back: 'slice.task.v3.risky.dare_challenge.dare_back.completed',
      refuse: 'slice.task.v3.risky.dare_challenge.refuse.completed',
    },
    effects: {
      do_it: { sympathy: 1, reputation: -1 },
      dare_back: {  },
      refuse: {  },
    },
  },
  {
    definitionId: 'DEMO_V3_RISKY_CHEAT_SHEET',
    title: 'Bigliettino durante esame',
    description: 'Qualcuno ti passa un bigliettino durante un corso o esame.',
    options: [
      { optionId: 'use', label: 'Lo usi' },
      { optionId: 'return', label: 'Restituisci' },
      { optionId: 'report', label: 'Segnali' },
    ],
    messageKeys: {
      use: 'slice.task.v3.risky.cheat_sheet.use.completed',
      return: 'slice.task.v3.risky.cheat_sheet.return.completed',
      report: 'slice.task.v3.risky.cheat_sheet.report.completed',
    },
    effects: {
      use: { reputation: -2 },
      return: {  },
      report: { reputation: 1 },
    },
  },
  {
    definitionId: 'DEMO_V3_RISKY_SHOPLIFT_WITNESS',
    title: 'Furto in negozio',
    description: 'Vedi qualcuno nascondere un prodotto in un negozio.',
    options: [
      { optionId: 'tell_staff', label: 'Avvisi il personale' },
      { optionId: 'ignore', label: 'Ignori' },
      { optionId: 'confront', label: 'Confronti' },
    ],
    messageKeys: {
      tell_staff: 'slice.task.v3.risky.shoplift_witness.tell_staff.completed',
      ignore: 'slice.task.v3.risky.shoplift_witness.ignore.completed',
      confront: 'slice.task.v3.risky.shoplift_witness.confront.completed',
    },
    effects: {
      tell_staff: { reputation: 1 },
      ignore: {  },
      confront: { sympathy: -1 },
    },
  },
  {
    definitionId: 'DEMO_V3_RISKY_BRIBE_OFFER',
    title: 'Tangente',
    description: 'Qualcuno ti offre un vantaggio in cambio di un favore non del tutto lecito.',
    options: [
      { optionId: 'accept', label: 'Accetti' },
      { optionId: 'refuse', label: 'Rifiuti' },
      { optionId: 'report', label: 'Segnali' },
    ],
    messageKeys: {
      accept: 'slice.task.v3.risky.bribe_offer.accept.completed',
      refuse: 'slice.task.v3.risky.bribe_offer.refuse.completed',
      report: 'slice.task.v3.risky.bribe_offer.report.completed',
    },
    effects: {
      accept: { reputation: -2, cashDeltaMinor: 10n, cashReason: 'DEMO_V3_RISKY_BRIBE_CASH' },
      refuse: { reputation: 1 },
      report: { reputation: 1 },
    },
  }
];

export const VARIETY_V3_STANDARD_DEFINITION_IDS = VARIETY_V3_STANDARD_TASKS.map((t) => t.definitionId);

export function varietyV3CashEffect(deltaMinor: bigint, reasonCode: string, kind: 'reward' | 'spend' = deltaMinor >= 0n ? 'reward' : 'spend') {
  const tx = kind === 'reward' ? TX_REWARD : TX_SPEND;
  return { kind: 'cash_delta' as const, deltaMinor, transactionType: tx.transactionType, transactionClass: tx.transactionClass, reasonCode };
}
