# V1-FIRST-PLAYTEST-BUGFIX-3-JOBS-MARKET-REPORT

Pass finale Game Surface V1 — correzioni playtest, grafici, lavoro e marketplace.

---

## 1. Popup World Event

**Causa:** state dismiss perso al remount + `refetch()` post-dismiss.

**Fix:** dismiss ottimistico + `sessionStorage` (`citizenId:eventId`), API in background, `placeholderData` su `useHome`, nessun refetch obbligatorio dopo dismiss.

## 2. Dismiss immediato

Click X / Chiudi → popup sparisce subito; persistenza backend asincrona.

## 3. Persistenza dismiss

Migration 0012 invariata; layer frontend `worldEventDismissStorage.ts` integrato con backend `popup_dismissed_at`.

## 4. Navigazione

Regression test in `GlobalOverlays.test.tsx` (remount, refetch, API lenta/fallita, nuovo eventId).

## 5. Grafico patrimonio

`TemporalLineChart` in Profilo → Patrimonio, dati reali da `patrimonioSnapshots` (fino a 500 punti).

## 6. Grafico inflazione

Stesso componente in Comune → Panoramica, dati da `municipality_inflation_history` (registrati in `syncMunicipality`).

## 7. Periodi grafici

`24 ORE | SETTIMANA | MESE | TOTALE` — default **TOTALE**, filtro su game time.

## 8. Default TOTALE

`DEFAULT_CHART_PERIOD = 'total'`.

## 9. Icone fase

SVG aggiornati in `DayPhaseHeaderIcon` (alba/giorno/pomeriggio/tramonto/notte), API e routing invariati.

## 10. Compenso mensile

UI: `€ X / mese` via `formatMonthlySalary`. Backend: `salary_hint_minor` aggiornato in migration 0013 (2500 / 1800 / 1500).

## 11. Candidatura

Pulsante **CANDIDATURA** → `POST /api/v1/jobs/:offerId/apply`. Non più assunzione automatica.

## 12. 50/50 assunzione/rifiuto

`deterministicChance` con seed `job-application-decision:{idempotencyKey}`, probabilità **0.5**. Test distribuzione in `job-application-decision.test.ts`.

## 13. Lettere assunzione/rifiuto

Messaggi:
- Accettato: *"Congratulazioni! La tua candidatura per [NOME] è stata accettata."*
- Rifiutato: *"La tua candidatura per [NOME] non è stata accettata."*

## 14. Popup candidature

`JobApplicationOverlay` in Mercato → Lavoro (stile ComuneMessage).

## 15. Notifiche candidature

Evento temporale `job_application` con idempotency `job-application-notice:{applicationId}` → Notifiche Personali. Una candidatura = una notifica.

## 16. TIMBRA

Stato **hired** → pulsante **TIMBRA** → `POST /api/v1/jobs/:offerId/clock-in`.

## 17. Timer turno

Durata: **2 ore di gioco** (`GAME_SURFACE_WORK_SHIFT_DURATION_MS`). Fonte verità: `WorldClockService`; UI fa refetch ogni secondo durante turno attivo.

## 18. Blocco durante turno

Backend: `canApplyToJob` / `canClockInToJob` + status `shift_active`. UI: "Turno in corso" + countdown.

## 19. Blocco fino a fine giornata

A fine turno → `blocked_today` fino a `endOfGameDayMs`. Sync automatico su GET jobs / apply / clock-in.

## 20. Secondo lavoro

Blocco **per singolo offerId**. Primo lavoro bloccato non impedisce candidatura/timbratura su secondo lavoro (test integrazione).

## 21. Licenziamento

Nessun endpoint licenziamento esposto; durante turno attivo apply/clock-in bloccati lato backend.

## 22. Game clock

Tutti i timestamp e transizioni usano `worldTimeMs`. Nessun `Date.now` come fonte di verità per il turno.

## 23. Prezzi Marketplace rivisti

Migration 0013 (UPDATE catalogo):

| Bene | Prezzo |
|------|--------|
| Moka | € 35 |
| Kit attrezzi | € 95 |
| Bicicletta usata | € 280 |

## 24. Rapporto prezzi/stipendi

Con stipendio mensile ~€1.500–2.500 e liquidità iniziale €100: beni comuni accessibili; beni premium (bici) richiedono risparmio credibile.

## 25. Test

| Area | File |
|------|------|
| Popup | `GlobalOverlays.test.tsx` |
| Grafici | `TemporalLineChart.test.tsx`, `chartPeriods.test.ts` |
| Lavoro sync | `job-engagement-sync.test.ts` |
| 50/50 | `job-application-decision.test.ts` |
| Integrazione jobs/market | `game-surface.integration.test.ts` |
| UI lavoro | `formatWork.test.ts` |

## 26. typecheck

✓

## 27. lint

✓

## 28. validate:content

✓

## 29. Migration

**0013** (`0013_game_surface_jobs_v1.sql`):
- `citizen_job_applications`
- `citizen_job_engagements`
- UPDATE stipendi mensili + prezzi marketplace

0011/0012 **non modificate**.

## 30. Problemi residui

- **Pagamento turno:** non esiste ancora una regola economy per accredito stipendio a fine turno — fuori scope; il compenso resta indicativo in UI.
- **Licenziamento volontario:** non implementato (non richiesto esplicitamente oltre al blocco durante turno).
- **Durata turno:** 2 ore di gioco (costante `GAME_SURFACE_WORK_SHIFT_DURATION_MS`) — parametro di design, non da content YAML.

---

## Risultato finale

| Check | Esito |
|-------|-------|
| `pnpm typecheck` | ✓ |
| `pnpm lint` | ✓ |
| `pnpm test` | **388/388** ✓ |
| `pnpm validate:content` | ✓ |

**STOP — in attesa del prossimo playtest.**
