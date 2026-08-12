# Comune Virtuale — Asset Library (MEGA 4/4)

Drop `.webp` files into the matching category folder. **No code changes required.**

## Formati ufficiali

| Ratio | Uso | Export consigliato |
|-------|-----|-------------------|
| **1:1** | Avatar, prodotti, badge, item | 1024×1024 |
| **2:1** | Card panoramiche, thumbnail sezione | 1200×600 |
| **3:1** | Hero principali (Home, Gazzetta, Referendum, Mercato, Jobs, Tasks) | 1200×400 |
| **4:1** | Banner larghi, section background | 1600×400 |
| **4:5** | Personaggi premium verticali, portrait | 800×1000 |
| **9:16** | Scene full-screen verticali | 1080×1920 |

## Regole di produzione (prioritarie)

1. **Creare l'asset nativamente nel formato finale** — non tagliare un 16:9 in 3:1.
2. **MAI deformare** — la UI usa `object-fit: contain`; il container segue il ratio del catalogo.
3. **Spazio negativo OK** — non riempire il 100% a tutti i costi.
4. **Un file = un asset** — nessuna tavola multi-immagine.
5. **Filename esatto** come da catalogo TypeScript (`packages/shared/src/visual/asset-catalog.ts`).

## Workflow

```
Gameplay (semantic key) → catalog → /assets/{category}/{file}.webp
                              ↓ fallback legacy
                         placeholder grigio
```

## Personaggi

Libreria unificata `characters/` — NPC e PLAYER stesso stile visivo.

- Pool legacy: `profile_001.webp`, `npc_001.webp` (1:1, fallback `/profiles`, `/npc-portraits`)
- Premium: `character_f_029_romantic_001.webp` (preferibilmente **4:5**)

## Orario reale — varianti per fase

Ambient assets (hero, gazzetta, referendum, section background) supportano **4 fasi** dal clock locale del giocatore:

| Fase | Orario | Key |
|------|--------|-----|
| Mattino | 06:00–11:59 | `morning` |
| Giorno | 12:00–16:59 | `day` |
| Tramonto | 17:00–20:59 | `sunset` |
| Notte | 21:00–05:59 | `night` |

Naming: `{base}.{phase}.webp` — es. `marketplace-hero.sunset.webp`

Apertura/login (9:16 full-screen): `home-{phase}.webp` — es. `home-morning.webp`

Fallback: variante fase → file base → legacy → placeholder.

## Hero prioritari (3:1)

- `hero/home-hero.{phase}.webp`
- `hero/marketplace-hero.webp`
- `hero/jobs-hero.webp`
- `hero/tasks-hero.webp`
- `news/gazzetta-{categoria}.webp`
- `referendum/referendum-*.webp`

## Dev

- API: `GET /api/v1/dev/asset-status`
- UI: `/dev/assets`
