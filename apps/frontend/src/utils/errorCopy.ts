/** Client-side copy for API error messageKeys — Comune tone of voice. */
const ERROR_MESSAGES: Record<string, string> = {
  'error.auth.required': 'Devi effettuare l’accesso. Il Comune non serve ai fantasmi.',
  'error.auth.admin_required': 'Non hai i permessi amministrativi. Il Comune ha detto no.',
  'error.auth.dev_disabled': 'L’accesso dev non è disponibile. Nemmeno qui si barano tutti.',
  'error.citizen.required': 'Prima serve un cittadino. Anche il Comune ha le sue priorità.',
  'error.citizen.already_exists': 'Hai già un cittadino. Uno basta, per ora.',
  'error.validation.display_name': 'Il nome non è valido. Prova qualcosa che sembri credibile.',
  'error.validation.gender': 'Il genere selezionato non è valido.',
  'error.validation.age': 'L’età deve essere tra 18 e 120. Il Comune fa eccezioni solo sulla carta.',
  'error.validation.portrait_id': 'L\'avatar selezionato non è valido.',
  'error.validation.idempotency_key': 'Richiesta non valida. Riprova — il Comune non è in vena di ripetizioni.',
  'error.validation.request': 'Richiesta non valida. Controlla i dati. La matematica, per una volta, ha ragione.',
  'error.task.not_found': 'Attività non trovata. Forse è già finita nel dimenticatoio comunale.',
  'error.task.already_completed': 'Hai già completato questa attività. Il Comune ha memoria.',
  'error.task.not_completable': 'Non puoi farlo. Almeno non ancora.',
  'error.task.not_supported': 'Questa attività non è ancora disponibile. Pazienza — o no.',
  'error.task.option_not_supported': 'Scelta non disponibile. Il Comune ha già deciso per te, indirettamente.',
  'error.task.not_ready':
    'L’attività è ancora in corso. Aspetta che sia pronta. Il tempo qui passa, anche quando non vuoi.',
  'error.task.not_started': 'Devi avviare l’attività prima di completarla. Ordine, per favore.',
  'error.task.option_locked': 'Hai già effettuato una scelta. Il Comune non ama i ripensamenti.',
  'error.task.already_started': 'Questa attività è già in corso. Una cosa alla volta.',
  'error.task.not_startable': 'Non puoi avviarla adesso. Almeno non ancora.',
  'error.task.max_standard_tasks': 'Hai già tre attività in corso. Completa qualcosa prima di aggiungere caos.',
  'error.task.product_requirement': 'Non possiedi il prodotto richiesto. Il mercato ha vinto, di nuovo.',
  'error.game_surface.purchase_blocked': 'Non hai il prestigio necessario. Il Comune ha standard discutibili.',
  'error.game_surface.referendum_not_found': 'Questo referendum non c’è più. Forse non c’è mai stato.',
  'error.game_surface.referendum_closed': 'Referendum chiuso. La democrazia locale ha orari precisi.',
  'error.game_surface.unavailable': 'Non è stato possibile registrare il voto. Riprova — il Comune non è in vacanza.',
  'error.task.onboarding_selection_failed':
    'Impossibile avviare la prima attività. Il Comune si è impantanato. Riprova.',
  'error.task.steal_wallet_not_resolved': 'Impossibile completare l’azione. Riprova — senza furti, se possibile.',
  'error.economy.insufficient_cash': 'Risorse insufficienti. La matematica, per una volta, ha vinto.',
  'error.economy.insufficient_source_funds': 'I fondi disponibili non bastano. Controlla il saldo.',
  'error.economy.invalid_transfer_amount': 'Importo non valido. Anche i numeri hanno dignità.',
  'error.technical.internal': 'Si è verificato un errore. Il Comune nega ogni responsabilità. Riprova tra poco.',
  'error.unknown': 'Errore imprevisto. Succede anche ai migliori — e al Comune.',
};

export function resolveErrorMessage(messageKey: string): string {
  return ERROR_MESSAGES[messageKey] ?? 'Si è verificato un errore. Riprova tra poco.';
}
