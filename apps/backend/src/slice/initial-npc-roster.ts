/**
 * Popolazione NPC iniziale controllata — esattamente 30 personaggi.
 * Fonte unica per template persistenti — nessuna generazione massiva.
 */

export type InitialNpcCategory =
  | 'neighbor'
  | 'colleague'
  | 'acquaintance'
  | 'family'
  | 'supplier'
  | 'stranger';

export interface InitialNpcDefinition {
  templateId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  ageYears: number;
  ageCategory: string;
  category: InitialNpcCategory;
  narrativeRole: string;
  occupation?: string;
  zoneId?: string;
  introductionLine: string;
}

function npc(
  templateId: string,
  firstName: string,
  lastName: string,
  ageYears: number,
  ageCategory: string,
  category: InitialNpcCategory,
  narrativeRole: string,
  introductionLine: string,
  occupation?: string,
  zoneId?: string,
): InitialNpcDefinition {
  return {
    templateId,
    firstName,
    lastName,
    ageYears,
    displayName: `${firstName} ${lastName}`,
    ageCategory,
    category,
    narrativeRole,
    occupation,
    zoneId,
    introductionLine: introductionLine,
  };
}

/** Roster iniziale: esattamente 30 NPC credibili e distinti. */
export const INITIAL_NPC_ROSTER: InitialNpcDefinition[] = [
  npc('neighbor_marco', 'Marco', 'Rossi', 38, 'adult', 'neighbor', 'vicino di casa', 'Marco Rossi, il vicino del piano di sopra.', 'tecnico impianti', 'residential'),
  npc('colleague_laura', 'Laura', 'Conti', 34, 'adult', 'colleague', 'collega di lavoro', 'Laura Conti, una collega con cui lavori spesso.', 'impiegata amministrativa', 'workplace'),
  npc('acquaintance_giulia', 'Giulia', 'Colombo', 29, 'adult', 'acquaintance', 'conoscente di paese', 'Giulia Colombo, una conoscente che incontri ogni tanto in giro.', 'assistente biblioteca', 'city_center'),
  npc('elderly_signora_rossi', 'Antonella', 'Romano', 78, 'elderly', 'stranger', 'anziana del quartiere', 'La signora Romano, un\'anziana che attraversa spesso la strada.', undefined, 'residential'),
  npc('merchant_salvatore', 'Salvatore', 'Bianchi', 52, 'adult', 'supplier', 'commerciante alimentari', 'Salvatore Bianchi, titolare del negozio di proximità.', 'commerciante', 'market'),
  npc('merchant_elena', 'Elena', 'Ferri', 45, 'adult', 'supplier', 'mercato coperto', 'Elena Ferri, vende frutta e verdura al mercato.', 'mercante', 'market'),
  npc('worker_tommaso', 'Tommaso', 'Ricci', 41, 'adult', 'colleague', 'operaio edile', 'Tommaso Ricci, operaio che lavora spesso in cantiere.', 'operaio edile', 'industrial'),
  npc('worker_sara', 'Sara', 'Bellini', 27, 'adult', 'colleague', 'barista', 'Sara Bellini, barista del bar sotto casa.', 'barista', 'city_center'),
  npc('professional_dr_neri', 'Fabio', 'Neri', 48, 'adult', 'acquaintance', 'medico di base', 'Il dottor Neri, medico di famiglia del quartiere.', 'medico', 'city_center'),
  npc('professional_avv_costa', 'Valentina', 'Costa', 43, 'adult', 'acquaintance', 'avvocato', 'L\'avvocata Costa, conosciuta per i casi civili in paese.', 'avvocato', 'city_center'),
  npc('youth_luca', 'Luca', 'Fontana', 22, 'adult', 'acquaintance', 'ragazzo del quartiere', 'Luca Fontana, un ragazzo sempre in movimento.', 'fattorino', 'residential'),
  npc('youth_chiara', 'Chiara', 'Moretti', 19, 'adult', 'acquaintance', 'studentessa', 'Chiara Moretti, studentessa universitaria.', 'studentessa', 'city_center'),
  npc('elderly_signor_benedetti', 'Giuseppe', 'Benedetti', 81, 'elderly', 'neighbor', 'anziano pensionato', 'Il signor Benedetti, pensionato che passeggia col cane.', undefined, 'residential'),
  npc('elderly_signora_villa', 'Rosa', 'Villa', 74, 'elderly', 'neighbor', 'nonna del quartiere', 'La signora Villa, conosce tutti e commenta tutto.', undefined, 'residential'),
  npc('politics_deputy_rinaldi', 'Andrea', 'Rinaldi', 55, 'adult', 'acquaintance', 'consigliere comunale', 'Andrea Rinaldi, consigliere comunale sempre in campagna elettorale.', 'politico locale', 'municipal'),
  npc('politics_activist_piras', 'Marta', 'Piras', 36, 'adult', 'acquaintance', 'attivista civica', 'Marta Piras, attivista che organizza assemblee di quartiere.', 'attivista', 'municipal'),
  npc('civic_librarian_orsi', 'Claudio', 'Orsi', 50, 'adult', 'acquaintance', 'bibliotecario', 'Claudio Orsi, bibliotecario e custode della memoria locale.', 'bibliotecario', 'city_center'),
  npc('civic_postmaster_albano', 'Silvia', 'Albano', 39, 'adult', 'acquaintance', 'ufficio postale', 'Silvia Albano, impiegata all\'ufficio postale.', 'impiegata postale', 'city_center'),
  npc('ambiguous_night_renato', 'Renato', 'Serra', 33, 'adult', 'stranger', 'figura notturna', 'Renato Serra, lo incroci raramente e sempre a ore strane.', undefined, 'night_district'),
  npc('ambiguous_night_nadia', 'Nadia', 'Pellegrini', 31, 'adult', 'stranger', 'presenza notturna', 'Nadia Pellegrini, conosciuta per muoversi nel circuito notturno.', 'taxi notturno', 'night_district'),
  npc('family_neighbor_paola', 'Paola', 'Greco', 42, 'adult', 'neighbor', 'madre di famiglia', 'Paola Greco, madre di due figli nel palazzo accanto.', 'casalinga', 'residential'),
  npc('family_neighbor_dario', 'Dario', 'Mancini', 44, 'adult', 'neighbor', 'padre di famiglia', 'Dario Mancini, padre di famiglia sempre di fretta.', 'autista', 'residential'),
  npc('artisan_bruno', 'Bruno', 'Fabbri', 58, 'adult', 'supplier', 'artigiano', 'Bruno Fabbri, falegname con bottega in via delle Botteghe.', 'falegname', 'artisan'),
  npc('artisan_teresa', 'Teresa', 'Lombardi', 49, 'adult', 'supplier', 'sarta', 'Teresa Lombardi, sarta del quartiere.', 'sarta', 'artisan'),
  npc('journalist_federico', 'Federico', 'Barone', 37, 'adult', 'acquaintance', 'giornalista locale', 'Federico Barone, giornalista che segue la cronaca cittadina.', 'giornalista', 'city_center'),
  npc('gardener_umberto', 'Umberto', 'Caruso', 63, 'elderly', 'acquaintance', 'giardiniere comunale', 'Umberto Caruso, giardiniere che cura le aiuole del Comune.', 'giardiniere', 'municipal'),
  npc('security_massimo', 'Massimo', 'De Luca', 46, 'adult', 'colleague', 'guardia giurata', 'Massimo De Luca, guardia giurata in servizio notturno.', 'guardia giurata', 'industrial'),
  npc('student_alessio', 'Alessio', 'Romano', 17, 'adult', 'acquaintance', 'ragazzo del liceo', 'Alessio Romano, studente del liceo sempre con lo zaino pieno.', 'studente', 'city_center'),
  npc('retiree_luigi', 'Luigi', 'Esposito', 67, 'elderly', 'neighbor', 'pensionato ex insegnante', 'Luigi Esposito, ex insegnante che corregge ancora tutti mentalmente.', 'pensionato', 'residential'),
  npc('merchant_rina', 'Rina', 'Colombo', 56, 'adult', 'supplier', 'drogheria', 'Rina Colombo, titolare della drogheria di piazza.', 'droghiera', 'market'),
];

export const INITIAL_NPC_COUNT = INITIAL_NPC_ROSTER.length;

export function buildInitialNpcTemplates(): Record<string, InitialNpcDefinition> {
  return Object.fromEntries(INITIAL_NPC_ROSTER.map((entry) => [entry.templateId, entry]));
}
