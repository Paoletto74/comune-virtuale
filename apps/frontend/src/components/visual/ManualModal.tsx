import { useEffect, useRef, useState } from 'react';

const MANUAL_INTRO = `Benvenuto nel Comune Virtuale.

Qui sei un cittadino tra altri cittadini. Il mondo continua anche quando non agisci: eventi, cronaca, referendum, lavoro e mercato non aspettano il tuo permesso.

Questo manuale descrive solo ciò che funziona adesso. Niente promesse future, niente feature immaginarie. Se non è scritto qui, il Comune non lo garantisce — e forse nemmeno lo sta considerando.

Diventa quello che vuoi. Se sei abbastanza bravo nel tuo percorso, puoi arrivare al livello massimo. Il Comune lo annoterà. Con distacco professionale.`;

const MANUAL_SECTIONS = [
  {
    title: 'Progressione globale',
    body: 'Livelli da 1 a 20. L’XP globale è permanente: non si consuma, si accumula. Task, Flash, incontri NPC, life review, voto ai referendum, turni di lavoro e acquisti al mercato contribuiscono al progresso. In Home e Profilo vedi LIVELLO e XP.',
  },
  {
    title: 'Carriera (struttura)',
    body: 'Il livello globale e la carriera sono due cose diverse. Il Comune traccia carriera corrente, grado (20 per percorso), affinità 0–100 e storico. Percorsi demo: MEDICINA, MOTORSPORT, CRIMINALITÀ. Il cambio carriera richiede affinità dominante (+15 sulla carriera attuale) e almeno 5 azioni significative consecutive — una singola scelta non basta.',
  },
  {
    title: 'Attività e task',
    body: 'Azioni personali con timer, scelte, rischio e ricompense. Massimo tre task standard in parallelo. Gli NPC ricordano le interazioni. Completare un task dà XP globale e può sbloccare dimensioni del profilo (lavoro, abitazione, vita personale).',
  },
  {
    title: 'Economia',
    body: '1 credito = 1 euro. Stipendi fissi, prezzi dinamici: l’indice prezzi del Comune muove catalogo e valore stimato dei beni. Potere d’acquisto, inflazione e passività mensili sono visibili in Profilo. Acquisti e vendite possono generare plusvalenza o perdita rispetto al prezzo storico.',
  },
  {
    title: 'Lavoro',
    body: 'Offerte giornaliere rotanti. Candidatura, assunzione, timbratura turno, stipendio a fine turno. Anche qui c’è XP: timbrare e chiudere un turno conta come progresso permanente.',
  },
  {
    title: 'Mercato',
    body: 'Acquisto beni con requisiti di livello, inventario persistente, affitti e rivendita dove previsto. Ogni acquisto significativo lascia traccia nell’XP globale.',
  },
  {
    title: 'Referendum e Gazzetta',
    body: 'Referendum con spiegazione del problema, guida al voto e impatto sul mondo. Votare conta per XP e per tesoreria/inflazione comunale. La Gazzetta pubblica articoli lunghi e cinici su cronaca, economia e esiti dei referendum — con hero editoriali dal catalogo asset.',
  },
  {
    title: 'Flash e eventi',
    body: 'Occasioni a tempo reale e eventi di mondo legati al tempo di gioco. Accettare una Flash dà XP. Gli eventi possono influenzare task, mercato e notizie.',
  },
  {
    title: 'Profilo e Comune',
    body: 'Profilo: identità, finanze, patrimonio, potere d’acquisto, flussi ricorrenti, progressione e carriera. Comune: inflazione autonoma, indice prezzi, popolazione, classifiche. Level-up e piccoli incrementi XP restano in UI — niente popup per ogni dettaglio.',
  },
  {
    title: 'Relazioni e chat libera',
    body: 'In Relazioni apri un profilo NPC con contatto sbloccato e scrivi liberamente. Un Social Brain locale (offline, rule-based) interpreta tono e intenzione, propone effetti relazionali e risponde in modo breve. Il Game Engine valida e applica trust, affetto e conflitto — niente punteggi manuali per frase. I dialoghi preset restano come fallback durante la migrazione.',
  },
  {
    title: 'Asset visivi',
    body: 'Immagini asset-driven: file `.webp` in `/assets/{categoria}/` con filename del catalogo. Formati ufficiali 1:1, 2:1, 3:1, 4:1, 4:5, 9:16 — produrre nativamente nel ratio dichiarato. La UI adatta il container al ratio (mai deformare). Placeholder grigio = da creare; rosso = errore.',
  },
  {
    title: 'Cosa NON c’è (ancora)',
    body: 'Mappa/città definitiva (progettazione futura). Carriera, attributi, task anti-stallo, economia dinamica, Social Brain, swipe e sistema asset visivo sono attivi. Il Comune non mente: al massimo omette con eleganza burocratica.',
  },
];

interface ManualModalProps {
  open: boolean;
  onClose: () => void;
}

export function ManualModal({ open, onClose }: ManualModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState<'intro' | 'detail'>('intro');

  useEffect(() => {
    if (!open) {
      setView('intro');
      return;
    }
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="manualModalBackdrop" role="presentation" onClick={onClose}>
      <div
        className="manualModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="manualModalHeader">
          <h2 id="manual-modal-title" className="manualModalTitle">
            Manuale del Comune
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="manualModalClose"
            onClick={onClose}
            aria-label="Chiudi manuale"
          >
            ×
          </button>
        </header>

        {view === 'intro' ? (
          <div className="manualModalBody manualModalBody--intro">
            <p className="manualModalIntro">{MANUAL_INTRO}</p>
            <button
              type="button"
              className="feedButton feedButtonPrimary manualModalDeepenBtn"
              onClick={() => setView('detail')}
            >
              Approfondisci
            </button>
          </div>
        ) : (
          <div className="manualModalBody">
            {MANUAL_SECTIONS.map((section) => (
              <section key={section.title} className="manualModalSection">
                <h3 className="manualModalSectionTitle">{section.title}</h3>
                <p className="manualModalSectionBody">{section.body}</p>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { MANUAL_INTRO, MANUAL_SECTIONS };
