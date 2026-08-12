export const DEFAULT_INFLATION_RATE_BPS = 200;

export const GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS = 20 * 60 * 1000;

export interface DemoReferendumTemplate {
  question: string;
  context: string;
  optionALabel: string;
  optionBLabel: string;
  consequenceSummaryA: string;
  consequenceSummaryB: string;
}

export const DEMO_REFERENDUM_TEMPLATE: DemoReferendumTemplate = {
  question: 'Estendere l’orario del mercato rionale?',
  context:
    'Il Comune Virtuale apre una consultazione sulla bancarella del quartiere: più ore di vendita, oppure più silenzio nelle ore di riposo. La redazione della Gazzetta osserva che, in entrambi i casi, qualcuno protesterà con convinzione.',
  optionALabel: 'Sì, orario esteso',
  optionBLabel: 'No, lasciamo com’è',
  consequenceSummaryA:
    'Il mercato resterà aperto più a lungo. I vicini hanno già preparato le lamentele.',
  consequenceSummaryB:
    'L’orario attuale resta in vigore. I commercianti hanno già preparato le lamentele.',
};

export const GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE = 'marketplacePurchase';
export const GAME_SURFACE_MARKETPLACE_TRANSACTION_CLASS = 'money_transfer';
export const GAME_SURFACE_MARKETPLACE_REASON = 'MARKETPLACE_PURCHASE';

export const GAME_SURFACE_PAYROLL_TRANSACTION_TYPE = 'jobPayroll';
export const GAME_SURFACE_PAYROLL_REASON = 'JOB_SHIFT_PAYROLL';

export const GAME_SURFACE_GIFT_TRANSACTION_TYPE = 'citizenGift';
export const GAME_SURFACE_GIFT_REASON = 'CITIZEN_GIFT';

export const GAME_SURFACE_LOAN_TRANSACTION_TYPE = 'citizenLoan';
export const GAME_SURFACE_LOAN_REASON = 'CITIZEN_LOAN';

export function marketplacePurchaseSourceActionId(citizenId: string, itemId: string): string {
  return `marketplace:${citizenId}:${itemId}`;
}

export function marketplacePurchaseIdempotencyKey(citizenId: string, itemId: string): string {
  return `marketplace-purchase:${citizenId}:${itemId}`;
}

export function referendumVoteIdempotencyKey(referendumId: string, citizenId: string): string {
  return `referendum-vote:${referendumId}:${citizenId}`;
}

export function jobAcceptIdempotencyKey(citizenId: string, offerId: string): string {
  return `job-accept:${citizenId}:${offerId}`;
}

export function citizenMessageIdempotencyKey(
  fromCitizenId: string,
  toCitizenId: string,
  clientKey: string,
): string {
  return `citizen-message:${fromCitizenId}:${toCitizenId}:${clientKey}`;
}

export function citizenGiftIdempotencyKey(
  fromCitizenId: string,
  toCitizenId: string,
  clientKey: string,
): string {
  return `citizen-gift:${fromCitizenId}:${toCitizenId}:${clientKey}`;
}

export function citizenLoanIdempotencyKey(
  fromCitizenId: string,
  toCitizenId: string,
  clientKey: string,
): string {
  return `citizen-loan:${fromCitizenId}:${toCitizenId}:${clientKey}`;
}

export function economicSnapshotIdempotencyKey(citizenId: string, gameTimeMs: number): string {
  const bucketMs = 60 * 60 * 1000;
  const bucket = Math.floor(gameTimeMs / bucketMs);
  return `economic-snapshot:${citizenId}:${bucket}`;
}

export function inflationSnapshotIdempotencyKey(gameTimeMs: number): string {
  const bucketMs = 60 * 60 * 1000;
  const bucket = Math.floor(gameTimeMs / bucketMs);
  return `inflation-snapshot:${bucket}`;
}

export function demoReferendumIdempotencyKey(gameTimeMs: number): string {
  const bucketMs = GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS;
  const bucket = Math.floor(gameTimeMs / bucketMs);
  return `demo-referendum:${bucket}`;
}

export const GAME_MS_PER_DAY = 24 * 60 * 60 * 1000;
export const GAME_SURFACE_WORK_SHIFT_DURATION_MS = 2 * 60 * 60 * 1000;

export function endOfGameDayMs(gameTimeMs: number): number {
  return (Math.floor(gameTimeMs / GAME_MS_PER_DAY) + 1) * GAME_MS_PER_DAY;
}

export function jobApplicationIdempotencyKey(
  citizenId: string,
  offerId: string,
  clientKey: string,
): string {
  return `job-application:${citizenId}:${offerId}:${clientKey}`;
}

export function jobClockInIdempotencyKey(
  citizenId: string,
  offerId: string,
  gameDayStartMs: number,
): string {
  return `job-clock-in:${citizenId}:${offerId}:${gameDayStartMs}`;
}

export const JOB_APPLICATION_ACCEPT_PROBABILITY = 0.5;
