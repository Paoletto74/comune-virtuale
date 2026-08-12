import type { WorldEventEffects, WorldEventScope, WorldEventSeverity, WorldEventType } from '../application/world/world-event-types.js';

export interface WorldEventTemplate {
  templateId: string;
  type: WorldEventType;
  scope: WorldEventScope;
  severity: WorldEventSeverity;
  title: string;
  body: string;
  comuneLine: string;
  durationGameMs: number;
  /** Deterministic spawn probability when a spawn slot opens. */
  spawnProbability: number;
  /** Minimum game time between spawns of this template. */
  cooldownGameMs: number;
  effects: WorldEventEffects;
  zoneId?: string;
}

export interface WorldEventConfig {
  enabled: boolean;
  maxActiveEvents: number;
  spawnCheckIntervalGameMs: number;
  globalSpawnCooldownGameMs: number;
  spawnProbability: number;
  maxCombinedTaskMultiplier: number;
  minCombinedTaskMultiplier: number;
  maxCombinedFlashMultiplier: number;
  minCombinedFlashMultiplier: number;
}

export const DEFAULT_WORLD_EVENT_CONFIG: WorldEventConfig = {
  enabled: true,
  maxActiveEvents: 2,
  spawnCheckIntervalGameMs: 2 * 60 * 60 * 1000,
  globalSpawnCooldownGameMs: 6 * 60 * 60 * 1000,
  spawnProbability: 0.45,
  maxCombinedTaskMultiplier: 1.35,
  minCombinedTaskMultiplier: 0.85,
  maxCombinedFlashMultiplier: 1.4,
  minCombinedFlashMultiplier: 0.9,
};

export const WORLD_EVENT_TEMPLATES: readonly WorldEventTemplate[] = [
  {
    templateId: 'demo_weather_heat_wave',
    type: 'weather',
    scope: 'global',
    severity: 'moderate',
    title: 'Ondata di caldo',
    body: 'Le temperature hanno deciso di fare le valigie e restare.',
    comuneLine: 'Anche l\'asfalto ha deciso di chiedere ferie.',
    durationGameMs: 6 * 60 * 60 * 1000,
    spawnProbability: 0.55,
    cooldownGameMs: 12 * 60 * 60 * 1000,
    effects: {
      taskContextMultipliers: { social: 1.18, generic: 1.08 },
      taskContextPenalties: { work: 0.94 },
      flashTypeMultipliers: { social: 1.15, special: 1.1 },
    },
  },
  {
    templateId: 'demo_infrastructure_transport_disruption',
    type: 'infrastructure',
    scope: 'local',
    severity: 'moderate',
    title: 'Interruzione dei trasporti',
    body: 'La linea che collegava due punti che già non si parlavano è temporaneamente in pausa.',
    comuneLine: 'Il Comune consiglia pazienza. Ne ha molta, lui.',
    durationGameMs: 5 * 60 * 60 * 1000,
    spawnProbability: 0.5,
    cooldownGameMs: 10 * 60 * 60 * 1000,
    zoneId: 'district_center',
    effects: {
      taskContextMultipliers: { social: 1.14, living: 1.12, unexpected: 1.1 },
      taskContextPenalties: { work: 0.9, economic: 0.92 },
      flashTypeMultipliers: { social: 1.12 },
      npcTemplateMultipliers: { marco_neighbor: 1.15 },
    },
  },
  {
    templateId: 'demo_economic_cost_of_living',
    type: 'economic',
    scope: 'global',
    severity: 'high',
    title: 'Aumento improvviso del costo della vita',
    body: 'I prezzi hanno fatto un salto. Il Comune osserva con distacco professionale.',
    comuneLine: 'Il bilancio familiare ringrazia e chiede un minuto di silenzio.',
    durationGameMs: 8 * 60 * 60 * 1000,
    spawnProbability: 0.48,
    cooldownGameMs: 14 * 60 * 60 * 1000,
    effects: {
      taskContextMultipliers: { economic: 1.2, social: 1.1 },
      taskContextPenalties: { unexpected: 0.93 },
      flashTypeMultipliers: { economic: 1.18, work: 1.08 },
    },
  },
  {
    templateId: 'demo_geopolitical_abstract_crisis',
    type: 'geopolitical',
    scope: 'global',
    severity: 'moderate',
    title: 'Crisi internazionale',
    body: 'Da lontano, il mondo sembra più complicato. Da qui, le code in ufficio postale sembrano più lunghe.',
    comuneLine: 'Il Comune non commenta. Il Comune registra.',
    durationGameMs: 7 * 60 * 60 * 1000,
    spawnProbability: 0.4,
    cooldownGameMs: 16 * 60 * 60 * 1000,
    effects: {
      taskContextMultipliers: { economic: 1.12, social: 1.08, dialogue: 1.06 },
      taskContextPenalties: { risky: 0.88 },
      flashTypeMultipliers: { economic: 1.1, special: 1.08 },
    },
  },
  {
    templateId: 'demo_culture_festival',
    type: 'social',
    scope: 'local',
    severity: 'moderate',
    title: 'Festival di quartiere',
    body: 'Stand, musica e file ai bagni pubblici. Il centro si riempie di vita.',
    comuneLine: 'Il Comune approva. I residenti preoccupano per il parcheggio.',
    durationGameMs: 8 * 60 * 60 * 1000,
    spawnProbability: 0.42,
    cooldownGameMs: 18 * 60 * 60 * 1000,
    effects: {
      taskContextMultipliers: { social: 1.2, unexpected: 1.1 },
      flashTypeMultipliers: { social: 1.15, economic: 1.08 },
    },
  },
  {
    templateId: 'demo_politics_council_session',
    type: 'special',
    scope: 'global',
    severity: 'moderate',
    title: 'Seduta consiliare',
    body: 'Il consiglio comunale si riunisce. Le decisioni sono lente. Le discussioni no.',
    comuneLine: 'La democrazia locale procede. Con pause caffè.',
    durationGameMs: 6 * 60 * 60 * 1000,
    spawnProbability: 0.38,
    cooldownGameMs: 14 * 60 * 60 * 1000,
    effects: {
      taskContextMultipliers: { social: 1.1, economic: 1.08 },
      flashTypeMultipliers: { special: 1.12 },
    },
  },
  {
    templateId: 'demo_safety_neighborhood_watch',
    type: 'local',
    scope: 'local',
    severity: 'low',
    title: 'Ronde di quartiere',
    body: 'I cittadini organizzano turni di vigilanza informale. Tutti si sentono più sicuri. O più nervosi.',
    comuneLine: 'Il Comune osserva. Non interferisce. Per ora.',
    durationGameMs: 5 * 60 * 60 * 1000,
    spawnProbability: 0.35,
    cooldownGameMs: 12 * 60 * 60 * 1000,
    effects: {
      taskContextMultipliers: { social: 1.12, living: 1.08 },
      taskContextPenalties: { risky: 0.9 },
    },
  },
  {
    templateId: 'demo_sport_local_tournament',
    type: 'social',
    scope: 'local',
    severity: 'moderate',
    title: 'Torneo di paese',
    body: 'Squadre locali, tifosi entusiasti e un campo che ha visto giorni migliori.',
    comuneLine: 'Lo sport unisce. I risultati dividono.',
    durationGameMs: 7 * 60 * 60 * 1000,
    spawnProbability: 0.4,
    cooldownGameMs: 16 * 60 * 60 * 1000,
    effects: {
      taskContextMultipliers: { social: 1.16, unexpected: 1.08 },
      flashTypeMultipliers: { social: 1.1 },
    },
  },
  {
    templateId: 'demo_work_job_fair',
    type: 'economic',
    scope: 'global',
    severity: 'moderate',
    title: 'Job fair comunale',
    body: 'Aziende e cittadini si incontrano. CV, sorrisi e speranze in fila.',
    comuneLine: 'Il lavoro è un tema delicato. Il Comune lo sa.',
    durationGameMs: 6 * 60 * 60 * 1000,
    spawnProbability: 0.45,
    cooldownGameMs: 15 * 60 * 60 * 1000,
    effects: {
      taskContextMultipliers: { work: 1.18, economic: 1.12 },
      flashTypeMultipliers: { work: 1.15, economic: 1.1 },
    },
  },
];

let configOverride: WorldEventConfig | null = null;

export function getWorldEventConfig(): WorldEventConfig {
  return configOverride ?? DEFAULT_WORLD_EVENT_CONFIG;
}

export function setWorldEventConfigForTests(config: WorldEventConfig | null): void {
  configOverride = config;
}

export function getWorldEventTemplate(templateId: string): WorldEventTemplate | undefined {
  return WORLD_EVENT_TEMPLATES.find((template) => template.templateId === templateId);
}

export function listWorldEventTemplates(): readonly WorldEventTemplate[] {
  return WORLD_EVENT_TEMPLATES;
}
