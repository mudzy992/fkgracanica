# HANDOFF — Web Complete

> **Datum:** 2026-06-30 (ažurirano)  
> **Sesija završila na:** Gate **#20 Postavke** + admin sidebar / dark tema / javna stranica kluba — kod ✅, **READY_FOR_REVIEW** (čeka tvoj smoke + APPROVED)  
> **Git:** veliki **uncommitted** diff (~50+ fajlova) — **commit preporučen** prije sljedeće sesije

---

## 0. Pravilo gate-a (ne mijenjati bez korisnika)

| Status | Gate-ovi | Akcija agenta |
|--------|----------|---------------|
| **APPROVED** | #1–13, #15–#19 | Ne dirati osim regresije |
| **READY_FOR_REVIEW** | **#14**, **#20**, **#21** | **Ne prebacivati u APPROVED** dok korisnik eksplicitno ne potvrdi |
| **Sljedeći red** | **#20 APPROVED** → **#21** | #14 paralelno (frozen) |

---

## 1. Gate status (snapshot)

| # | Modul | Status | Napomena |
|---|-------|--------|----------|
| 1–13 | Vijesti → Članstvo | **APPROVED** | — |
| **14** | **Ulaznice** | **READY_FOR_REVIEW** | Frozen — samo regresija |
| 15–19 | Kontakt → Korisnici + Role | **APPROVED** | — |
| **20** | **Postavke** | **READY_FOR_REVIEW** | ← **čeka tvoj APPROVED** |
| **21** | Dashboard / Audit / Notifikacije | **READY_FOR_REVIEW** | Tek nakon #20 |

Log: [GATE_LOG.md](./GATE_LOG.md)

---

## 2. Analiza — šta je urađeno (kumulativno, ove sesije)

### A) Gate #20 — Postavke (core)

| Oblast | Šta |
|--------|-----|
| **UI** | `AdminPageShell`, scope tabovi **Javne / Privatne**, **tabovi po grupama** (Moduli, Identitet, Kontakt, SEO, Live, SMTP, Sistem) |
| **Moduli (16)** | `modules.*` + `feature.*`, ovisnosti (npr. Live → Takmičenja), BE validacija `400` |
| **RBAC** | `settings.read` / `settings.update`, read-only bez Sačuvaj |
| **Poliranje** | Spacing (`px-5 py-5`), sticky save bar, grb media picker padding |

### B) Gate #20 — potpuno gašenje modula (dorada)

| Oblast | Fajl |
|--------|------|
| `ModuleRoute` guard (javne + admin rute) | `components/common/ModuleRoute.tsx`, `App.tsx` |
| Javni endpoint flagova | `GET /settings/module-flags` |
| CMS + fallback nav filter | `PublicLayout.tsx`, `route-module-map.ts` |
| Admin nav filter | `AdminLayout.tsx` + `admin-module-map.ts` |

**Primjer:** isključi Muzej → nestaje iz menija, `/muzej` → `/`, `/admin/museum` → redirect na `/admin/heritage?tab=museum`

### C) Admin sidebar + hub merge (plan admin_nav_dark_club)

| Oblast | Šta |
|--------|-----|
| **Grupisani sidebar** | 8 grupa, collapsible, auto-expand aktivne grupe |
| **Baština hub** | `/admin/heritage` — tabovi HoF \| Muzej |
| **Komunikacija hub** | `/admin/comms` — tabovi Kontakt \| Newsletter |
| **Redirecti** | `/admin/hall-of-fame`, `/museum`, `/contact`, `/newsletter` → hub + `?tab=` |
| **i18n** | `admin.navGroup.*`, `admin.heritage`, `admin.comms` |

Ključni fajlovi: `admin-nav-groups.ts`, `AdminSidebarNav.tsx`, `HeritageAdminPage.tsx`, `CommsAdminPage.tsx`

### D) Dark tema — hero poliranje

| Oblast | Šta |
|--------|-----|
| CSS varijable | `--hero-radial-accent`, `--hero-orb-color`, tamniji `--gradient-page-hero` u dark |
| `PublicHeroShell` | Theme-aware radial + orb |
| CMS hero | `dark:to-accent/25` na foto overlayu |
| Admin tokeni | `border-[var(--border-subtle)]` u layoutu, shellu, settings, tablicama |

### E) Javna stranica kluba (`/klub/:slug`)

| Oblast | Šta |
|--------|-----|
| **Uklonjeno** | Posljednja postava (`LastMatchLineupSection`, BE `lastMatch`) |
| **Novo** | `ClubCompetitionTabs` — **Posljednje kolo** (sve utakmice kola, highlight kluba) + **Tabela** (`LeagueStandingsTable`) |
| **Uvjet** | Prikaz samo kad je `modules.competitions` uključen i postoji aktivna sezona |

---

## 3. Šta čeka APPROVED (od tebe)

### #20 Postavke — smoke checklist

**Postavke**
- [ ] `/admin/settings` — scope Javne/Privatne + tabovi po grupama
- [ ] Moduli — 14 javnih + 2 privatna switcha, ovisnosti (Takmičenja ↔ Live)
- [ ] Sačuvaj + refresh (npr. Slogan kluba)
- [ ] Grb — media picker, spacing OK
- [ ] Read-only admin — polja disabled, nema Sačuvaj
- [ ] Writer nema pristup Postavkama

**Modul guard (ključno)**
- [ ] Isključi **Muzej** → nestaje iz menija, `/muzej` redirect, admin nedostupan
- [ ] Isključi **Takmičenja** → Live disabled u postavkama + hint
- [ ] CMS meni filtrira ugašene module

**Admin sidebar (nova sesija)**
- [ ] Grupe expand/collapse (desktop + mobile sheet)
- [ ] `/admin/heritage` — tabovi HoF/Muzej, RBAC po tabu
- [ ] `/admin/comms` — tabovi Kontakt/Newsletter
- [ ] Stari URL-ovi redirectaju (`/admin/museum` → heritage)

**Dark tema**
- [ ] Hero na `/klub/:slug`, `/vijesti`, home — nema previše svijetlog wash-a u dark

**Javna stranica kluba**
- [ ] Tab Posljednje kolo — sve utakmice zadnjeg kola, highlight našeg kluba
- [ ] Tab Tabela — ukupna liga tabela
- [ ] Sekcija skrivena kad je competitions modul ugašen

### #14 Ulaznice (paralelno, frozen)
- Ne mijenjati kod; možeš odvojeno reći **APPROVED** kad smoke prođe

### #21 Dashboard / Audit / Notifikacije
- **Ne dirati** dok #20 nije APPROVED

---

## 4. Šta je ostalo otvoreno (nije blocker za #20)

| Tema | Status |
|------|--------|
| Dodatne ovisnosti modula (Newsletter → Vijesti?) | Ideja — dogovoriti mapu |
| Audit na `settings.update` | Nije implementirano |
| Realtime `settings:changed` na public layoutu | BE emit postoji, FE listener nema |
| E2E module dependency | Nema |
| `smtp.port` / `upload.maxSizeMb` kao number input | Još text |
| Spajanje Vijesti+Galerija, Sponzori+Trofeji u hubove | Odloženo (samo grupisano u sidebaru) |

---

## 5. Šta je dalje (redoslijed)

```
1. Ti: smoke #20 → reci APPROVED
2. Agent: #21 Dashboard / Audit / Notifikacije (READY_FOR_REVIEW → polish → čeka APPROVED)
3. Paralelno: ti možeš APPROVED #14 Ulaznice
4. Commit velikog diffa (preporuka prije #21)
5. Deploy: docker compose build frontend backend && docker compose up -d
```

---

## 6. Build / deploy

```bash
cd frontend && npm run build   # ✅ zadnji run OK
cd backend && npm run build    # ✅ zadnji run OK

# Prod refresh:
docker compose build frontend backend && docker compose up -d
```

---

## 7. Ključni fajlovi (brzi pregled)

| Oblast | Putanja |
|--------|---------|
| Postavke UI | `frontend/src/pages/admin/SettingsPage.tsx` |
| Moduli + guard | `module-definitions.ts`, `ModuleRoute.tsx`, `route-module-map.ts` |
| module-flags API | `backend/src/settings/settings.controller.ts` |
| Admin sidebar | `admin-nav-groups.ts`, `AdminSidebarNav.tsx` |
| Heritage / Comms hub | `HeritageAdminPage.tsx`, `CommsAdminPage.tsx` |
| Dark hero | `frontend/src/index.css`, `PublicHeroShell.tsx` |
| Klub public | `ClubPublicPage.tsx`, `ClubCompetitionTabs.tsx` |
| Matrica | `.cursor/docs/matrices/admin_ops/MATRIX.md` |

---

## 8. Uncommitted diff

~52 modified + ~25 novih fajlova. Glavne oblasti:

- #16–#19 (Kontakt, Newsletter, HoF, Muzej, Korisnici+Role) — APPROVED, u diffu
- #20 Postavke — moduli, UI, guard, module-flags
- Admin sidebar grupe + heritage/comms hubovi
- Dark hero + admin border tokeni
- Club public competition tabovi

```bash
git status && git diff --stat
```

---

## 9. Poznati blockeri

| Problem | Rješenje |
|---------|----------|
| Admin login 401 | `ADMIN_PASSWORD` u `.env` ≠ hash u DB → seed/reset |
| Novi `modules.*` u DB | `ensureDefaults()` na BE startu |
| FE/BE module defs sync | Oba `module-definitions.ts` + registry |

---

## 10. Prompt za sljedeću sesiju (copy-paste)

```
Nastavi Web Complete iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

#20 Postavke je READY_FOR_REVIEW — ja sam uradio smoke [ili: nađi i popravi X].

Ako kažem APPROVED za #20 → prelazi na #21 Dashboard / Audit / Notifikacije.

NE mijenjaj gate status za #14 i #21 bez moje potvrde.
#1–#19 APPROVED — samo regresija ako pukne.
```
