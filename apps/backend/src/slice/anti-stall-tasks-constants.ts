/**
 * MEGA 1/4 — repeatable fallback tasks when the main pool is exhausted.
 * Every option grants permanent progression so players never stall.
 */

export const ANTI_STALL_POOL_WEIGHT = 40;

export const ANTI_STALL_PASSEGGIATA_DEFINITION_ID = 'ANTI_STALL_PASSEGGIATA';
export const ANTI_STALL_LETTURA_DEFINITION_ID = 'ANTI_STALL_LETTURA';
export const ANTI_STALL_CAFFE_DEFINITION_ID = 'ANTI_STALL_CAFFE';

export const ANTI_STALL_TASK_DEFINITION_IDS = [
  ANTI_STALL_PASSEGGIATA_DEFINITION_ID,
  ANTI_STALL_LETTURA_DEFINITION_ID,
  ANTI_STALL_CAFFE_DEFINITION_ID,
] as const;

export const ANTI_STALL_STANDARD_TASKS = [
  {
    definitionId: ANTI_STALL_PASSEGGIATA_DEFINITION_ID,
    title: 'Passeggiata nel quartiere',
    description:
      'Hai un po\' di tempo libero. Una camminata nel quartiere può fare bene — al corpo e alla testa.',
    options: [
      { optionId: 'long_walk', label: 'Fai il giro completo del quartiere' },
      { optionId: 'short_loop', label: 'Un giro breve e torni a casa' },
    ],
    messageKeys: {
      long_walk: 'slice.task.anti_stall.passeggiata.long_walk.completed',
      short_loop: 'slice.task.anti_stall.passeggiata.short_loop.completed',
    },
  },
  {
    definitionId: ANTI_STALL_LETTURA_DEFINITION_ID,
    title: 'Tempo per te',
    description:
      'Tra un impegno e l\'altro ti resta un momento. Puoi informarti, riposare o organizzare la giornata.',
    options: [
      { optionId: 'read_news', label: 'Leggi le notizie locali' },
      { optionId: 'rest', label: 'Ti concedi una pausa senza schermi' },
    ],
    messageKeys: {
      read_news: 'slice.task.anti_stall.lettura.read_news.completed',
      rest: 'slice.task.anti_stall.lettura.rest.completed',
    },
  },
  {
    definitionId: ANTI_STALL_CAFFE_DEFINITION_ID,
    title: 'Pausa al bar',
    description:
      'Il bar sotto casa è aperto. Una pausa veloce può cambiare il tono della giornata.',
    options: [
      { optionId: 'social_coffee', label: 'Prendi un caffè e chiacchieri un po\'' },
      { optionId: 'solo_coffee', label: 'Bevi il caffè in silenzio' },
    ],
    messageKeys: {
      social_coffee: 'slice.task.anti_stall.caffe.social_coffee.completed',
      solo_coffee: 'slice.task.anti_stall.caffe.solo_coffee.completed',
    },
  },
] as const;
