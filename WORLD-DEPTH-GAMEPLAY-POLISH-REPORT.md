# Comune Virtuale — World Depth + Gameplay Polish + UX Corrections

**Data:** 10 agosto 2026  
**Pipeline:** `403/403` test · typecheck ✓ · lint ✓ · validate:content ✓ · build ✓

---

## 1. Audit statistiche e livelli del personaggio

| Statistica | Persistita | Range | Visibile Profilo | Gameplay |
|---|---|---|---|---|
| **sympathy** (Simpatia) | ✓ `citizen_personal_values` | 0–100 | ✓ barra | task, lavori, NPC |
| **reputation** (Reputazione) | ✓ | 0–100 | ✓ barra | task, lavori, ranking |
| **happiness** (Felicità) | ✓ (aggiunta questa iterazione) | 0–100 | ✓ barra | task, beni consumo (meta) |
| **main_level** | ✓ | interno | ✗ | progression engine |
| **progression_points** | ✓ | interno | ✗ | level-up popup |
| **occupation / housing / family** | ✓ profile codes | — | parziale | unlock, task |
| **relationship_level** (NPC) | ✓ | per-NPC | ✗ | NPC engine, task |
| **task counters / unlock flags** | ✓ | — | ✗ | task engine |

**Conclusione audit:** la triade giocabile è **Simpatia / Reputazione / Felicità** (0–100, clampate). Felicità era solo nel content pack, ora persistita e visibile. Livelli interni (main_level, NPC) restano backend-only.

---

## 2. Report per sezione

### 🟢 IMPLEMENTATO E FUNZIONANTE

| # | Area | Dettaglio verificato |
|---|---|---|
| 1 | Audit stats | Triade sympathy/reputation/happiness mappata backend→frontend |
| 2 | Config personalità | Trade-off 90 punti su 3 assi (`personality-constants.ts`, `CreateCitizenPage`) |
| 4 | Pagina ingresso | `LoginPage.tsx` — logo, tono, Google stub, user/password |
| 5 | Header | Saldo centrato, 4 icone destra, sole/luna prima |
| 5b | Icona sole/luna | `DayPhaseHeaderIcon.tsx` — sole pieno + luna a mezzaluna |
| 6 | Popup | Delay 3.5s, coda serializzata (flash > world > level > life review) |
| 7 | Menu basso | Profilo ↔ Notifiche invertiti in `ShellLayout.tsx` |
| 8–10 | Gazzetta | ≥7 articoli, refresh ~5 min, dedup `articleId`, summary+fullBody, click→modal |
| 11 | Referendum | APPROVO/NON APPROVO, voti ricevuti, esito→Gazzetta (engine esistente) |
| 12 | Task tempo | `DEFAULT_TASK_DURATION_MS = 20_000` |
| 13 | Task conseguenze | `statEffects` su opzioni, preview in `TaskFeedPanel` |
| 14 | Lavori requisiti | `job-requirements-constants.ts` + UI Lavoro |
| 15 | Lavoro Profilo | `toEmploymentDto()` arricchito, empty state |
| 16 | TIMBRA | `.workClockInButton` verde/bianco |
| 17–18 | Barre Flash/turno | `HomeProgressBars` in shell |
| 19 | Inventario | Oggetti in Profilo con nome/categoria/qty/prezzo |
| 20 | Rivendita NPC | `POST /marketplace/:itemId/sell`, rimozione inventario |
| 22 | Grafici default | Periodo default → **24 ORE** (`chartPeriods.ts`) |
| 30 | Test | 403 test inclusi gazzetta, personality, header, popup, chart |

### 🟡 IMPLEMENTATO MA PARZIALE

| # | Area | Stato | Cosa manca |
|---|---|---|---|
| 2 | Personalità → gameplay | Pool applicato alla creazione | Influenza probabilità task/lavori/NPC non ancora wired end-to-end |
| 3 | Tono sarcastico | Login, Gazzetta subtitle, create-citizen, empty state | Manuale, task copy, notifiche, errori, referendum templates |
| 4 | Google auth | UI presente | OAuth non collegato (pulsante disabilitato) |
| 8 | Gazzetta refresh | Simulazione cronaca autonoma su fetch | Non cron job indipendente dal player |
| 20 | Rivendita | Solo NPC (`sellItem` backend) | Rivendita tra giocatori reali assente |
| 21 | Beni consumo | Meta `marketplace-item-meta.ts`, non rivendibili | Scadenza/consumo runtime e boost felicità non simulati |
| 22 | Grafici dettaglio | Default 24h | Densità punti dati backend invariata |
| 23–27 | World depth | Engine esistenti riusati | NPC/Flash/Story Threads/Task v4 non ampliati in contenuto |
| 24 | Cittadini autonomi | `simulateAutonomousCitizenActivity` leggero | No simulazione completa (lavoro, acquisti, voto) |
| 1 | Stats nascoste | main_level, NPC rel | Non mostrate in Profilo (by design parziale) |

### 🔴 ANCORA MANCANTE

| # | Area |
|---|---|
| 3 | Pass sistematico tono su tutto il content pack (832 YAML) |
| 20 | Marketplace P2P (vendita ad altro giocatore) |
| 21 | Loop scadenza consumabili + ricompra obbligatoria |
| 24 | Simulazione autonoma completa cittadini |
| 25–27 | Popolamento massiccio Story Threads, Flash, Task v4 |
| 22 | Backend snapshot più granulari per grafici |

### 🐛 BUG RISCONTRATI (e corretti)

| Bug | Fix |
|---|---|
| `happiness` non persistita | Aggiunta a initial values + API + clamp |
| Lavoro assente/errato in Profilo | DTO employment arricchito async |
| Gazzetta duplicati | Dedup per `articleId` |
| Popup immediati/sovrapposti | Delay + priorità serializzata |
| Test steal_wallet statEffects | Expect aggiornati |
| Test clock flaky | Snapshot pre-advance invece di base iniziale |
| Lint unused import GameHeader.test | Rimosso |

---

## 3. Pipeline finale

```
pnpm test          → 403/403 ✓
pnpm typecheck     → ✓
pnpm lint          → ✓
pnpm validate:content → ✓ (29 packs, 832 YAML)
pnpm build         → ✓
```

---

## 4. Verifica manuale consigliata

Non eseguita automaticamente in questa sessione. Checklist per Paolo:

- [ ] Login + create citizen con personalità trade-off
- [ ] Header mobile: saldo centrale, 4 icone, sole/luna riconoscibile
- [ ] Bottom nav: Notifiche al posto di Profilo (4ª voce)
- [ ] Gazzetta: ≥7 card, click articolo, no duplicati visibili
- [ ] Task: 20s countdown, preview +/- stats
- [ ] Lavoro: requisiti visibili, TIMBRA verde, turno in barra
- [ ] Profilo: lavoro, 3 stats, inventario, rivendita NPC
- [ ] Popup: nessuno all'apertura, uno alla volta
- [ ] Referendum: APPROVO/NON APPROVO + conteggio voti

---

## 5. File chiave modificati

**Backend:** `game-surface-service.ts`, `citizen-service.ts`, `citizen-repository.ts`, `task-service.ts`, `task-gameplay-profile.ts`, `gazzetta-constants.ts`, `personality-constants.ts`, `job-requirements-constants.ts`, `marketplace-item-meta.ts`, `task-timing-constants.ts`

**Frontend:** `GameHeader.tsx`, `DayPhaseHeaderIcon.tsx`, `ShellLayout.tsx`, `GlobalOverlays.tsx`, `HomeProgressBars.tsx`, `LoginPage.tsx`, `CreateCitizenPage.tsx`, `ProfiloPage.tsx`, `GazzettaPage.tsx`, `AttivitaPage.tsx`, `TaskFeedPanel.tsx`, `LavoroPanel.tsx`, `chartPeriods.ts`

---

## 6. Prossimi passi prioritari

1. **Consumabili:** job scheduler leggero che scala felicità e rimuove item scaduti
2. **Tono:** pass mirato su manual, notifications, task YAML (non tutto in una volta)
3. **World depth:** 10–15 nuovi task v4 + 5 flash + 3 story threads interconnessi
4. **P2P marketplace:** listing tra cittadini con prezzo e transfer inventario
5. **Google OAuth:** collegare provider esistente se configurato in env

---

*Il Comune respira meglio, ma non è ancora un metropolis satirico completamente autonomo. La base è giocabile; la profondità di mondo richiede un'altra iterazione di contenuto.*
