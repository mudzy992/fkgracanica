# HANDOFF — Web Complete

> **Datum:** 2026-07-08  
> **Sesija završila na:** `/kontakt` cinematic ✅ · Match center (`/utakmice/:id`) maximal polish ✅ · Live shell polish ✅  
> **Sljedeći fokus:** Gate smoke (#14, #21) + SeasonClub smoke (sekcija 4) — **statuse NE mijenjati bez korisnika**  
> **Git:** working tree **dirty** (ova sesija — uncommitted); prethodni clean: `60d1e5e` / `fbd337a`

---

## 0. Pravilo gate-a (ne mijenjati bez korisnika)

| Status | Gate-ovi | Akcija agenta |
|--------|----------|---------------|
| **APPROVED** | **#1–13, #15–#20** | Ne dirati osim regresije |
| **READY_FOR_REVIEW** | **#14**, **#21** | Ne prebacivati u APPROVED dok korisnik ne potvrdi |
| **REVIEW (kod)** | **SeasonClub + standings** | Smoke sekcija 4 — logiku ne dirati bez potrebe |
| **Ova sesija** | `/kontakt`, match center, live UI | Polish done — gate status nepromijenjen |
| **Frozen** | #14 | Samo regresija dok nije APPROVED |

---

## 1. Gate status (snapshot)

| # | Modul | Status |
|---|-------|--------|
| 1–13 | Vijesti → Članstvo | **APPROVED** |
| **14** | Ulaznice | **READY_FOR_REVIEW** |
| 15–19 | Kontakt → Korisnici + Role | **APPROVED** (#15 funkcionalno; UI polish ova sesija) |
| **20** | Postavke | **APPROVED** |
| **21** | Dashboard / Audit / Notifikacije | **READY_FOR_REVIEW** |

Log: [GATE_LOG.md](./GATE_LOG.md)

---

## 2. Uradio po segmentima (ova sesija = Segment I)

### Segment I — `/kontakt` + match center + live (maximal polish) ✅

#### `/kontakt`

| Fajl | Uloga |
|------|-------|
| `ContactCinematicHero.tsx` | Gradient hero + KPI chipovi (Email/Tel/Adresa ako postoje u settings) |
| `ContactInfoAside.tsx` | Glass tileovi + mailto/tel linkovi + `NewsSectionTitle` |
| `ContactFormPanel.tsx` | Forma (labeli, validacija BS, success stanje) |
| `ContactPage.tsx` | Orchestracija; prefill auth user; bez starog `PageHeroHeader`/`FormShell` |

#### Match center `/utakmice/:id`

| Fajl | Uloga |
|------|-------|
| `MatchScoreHero.tsx` | Cinematic scoreboard (full-bleed gradient, motion, live pulse) |
| `MatchCenterToolbar.tsx` | Status badge (BS labeli) + Live / Komentator CTA |
| `MatchEventsSection.tsx` | Glass timeline događaja |
| `MatchCenterSections.tsx` | Postave + vijesti → `NewsSectionTitle` + glass |
| `MatchStatisticsSection.tsx` | Glass statistika + Reveal |
| `MatchPlayerStatsTable.tsx` | Glass tabela |
| `MatchCenterPage.tsx` | Sastavljeno; skeleton loading; Snimak sekcija |
| `match-status-label.ts` | BS labeli + tone (LIVE/Pauza/Završena…) |
| `badge.tsx` | Dodan `warning` variant (HALFTIME) |

#### Live `/live/:id`

| Fajl | Uloga |
|------|-------|
| `LiveCenterShell.tsx` | Radial glow, rounded-3xl score, pulse live badge |
| `LivePreMatchShell.tsx` | Glass countdown kartica, usklađen tipografski ritam |
| `LiveMatchPage.tsx` | „Nije uživo“ finished state sa crest + score card |

### Raniji segmenti (ne dirati)

A–H: Segment A–H iz prethodnog HANDOFF-a (admin, public liga/klub, SEO OG, mediji, sponzori/trofeji, SeasonClub…) — **intaktno**.

---

## 3. Šta je sljedeće (redoslijed)

```
1. TI: Smoke visual
   - /kontakt — hero, aside tiles, forma (logged-in prefill)
   - /utakmice/:id — score hero, sekcije, Live CTA
   - /live/:id — prematch / live / finished shell

2. TI: Smoke REVIEW — SeasonClub (sekcija 4) ako još nije

3. TI + AGENT: Gate review (bez auto-approve)
   - #14 Ulaznice → APPROVED kad potvrdiš
   - #21 Dashboard/Audit/Notif. → APPROVED kad potvrdiš
   - #20 Postavke — brza regresija

4. (Opciono) Muzej, HOF polish

5. Commit + deploy ako lokal ≠ prod:
   docker compose build frontend && docker compose up -d frontend
```

### Javne stranice — status polish-a

| Stranica | Status |
|----------|--------|
| Naslovna (CMS) | ✅ Premium + SEO home = club.name |
| `/vijesti` + detalj | ✅ + OG |
| `/galerija` + detalj | ✅ |
| `/tim` + `/igrac/:id` | ✅ |
| `/liga` | ✅ + crest u tabeli |
| `/klub/:slug` | ✅ |
| `/sponzori` | ✅ |
| `/trofeji` | ✅ |
| `/kontakt` | ✅ **Cinematic** (ova sesija) |
| `/utakmice/:id` | ✅ **Cinematic match center** (ova sesija) |
| `/live/:id` | ✅ **Shell polish** (ova sesija); SEO već ok |
| `/o-klubu` | Skip |
| `/ulaznice`, `/clanstvo` | #14 — samo regresija |
| Muzej, HOF | Čeka |

---

## 4. Smoke checkliste

### Ova sesija — Kontakt / Match / Live

- [ ] `/kontakt` — hero + tileovi iz settings; forma submit; auth prefill
- [ ] `/utakmice/:id` — cinematic score; BS status badge; sekcije glass
- [ ] `/live/:id` — SCHEDULED countdown; LIVE timeline; FINISHED card
- [ ] Mobile 375px — bez horizontal overflow (kontakt split → stack)

### REVIEW — SeasonClub + standings

- [ ] Migracija `SeasonClub` applied
- [ ] Admin → Uredi sezonu → checkboxi **rade**
- [ ] `/liga` — učesnici + **grbovi** pored imena
- [ ] Promjena sezone/kola, rezultati, strijelci

### SEO / OG (produkcija)

- [ ] `seo/share?path=/` → title = FK Gračanica
- [ ] WhatsApp UA curl na `/`, `/vijesti/:slug`, `/utakmice/:id`

### #21 / #14 / #20

- [ ] Dashboard KPI linkovi; audit; bell
- [ ] Ulaznice regresija
- [ ] Postavke moduli

---

## 5. Otvoreno (nije blocker)

| Tema | Status |
|------|--------|
| `/kontakt` UI polish | ✅ Done |
| Match center / live UI polish | ✅ Done |
| Realtime `settings:changed` FE listener | Još nema |
| `smtp.port` / `upload.maxSizeMb` number inputs | Još text |
| Match validacija: samo SeasonClub učesnici | Opciono |
| Muzej / HOF polish | Opciono |

---

## 6. Build / deploy

```bash
cd frontend && npm run build
# opcioni: docker compose build frontend && docker compose up -d frontend
```

---

## 7. Ključni fajlovi (ova sesija)

| Oblast | Putanja |
|--------|---------|
| Kontakt | `components/public/contact/*`, `pages/public/ContactPage.tsx` |
| Match center | `components/match/MatchScoreHero`, `MatchCenterToolbar`, `MatchEventsSection`, `MatchCenterSections`, `MatchStatisticsSection`, `MatchPlayerStatsTable`, `pages/public/MatchCenterPage` |
| Status helper | `lib/match-status-label.ts`, `ui/badge.tsx` (`warning`) |
| Live | `LiveCenterShell`, `LivePreMatchShell`, `LiveMatchPage` |

---

## 8. Git stanje

- Branch: `main`
- Working tree: **dirty** (kontakt + match + live polish) — commit na zahtjev
- Prethodni: `fbd337a` Do seo · `60d1e5e` Poliranje odrađeno

---

## 9. Poznati blockeri / pitfalli

| Problem | Rješenje |
|---------|----------|
| WhatsApp preview „Početna“ | Redeploy backend; `?v=` za cache |
| Checkboxi sezone | Fix already — ne vraćati nestabilne deps |
| Gate #14/#21 | NE upgrade bez eksplicitne potvrde |

---

## 10. Prompt za sljedeću sesiju (copy-paste)

```
Nastavi iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

Fokus (po redu):
1) Gate smoke: #14 Ulaznice, #21 Dashboard/Audit/Notif. — NE mijenjaj status bez moje potvrde
2) SeasonClub smoke (sekcija 4) ako još nije checked
3) Opciono: Muzej / HOF polish
4) Commit + deploy frontend (dirty tree iz kontakt/match polish)

Već gotovo (ne diraj bez potrebe):
- /kontakt cinematic (ContactCinematicHero + FormPanel + InfoAside)
- /utakmice/:id MatchScoreHero cinematic + sekcije glass
- /live shell polish (prematch / center / finished)
- /sponzori, /trofeji, SEO OG, SeasonClub, medije, formatDate

Gate: #1–#13, #15–#20 APPROVED — samo regresija.
#14 i #21 READY_FOR_REVIEW.
```
