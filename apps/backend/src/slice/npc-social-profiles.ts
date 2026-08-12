/**
 * Persistent social/linguistic characterization for roster NPCs.
 * Seeded into npc.metadata on first materialization; used by dialogue/chat systems.
 */

export interface NpcSocialProfile {
  character: string;
  linguisticStyle: string;
  interests: string[];
  situation: string;
}

export const NPC_SOCIAL_PROFILES: Readonly<Record<string, NpcSocialProfile>> = {
  neighbor_marco: {
    character: 'affabile',
    linguisticStyle: 'pratico, diretto, punteggiatura sobria',
    interests: ['fai-da-te', 'calcio', 'barbecue'],
    situation: 'Vive al piano di sopra e combina lavoro e casa senza confini netti.',
  },
  colleague_laura: {
    character: 'professionalità',
    linguisticStyle: 'formale ma cordiale, frasi complete',
    interests: ['organizzazione', 'caffè', 'serie TV'],
    situation: 'In ufficio da anni, conosce tutti i procedimenti.',
  },
  acquaintance_giulia: {
    character: 'timida',
    linguisticStyle: 'cortese, pause lunghe, poche emoji',
    interests: ['libri', 'passeggiate', 'volontariato'],
    situation: 'Conosciuta per caso, diffidente all\'inizio.',
  },
  elderly_signora_rossi: {
    character: 'permalo',
    linguisticStyle: 'lamentela educata, ricorda sempre il passato',
    interests: ['nipoti', 'chiesa', 'telegiornale'],
    situation: 'Attraversa spesso la strada da sola.',
  },
  merchant_salvatore: {
    character: 'espansivo',
    linguisticStyle: 'voce alta, battute, dialetto leggero',
    interests: ['sconti', 'politica locale', 'calcio'],
    situation: 'Titolare del negozio sotto casa.',
  },
  merchant_elena: {
    character: 'generoso',
    linguisticStyle: 'caldo, domande personali',
    interests: ['orto', 'mercato', 'ricette'],
    situation: 'Al banco del mercato coperto.',
  },
  worker_tommaso: {
    character: 'irascibile',
    linguisticStyle: 'breve, secco, poco paziente',
    interests: ['cantiere', 'birra', 'motori'],
    situation: 'Operaio sempre in ritardo e sempre indisposto.',
  },
  worker_sara: {
    character: 'ironico',
    linguisticStyle: 'commenti sarcastici, emoji occasionali',
    interests: ['caffè specialty', 'musica', 'clienti abituali'],
    situation: 'Barista del bar sotto casa.',
  },
  professional_dr_neri: {
    character: 'cinico',
    linguisticStyle: '«Mi permetto di dissentire», frasi lunghe, zero slang',
    interests: ['medicina', 'camminate', 'silenzio'],
    situation: 'Medico di famiglia del quartiere.',
  },
  professional_avv_costa: {
    character: 'ambizioso',
    linguisticStyle: 'preciso, lessico legale anche fuori studio',
    interests: ['causa civile', 'networking', 'giornali'],
    situation: 'Avvocato con clientela mista.',
  },
  youth_luca: {
    character: 'espansivo',
    linguisticStyle: '«ma che ne so io 😂», abbreviazioni, tono giovane',
    interests: ['motori', 'drift', 'social'],
    situation: 'Ragazzo del quartiere sempre in movimento.',
  },
  youth_chiara: {
    character: 'romantico',
    linguisticStyle: 'dolce, emoji, frasi un po\' lunghe',
    interests: ['università', 'poesia', 'calcetto'],
    situation: 'Studentessa che torna spesso in paese.',
  },
  elderly_signor_benedetti: {
    character: 'affabile',
    linguisticStyle: 'racconti del passato, voce lenta',
    interests: ['cane', 'pensione', 'panchina'],
    situation: 'Passeggia col cane ogni mattina.',
  },
  elderly_signora_villa: {
    character: 'permalo',
    linguisticStyle: 'commenta tutto, tono da comitato',
    interests: ['quartiere', 'pettegolezzi', 'pulizie'],
    situation: 'Nonna del palazzo che conosce tutti.',
  },
  politics_deputy_rinaldi: {
    character: 'manipolatore',
    linguisticStyle: 'discorso da campagna, promesse vaghe',
    interests: ['elezioni', 'consiglio', 'foto'],
    situation: 'Consigliere sempre in campagna.',
  },
  politics_activist_piras: {
    character: 'espansivo',
    linguisticStyle: 'appelli civici, tono appassionato',
    interests: ['assemblee', 'ambiente', 'diritti'],
    situation: 'Attivista di quartiere.',
  },
  civic_librarian_orsi: {
    character: 'affabile',
    linguisticStyle: 'preciso, citazioni, voce pacata',
    interests: ['libri rari', 'storia locale', 'silenzio'],
    situation: 'Bibliotecario e memoria del paese.',
  },
  civic_postmaster_albano: {
    character: 'professionalità',
    linguisticStyle: 'efficiente, poche parole',
    interests: ['turni', 'pacchi', 'ordine'],
    situation: 'All\'ufficio postale.',
  },
  ambiguous_night_renato: {
    character: 'diffidente',
    linguisticStyle: 'monosillabi, guardingo',
    interests: ['notte', 'musica bassa', 'sigarette'],
    situation: 'Compare a ore strane.',
  },
  ambiguous_night_nadia: {
    character: 'ironico',
    linguisticStyle: 'doppi sensi, tono notturno',
    interests: ['taxi', 'locali', 'conversazioni brevi'],
    situation: 'Circuito notturno del paese.',
  },
  family_neighbor_paola: {
    character: 'generoso',
    linguisticStyle: 'domande sui figli, tono materno',
    interests: ['scuola', 'mercato', 'parco'],
    situation: 'Madre di famiglia nel palazzo accanto.',
  },
  family_neighbor_dario: {
    character: 'irascibile',
    linguisticStyle: 'secco, sempre di fretta',
    interests: ['lavoro', 'calcetto', 'auto'],
    situation: 'Padre di famiglia sempre stressato.',
  },
  artisan_bruno: {
    character: 'affabile',
    linguisticStyle: 'tecnico, metafore sul legno',
    interests: ['falegnameria', 'bottega', 'caffè'],
    situation: 'Artigiano storico del quartiere.',
  },
  artisan_teresa: {
    character: 'romantico',
    linguisticStyle: 'morbido, attenzione ai dettagli',
    interests: ['sartoria', 'tessuti', 'moda'],
    situation: 'Sarta con clientela fedele.',
  },
  retiree_luigi: {
    character: 'cinico',
    linguisticStyle: 'correzione grammaticale involontaria',
    interests: ['pensione', 'insegnamento', 'corrieri'],
    situation: 'Ex insegnante che corregge tutti.',
  },
  merchant_rina: {
    character: 'affabile',
    linguisticStyle: 'consigli da bancone, voce calda',
    interests: ['drogheria', 'salute', 'vicini'],
    situation: 'Droghiera di piazza.',
  },
};

export function getNpcSocialProfile(templateId: string | null | undefined): NpcSocialProfile | null {
  if (!templateId) return null;
  return NPC_SOCIAL_PROFILES[templateId] ?? null;
}
