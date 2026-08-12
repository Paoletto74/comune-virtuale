# V1-FIRST-PLAYTEST-BUGFIX-3-REPORT

Pass finale di correzione Game Surface V1 prima del prossimo playtest.

---

## 1. Causa del popup che ricompariva

Il dismiss locale (`dismissedWorldEventIds` in React state) veniva **perso al remount** di `GlobalOverlays` — ad esempio quando `home` diventava temporaneamente `undefined` durante refetch o al cambio route, perché il componente era montato condizionalmente con `{showNav && home && <GlobalOverlays … />}`.

Inoltre, dopo il click su Chiudi/X veniva eseguito `await refetch()`: se il backend non aveva ancora persistito il dismiss, l'evento restava in `activeEvents` e, senza stato locale persistente, il popup poteva riapparire.

---

## 2. Fix del dismiss persistente

- **`sessionStorage`** keyed by `citizenId:eventId` (`worldEventDismissStorage.ts`)
- Hydration dello state al mount e al cambio `citizenId`
- Controllo dismiss tramite **state + sessionStorage + backend** (`popup_dismissed_at` / migration 0012 invariata)
- `useHome` con **`placeholderData`** per evitare unmount di `GlobalOverlays` durante refetch
- `GlobalOverlays` montato con **`key={home.citizenId}`** in `ShellLayout`

---

## 3. Fix della chiusura immediata

- Click su X / Chiudi → **aggiornamento UI sincrono** (state + sessionStorage)
- **`POST /api/v1/world-events/:eventId/dismiss-popup`** in background (fire-and-forget)
- **Nessun `await refetch()`** dopo dismiss
- Se l'API fallisce: messaggio errore opzionale, **popup non riappare**

---

## 4. Test navigazione

Regression test in `GlobalOverlays.test.tsx`:

- popup visibile
- dismiss immediato (X e Chiudi)
- rerender simulato (navigazione)
- remount stesso cittadino
- refetch con API lenta
- API fallita → popup resta chiuso
- nuovo `eventId` → nuovo popup consentito
- persistenza sessionStorage

---

## 5. Grafico patrimonio

**Profilo → Patrimonio**: componente condiviso `TemporalLineChart` con dati reali da `patrimonioSnapshots` (`GET /api/v1/profile/detail`).

- Line chart SVG dark premium
- Tooltip touch-friendly
- Limite snapshot backend portato a **500** per storico TOTALE

---

## 6. Grafico inflazione

**Comune → Panoramica → Inflazione**: stesso `TemporalLineChart` con dati da `municipality_inflation_history`.

Backend:

- `recordInflationSnapshot` in `syncMunicipality` (bucket orario, idempotente)
- `listInflationHistory` nel repository
- `inflationHistory[]` incluso in `GET /api/v1/municipality`

---

## 7. Selezione periodi

Entrambi i grafici:

**[ 24 ORE ] [ SETTIMANA ] [ MESE ] [ TOTALE ]**

Filtro su tempo di gioco (`chartPeriods.ts`):

- 24 ORE = ultime 24h di gioco
- SETTIMANA = ultimi 7 giorni di gioco
- MESE = ultimi 30 giorni di gioco
- TOTALE = tutto lo storico disponibile

Cambio periodo senza cambio pagina; periodo attivo evidenziato.

---

## 8. Default TOTALE

`DEFAULT_CHART_PERIOD = 'total'` — all'apertura di Profilo/Comune il tab **TOTALE** è già selezionato.

---

## 9. Icone fase

`DayPhaseHeaderIcon` invariato come API/componente; **solo SVG aggiornati** per maggiore leggibilità a 20×20:

| Fase | Icona |
|------|-------|
| ALBA | sole che sorge + orizzonte |
| GIORNO | sole pieno con raggi |
| POMERIGGIO | sole basso a destra |
| TRAMONTO | semicerchio sul tramonto |
| NOTTE | luna + stelle |

Header `[ LOGO ] [ SALDO ] [ ICONA FASE ] [ MANUALE ] [ CONDIVIDI ] [ ESCI ]` non modificato.

---

## 10. Regression test

| Area | File test |
|------|-----------|
| Popup dismiss | `GlobalOverlays.test.tsx`, `worldEventDismissStorage.test.ts` |
| Periodi grafico | `chartPeriods.test.ts`, `TemporalLineChart.test.tsx` |
| Icone fase | `DayPhaseHeaderIcon.test.tsx` |
| Inflazione API | `game-surface.integration.test.ts` |

---

## 11. Migration

**Nessuna nuova migration.**

Riutilizzate:

- **0011** — `municipality_inflation_history`, `citizen_economic_snapshots`
- **0012** — `popup_dismissed_at` su `citizen_world_event_notices`

---

## 12. Risultato finale

| Check | Esito |
|-------|-------|
| `pnpm typecheck` | ✓ |
| `pnpm lint` | ✓ |
| `pnpm test` | **378/378** ✓ (baseline 357 + 21 nuovi) |
| `pnpm validate:content` | ✓ |

---

## Criterio finale — check

- ✓ Chiudo l'Ondata di caldo → sparisce immediatamente
- ✓ Navigazione tra sezioni → NON ricompare
- ✓ Refetch/sync → NON ricompare
- ✓ Nuovo World Event (nuovo eventId) → può comparire
- ✓ Profilo → grafico patrimonio reale
- ✓ Comune → grafico inflazione reale
- ✓ Periodi 24 ORE \| SETTIMANA \| MESE \| TOTALE
- ✓ TOTALE default
- ✓ Icone fase chiare
- ✓ Header non regressa
- ✓ Suite verde

**STOP — in attesa del prossimo playtest.**
