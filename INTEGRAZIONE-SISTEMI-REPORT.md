# Comune Virtuale — Integrazione Sistemi + UX + Profondità

**Data:** 10 agosto 2026  
**Base:** `MARKETPLACE-JOBS-TASK-UX-REPORT.md` (iterazione precedente)  
**Pipeline:** `418/418` test · typecheck ✓ · lint ✓ · validate:content ✓ · build ✓

---

## Pipeline finale

| Check | Risultato |
|---|---|
| `pnpm test` | **418/418** (98 file) |
| `pnpm typecheck` | ✓ |
| `pnpm lint` | ✓ |
| `pnpm validate:content` | ✓ (29 pack, 832 YAML) |
| `pnpm build` | ✓ |

---

## 🟢 IMPLEMENTATO E VERIFICATO

### Test e stabilità
- **Bug loop infinito TaskFeedPanel:** `home?.activeTasks ?? []` creava un nuovo array a ogni render → `useEffect`/`setSlotOrder` in loop → `DashboardPage.test.tsx` bloccato. Fix: costante stabile `EMPTY_FEED_TASKS`.
- **Import rotti:** ripristinato `AppError`, aggiunto `mapLegacyCategoryToCanonical`, `PersonalValueEffectsApplied`, rimosso `canApplyToJob` inutilizzato.
- **applyForJob durante turno:** blocco 409 coerente; idempotency prima del controllo engagement.

### Livelli personali — infrastruttura completa
- **`personal-values-constants.ts`:** 14 chiavi da `progression_balance_v1/schema.yaml` (happiness, health, culture, education, politicalInfluence, popularity, experience, stress, luck, reliability, civicParticipation, freeTime, reputation, sympathy).
- **Backend:** clamp/persist/increment su tutte le chiavi; `PersonalValueDelta` e `PersonalValueEffectsApplied` estesi; task-service applica qualsiasi delta non-zero.
- **Frontend:** `personalValues.ts` mirror; **Profilo** mostra tutti i 14 livelli con barre.
- **Preview task:** il motore legge effetti reali dal bundle; la UI mostra solo delta effettivamente presenti.

### Gang → task criminali
- **`gang-task-boost.ts`:** moltiplicatore 2.5× sui pesi task criminali se impiegato in gang (`isGangMemberFromEmployment`).
- **`TaskSelectionService`:** wired con `GameSurfaceRepository`; boost persistente finché impiego gang attivo.
- **4 test unitari** aggiunti.

### Marketplace P2P (Occasioni) — backend + UI base
- **Migration `0015_marketplace_player_listings.sql`:** tabella listing con vendita/affitto, idempotency, ownership transfer.
- **Repository:** `createPlayerListing`, `completePlayerListing`, `transferInventoryOwnership`, merge listing reali + vetrina simulata in `getMarketplace`.
- **API:** `POST /api/v1/marketplace/listings`, `POST /api/v1/marketplace/listings/:listingId/buy`.
- **Frontend `OccasioniPanel`:** tab Mercato → Occasioni; form vendita da inventario; acquisto listing P2P.

### Task UX
- **Doppia icona rimossa:** solo `TaskIllustration`, niente `FeedCategoryIcon` duplicato.
- **Progress bar task:** 33/66/100% su 3 slot attivi in `HomeProgressBars`; ordine barre TASK → FLASH → LAVORO → MENU.
- **20s, slot stabile, completamento inline:** mantenuti dall'iterazione precedente.

### Grafici
- **Default SETTIMANA:** `DEFAULT_CHART_PERIOD = 'week'` in `chartPeriods.ts`; test aggiornati.

### Navigazione e UI
- **Attività:** Task (default) + Lavori.
- **Mercato:** Marketplace + Occasioni.
- **Gazzetta:** Notizie + Referendum (`ReferendumPanel`: voto singolo click, conteggi, ringraziamento).
- **Bottom nav:** Profilo ↔ Notifiche invertiti (Profilo 4°, Notifiche 5°).
- **Notifiche:** "Generali" al posto di "Globali"; icone distinte Personali/Generali.
- **Comune:** tab "Classifiche" (non Ranking); rimosso blocco "Eventi recenti"; directory limitata a 12 cittadini.
- **Classifiche:** backend già TOP 5 per categoria.

### Sistemi già funzionanti (non riscritti)
Marketplace 4 categorie, rotazione 8+2, lavori tier/rotazione/requisiti, popup base, referendum 13 template, Flash bar, work bar, scaling task nuovi giocatori.

---

## 🟡 PARZIALE

| Area | Stato |
|---|---|
| **Task → tutti i livelli nel contenuto** | Runtime supporta 14 livelli; la maggior parte dei task YAML applica ancora sympathy/reputation/happiness/cash. Servono delta su culture/education/etc. nei pack contenutistici. |
| **P2P end-to-end** | API + migration + UI form presenti; affitto (`listing_type: rent`) in schema ma flusso scadenza/restituzione non completato. Nessun test integrazione P2P dedicato. |
| **POSSEDI: X su card marketplace** | Inventario reale in profilo; conteggio quantità per itemId non ancora in card catalogo. |
| **Consumabili / pasti / scadenza** | Meta consumable esiste; indicatori VERDE/GIALLO/ROSSO e loop 3 pasti/giorno non implementati. |
| **Referendum 20 minuti** | UI single-click; rotazione automatica post-voto e rimozione timer lato backend non verificati end-to-end. |
| **Grafici dettagliati** | Default settimana OK; densità punti dipende da snapshot reali — serve più attività di gioco per linee ricche di variazioni. |
| **Popup** | Coda serializzata e sessionStorage dismiss OK; bug "ultima frase duplicata" non riprodotto in questa sessione; filtro solo-notifiche-personali non rivisto. |
| **Gazzetta** | Feed + articoli; deduplicazione rapida e refresh ogni ~5 min non verificati con test dedicati. |
| **Profilo lavoro** | Employment in API; visualizzazione dettagliata turno/stipendio/requisiti parziale in UI. |

---

## 🔴 MANCANTE

- **Affitto completo:** assegnazione temporanea, distinzione POSSEDUTO vs IN AFFITTO, restituzione automatica.
- **Notifiche popup solo personali** (generali restano in feed, nessun popup).
- **NPC nomi credibili** in massa (directory limitata, seed non rivisto).
- **Manuale/onboarding** tono sarcastico esteso ovunque (solo aggiornamenti puntuali).
- **Configurazione personaggio** 3+ attributi con reazioni incrociate (sistema personality esiste, non esteso in questa iterazione).

---

## 🐛 BUG CORRETTI

| Bug | Causa | Fix |
|---|---|---|
| Test 413/414 (poi hang) | Array instabile in `TaskFeedPanel` useEffect | `EMPTY_FEED_TASKS` costante |
| Typecheck task-service | `PersonalValueEffectsApplied` opzionale vs number | `?? 0` su sympathy/reputation delta |
| Import game-surface-service | `AppError` rimosso per errore | Ripristinato import |
| Lint unused import | `canApplyToJob` dopo refactor applyForJob | Rimosso |

---

## File e sistemi toccati

### Backend (principali)
- `slice/personal-values-constants.ts` (nuovo)
- `slice/gang-task-boost.ts` (nuovo)
- `application/task/task-service.ts`, `task-selection-service.ts`, `task-gameplay-profile.ts`
- `application/game-surface/game-surface-service.ts`
- `infrastructure/db/schema/index.ts`, `repositories/game-surface-repository.ts`
- `drizzle/0015_marketplace_player_listings.sql` (nuovo)
- `api/routes/game-surface-routes.ts`
- `application/home/home-service.ts`

### Frontend (principali)
- `components/game/TaskFeedPanel.tsx`, `HomeProgressBars.tsx`
- `components/game/ReferendumPanel.tsx`, `OccasioniPanel.tsx` (nuovi)
- `pages/AttivitaPage.tsx`, `MercatoPage.tsx`, `GazzettaPage.tsx`, `ProfiloPage.tsx`, `ComunePage.tsx`, `NotifichePage.tsx`
- `components/shell/ShellLayout.tsx`, `components/game/SectionSwitch.tsx`
- `utils/personalValues.ts`, `chartPeriods.ts`, `marketplaceHelpers.ts`

### Migration
- **`0015_marketplace_player_listings.sql`** — richiesta per P2P reale in produzione.

---

## Loop di gioco — stato collegamento

```
TASK → livelli (14 persistiti, contenuto parziale)
  ↓
LIVELLI → requisiti lavori (sympathy/reputation/happiness + mainLevel)
  ↓
LAVORI → denaro (payroll) + gang → boost task criminali ✓
  ↓
DENARO → acquisto marketplace ✓
  ↓
OGGETTI → inventario profilo ✓ → Occasioni P2P (vendita ✓, affitto 🟡)
  ↓
NOTIZIE → Gazzetta (🟡 dedup/timer)
  ↓
REFERENDUM → voto UI ✓, rotazione 20min 🟡
  ↓
GRAFICI → default settimana ✓, densità dati 🟡
```

---

## Prossimi passi consigliati

1. Estendere effetti task nei pack YAML a culture, education, politicalInfluence, ecc.
2. Test integrazione P2P (list → buy → ownership transfer → saldo).
3. Completare affitto con scadenza e stati UI POSSEDUTO/IN AFFITTO.
4. Referendum: timer 20 min lato backend + auto-rotazione template pool.
5. Consumabili: pasti, scadenza, indicatori colore.
6. Popup: audit duplicazione testo + filtro scope personal-only.

---

*Report generato al termine dell'iterazione "Integrazione Sistemi". Pipeline verificata in esecuzione reale.*
