# HANDOFF — Web Complete

> **Datum:** 2026-06-30 (ažurirano)  
> **Sesija završila na:** `/liga`, `/klub/:slug`, **SeasonClub** (učesnici sezone) — kod ✅  
> **Sljedeći fokus:** **Poliranje `/sponzori` + `/trofeji`** → preostale javne → gate review (#14, #21)  
> **Git:** veliki **uncommitted** diff — **commit preporučen** prije sljedeće sesije

---

## 0. Pravilo gate-a (ne mijenjati bez korisnika)

| Status | Gate-ovi | Akcija agenta |
|--------|----------|---------------|
| **APPROVED** | **#1–13, #15–#20** | Ne dirati osim regresije |
| **READY_FOR_REVIEW** | **#14**, **#21** | Ne prebacivati u APPROVED dok korisnik ne potvrdi |
| **REVIEW (kod)** | **SeasonClub + standings** | Smoke u sekciji 4 — ne mijenjati logiku bez potrebe |
| **Sljedeći red (kod)** | `/sponzori`, `/trofeji` | Zatim `/kontakt`, match center, … |
| **Frozen** | #14 | Samo regresija dok nije APPROVED |

---

## 1. Gate status (snapshot)

| # | Modul | Status |
|---|-------|--------|
| 1–13 | Vijesti → Članstvo | **APPROVED** |
| **14** | Ulaznice | **READY_FOR_REVIEW** |
| 15–19 | Kontakt → Korisnici + Role | **APPROVED** |
| **20** | Postavke | **APPROVED** |
| **21** | Dashboard / Audit / Notifikacije | **READY_FOR_REVIEW** |

Log: [GATE_LOG.md](./GATE_LOG.md)

---

## 2. Uradio po segmentima (kumulativno)

### Segment A — Admin moduli (#1–#21)

| # | Oblast | Status | Napomena |
|---|--------|--------|----------|
| 1–13 | Vijesti … Članstvo | APPROVED | — |
| 14 | Ulaznice | READY_FOR_REVIEW | Frozen |
| 15–19 | Kontakt … Korisnici+Role | APPROVED | — |
| 20 | Postavke | APPROVED | Moduli, guard, sidebar hubovi |
| 21 | Dashboard / Audit / Notif. | READY_FOR_REVIEW | KPI, audit RBAC, bell/sheet |

### Segment B — Dark-only + tokeni (naslovna)

| Šta | Fajlovi |
|-----|---------|
| Forsiran `dark` | `theme.tsx`, `index.html`, `index.css` |
| Premium paleta + glass | `index.css`, `premium-landing.css` |
| Hero 100dvh + HeroMatchDock | `HeroWidget.tsx`, `hero/HeroMatchDock.tsx` |
| CMS widgeti redesign | news, gallery, players, league table, trophies, club-actions |

Referenca: `.cursor/reference/fkt-newdesign/` (gitignored)

### Segment C — Javne stranice polish (ranije) ✅

| Stranica | Ključni fajlovi |
|----------|-----------------|
| `/vijesti` + detalj | `NewsListPage`, `NewsDetailPage`, `components/news/*` |
| `/galerija` + detalj | `GalleryListPage`, `GalleryDetailPage`, `components/gallery/*` |
| `/tim` + `/igrac/:id` | `FirstTeamPage`, `TeamCinematicHero`, `PlayerPortraitCard`, … |
| Forma | `standings.util.ts`, `FormResultChips.tsx` |

**Reuse:** `PremiumPhotoBento`, `NewsSectionTitle`, `FormResultChips`

**Skip:** `/o-klubu` (timeline) — korisnik zadovoljan

### Segment D — Javne stranice polish (ova sesija) ✅

| Stranica | Šta je urađeno |
|----------|----------------|
| **`/liga`** | `LeagueCinematicHero`, KPI, filteri (sezona/kolo), tabela + ± pozicija, rezultati po kolima (tabela), strijelci; layout **jedno ispod drugog** |
| **`/klub/:slug`** | `ClubCinematicHero`, `ClubInfoSection`, reuse `TeamFormationSection` / `TeamSpotlight` / `TeamRosterSections` / `TeamSeasonStats`, premium competition tabovi |
| **SeasonClub (BE+admin)** | Učesnici sezone → tabela prikazuje klubove **bez odigranih utakmica** (0 bodova) |

### Segment E — SeasonClub + standings (**REVIEW** → sekcija 4)

| Sloj | Promjena |
|------|----------|
| **Prisma** | `SeasonClub` (`seasonId` + `clubId`), migracija `20260630140000_season_clubs` |
| **BE** | `createSeason` / `updateSeason` + `clubIds[]`; standings iz učesnika sezone |
| **Admin** | `SeasonClubPicker` u formi sezone; kolona „Učesnici“ |
| **Seed** | Demo sezona dobija FK Gračanica + FK Slavija |

---

## 3. Šta je sljedeće (redoslijed)

```
1. AGENT: Poliranje /sponzori + /trofeji (premium dark, kao Tim/Vijesti/Liga)
   - Referenca: CMS widgeti na naslovnoj (SponsorsWidget, TrophiesWidget)
   - Cinematic hero umjesto PageHeroHeader gdje ima smisla
   - NewsSectionTitle, glass-premium, border-gradient-club

2. AGENT (opciono): /kontakt, /utakmice/:id, /live, muzej, HOF

3. TI: Smoke REVIEW — SeasonClub + /liga + /klub (sekcija 4)

4. TI + AGENT: Gate review
   - #14 Ulaznice — smoke → APPROVED
   - #21 Dashboard/Audit/Notifikacije — smoke → APPROVED
   - #20 Postavke — brza regresija

5. Commit + deploy
   cd backend && npx prisma migrate deploy
   docker compose build frontend backend && docker compose up -d
```

### Javne stranice — status polish-a

| Stranica | Status |
|----------|--------|
| Naslovna (CMS) | ✅ Premium |
| `/vijesti` + detalj | ✅ |
| `/galerija` + detalj | ✅ |
| `/tim` + `/igrac/:id` | ✅ |
| `/liga` | ✅ |
| `/klub/:slug` | ✅ |
| **`/sponzori`** | **⏭ Sljedeće** |
| **`/trofeji`** | **⏭ Sljedeće** |
| `/kontakt` | Čeka |
| `/o-klubu` | Skip |
| `/ulaznice`, `/clanstvo` | #14 — samo regresija |
| `/utakmice/:id`, `/live` | Čeka |
| Muzej, HOF | Čeka |

---

## 4. Smoke checkliste

### REVIEW — SeasonClub + standings (obavezno prije commita)

- [ ] **Migracija:** `npx prisma migrate deploy` (tabela `SeasonClub`)
- [ ] **Admin → Takmičenja → Uredi aktivnu sezonu** — čekirani svi klubovi lige (ukl. novododani)
- [ ] **`/liga`** — svi učesnici u tabeli (0 bodova ako nema utakmica)
- [ ] **`/liga`** — promjena sezone/kola, rezultati po kolima, strijelci
- [ ] **Nova sezona** — min. 1 učesnik; „Svi“ / „Očisti“ radi
- [ ] **Drugo takmičenje** — učesnici sezone A ≠ sezone B (izolacija)

### REVIEW — Javne polish (ova sesija)

- [ ] `/liga` — tabela + rezultati vertikalno, čitljivo na 375/768/1280
- [ ] `/klub/:slug` — hero, stadion, formacija, kadar, takmičenje tab
- [ ] `/tim` — forma chipovi, tooltip (regresija)

### #21 Dashboard / Audit / Notifikacije
- [ ] `/admin` — KPI kartice
- [ ] `/admin/audit` — filteri; writer → redirect
- [ ] `/admin/notifications` + bell
- [ ] Postavke save → audit + notifikacija

### #14 Ulaznice (frozen)
- [ ] Javna `/ulaznice`, Moj račun, Stripe — bez regresije

### #20 Postavke (regresija)
- [ ] Modul guard, scope tabovi, sidebar hubovi

---

## 5. Otvoreno (nije blocker)

| Tema | Status |
|------|--------|
| `/sponzori` + `/trofeji` polish | **Sljedeća sesija** |
| Realtime `settings:changed` na public layoutu | BE emit ✅, FE listener nema |
| `smtp.port` / `upload.maxSizeMb` kao number | Još text |
| Match validacija: samo učesnici sezone | Nije implementirano (opciono) |

---

## 6. Build / deploy

```bash
cd frontend && npm run build   # ✅
cd backend && npm run build    # ✅
cd backend && npm test -- standings.util.spec.ts  # ✅
cd backend && npx prisma migrate deploy

docker compose build frontend backend && docker compose up -d
```

---

## 7. Ključni fajlovi (ova sesija)

| Oblast | Putanja |
|--------|---------|
| Liga | `pages/public/LeaguePage.tsx`, `components/public/league/*` |
| Klub | `pages/public/ClubPublicPage.tsx`, `ClubCinematicHero`, `ClubInfoSection` |
| SeasonClub | `prisma/schema.prisma` (`SeasonClub`), `competitions/season-participants.util.ts` |
| Standings | `statistics/standings.util.ts`, `statistics.service.ts` |
| Admin sezona | `SeasonClubPicker.tsx`, `CompetitionsAdminFormSheet.tsx` |
| **Sponzori (sljedeće)** | `pages/public/SponsorsPage.tsx`, `SponsorsTierSection`, `SponsorLogoTile`, `SponsorsWidget` |
| **Trofeji (sljedeće)** | `pages/public/TrophiesPage.tsx`, `TrophyCard`, `TrophyFeaturedShowcase`, `TrophiesWidget` |

---

## 8. Uncommitted diff

Glavne oblasti:

- Javne: vijesti, galerija, tim, igrač, **liga, klub**
- **SeasonClub** + standings fix
- Premium landing + CMS widgeti
- Admin #16–#21 (ranije)

```bash
git status && git diff --stat
```

---

## 9. Poznati blockeri

| Problem | Rješenje |
|---------|----------|
| Klub nije u ligaškoj tabeli | Admin → Uredi sezonu → čekiraj učesnika |
| Admin login 401 | `ADMIN_PASSWORD` u `.env` ≠ hash u DB |
| Forma tooltip prazan | Restart backend (`formMatches`) |
| FE/BE module defs sync | Oba `module-definitions.ts` |

---

## 10. Prompt za sljedeću sesiju (copy-paste)

```
Nastavi iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

Fokus: poliranje /sponzori i /trofeji (premium dark, kao Tim/Vijesti/Liga).

Gate: #1–#13, #15–#20 APPROVED — samo regresija.
#14 i #21 READY_FOR_REVIEW — ne mijenjaj status bez moje potvrde.

REVIEW (ne preskači): SeasonClub smoke (sekcija 4) ako još nije odrađen.

── Postojeće (referenca) ──
/sponzori:
- SponsorsPage.tsx — PageHeroHeader, SponsorsTierSection po tieru (GENERAL hero)
- SponsorLogoTile, SponsorsMarquee, sponsor-tiers.ts
- CMS: SponsorsWidget na naslovnoj

/trofeji:
- TrophiesPage.tsx — PageHeroHeader, TrophyFeaturedShowcase + TrophyCard grid
- splitFeaturedTrophy (trophy-utils.ts)
- CMS: TrophiesWidget na naslovnoj

Cilj: cinematic hero, NewsSectionTitle, glass-premium, uskladiti s TrophiesWidget/SponsorsWidget jezikom.
```
