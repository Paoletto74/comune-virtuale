/** V1-MULTI-TASK-FEED-1 — v3 dialogues (runtime slice). */
import { DEMO_BOSS_DIALOGUE_TERMINAL_OPTION } from './boss-dialogue-constants.js';

export const DEMO_V3_DIALOGUE_WORK_REVIEW_GREETING = 'DEMO_V3_DIALOGUE_WORK_REVIEW_GREETING';
export const DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_GREETING = 'DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_GREETING';
export const DEMO_V3_DIALOGUE_FAMILY_CARE_GREETING = 'DEMO_V3_DIALOGUE_FAMILY_CARE_GREETING';
export const DEMO_V3_DIALOGUE_FRIEND_BREAKUP_GREETING = 'DEMO_V3_DIALOGUE_FRIEND_BREAKUP_GREETING';
export const DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_GREETING = 'DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_GREETING';
export const DEMO_V3_DIALOGUE_SUPPLIER_CALL_GREETING = 'DEMO_V3_DIALOGUE_SUPPLIER_CALL_GREETING';
export const DEMO_V3_DIALOGUE_SHADY_DEAL_GREETING = 'DEMO_V3_DIALOGUE_SHADY_DEAL_GREETING';
export const DEMO_V3_DIALOGUE_STRANGER_HELP_GREETING = 'DEMO_V3_DIALOGUE_STRANGER_HELP_GREETING';

export const VARIETY_V3_DIALOGUE_ROOT_IDS = [
  "DEMO_V3_DIALOGUE_WORK_REVIEW_GREETING",
  "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_GREETING",
  "DEMO_V3_DIALOGUE_FAMILY_CARE_GREETING",
  "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_GREETING",
  "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_GREETING",
  "DEMO_V3_DIALOGUE_SUPPLIER_CALL_GREETING",
  "DEMO_V3_DIALOGUE_SHADY_DEAL_GREETING",
  "DEMO_V3_DIALOGUE_STRANGER_HELP_GREETING"
] as const;
export const VARIETY_V3_DIALOGUE_STEP_IDS = [
  "DEMO_V3_DIALOGUE_WORK_REVIEW_GREETING",
  "DEMO_V3_DIALOGUE_WORK_REVIEW_S2A",
  "DEMO_V3_DIALOGUE_WORK_REVIEW_S2B",
  "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_GREETING",
  "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_S2A",
  "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_S2B",
  "DEMO_V3_DIALOGUE_FAMILY_CARE_GREETING",
  "DEMO_V3_DIALOGUE_FAMILY_CARE_S2A",
  "DEMO_V3_DIALOGUE_FAMILY_CARE_S2B",
  "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_GREETING",
  "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_S2A",
  "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_S2B",
  "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_GREETING",
  "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_S2A",
  "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_S2B",
  "DEMO_V3_DIALOGUE_SUPPLIER_CALL_GREETING",
  "DEMO_V3_DIALOGUE_SUPPLIER_CALL_S2A",
  "DEMO_V3_DIALOGUE_SUPPLIER_CALL_S2B",
  "DEMO_V3_DIALOGUE_SHADY_DEAL_GREETING",
  "DEMO_V3_DIALOGUE_SHADY_DEAL_S2A",
  "DEMO_V3_DIALOGUE_SHADY_DEAL_S2B",
  "DEMO_V3_DIALOGUE_STRANGER_HELP_GREETING",
  "DEMO_V3_DIALOGUE_STRANGER_HELP_S2A",
  "DEMO_V3_DIALOGUE_STRANGER_HELP_S2B"
] as const;
export const VARIETY_V3_DIALOGUE_TERMINAL_IDS = [
  "DEMO_V3_DIALOGUE_WORK_REVIEW_END_POSITIVE",
  "DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEUTRAL",
  "DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEGATIVE",
  "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_POSITIVE",
  "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEUTRAL",
  "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEGATIVE",
  "DEMO_V3_DIALOGUE_FAMILY_CARE_END_POSITIVE",
  "DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEUTRAL",
  "DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEGATIVE",
  "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_POSITIVE",
  "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEUTRAL",
  "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEGATIVE",
  "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_POSITIVE",
  "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEUTRAL",
  "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEGATIVE",
  "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_POSITIVE",
  "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEUTRAL",
  "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEGATIVE",
  "DEMO_V3_DIALOGUE_SHADY_DEAL_END_POSITIVE",
  "DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEUTRAL",
  "DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEGATIVE",
  "DEMO_V3_DIALOGUE_STRANGER_HELP_END_POSITIVE",
  "DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEUTRAL",
  "DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEGATIVE"
] as const;

export const VARIETY_V3_DIALOGUE_TRANSITIONS: Record<string, Record<string, string>> = {
  "DEMO_V3_DIALOGUE_WORK_REVIEW_GREETING": {
    "open": "DEMO_V3_DIALOGUE_WORK_REVIEW_S2A",
    "listen": "DEMO_V3_DIALOGUE_WORK_REVIEW_S2B",
    "deflect": "DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEGATIVE",
    "postpone": "DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEUTRAL"
  },
  "DEMO_V3_DIALOGUE_WORK_REVIEW_S2A": {
    "plan": "DEMO_V3_DIALOGUE_WORK_REVIEW_END_POSITIVE",
    "vague": "DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEUTRAL",
    "push": "DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_WORK_REVIEW_S2B": {
    "detail": "DEMO_V3_DIALOGUE_WORK_REVIEW_END_POSITIVE",
    "minimal": "DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEUTRAL",
    "deny": "DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_GREETING": {
    "flexible": "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_S2A",
    "firm": "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_S2B",
    "delay": "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEUTRAL",
    "walk": "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_S2A": {
    "offer": "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_POSITIVE",
    "partial": "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEUTRAL",
    "backtrack": "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_S2B": {
    "justify": "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_POSITIVE",
    "soften": "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEUTRAL",
    "insult": "DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_FAMILY_CARE_GREETING": {
    "volunteer": "DEMO_V3_DIALOGUE_FAMILY_CARE_S2A",
    "share": "DEMO_V3_DIALOGUE_FAMILY_CARE_S2B",
    "avoid": "DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEUTRAL",
    "argue": "DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_FAMILY_CARE_S2A": {
    "commit": "DEMO_V3_DIALOGUE_FAMILY_CARE_END_POSITIVE",
    "limited": "DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEUTRAL",
    "withdraw": "DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_FAMILY_CARE_S2B": {
    "calendar": "DEMO_V3_DIALOGUE_FAMILY_CARE_END_POSITIVE",
    "informal": "DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEUTRAL",
    "refuse": "DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_GREETING": {
    "support": "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_S2A",
    "advice": "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_S2B",
    "distract": "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEUTRAL",
    "busy": "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_S2A": {
    "meet": "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_POSITIVE",
    "call_later": "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEUTRAL",
    "hang_up": "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_S2B": {
    "gentle": "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_POSITIVE",
    "harsh": "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEGATIVE",
    "back_off": "DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEUTRAL"
  },
  "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_GREETING": {
    "knock": "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_S2A",
    "note": "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEUTRAL",
    "call": "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_S2B",
    "ignore": "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_S2A": {
    "cooperate": "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_POSITIVE",
    "demand": "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEUTRAL",
    "yell": "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_S2B": {
    "document": "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_POSITIVE",
    "wait": "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEUTRAL",
    "threaten": "DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_SUPPLIER_CALL_GREETING": {
    "polite": "DEMO_V3_DIALOGUE_SUPPLIER_CALL_S2A",
    "firm": "DEMO_V3_DIALOGUE_SUPPLIER_CALL_S2B",
    "angry": "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEGATIVE",
    "delegate": "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEUTRAL"
  },
  "DEMO_V3_DIALOGUE_SUPPLIER_CALL_S2A": {
    "solution": "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_POSITIVE",
    "accept_delay": "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEUTRAL",
    "cancel": "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_SUPPLIER_CALL_S2B": {
    "evidence": "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_POSITIVE",
    "threaten": "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEGATIVE",
    "compromise": "DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEUTRAL"
  },
  "DEMO_V3_DIALOGUE_SHADY_DEAL_GREETING": {
    "interested": "DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEGATIVE",
    "skeptical": "DEMO_V3_DIALOGUE_SHADY_DEAL_S2A",
    "refuse": "DEMO_V3_DIALOGUE_SHADY_DEAL_END_POSITIVE",
    "play_along": "DEMO_V3_DIALOGUE_SHADY_DEAL_S2B"
  },
  "DEMO_V3_DIALOGUE_SHADY_DEAL_S2A": {
    "verify": "DEMO_V3_DIALOGUE_SHADY_DEAL_END_POSITIVE",
    "invest": "DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEGATIVE",
    "report": "DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEUTRAL"
  },
  "DEMO_V3_DIALOGUE_SHADY_DEAL_S2B": {
    "gather_info": "DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEUTRAL",
    "join": "DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEGATIVE",
    "leave": "DEMO_V3_DIALOGUE_SHADY_DEAL_END_POSITIVE"
  },
  "DEMO_V3_DIALOGUE_STRANGER_HELP_GREETING": {
    "help": "DEMO_V3_DIALOGUE_STRANGER_HELP_S2A",
    "distance": "DEMO_V3_DIALOGUE_STRANGER_HELP_S2B",
    "call_police": "DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEUTRAL",
    "walk_away": "DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_STRANGER_HELP_S2A": {
    "assist": "DEMO_V3_DIALOGUE_STRANGER_HELP_END_POSITIVE",
    "partial": "DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEUTRAL",
    "suspect": "DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEGATIVE"
  },
  "DEMO_V3_DIALOGUE_STRANGER_HELP_S2B": {
    "verify": "DEMO_V3_DIALOGUE_STRANGER_HELP_END_POSITIVE",
    "ignore": "DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEGATIVE",
    "donate": "DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEUTRAL"
  }
};

export const VARIETY_V3_DIALOGUE_NODES: Record<string, { title: string; description: string; options: ReadonlyArray<{ optionId: string; label: string }> }> = {
  'DEMO_V3_DIALOGUE_WORK_REVIEW_GREETING': {
  "title": "Colloquio annuale",
  "description": "Il responsabile vuole fare il punto sull'anno.",
  "options": [
    {
      "optionId": "open",
      "label": "Parti con i risultati"
    },
    {
      "optionId": "listen",
      "label": "Chiedi cosa gli preoccupa"
    },
    {
      "optionId": "deflect",
      "label": "Parli di difficoltà esterne"
    },
    {
      "optionId": "postpone",
      "label": "Chiedi di rimandare"
    }
  ]
},
  'DEMO_V3_DIALOGUE_WORK_REVIEW_S2A': {
  "title": "Colloquio annuale",
  "description": "Come procedi?",
  "options": [
    {
      "optionId": "plan",
      "label": "Proponi obiettivi"
    },
    {
      "optionId": "vague",
      "label": "Risposta generica"
    },
    {
      "optionId": "push",
      "label": "Resisti"
    }
  ]
},
  'DEMO_V3_DIALOGUE_WORK_REVIEW_S2B': {
  "title": "Colloquio annuale",
  "description": "E adesso?",
  "options": [
    {
      "optionId": "detail",
      "label": "Approfondisci"
    },
    {
      "optionId": "minimal",
      "label": "Risposta breve"
    },
    {
      "optionId": "deny",
      "label": "Nega problemi"
    }
  ]
},
  'DEMO_V3_DIALOGUE_WORK_REVIEW_END_POSITIVE': {
  "title": "Colloquio annuale",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEUTRAL': {
  "title": "Colloquio annuale",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEGATIVE': {
  "title": "Colloquio annuale",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_GREETING': {
  "title": "Trattativa col cliente",
  "description": "Un cliente importante vuole rinegoziare i termini.",
  "options": [
    {
      "optionId": "flexible",
      "label": "Mostri flessibilità"
    },
    {
      "optionId": "firm",
      "label": "Resti fermo"
    },
    {
      "optionId": "delay",
      "label": "Chiedi tempo"
    },
    {
      "optionId": "walk",
      "label": "Minacci di andartene"
    }
  ]
},
  'DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_S2A': {
  "title": "Trattativa col cliente",
  "description": "Come procedi?",
  "options": [
    {
      "optionId": "offer",
      "label": "Fai un'offerta"
    },
    {
      "optionId": "partial",
      "label": "Offerta parziale"
    },
    {
      "optionId": "backtrack",
      "label": "Tiri indietro"
    }
  ]
},
  'DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_S2B': {
  "title": "Trattativa col cliente",
  "description": "E adesso?",
  "options": [
    {
      "optionId": "justify",
      "label": "Giustifichi"
    },
    {
      "optionId": "soften",
      "label": "Ammorbidisci"
    },
    {
      "optionId": "insult",
      "label": "Offendi"
    }
  ]
},
  'DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_POSITIVE': {
  "title": "Trattativa col cliente",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEUTRAL': {
  "title": "Trattativa col cliente",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEGATIVE': {
  "title": "Trattativa col cliente",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FAMILY_CARE_GREETING': {
  "title": "Cura di un genitore",
  "description": "In famiglia discutono su chi si occupa di un genitore malato.",
  "options": [
    {
      "optionId": "volunteer",
      "label": "Ti offri"
    },
    {
      "optionId": "share",
      "label": "Proponi turni"
    },
    {
      "optionId": "avoid",
      "label": "Eviti il tema"
    },
    {
      "optionId": "argue",
      "label": "Discuti"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FAMILY_CARE_S2A': {
  "title": "Cura di un genitore",
  "description": "Come procedi?",
  "options": [
    {
      "optionId": "commit",
      "label": "Ti impegni"
    },
    {
      "optionId": "limited",
      "label": "Impegno limitato"
    },
    {
      "optionId": "withdraw",
      "label": "Ritiri"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FAMILY_CARE_S2B': {
  "title": "Cura di un genitore",
  "description": "E adesso?",
  "options": [
    {
      "optionId": "calendar",
      "label": "Organizzi calendario"
    },
    {
      "optionId": "informal",
      "label": "Accordo informale"
    },
    {
      "optionId": "refuse",
      "label": "Rifiuti"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FAMILY_CARE_END_POSITIVE': {
  "title": "Cura di un genitore",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEUTRAL': {
  "title": "Cura di un genitore",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEGATIVE': {
  "title": "Cura di un genitore",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FRIEND_BREAKUP_GREETING': {
  "title": "Amico in crisi",
  "description": "Un amico ti chiama perché la relazione è finita.",
  "options": [
    {
      "optionId": "support",
      "label": "Offri ascolto"
    },
    {
      "optionId": "advice",
      "label": "Dai consigli"
    },
    {
      "optionId": "distract",
      "label": "Distrai"
    },
    {
      "optionId": "busy",
      "label": "Dici di essere occupato"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FRIEND_BREAKUP_S2A': {
  "title": "Amico in crisi",
  "description": "Come procedi?",
  "options": [
    {
      "optionId": "meet",
      "label": "Proponi di vedervi"
    },
    {
      "optionId": "call_later",
      "label": "Richiami dopo"
    },
    {
      "optionId": "hang_up",
      "label": "Riattacchi"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FRIEND_BREAKUP_S2B': {
  "title": "Amico in crisi",
  "description": "E adesso?",
  "options": [
    {
      "optionId": "gentle",
      "label": "Consigli delicati"
    },
    {
      "optionId": "harsh",
      "label": "Consigli duri"
    },
    {
      "optionId": "back_off",
      "label": "Tiri indietro"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_POSITIVE': {
  "title": "Amico in crisi",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEUTRAL': {
  "title": "Amico in crisi",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEGATIVE': {
  "title": "Amico in crisi",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_GREETING': {
  "title": "Perdita dal vicino",
  "description": "L'acqua dal piano di sopra gocciola nel tuo appartamento.",
  "options": [
    {
      "optionId": "knock",
      "label": "Salire subito"
    },
    {
      "optionId": "note",
      "label": "Lasci biglietto"
    },
    {
      "optionId": "call",
      "label": "Chiami amministratore"
    },
    {
      "optionId": "ignore",
      "label": "Ignori"
    }
  ]
},
  'DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_S2A': {
  "title": "Perdita dal vicino",
  "description": "Come procedi?",
  "options": [
    {
      "optionId": "cooperate",
      "label": "Collabori"
    },
    {
      "optionId": "demand",
      "label": "Chiedi risarcimento"
    },
    {
      "optionId": "yell",
      "label": "Alzi voce"
    }
  ]
},
  'DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_S2B': {
  "title": "Perdita dal vicino",
  "description": "E adesso?",
  "options": [
    {
      "optionId": "document",
      "label": "Documenti danni"
    },
    {
      "optionId": "wait",
      "label": "Aspetti"
    },
    {
      "optionId": "threaten",
      "label": "Minacci legali"
    }
  ]
},
  'DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_POSITIVE': {
  "title": "Perdita dal vicino",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEUTRAL': {
  "title": "Perdita dal vicino",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEGATIVE': {
  "title": "Perdita dal vicino",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SUPPLIER_CALL_GREETING': {
  "title": "Chiamata al fornitore",
  "description": "Devi chiamare un fornitore che ha sbagliato una consegna.",
  "options": [
    {
      "optionId": "polite",
      "label": "Parti con calma"
    },
    {
      "optionId": "firm",
      "label": "Parti deciso"
    },
    {
      "optionId": "angry",
      "label": "Parti arrabbiato"
    },
    {
      "optionId": "delegate",
      "label": "Chiedi a un collega"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SUPPLIER_CALL_S2A': {
  "title": "Chiamata al fornitore",
  "description": "Come procedi?",
  "options": [
    {
      "optionId": "solution",
      "label": "Cerchi soluzione"
    },
    {
      "optionId": "accept_delay",
      "label": "Accetti ritardo"
    },
    {
      "optionId": "cancel",
      "label": "Annulli ordine"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SUPPLIER_CALL_S2B': {
  "title": "Chiamata al fornitore",
  "description": "E adesso?",
  "options": [
    {
      "optionId": "evidence",
      "label": "Presenti prove"
    },
    {
      "optionId": "threaten",
      "label": "Minacci penali"
    },
    {
      "optionId": "compromise",
      "label": "Compromesso"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_POSITIVE': {
  "title": "Chiamata al fornitore",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEUTRAL': {
  "title": "Chiamata al fornitore",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEGATIVE': {
  "title": "Chiamata al fornitore",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SHADY_DEAL_GREETING': {
  "title": "Affare losco",
  "description": "Qualcuno ti propone un guadagno facile con un piano poco chiaro.",
  "options": [
    {
      "optionId": "interested",
      "label": "Mostri interesse"
    },
    {
      "optionId": "skeptical",
      "label": "Fai domande"
    },
    {
      "optionId": "refuse",
      "label": "Rifiuti subito"
    },
    {
      "optionId": "play_along",
      "label": "Fingi per capire"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SHADY_DEAL_S2A': {
  "title": "Affare losco",
  "description": "Come procedi?",
  "options": [
    {
      "optionId": "verify",
      "label": "Verifichi"
    },
    {
      "optionId": "invest",
      "label": "Investi"
    },
    {
      "optionId": "report",
      "label": "Segnali"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SHADY_DEAL_S2B': {
  "title": "Affare losco",
  "description": "E adesso?",
  "options": [
    {
      "optionId": "gather_info",
      "label": "Raccogli info"
    },
    {
      "optionId": "join",
      "label": "Entri nel piano"
    },
    {
      "optionId": "leave",
      "label": "Te ne vai"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SHADY_DEAL_END_POSITIVE': {
  "title": "Affare losco",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEUTRAL': {
  "title": "Affare losco",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEGATIVE': {
  "title": "Affare losco",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_STRANGER_HELP_GREETING': {
  "title": "Sconosciuto in difficoltà",
  "description": "Una persona in strada chiede aiuto urgente.",
  "options": [
    {
      "optionId": "help",
      "label": "Ti avvicini"
    },
    {
      "optionId": "distance",
      "label": "Chiedi da lontano"
    },
    {
      "optionId": "call_police",
      "label": "Chiami polizia"
    },
    {
      "optionId": "walk_away",
      "label": "Te ne vai"
    }
  ]
},
  'DEMO_V3_DIALOGUE_STRANGER_HELP_S2A': {
  "title": "Sconosciuto in difficoltà",
  "description": "Come procedi?",
  "options": [
    {
      "optionId": "assist",
      "label": "Aiuti concretamente"
    },
    {
      "optionId": "partial",
      "label": "Aiuto limitato"
    },
    {
      "optionId": "suspect",
      "label": "Sospetti e te ne vai"
    }
  ]
},
  'DEMO_V3_DIALOGUE_STRANGER_HELP_S2B': {
  "title": "Sconosciuto in difficoltà",
  "description": "E adesso?",
  "options": [
    {
      "optionId": "verify",
      "label": "Verifichi la storia"
    },
    {
      "optionId": "ignore",
      "label": "Ignori"
    },
    {
      "optionId": "donate",
      "label": "Dai soldi e vai"
    }
  ]
},
  'DEMO_V3_DIALOGUE_STRANGER_HELP_END_POSITIVE': {
  "title": "Sconosciuto in difficoltà",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEUTRAL': {
  "title": "Sconosciuto in difficoltà",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
  'DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEGATIVE': {
  "title": "Sconosciuto in difficoltà",
  "description": "La conversazione si conclude.",
  "options": [
    {
      "optionId": DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      "label": "Concludi la conversazione"
    }
  ]
},
};

export const VARIETY_V3_DIALOGUE_TERMINAL_EFFECTS: Record<string, { messageKey: string; sympathy?: number; reputation?: number; cashDeltaMinor?: bigint; cashReason?: string }> = {
  'DEMO_V3_DIALOGUE_WORK_REVIEW_END_POSITIVE': { messageKey: 'slice.task.v3.dialogue.work_review.end_positive.completed', reputation: 1, cashDeltaMinor: 5n, cashReason: 'DEMO_V3_DIALOGUE_REVIEW_BONUS_CASH' },
  'DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEUTRAL': { messageKey: 'slice.task.v3.dialogue.work_review.end_neutral.completed', sympathy: 1 },
  'DEMO_V3_DIALOGUE_WORK_REVIEW_END_NEGATIVE': { messageKey: 'slice.task.v3.dialogue.work_review.end_negative.completed', reputation: -1 },
  'DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_POSITIVE': { messageKey: 'slice.task.v3.dialogue.client_negotiation.end_positive.completed', reputation: 1 },
  'DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEUTRAL': { messageKey: 'slice.task.v3.dialogue.client_negotiation.end_neutral.completed' },
  'DEMO_V3_DIALOGUE_CLIENT_NEGOTIATION_END_NEGATIVE': { messageKey: 'slice.task.v3.dialogue.client_negotiation.end_negative.completed', sympathy: -1, reputation: -1 },
  'DEMO_V3_DIALOGUE_FAMILY_CARE_END_POSITIVE': { messageKey: 'slice.task.v3.dialogue.family_care.end_positive.completed', sympathy: 1 },
  'DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEUTRAL': { messageKey: 'slice.task.v3.dialogue.family_care.end_neutral.completed' },
  'DEMO_V3_DIALOGUE_FAMILY_CARE_END_NEGATIVE': { messageKey: 'slice.task.v3.dialogue.family_care.end_negative.completed', sympathy: -1 },
  'DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_POSITIVE': { messageKey: 'slice.task.v3.dialogue.friend_breakup.end_positive.completed', sympathy: 1 },
  'DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEUTRAL': { messageKey: 'slice.task.v3.dialogue.friend_breakup.end_neutral.completed' },
  'DEMO_V3_DIALOGUE_FRIEND_BREAKUP_END_NEGATIVE': { messageKey: 'slice.task.v3.dialogue.friend_breakup.end_negative.completed', sympathy: -1 },
  'DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_POSITIVE': { messageKey: 'slice.task.v3.dialogue.neighbor_leak.end_positive.completed', sympathy: 1 },
  'DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEUTRAL': { messageKey: 'slice.task.v3.dialogue.neighbor_leak.end_neutral.completed' },
  'DEMO_V3_DIALOGUE_NEIGHBOR_LEAK_END_NEGATIVE': { messageKey: 'slice.task.v3.dialogue.neighbor_leak.end_negative.completed', sympathy: -1, reputation: -1 },
  'DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_POSITIVE': { messageKey: 'slice.task.v3.dialogue.supplier_call.end_positive.completed', reputation: 1 },
  'DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEUTRAL': { messageKey: 'slice.task.v3.dialogue.supplier_call.end_neutral.completed' },
  'DEMO_V3_DIALOGUE_SUPPLIER_CALL_END_NEGATIVE': { messageKey: 'slice.task.v3.dialogue.supplier_call.end_negative.completed', sympathy: -1, reputation: -1 },
  'DEMO_V3_DIALOGUE_SHADY_DEAL_END_POSITIVE': { messageKey: 'slice.task.v3.dialogue.shady_deal.end_positive.completed', reputation: 1 },
  'DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEUTRAL': { messageKey: 'slice.task.v3.dialogue.shady_deal.end_neutral.completed' },
  'DEMO_V3_DIALOGUE_SHADY_DEAL_END_NEGATIVE': { messageKey: 'slice.task.v3.dialogue.shady_deal.end_negative.completed', reputation: -2 },
  'DEMO_V3_DIALOGUE_STRANGER_HELP_END_POSITIVE': { messageKey: 'slice.task.v3.dialogue.stranger_help.end_positive.completed', sympathy: 1, reputation: 1 },
  'DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEUTRAL': { messageKey: 'slice.task.v3.dialogue.stranger_help.end_neutral.completed' },
  'DEMO_V3_DIALOGUE_STRANGER_HELP_END_NEGATIVE': { messageKey: 'slice.task.v3.dialogue.stranger_help.end_negative.completed', sympathy: -1 },
};

export function getVarietyV3DialogueNext(definitionId: string, optionId: string): string | null {
  return VARIETY_V3_DIALOGUE_TRANSITIONS[definitionId]?.[optionId] ?? null;
}
export function isVarietyV3DialogueTerminal(definitionId: string): boolean {
  return (VARIETY_V3_DIALOGUE_TERMINAL_IDS as readonly string[]).includes(definitionId);
}
export function isVarietyV3DialogueStep(definitionId: string): boolean {
  return (VARIETY_V3_DIALOGUE_STEP_IDS as readonly string[]).includes(definitionId);
}
export function isVarietyV3DialogueDefinition(definitionId: string): boolean {
  return isVarietyV3DialogueStep(definitionId) || isVarietyV3DialogueTerminal(definitionId);
}
