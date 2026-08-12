import {
  MUNICIPALITY_CHRONICLE_TEMPLATES,
  municipalityChronicleIdempotencyKey,
  pickChronicleTemplate,
} from './world-depth-constants.js';

/** Game-time bucket for periodic gazzetta refresh (~5 min game time). */
export const GAZZETTA_REFRESH_BUCKET_MS = 5 * 60 * 1000;

export const GAZZETTA_MIN_ARTICLES = 15;
export const GAZZETTA_MAX_ARTICLES = 15;

export const GAZZETTA_SUMMARY_MAX_CHARS = 140;

export interface GazzettaArticleExpansion {
  summary: string;
  fullBody: string;
  comuneLine?: string;
}

const SARCASTIC_CLOSINGS = [
  'Il Comune ha preso nota. Il Comune non interviene.',
  'La redazione resta in attesa di sviluppi. Preferibilmente meno noiosi.',
  'I lettori sono invitati a formarsi un\'opinione. Poi a tenerla per sé.',
  'Cronaca verificata. Entusiasmo non garantito.',
  'Fine articolo. Torna alla fila.',
] as const;

function pickClosing(gameTimeMs: number, seed: string): string {
  const idx =
    Math.abs(
      [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), gameTimeMs),
    ) % SARCASTIC_CLOSINGS.length;
  return SARCASTIC_CLOSINGS[idx]!;
}

function trimToSummary(body: string): string {
  const normalized = body.replace(/\s+/g, ' ').trim();
  if (normalized.length <= GAZZETTA_SUMMARY_MAX_CHARS) return normalized;
  const cut = normalized.slice(0, GAZZETTA_SUMMARY_MAX_CHARS);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function gazzettaHeroImageKey(category?: string): string {
  const normalized = (category ?? 'cronaca').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `gazzetta-${normalized}`;
}

export function expandGazzettaArticle(input: {
  title: string;
  body: string;
  category?: string;
  gameTimeMs: number;
  articleId: string;
  contextLine?: string;
  consequenceLine?: string;
}): GazzettaArticleExpansion {
  const category = input.category ?? 'cronaca';
  const intro = input.body.trim();
  const context =
    input.contextLine ??
    `La redazione della Gazzetta ha raccolto testimonianze sul tema «${input.title}».`;
  const consequence =
    input.consequenceLine ??
    `Per il momento la situazione resta sotto osservazione del Comune. Categoria: ${category}.`;
  const closing = pickClosing(input.gameTimeMs, input.articleId);

  const paragraphs = [
    intro,
    context,
    consequence,
    'I residenti commentano già nelle code, nei bar e nei gruppi che il Comune non legge.',
    'Non è chiaro se qualcuno cambierà idea dopo aver letto questo articolo. Probabilmente no.',
    closing,
  ].filter((p) => p.length > 0);

  const fullBody = paragraphs.join('\n\n');
  return {
    summary: trimToSummary(intro || input.title),
    fullBody,
    comuneLine: closing,
  };
}

export function gazzettaRefreshIdempotencyKey(gameTimeMs: number): string {
  const bucket = Math.floor(gameTimeMs / GAZZETTA_REFRESH_BUCKET_MS);
  return `gazzetta-refresh:${bucket}`;
}

export function pickGazzettaFillerTemplate(gameTimeMs: number, index: number) {
  const templates = MUNICIPALITY_CHRONICLE_TEMPLATES;
  const bucket = Math.floor(gameTimeMs / GAZZETTA_REFRESH_BUCKET_MS);
  return templates[(bucket + index) % templates.length]!;
}

export function pickPeriodicChronicleTemplate(gameTimeMs: number) {
  return pickChronicleTemplate(gameTimeMs);
}

export { municipalityChronicleIdempotencyKey };
