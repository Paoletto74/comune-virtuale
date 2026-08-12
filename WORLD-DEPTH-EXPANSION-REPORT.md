# WORLD DEPTH & CONTENT EXPANSION — Report

## Obiettivo

Prima espansione di profondità del mondo sui sistemi V1 esistenti: più contenuto seed, interconnessioni economiche/politiche, cronaca comunale, stipendi reali — senza redesign né duplicazione architetetturale.

---

## 1. Cosa è stato implementato

### FASE 1 — Content expansion (seed)

| Area | Prima | Dopo | Meccanismo |
|------|------:|-----:|------------|
| Lavori | 3 | **10** | Migration `0014` + seed SQL |
| Marketplace | 3 | **17** | Migration `0014` |
| Aziende (base) | 0 | **8** | Tabella `businesses` + seed |
| World Events | 4 | **9** | `world-events-constants.ts` |
| Referendum template | 1 | **5** | `world-depth-constants.ts` |
| Task pool | ~111 | ~111 | *Invariato in questo pass* |

### FASE 2 — Interconnessione

- **Stipendio reale a fine turno**: al completamento del turno (shift → blocked_today), accredito `salary_hint_minor / 30` via `EconomyService`, notifica `job_payroll`, snapshot patrimonio aggiornato.
- **Acquisto marketplace**: notifica personale (+ Gazzetta per acquisti ≥ €200), snapshot patrimonio con valore inventario.
- **Referendum chiusi**: conseguenze su **cassa comunale** e **inflazione** (delta per template), voce in cronaca comunale, articolo Gazzetta (già presente).
- **Cronaca comunale**: tabella `municipality_chronicle`, entry periodiche (6h game-time bucket), visibile in **Comune** e **Gazzetta**.
- **Patrimonio**: liquidità + valore inventario → `netWorthMinor` (logica esistente, ora aggiornata più spesso post-acquisto/stipendio).

### FASE 3 — World simulation (prima base)

- Cronaca simulata del Comune (eventi di quartiere, economia, politica, clima…) senza AI.
- 8 aziende seed con settore/descrizione/dipendenti (preparazione ownership futura).

### FASE 4 — Game Master (prima UI)

- Pagina `/game-master` (solo se `enableDevAuth`): clock (pausa/avanzamento), Flash (valuta/reset config), toggle audio.
- Riutilizza API admin esistenti (`/api/v1/admin/time/*`, `/api/v1/admin/flash/*`).

### FASE 5 — Audio (base)

- Utility `gameAudio.ts`: hook suoni notification/success/error/purchase/flash, toggle ON/OFF, fail silenzioso se file assenti o autoplay bloccato.

### UI

- **Comune → Panoramica**: sezione “Eventi recenti” da `recentChronicle`.
- CSS compatto mobile per cronaca e Game Master.

---

## 2. File modificati / creati

### Nuovi

- `apps/backend/drizzle/0014_world_depth_expansion.sql`
- `apps/backend/src/slice/world-depth-constants.ts`
- `apps/backend/src/slice/world-depth-constants.test.ts`
- `apps/frontend/src/pages/GameMasterPage.tsx`
- `apps/frontend/src/utils/gameAudio.ts`
- `WORLD-DEPTH-EXPANSION-REPORT.md`

### Backend principali

- `game-surface-service.ts` — payroll, cronaca, referendum multi-template, gazzetta arricchita, snapshot post-acquisto
- `citizen-life-evolution-service.ts` — `recordPayrollNotice`, `recordMarketplacePurchaseNotice`
- `game-surface-repository.ts` + `repositories.ts` + `schema/index.ts` — chronicle/businesses
- `world-events-constants.ts` — +5 eventi
- `game-surface.integration.test.ts` — payroll + catalogo ≥10 lavori
- `world-events.integration.test.ts` — fix assertion ordine eventi
- `test-app.ts` — applica migration 0014

### Frontend principali

- `ComunePage.tsx`, `client.ts`, `global.css`, `App.tsx`

---

## 3. Sistemi riutilizzati (nessuna duplicazione)

- Task engine, Flash, World Events, Story Threads, NPC, Economy, Gazzetta, Notifiche, Referendum, Jobs, Marketplace, Profilo/patrimonio, Admin time/flash.
- Content packs YAML (`/content/`) **non** modificati: restano architettura/spec; runtime seed in TypeScript/SQL come da convenzione slice.

---

## 4. Migration

- **0014_world_depth_expansion.sql** — businesses, municipality_chronicle, +7 jobs, +14 marketplace items  
- 0011/0012/0013 **invariate**

---

## 5. Nuove API

Nessuna route REST pubblica nuova. Estensioni DTO:

- `GET /api/v1/municipality` → campo opzionale `recentChronicle[]`
- Notifiche personali: tipi `job_payroll`, `marketplace_purchase`

---

## 6. Test

| Suite | Risultato |
|-------|-----------|
| `pnpm test` | **396/396** |
| `pnpm typecheck` | ✓ |
| `pnpm lint` | ✓ |
| `pnpm validate:content` | ✓ |
| `pnpm --filter @comune-virtuale/frontend build` | ✓ |

Nuovi test: `world-depth-constants.test.ts`, payroll in `game-surface.integration.test.ts`.

---

## 7. Cosa percepisce il giocatore (playtest checklist)

| # | Verifica | Stato |
|---|----------|-------|
| 1 | Gazzetta con articoli diversi (eventi, referendum, cronaca, acquisti importanti) | ✓ migliorato |
| 2 | Attività con task vari (pool ~111 già esistente) | ✓ esistente |
| 3 | Referendum con conseguenze economiche | ✓ base |
| 4 | Flash presenti | ✓ esistente (+ GM valuta) |
| 5 | Più lavori in Mercato → Lavoro | ✓ 10 offerte |
| 6 | Candidatura / timbra / turno | ✓ invariato |
| 7 | **Stipendio dopo turno** | ✓ **nuovo** |
| 8 | Acquisto beni + patrimonio | ✓ migliorato |
| 9 | Comune con eventi recenti | ✓ **nuovo** |
| 10 | Ranking / grafici | ✓ invariati |
| 11 | Mobile responsive | ✓ invariato |

---

## 8. Cosa resta da fare (prossime iterazioni)

Non dichiarare “mondo completo” — restano aree significative dal brief originale:

1. **Task v4** — batch tematico aggiuntivo (lavoro, vicinato, rischio…) oltre al pool v3 (~111).
2. **Flash / Story Threads / NPC** — espansione contenutistica più ampia (target 15+ flash, 10+ thread, 10+ NPC significativi).
3. **Cittadini autonomi** — simulazione ranking/economia altri cittadini oltre cronaca.
4. **Azienda posseduta dal cittadino** — ownership gameplay.
5. **Referendum** — effetti su task/Flash/prezzi marketplace oltre cassa/inflazione.
6. **Life Review** — storico più ricco (lavori, acquisti, eventi).
7. **Progression unlocks** — nuovi contenuti sbloccabili per livello.
8. **Audio assets** — file `.mp3` in `public/sounds/` + integrazione negli eventi UI.
9. **Game Master** — force world event, referendum editor, marketplace admin.
10. **YAML content loader** — ponte verso content packs (architettura lunga).

---

## 9. Regole rispettate

- Nessun redesign desktop/mobile
- Nessuna modifica backend gameplay jobs (50/50, timbra, blocco, secondo lavoro)
- Nessuna migration 0011–0013 alterata
- API esistenti compatibili
- Idempotenza notifiche/stipendi/acquisti preservata

---

## 10. Come applicare in dev

```bash
# Migration 0014 (se DB già su 0013)
psql $DATABASE_URL -f apps/backend/drizzle/0014_world_depth_expansion.sql

# Oppione: test suite applica automaticamente via ensureGameSurfaceSchemaForTests
pnpm test
```

Game Master: `http://localhost:5173/game-master` con `enableDevAuth=true`.
