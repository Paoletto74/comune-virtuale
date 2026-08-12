import {
  DEMO_REFERENDUM_TEMPLATE,
  GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS,
  type DemoReferendumTemplate,
} from './game-surface-constants.js';

/** Monthly salary divided by working shifts per game-month (1 shift ≈ 1 game day). */
export const GAME_SURFACE_SHIFTS_PER_MONTH = 30n;

export function shiftPayMinor(monthlySalaryMinor: bigint): bigint {
  if (monthlySalaryMinor <= 0n) return 0n;
  return monthlySalaryMinor / GAME_SURFACE_SHIFTS_PER_MONTH;
}

export function jobPayrollIdempotencyKey(
  citizenId: string,
  offerId: string,
  shiftEndsAtGameMs: number,
): string {
  return `job-payroll:${citizenId}:${offerId}:${shiftEndsAtGameMs}`;
}

export interface ReferendumTemplate extends DemoReferendumTemplate {
  templateId: string;
  treasuryDeltaA: bigint;
  treasuryDeltaB: bigint;
  inflationDeltaBpsA: number;
  inflationDeltaBpsB: number;
  problem?: string;
  votingGuide?: string;
  impactSummary?: string;
}

export function enrichReferendumTemplate(template: ReferendumTemplate): {
  problem: string;
  votingGuide: string;
  impactSummary: string;
} {
  const problem =
    template.problem ??
    `Il Comune chiede una scelta netta: ${template.question} La consultazione resta aperta per poco; poi qualcuno dovrà spiegare il risultato con faccia professionale.`;
  const votingGuide =
    template.votingGuide ??
    `«${template.optionALabel}» spinge verso la prima opzione descritta nel bando. «${template.optionBLabel}» mantiene lo status quo o la linea opposta. Il voto è personale, tracciato e non reversibile. Il Comune non promette che cambierà la tua vita. Solo il bilancio.`;
  const impactSummary =
    template.impactSummary ??
    `Esito A: ${template.consequenceSummaryA} Esito B: ${template.consequenceSummaryB} Inflazione e cassa comunale possono muoversi di conseguenza. Gli stipendi restano quelli scritti in busta.`;
  return { problem, votingGuide, impactSummary };
}

export const REFERENDUM_TEMPLATES: readonly ReferendumTemplate[] = [
  {
    templateId: 'referendum_market_hours_v1',
    ...DEMO_REFERENDUM_TEMPLATE,
    problem:
      'Il mercato rionale chiude troppo presto per alcuni commercianti e troppo tardi per alcuni vicini. Il Comune vuole una decisione prima che la discussione diventi un podcast di quartiere.',
    votingGuide:
      'Approva per allungare l\'orario di vendita. Non approva per lasciare tutto com\'è. Il voto non sconta la tassa sui rifiuti. Peccato.',
    impactSummary:
      'Orario esteso: più commercio di strada, più rumore, inflazione leggermente più vivace. Orario attuale: nessun cambiamento, nessun entusiasmo.',
    treasuryDeltaA: -50_000n,
    treasuryDeltaB: 0n,
    inflationDeltaBpsA: 10,
    inflationDeltaBpsB: 0,
  },
  {
    templateId: 'referendum_green_spaces_v1',
    question: 'Investire nella cura dei parchi cittadini?',
    context:
      'Il Comune propone un fondo per parchi, panchine e alberi. I sostenitori parlano di qualità della vita. I detrattori parlano di bilancio.',
    optionALabel: 'Sì, più verde',
    optionBLabel: 'No, priorità altrove',
    consequenceSummaryA:
      'I parchi riceveranno più attenzione. I giardinieri hanno già iniziato a sperare.',
    consequenceSummaryB:
      'Il verde pubblico resta com’è. I giardinieri hanno già iniziato a rassegnarsi.',
    treasuryDeltaA: -80_000n,
    treasuryDeltaB: 20_000n,
    inflationDeltaBpsA: 15,
    inflationDeltaBpsB: -5,
  },
  {
    templateId: 'referendum_night_transport_v1',
    question: 'Attivare corse notturne extra?',
    context:
      'Una consultazione su bus e tram dopo mezzanotte. Utile per lavoratori e studenti. Costoso per la cassa comunale.',
    optionALabel: 'Sì, corse notturne',
    optionBLabel: 'No, orario attuale',
    consequenceSummaryA:
      'Il trasporto notturno verrà potenziato. I taxisti osservano con interesse professionale.',
    consequenceSummaryB:
      'Gli orari restano invariati. Chi esce tardi continua a camminare.',
    treasuryDeltaA: -120_000n,
    treasuryDeltaB: 30_000n,
    inflationDeltaBpsA: 20,
    inflationDeltaBpsB: 0,
  },
  {
    templateId: 'referendum_local_tax_v1',
    question: 'Aumentare leggermente le tasse locali?',
    context:
      'Più entrate per servizi pubblici, oppure tasse stabili e servizi invariati. Il Comune non sorride in nessuno dei due casi.',
    optionALabel: 'Sì, tasse più alte',
    optionBLabel: 'No, tasse stabili',
    consequenceSummaryA:
      'Le entrate comunali aumenteranno. I cittadini hanno già preparato le obiezioni.',
    consequenceSummaryB:
      'Le tasse restano invariate. I servizi restano come sono.',
    treasuryDeltaA: 150_000n,
    treasuryDeltaB: -20_000n,
    inflationDeltaBpsA: 25,
    inflationDeltaBpsB: 5,
  },
  {
    templateId: 'referendum_festival_v1',
    question: 'Finanziare un festival cittadino?',
    context:
      'Musica, stand gastronomici e file ai bagni pubblici. Un evento per rilanciare il centro storico.',
    optionALabel: 'Sì, festival',
    optionBLabel: 'No, non ora',
    consequenceSummaryA:
      'Il festival verrà organizzato. La Gazzetta ha già preparato titoli entusiastici.',
    consequenceSummaryB:
      'Nessun festival questa stagione. Il centro storico resta tranquillo.',
    treasuryDeltaA: -100_000n,
    treasuryDeltaB: 10_000n,
    inflationDeltaBpsA: 10,
    inflationDeltaBpsB: 0,
  },
  {
    templateId: 'referendum_culture_fund_v1',
    question: 'Finanziare biblioteca e teatro comunale?',
    context:
      'Più cultura, più eventi, più speranza che qualcuno partecipi. Costa. Il Comune sorride in entrambi i casi, ma per motivi diversi.',
    optionALabel: 'Sì, più cultura',
    optionBLabel: 'No, priorità altrove',
    consequenceSummaryA: 'Biblioteca e teatro riceveranno fondi. I pochi abituati festeggiano.',
    consequenceSummaryB: 'La cultura resta come ieri. I pochi abituati protestano.',
    treasuryDeltaA: -90_000n,
    treasuryDeltaB: 15_000n,
    inflationDeltaBpsA: 12,
    inflationDeltaBpsB: 0,
  },
  {
    templateId: 'referendum_security_cameras_v1',
    question: 'Installare telecamere in più zone?',
    context:
      'Sicurezza percepita vs privacy discutibile. Il Comune promette che guarderanno solo quando serve. Come sempre.',
    optionALabel: 'Sì, più telecamere',
    optionBLabel: 'No, basta così',
    consequenceSummaryA: 'Nuove telecamere in arrivo. I furbetti cambiano percorso.',
    consequenceSummaryB: 'Nessuna telecamera in più. La privacy respira.',
    treasuryDeltaA: -70_000n,
    treasuryDeltaB: 5_000n,
    inflationDeltaBpsA: 8,
    inflationDeltaBpsB: 0,
  },
  {
    templateId: 'referendum_commerce_hours_v1',
    question: 'Liberalizzare gli orari dei negozi?',
    context:
      'Negozi aperti più a lungo, commercianti stanchi, clienti felici la domenica. O quasi.',
    optionALabel: 'Sì, orari estesi',
    optionBLabel: 'No, orari attuali',
    consequenceSummaryA: 'Il commercio potrà restare aperto più a lungo. I commessi preghino.',
    consequenceSummaryB: 'Gli orari restano invariati. Domenica sacra per molti.',
    treasuryDeltaA: 20_000n,
    treasuryDeltaB: 0n,
    inflationDeltaBpsA: 5,
    inflationDeltaBpsB: 0,
  },
  {
    templateId: 'referendum_waste_tax_v1',
    question: 'Aumentare la tassa sui rifiuti?',
    context:
      'Più soldi per la raccolta differenziata. Meno soldi in tasca. Il Comune chiama questo "responsabilità".',
    optionALabel: 'Sì, tassa rifiuti',
    optionBLabel: 'No, tasse stabili',
    consequenceSummaryA: 'La tassa rifiuti aumenterà. I sacchetti resteranno costosi.',
    consequenceSummaryB: 'Nessun aumento. I bidoni restano pieni come prima.',
    treasuryDeltaA: 80_000n,
    treasuryDeltaB: -10_000n,
    inflationDeltaBpsA: 15,
    inflationDeltaBpsB: 5,
  },
  {
    templateId: 'referendum_infrastructure_v1',
    question: 'Investire nelle strade dissestate?',
    context:
      'Buche, cantieri, file. Un classico del Comune Virtuale. I lavori dureranno più del previsto. Sempre.',
    optionALabel: 'Sì, sistemare strade',
    optionBLabel: 'No, non ora',
    consequenceSummaryA: 'Cantieri in arrivo. Preparatevi ai deviazioni.',
    consequenceSummaryB: 'Le buche restano. Le sospensioni anche.',
    treasuryDeltaA: -200_000n,
    treasuryDeltaB: 25_000n,
    inflationDeltaBpsA: 18,
    inflationDeltaBpsB: 0,
  },
  {
    templateId: 'referendum_environment_v1',
    question: 'Incentivare mobilità sostenibile?',
    context:
      'Piste ciclabili, bonus bici, meno auto in centro. I motoristi hanno già preparato le obiezioni.',
    optionALabel: 'Sì, mobilità verde',
    optionBLabel: 'No, status quo',
    consequenceSummaryA: 'Incentivi e piste in arrivo. Le bici ringraziano.',
    consequenceSummaryB: 'Nessun incentivo. Le auto dominano.',
    treasuryDeltaA: -60_000n,
    treasuryDeltaB: 10_000n,
    inflationDeltaBpsA: 10,
    inflationDeltaBpsB: 0,
  },
  {
    templateId: 'referendum_school_meals_v1',
    question: 'Migliorare le mense scolastiche?',
    context:
      'Cibo migliore per i bambini, costi per la collettività. Nessuno voterà contro i bambini. Ufficialmente.',
    optionALabel: 'Sì, mense migliori',
    optionBLabel: 'No, budget limitato',
    consequenceSummaryA: 'Le mense miglioreranno. I genitori sperano.',
    consequenceSummaryB: 'Le mense restano come sono. I bambini lo sanno già.',
    treasuryDeltaA: -110_000n,
    treasuryDeltaB: 20_000n,
    inflationDeltaBpsA: 14,
    inflationDeltaBpsB: 0,
  },
];

export function pickReferendumTemplate(gameTimeMs: number): ReferendumTemplate {
  const bucket = Math.floor(gameTimeMs / GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS);
  return REFERENDUM_TEMPLATES[bucket % REFERENDUM_TEMPLATES.length]!;
}

export interface MunicipalityChronicleTemplate {
  templateId: string;
  category: string;
  title: string;
  body: string;
}

export const MUNICIPALITY_CHRONICLE_TEMPLATES: readonly MunicipalityChronicleTemplate[] = [
  {
    templateId: 'chronicle_job_hire',
    category: 'lavoro',
    title: 'Nuova assunzione in città',
    body: 'Un cittadino ha trovato lavoro. Le code all\'ufficio collocamento si accorciano di una persona.',
  },
  {
    templateId: 'chronicle_market_busy',
    category: 'economia',
    title: 'Mercato in movimento',
    body: 'Il mercato rionale registra più affluenza del solito. I prezzi osservano con attenzione.',
  },
  {
    templateId: 'chronicle_neighbor_dispute',
    category: 'società',
    title: 'Lite tra vicini',
    body: 'Due cittadini hanno discusso animatamente per un parcheggio. Il Comune non interviene. Il Comune registra.',
  },
  {
    templateId: 'chronicle_business_open',
    category: 'commercio',
    title: 'Attività in espansione',
    body: 'Un\'impresa locale assume personale extra. Buone notizie per chi cerca lavoro.',
  },
  {
    templateId: 'chronicle_wealth_gap',
    category: 'economia',
    title: 'Disparità in crescita',
    body: 'La distanza tra chi guadagna bene e chi fa fatica si fa sentire. I ranking non mentono.',
  },
  {
    templateId: 'chronicle_referendum_buzz',
    category: 'politica',
    title: 'Referendum sotto discussioni',
    body: 'I cittadini discutono dell\'ultima consultazione. Tutti hanno un\'opinione. Pochi hanno letto il testo.',
  },
  {
    templateId: 'chronicle_festival_rumor',
    category: 'cultura',
    title: 'Voci di festival',
    body: 'Si parla di un evento in centro. I commercianti sorridono. I residenti preoccupano per il parcheggio.',
  },
  {
    templateId: 'chronicle_heat_wave',
    category: 'clima',
    title: 'Caldo insistente',
    body: 'Le temperature restano alte. I condizionatori lavorano overtime. I conti elettrici tremano.',
  },
];

export function pickChronicleTemplate(gameTimeMs: number): MunicipalityChronicleTemplate {
  const bucket = Math.floor(gameTimeMs / (6 * 60 * 60 * 1000));
  return MUNICIPALITY_CHRONICLE_TEMPLATES[bucket % MUNICIPALITY_CHRONICLE_TEMPLATES.length]!;
}

export function municipalityChronicleIdempotencyKey(gameTimeMs: number): string {
  const bucketMs = 6 * 60 * 60 * 1000;
  const bucket = Math.floor(gameTimeMs / bucketMs);
  return `municipality-chronicle:${bucket}`;
}
