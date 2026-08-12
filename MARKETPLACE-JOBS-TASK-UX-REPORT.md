# Comune Virtuale — Marketplace + Lavori + Task + Popup + Home/Work Bar

**Data:** 10 agosto 2026  
**Pipeline:** `413/414` test · typecheck ✓ · lint ✓ · validate:content ✓ · build ✓

---

## 🟢 IMPLEMENTATO E FUNZIONANTE

### Marketplace
- **4 categorie:** consumables, vehicles, housing, luxury con sfondi discreti
- **~10 prodotti/categoria** da pool di 48 item (`marketplace-catalog-constants.ts`)
- **Rotazione giornaliera:** 8 stabili + 2 ruotati per categoria (`marketplace-rotation.ts`)
- **Card compatte** a griglia 2–3 colonne con immagine SVG dominante
- **Vetrina cittadini** in cima a ogni categoria (listings simulati deterministici)
- API estesa: `categories[]`, `imageKey`, `isShowcase`, `rotationDayKey`
- Acquisto da catalogo constants + DB (`resolvePurchasableItem`)

### Lavori
- **10+ offerte** nel pool (`job-catalog-constants.ts`) con tier entry/medium/high/criminal
- **Rotazione giornaliera:** 8 stabili + 2 ruotate
- **Requisiti visibili** anche se bloccati (stats + mainLevel)
- **Lavori gang/organizzazioni** (`job_gang_v1`, `job_shady_collect_v1`) senza stipendio fisso o variabile
- Offerte criminali nel pool rotazione; apply via catalog (non solo DB)

### Task
- **Progressione economica:** scaling ricompense nuovi giocatori (`task-economy-scaling.ts`, micro-reward ≤50 escluse)
- **Posizione stabile:** slot order preservato in feed
- **Completamento inline:** "Task completato." nella card, nessun pulsante COMPLETA
- **Stat preview per opzione:** Simpatia, Reputazione, Felicità, Denaro

### Popup
- **Dimensioni:** overlay fullscreen, pannello ~70% mobile, sfondo `#2a3144` più chiaro
- **Contrasto:** backdrop scuro + blur
- **Navigation-driven fix:** level-up e life-review dismiss persistiti in sessionStorage
- Coda serializzata invariata (delay 3.5s)

### Referendum
- **13 template** (economia, tasse, cultura, sicurezza, infrastrutture, ambiente, commercio, ecc.)

### Home / Barre
- **Testo Flash rimosso** sotto barra (label non renderizzata)
- **Barra Flash** + **barra lavoro verde** in `bottomGameChrome` attaccato al menu
- Barra lavoro **solo durante turno attivo**
- Ordine: Flash → Lavoro → Menu, senza gap

---

## 🟡 IMPLEMENTATO MA PARZIALE

| Area | Nota |
|---|---|
| Vetrina giocatori | Listings simulati; rivendita P2P reale non collegata al marketplace |
| Lavori criminali | Offerte presenti; boost task criminali post-assunzione non wired |
| Task stat coverage | Solo stats persistite (Simpatia/Reputazione/Felicità/Denaro) — cultura/istruzione non esistono nel runtime |
| Popup desktop | Migliorati ma non testati manualmente su tutte le risoluzioni |
| Profilo dimensioni | work/living/personal ancora nascoste fino a unlock |

---

## 🔴 ANCORA MANCANTE

- Rivendita/affitto reale tra giocatori nel marketplace
- Loop consumabili scadenza/consumo
- Task v4 pool expansion contenutistica
- Migration DB per nuovi item catalog-only (funziona via constants overlay)

---

## 🐛 BUG CORRETTI

- Import `applyEconomicEffect` rimosso per errore in task-service
- Prezzi marketplace flat list includeva vetrina a prezzo scontato
- Rotazione giornaliera non cambiava tra day 0 e day 1 (hash debole)
- Lint unused imports

---

## Sistemi riutilizzati

`GameSurfaceService`, `job-engagement-sync`, `job-requirements-constants`, `GlobalOverlays`, `ShellLayout`, `TaskFeedPanel`, `REFERENDUM_TEMPLATES` pattern, `citizen_progression` per mainLevel job gates.

## Nuovi file

- `marketplace-catalog-constants.ts`, `marketplace-rotation.ts`
- `job-catalog-constants.ts`, `task-economy-scaling.ts`
- `MarketplacePanel.tsx`, `MarketplaceItemImage.tsx`
- Test: `marketplace-rotation.test.ts`, `job-catalog-constants.test.ts`, `task-economy-scaling.test.ts`

## Migration

Nessuna migration DB richiesta — catalogo e rotazione via constants; DB seeds esistenti usati per prezzi ufficiali.

## Verifica manuale consigliata

Mercato → 4 sezioni colorate → vetrina → acquisto · Lavori → 10 offerte → requisiti bloccati → gang · Task → preview stats → completamento inline · Popup → contrasto · Home → barre attaccate al menu · TIMBRA → barra verde
