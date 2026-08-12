import type { JobStatRequirements } from './job-requirements-constants.js';

export type JobTier = 'entry' | 'medium' | 'high' | 'criminal';

export interface JobCatalogEntry {
  offerId: string;
  title: string;
  employer: string;
  description: string;
  occupationCode: number;
  salaryHintMinor: bigint;
  tier: JobTier;
  requirements?: JobStatRequirements;
  minMainLevel?: number;
  isCriminalOrg?: boolean;
  enabled?: boolean;
}

export const JOB_OFFERS_VISIBLE_COUNT = 10;
export const JOB_DAILY_ROTATION_COUNT = 2;

/** Extended job pool — DB offers merged; rotation shows 10/day, swaps 2. */
export const JOB_CATALOG_POOL: readonly JobCatalogEntry[] = [
  // Entry
  { offerId: 'job_comune_clerk_v1', title: 'Impiegato comunale', employer: 'Comune Virtuale', description: 'Burocrazia, timbri e pazienza infinita.', occupationCode: 1, salaryHintMinor: 2500n, tier: 'entry', requirements: { culture: 15, civicParticipation: 20, reputation: 25 } },
  { offerId: 'job_delivery_v1', title: 'Corriere espresso', employer: 'Spedizioni Rapide', description: 'Pacchi, scale e clienti impazienti.', occupationCode: 2, salaryHintMinor: 1800n, tier: 'entry' },
  { offerId: 'job_cafe_v1', title: 'Barista', employer: 'Bar del Comune', description: 'Caffè, cornetti e pettegolezzi.', occupationCode: 3, salaryHintMinor: 1500n, tier: 'entry', requirements: { sympathy: 35, reputation: 10 } },
  { offerId: 'job_cleaner_v1', title: 'Addetto pulizie', employer: 'Comune Virtuale', description: 'Uffici, corridoi e dignità silenziosa.', occupationCode: 10, salaryHintMinor: 1300n, tier: 'entry', requirements: { reputation: 15 } },
  { offerId: 'job_supermarket_v1', title: 'Commesso supermercato', employer: 'Supermercato Centro', description: 'Scaffali, casse e sorrisi obbligatori.', occupationCode: 4, salaryHintMinor: 1400n, tier: 'entry', requirements: { sympathy: 30, reputation: 20 } },
  // Medium
  { offerId: 'job_gardener_v1', title: 'Giardiniere comunale', employer: 'Comune Virtuale', description: 'Verde pubblico e potatura paziente.', occupationCode: 5, salaryHintMinor: 1350n, tier: 'medium', requirements: { sympathy: 25, happiness: 20 } },
  { offerId: 'job_baker_v1', title: 'Fornaio', employer: 'Panificio Rossi', description: 'Impasti mattutini e clienti affamati.', occupationCode: 9, salaryHintMinor: 1600n, tier: 'medium', requirements: { sympathy: 25, happiness: 20 } },
  { offerId: 'job_mechanic_v1', title: 'Meccanico officina', employer: 'Officina Meccanica Nord', description: 'Motori, freni e diagnosi ottimiste.', occupationCode: 6, salaryHintMinor: 1900n, tier: 'medium', requirements: { reputation: 30, happiness: 15 } },
  { offerId: 'job_nurse_v1', title: 'Assistente ambulatorio', employer: 'Ambulatorio San Marco', description: 'Accoglienza pazienti e pratiche.', occupationCode: 8, salaryHintMinor: 2000n, tier: 'medium', requirements: { sympathy: 45, reputation: 30, happiness: 30 }, minMainLevel: 2 },
  { offerId: 'job_teacher_v1', title: 'Supplente scuola', employer: 'Istituto Comunale', description: 'Lezioni, compiuti e corridoio rumoroso.', occupationCode: 7, salaryHintMinor: 2200n, tier: 'medium', requirements: { sympathy: 40, reputation: 35, happiness: 25, education: 35, culture: 20 }, minMainLevel: 2 },
  // High
  { offerId: 'job_accountant_v1', title: 'Contabile senior', employer: 'Studio Rossi & Figli', description: 'Numeri, bilanci e responsabilità reale.', occupationCode: 11, salaryHintMinor: 3200n, tier: 'high', requirements: { reputation: 50, happiness: 30, education: 30, reliability: 25 }, minMainLevel: 3 },
  { offerId: 'job_manager_v1', title: 'Responsabile negozio', employer: 'Supermercato Centro', description: 'Team, turni e obiettivi mensili.', occupationCode: 12, salaryHintMinor: 2800n, tier: 'high', requirements: { sympathy: 45, reputation: 55 }, minMainLevel: 3 },
  { offerId: 'job_engineer_v1', title: 'Tecnico comunale', employer: 'Comune Virtuale', description: 'Infrastrutture, progetti e riunioni.', occupationCode: 13, salaryHintMinor: 3500n, tier: 'high', requirements: { reputation: 60, happiness: 35, education: 40, culture: 25 }, minMainLevel: 4 },
  { offerId: 'job_lawyer_v1', title: 'Praticante legale', employer: 'Studio Legale Bianchi', description: 'Pratiche, udienze e caffeina.', occupationCode: 14, salaryHintMinor: 3800n, tier: 'high', requirements: { reputation: 65, sympathy: 40, education: 45, politicalInfluence: 30 }, minMainLevel: 4 },
  // Criminal org — occasional rotation
  {
    offerId: 'job_gang_v1',
    title: 'Entra a far parte di una gang',
    employer: 'Organizzazione non ufficiale',
    description: 'Niente busta paga. Molti incarichi rischiosi. Il Comune farà finta di niente finché conviene.',
    occupationCode: 99,
    salaryHintMinor: 0n,
    tier: 'criminal',
    isCriminalOrg: true,
    requirements: { reputation: 10 },
  },
  {
    offerId: 'job_shady_collect_v1',
    title: 'Recupero crediti… creativo',
    employer: 'Agenzia informale',
    description: 'Persuasione alternativa. Stipendio variabile. Conseguenze garantite.',
    occupationCode: 99,
    salaryHintMinor: 500n,
    tier: 'criminal',
    isCriminalOrg: true,
    requirements: { reputation: 20, sympathy: 15 },
  },
];

export const CRIMINAL_ORG_JOB_IDS = new Set(
  JOB_CATALOG_POOL.filter((job) => job.isCriminalOrg).map((job) => job.offerId),
);

export function getJobCatalogEntry(offerId: string): JobCatalogEntry | null {
  return JOB_CATALOG_POOL.find((job) => job.offerId === offerId) ?? null;
}

export function isCriminalOrganizationJob(offerId: string): boolean {
  return CRIMINAL_ORG_JOB_IDS.has(offerId);
}

/** Daily job board: entry always visible; extras scale with mainLevel; 2 slots rotate daily. */
export function pickDailyJobOffers(
  gameTimeMs: number,
  mainLevel = 1,
  pool: readonly JobCatalogEntry[] = JOB_CATALOG_POOL,
): JobCatalogEntry[] {
  const enabled = pool.filter((job) => job.enabled !== false);
  const day = Math.floor(gameTimeMs / (24 * 60 * 60 * 1000));

  const isUnlocked = (job: JobCatalogEntry) => (job.minMainLevel ?? 1) <= mainLevel;
  const canPreview = (job: JobCatalogEntry) => {
    if (job.tier === 'criminal') return mainLevel >= 2;
    if (job.tier === 'high') return (job.minMainLevel ?? 99) <= mainLevel + 1;
    if (job.tier === 'medium' && !isUnlocked(job)) return (job.minMainLevel ?? 99) <= mainLevel + 1;
    return isUnlocked(job);
  };

  const entryJobs = enabled.filter((job) => job.tier === 'entry');
  const mediumJobs = enabled.filter((job) => job.tier === 'medium' && canPreview(job));
  const highJobs = enabled.filter((job) => job.tier === 'high' && canPreview(job));
  const criminalJobs = enabled.filter((job) => job.tier === 'criminal' && canPreview(job));

  const stableCount = JOB_OFFERS_VISIBLE_COUNT - JOB_DAILY_ROTATION_COUNT;
  const core: JobCatalogEntry[] = [...entryJobs];
  const seen = new Set(core.map((job) => job.offerId));

  const unlockedHigh = highJobs.filter((job) => isUnlocked(job));
  if (mainLevel >= 4) {
    for (const job of unlockedHigh.slice(0, 3)) {
      if (seen.has(job.offerId)) continue;
      seen.add(job.offerId);
      core.push(job);
    }
  } else if (mainLevel >= 3) {
    for (const job of unlockedHigh.slice(0, 1)) {
      if (seen.has(job.offerId)) continue;
      seen.add(job.offerId);
      core.push(job);
    }
  }

  const mediumStableCount =
    mainLevel >= 4 ? 1 : mainLevel >= 3 ? 2 : Math.min(3, mediumJobs.length);
  const mediumOffset = (day * JOB_DAILY_ROTATION_COUNT) % Math.max(mediumJobs.length, 1);

  for (let i = 0; i < mediumStableCount; i++) {
    const job = mediumJobs[(mediumOffset + i) % mediumJobs.length];
    if (!job || seen.has(job.offerId)) continue;
    seen.add(job.offerId);
    core.push(job);
  }

  for (const job of [...mediumJobs, ...highJobs].sort(
    (a, b) => Number(a.salaryHintMinor - b.salaryHintMinor),
  )) {
    if (core.length >= stableCount) break;
    if (seen.has(job.offerId)) continue;
    if (job.tier === 'high' && !isUnlocked(job)) continue;
    seen.add(job.offerId);
    core.push(job);
  }

  const rotatable = [
    ...mediumJobs.filter((job) => !seen.has(job.offerId)),
    ...highJobs.filter((job) => !seen.has(job.offerId)),
    ...criminalJobs.filter((job) => !seen.has(job.offerId)),
  ];
  const rotated: JobCatalogEntry[] = [];

  for (let i = 0; i < JOB_DAILY_ROTATION_COUNT; i++) {
    if (rotatable.length === 0) break;
    const idx = (day * JOB_DAILY_ROTATION_COUNT + i) % rotatable.length;
    const pick = rotatable[idx]!;
    if (!core.some((job) => job.offerId === pick.offerId) && !rotated.some((job) => job.offerId === pick.offerId)) {
      rotated.push(pick);
    } else {
      rotated.push(rotatable[(idx + 1) % rotatable.length]!);
    }
  }

  const result = [...core, ...rotated];
  const backfillPool = enabled
    .filter((job) => !result.some((entry) => entry.offerId === job.offerId))
    .filter((job) => canPreview(job))
    .sort((a, b) => Number(a.salaryHintMinor - b.salaryHintMinor));

  for (const job of backfillPool) {
    if (result.length >= JOB_OFFERS_VISIBLE_COUNT) break;
    result.push(job);
  }

  return result.slice(0, JOB_OFFERS_VISIBLE_COUNT);
}
