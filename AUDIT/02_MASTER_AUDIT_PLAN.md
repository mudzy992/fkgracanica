# FAZA 2 — Master audit plan

> Kreirano: 2026-11-02 · Grana: `arena/290a6f13-fkgracanica` · Status: **čeka KAPIJA 2**
> Ovaj dokument je projektni zadatak audita. Svaki segment = jedna fokusirana sesija.
> Segmenti se vode u `AUDIT/segments/<ID>.md` (šablon iz protokola, FAZA 4).

---

## 1. Ciljevi i mjerljivi kriteriji "gotovo"

| Sloj | Kriteriji gotovo (mjerljivo) |
|------|------------------------------|
| **CI** | `scripts/standards/check:all` zelen na svakom pushu; workflow filter = aktivna grana; `workflow_dispatch` sa odabirom suite-a; audit-gate job (`check-coverage`) obavezan; coverage artefakti + `GITHUB_STEP_SUMMARY`; badge u `docs/CI.md`; **stvarno provjereni runovi** (link u STATE.md), 0 crvenih |
| **INFRA** | `docker compose config` validan; healthcheck na **svakom** servisu; resource limiti definisani; slike pinovane (digest) gdje je izvodljivo; `gitleaks`/secret scan čist (F-001 riješen po Q-04); backup/restore runbook **testiran jednom** (dokaz u segmentu); sve env varijable dokumentovane i u `.env.example` usklađene sa compose-om |
| **BACKEND** | `tsc --noEmit` + eslint čist; coverage prag **postavljen kao baseline pa ≥55%** i diže se **+5pp po segmentu**; svaki endpoint: validacija + authN/authZ pravilo + test (guardrail skripta); konzistentan error model (jedan format odgovora na grešku); env validacija pri startu (fail-fast); rate-limiting odluka implementirana (F-004); **0 nalaza Critical/High** otvoreno u segmentima |
| **FRONTEND** | vitest + Testing Library coverage **≥50%, cilj ≥70%**; `token-check` (0 hardkodiranih boja/razmaci van tokena); axe: **0 critical/serious** grešaka na javnim i ključnim admin stranicama; Playwright: kritični tokovi zeleni; bundle budget zabilježen i bez regresije (>+5%); oxlint + `tsc` čist |
| **MOBILE** | unit coverage **≥40%** za `src/` logiku; Maestro E2E: ≥8 kritičnih tokova (gost browse → login → član ulaznice/QR → staff novi → staff validate → logout) zelenih u CI-ju; build reproducibilan (`eas build` profil dokumentovan); **0 nalaza Critical/High** otvoreno |
| **E2E (završni)** | Svi kritični tokovi (web Playwright + mobile Maestro) zeleni u istom pipeline-u; coverage gate zelen; docs-vs-reality re-provjera (nova tabela u segmentu) bez novih kontradikcija |

---

## 2. Segmenti

### 2.1 Spisak segmenata

| ID | Segment | Opseg (ulazni fajlovi / moduli) | Rizik | Zavisnosti |
|----|---------|----------------------------------|-------|------------|
| **CI-01** | CI skelet: static jobovi + audit gate | novi `.github/workflows/ci.yml`, `scripts/standards/check:all` (prva verzija), `docs/CI.md`; **prvi korak: F-015 (root lock sync)** | Medium — prvi CI uvijek nosi krpanje; lock regeneracija mijenja `package-lock.json` | **Q-06** (odobrenje rada bez CI-a do ovog segmenta); F-015 |
| **CI-02** | Backend testovi u CI | `ci.yml` (job: postgres + redis servisi, seed, health-wait, `npm test` + `test:e2e`, coverage) | Medium — e2e ovisi o servisima; flaky rizik | CI-01, BE-01 (barem env validacija) |
| **CI-03** | Frontend jobovi u CI | `ci.yml` (lint, tsc, vitest, build + bundle check) | Low | CI-01, FE-02 |
| **CI-04** | Mobile build + E2E u CI (završni job) | `ci.yml` (Android emulator, Maestro, `needs: svi prethodni jobovi`) | High — emulator stabilnost, trajanje | CI-01, MOB-01, MOB-05(E2E tokovi) |
| **INF-01** | Compose hardening | `docker-compose.yml`, (po odluci Q-05: `docker-compose1.yaml`), Dockerfajlovi | Low — konfiguracija, ali **vidljivo ponašanje ako compose pukne** → svaka izmjena compose-a se prijavljuje | **Q-05** |
| **INF-02** | Tajne i higijena repozitorija (F-001) | `.env.example`, docs, git historija, `scripts/rotate-secrets.sh`, pre-commit secret scan | **Critical postupak** — historija rewrite = force-push | **Q-04** (blokator) |
| **INF-03** | Backup/restore + observability baseline | `docs/INFRASTRUCTURE.md` (dopuna), runbook skripta, logging konvencija | Medium — ne može se testirati bez pristupa serveru | Q-05, Q-08 |
| **BE-01** | Backend fundamenti | `main.ts`, `common/` (filters/guards), `prisma.service.ts`, novi config modul; odluke: throttler (F-004), globalni guard (F-014) | **High — dira cross-cutting ponašanje** (error format = API ugovor) → bilo kakva vidljiva promjena traži odobrenje (pravilo 1) | KAPIJA 2; odluke o throttler/guard formatu |
| **BE-02** | Auth + RBAC + users | `auth/`, `rbac/`, `users/` (12+ fajla, 3+ spec) | High — sigurnost | BE-01 |
| **BE-03** | Settings + audit + notifikacije | `settings/`, `audit/`, `notifications/`, `email-log/` | Medium | BE-01 |
| **BE-04** | CMS + vijesti + galerija + media/upload | `cms/`, `news/`, `gallery/`, `media/`, `upload/` (veliki segment) | Medium | BE-01 |
| **BE-05** | Takmičenja | `clubs/`, `players/`, `competitions/`, `rounds/`, `matches/`, `statistics/`, `analytics/`, `public-analytics/` | Medium — poslovna logika statistike | BE-01 |
| **BE-06** | Live + realtime + newsletter/kontakt | `live/`, `realtime/`, `newsletter/`, `contact/`, `jobs/`, `cache/` | Medium — konkurentnost (socket, queue) | BE-01, REDIS okruženje |
| **BE-07** | Članstvo + ulaznice + plaćanja | `membership/`, `ticketing/`, `payments/`, `finance/` | **High — novac i QR** | BE-01, BE-02 |
| **BE-08** | Ostalo: showcase, SEO, pretraga, dashboard, app-releases, health | `showcase/`, `seo/`, `search/`, `dashboard/`, `app-releases/`, `health/`, `museum/`, `hall-of-fame/`, `club-timeline/`, `trophies/`, `sponsors/` | Low | BE-01 |
| **FE-01** | Design tokeni + tema + `token-check` | `index.css`, `styles/`, `lib/theme.tsx`, nova `scripts/standards/token-check.*` | Medium — dira vizuelni sloj svih stranica (vidljivo!) → kozmetika samo uz dozvolu | KAPIJA 2 (za bilo kakvu vidljivu promjenu) |
| **FE-02** | Frontend test infra | `frontend/package.json` (vitest + @testing-library/react — **novi deps, obrazloženje §4**), prvi testovi | Low | KAPIJA 2 (odobrenje zavisnosti) |
| **FE-03** | Javni portal — audit stranica | `pages/public/**`, `pages/home/**` | Medium | FE-01 (tokeni), FE-02 (testovi) |
| **FE-04** | Admin dashboard — audit i ispravke | `pages/admin/**` (147 fajlova) — možda 2 sesije: FE-04a hub/tabele, FE-04b forme | Medium | FE-02 |
| **FE-05** | Admin dashboard — redizajn | `pages/admin/**` + komponente — **UNUTRAŠNJA KAPIJA: IA struktura + wireframe opis → odobrenje prije implementacije** | **High — vidljivo ponašanje** | FE-04, odobrenje IA |
| **FE-06** | Playwright E2E + axe + bundle budget | `frontend/e2e/**`, `ci.yml`, budget konfiguracija | Medium | FE-02, FE-03 |
| **MOB-01** | Mobilni fundamenti + test infra | `mobile/package.json` (jest-expo/RNTL — **novi deps §4**), navigacija, login flow | Medium | KAPIJA 2 (deps) |
| **MOB-02** | Javni ekrani (audit + paritet) | `app/**` javni, `src/features/**` | Medium | MOB-01 |
| **MOB-03** | Član flow | `membership*`, `tickets*`, `notifications*`, QR | Medium | MOB-01 |
| **MOB-04** | Staff flow | `app/staff/**`, hub | Medium | MOB-01 |
| **E2E-01** | Završni cross-klijentski gate | Playwright + Maestro suite, docs re-provjera | Medium | **svi** prethodni + CI-04 |

> Ako segment naraste preko jedne sesije — dijeli se na `-a`/`-b` podsegmente (npr. FE-04),
> nikad se ne gura cijeli sloj u jednu sesiju (pravilo 5).

### 2.2 Definition of Done (zajednički za svaki segment)

- [ ] `AUDIT/segments/<ID>.md` kreiran po šablonu (FAZA 4) — opseg, inventar, nalazi, plan, izmjene, testovi, verifikacija
- [ ] Svi nalazi ozbiljnosti Critical/High riješeni ili eksplicitno prijavljeni s odlukom
- [ ] Ako segment mijenja **vidljivo ponašanje** (API ugovor, šema, UX) → eksplicitna dozvola dobijena prije implementacije
- [ ] Lokalna verifikacija: `check:all` + relevantni testovi zeleni
- [ ] Commit(ici) Conventional + **zelen CI** (od CI-01 nadalje; run link u STATE.md)
- [ ] `AUDIT/STATE.md` ažuriran; `AUDIT/COVERAGE_MATRIX.csv` ažuriran (statusi fajlova)
- [ ] `Status segmenta: ZATVOREN` u segment dokumentu (machine-readable marker za `check-coverage`)
- [ ] Kratak izvještaj korisniku (format iz protokola)

---

## 3. Redoslijed izvršavanja i obrazloženje

```
CI-01 → INF-01 → INF-02(*) → BE-01 → BE-02…BE-08 → FE-01 → FE-02 → FE-03 → FE-04
      → INF-03( paralelno kad zatreba )                    ↓
                            FE-06 ← FE-05(*) → MOB-01…MOB-04 → CI-02/03 (kad suite postoji)
                                                          ↓
                              CI-04 → E2E-01 (završni korak)
```

Zašto ovim redom:
1. **CI-01 prvi** — bez zelene CI osnove nema pouzdane evidencije ni za jedan kasniji segment (pravilo 3); ujedno rješava F-015 (lock) kao preduslov.
2. **INF rano** — compose/env/TLS su temelj; BE segmenti pišu kod koji se deploya u taj okvir. INF-02 (tajne) čeka Q-04.
3. **BE-01 prvi među BE** — cross-cutting (error model, config, logging) mora postojati prije modula da se ne piše dvaput.
4. **FE nakon BE** — API je izvor istine; FE-01 (tokeni) prije FE audita da se ne popravlja dvaput.
5. **MOB nakon FE** — dijeli koncepte (tokeni/i18n), a mobile je "kruna" — zadnji sloj.
6. **CI-02/03/04** — dodaju se **kad test suite postoji** (ne prije, da ne pišemo jobove za nepostojeće testove); CI-04 je uvek među zadnjima jer je najsporiji.
7. **E2E-01 posljednji** — zavisi od svega gore; ujedno re-validira dokumentaciju (FAZA 1 tabelu).

(*) INF-02 i FE-05 imaju vlastite kapije — čekaju odgovor/odobrenje, ne blokiraju ostatak reda osim gdje je navedeno u zavisnostima.

---

## 4. Standardi i alati po sloju (sa obrazloženjem i alternativama)

> **Sve dolje je PRIJEDLOG koji traži odobrenje na KAPIJI 2** (pravilo 7 — nove zavisnosti
> moraju imati obrazloženje). Bez odobrenja: ništa se ne instalira.

### Zajednički (scripts/standards/ — zero novih npm zavisnosti)

| Alat | Šta radi | Zašto | Alternativa |
|------|----------|-------|-------------|
| `check:all` (bash/node) | pokreće sve provjere ispod | jedna komanda, lokalno + CI | task runner (npm-run-all) — suvišno |
| `file-size` provjera | ≤200 linija (config ≤400) — `.cursorrules` hard limit | već postoji pravilo, niko ga ne provjerava | ESLint `max-lines-per-function` (ne pokriva cijeli fajl) |
| `console-ban` | zabrana `console.log` u src (izuzeci: logging sloj, scripts) | debug ostaci u produkciji | ESLint `no-console` (postoji, ali provjera svih slojeva odjednom je brža) |
| `secrets-ban` | regex provjera tajni u trackanim fajlovima (uz `gitleaks` u CI) | F-001 se ne smije ponoviti | trufflehog (teži, binarka) — **gitleaks preporuka** (brz, akcija postoji) |
| `layer-deps` | backend ne smije importati frontend/mobile i obrnuto; ciklički importi | arhitekturna pravila | dependency-cruiser (nova zavisnost, moćniji) — prvo custom, alat kasnije ako zatreba |
| `docs-links` | provjera da linkovi u docs/ ne vode na penzionisano/mrtvo | F-001 klasa grešaka | markdown-link-check (npm dep) |
| `check-coverage` | **već napisano** (FAZA 3) — matrica | pravilo 4 | — |

Lokalni hookovi: **`git config core.hooksPath .githooks`** (zero-dep skripte u `.githooks/`,
isti sadržaj kao CI) — alternativa husky+lint-staged (nova zavisnost + konfiguracija) —
preporuka: **zero-dep**; husky samo ako kasnije pokaže potrebu.

### Backend

| Alat | Status | Obrazloženje / alternativa |
|------|--------|----------------------------|
| eslint + prettier | **postoji** | zadržati; samo proširiti `check:all` |
| `tsc --noEmit` | **postoji** (tipovi) | obavezno u CI-ju |
| jest + coverage prag | **postoji** | prag = baseline-first (§1); alternativa isti je alat |
| `gitleaks` | novi (CI binarka) | brz, standard; alternativa trufflehog |
| `npm audit --audit-level=high` | novi (CI korak) | besplatan; alternativa Snyk/Dependabot (Dependabot **preporučuje se** kao dodatak — GitHub native) |
| OpenAPI export + diff | novi (mali script) | Swagger postoji; generisanje fajla + provjera da je ažuran sprječava drift |

### Frontend

| Alat | Status | Obrazloženje / alternativa |
|------|--------|----------------------------|
| oxlint | **postoji** | zadržati (brz); alternativa ESLint (teži, duplira) |
| **vitest + @testing-library/react** | **NOVI deps** | Vite-native (isto kao build), brz, DX; alternativa jest (sporiji setup s Vite-om), node:test (previše sirovo za React) |
| **Playwright** | **NOVI dep** | najbolji E2E (trace, auto-wait, multiple browsers); alternativa Cypress (teži, plaćeni parallel) |
| **@axe-core/playwright** | **NOVI dep** | WCAG provjera u E2E-u; alternativa pa11y (vanjski alat) |
| bundle budget | novi mali script (`vite build` + provjera veličine) | alternativa size-limit (deps + konfiguracija) — **prvo custom script** |

### Mobile

| Alat | Status | Obrazloženje / alternativa |
|------|--------|----------------------------|
| **jest-expo + @testing-library/react-native** | **NOVI deps** | standardni Expo stack, poklapa se sa Expo 57; alternativa jest bez preseta (krhko) |
| **Maestro** | **novi alat (CI binarka)** | YAML flowovi, stabilan na emulatoru, brz setup; alternativa **Detox** (dublja integracija ali teži održavati, poznati flaky), Appium (sporiji, više održavanja). **Preporuka: Maestro.** |
| Android emulator u CI | ubuntu-latest + KVM | jeftino i dovoljno za RN; alternativa macOS runner (skuplje, iOS opravdano samo ako bude iOS E2E-a) |

### Coverage pragovi (sažetak)

- Backend: baseline u CI-01 → **≥55%** → **+5pp po BE segmentu** (cap 80%).
- Frontend: baseline u FE-02 → **≥50%** → **+5pp po FE segmentu** (cilj ≥70%).
- Mobile: **≥40%** unit (src/ logika) + Maestro flow coverage (definiran u MOB-01).
- Pragovi su u konfiguraciji (jest/vitest), izuzeci eksplicitni i komentarisani.

---

## 5. Rizici

| ID | Rizik | Utjecaj | Mitigacija |
|----|-------|---------|------------|
| R-1 | **F-015** — root lock neusklađen | CI-01 ne može proći | Regeneracija locka = prvi korak CI-01 (mijenja `package-lock.json` — evidentira se u segmentu) |
| R-2 | **F-001** — ako je lozinka stvarna, čišćenje historije = **rewrite historije** | sve grane/forkovi, force-push | Samo uz Q-04 odobrenje; FORCE-PUSH SAMO uz eksplicitno odobrenje (pravilo) |
| R-3 | Nema pristupa produkciji iz okruženja | Q-07/Q-08 neodgovoreni; verifikacija limitirana na lokalno + CI | Korisnik odgovara; segmenti koji traže prod podatke to navode kao blokator |
| R-4 | BE-01 mijenja error model = API ugovor | klijenti (web/mobile) mogu puknuti | Pravilo 1: obrazloženje + odobrenje prije implementacije |
| R-5 | Nove zavisnosti (vitest, playwright, maestro, jest-expo) | težina, održavanje | Svaka u §4 s alternativom; odobrenje na KAPIJI 2 |
| R-6 | FE-05 admin redizajn | vidljiva promjena | Unutrašnja kapija: IA + wireframe → odobrenje |
| R-7 | Flaky testovi (socket/live, emulator) | povjerenje u CI | Politika: retry **samo** za infrastrukturu (1×), nikad za logiku; trace/video na failure |
| R-8 | `geoip-lite` traži Node ≥24 (imamo 22) | EBADENGINE upozorenja | U CI-ju odlučiti: podići Node na 24 u slikama (preporuka) ili prihvatiti warning |
| R-9 | Expo 57 tooling compat (jest-expo verzija) | MOB-01 | Pinovati tačne verzije koje odgovaraju Expo 57; provjeriti u MOB-01 prije svih ostalih MOB segmenata |
| R-10 | Segmenti preko jedne sesije (BE-04, FE-04) | gubitak fokusa | Obavezno `-a`/`-b` dijeljenje prije početka |

---

## 6. Otvorena pitanja (preuzeta iz KAPIJE 1 — i dalje otvorena)

| ID | Pitanje | Blokira |
|----|---------|---------|
| Q-01 | Root README: zadržati/penzionisati? | ništa hitno |
| Q-02 | `.cursor/plans/**` penzionisati? | čišćenje repo-a (može bilo kad) |
| Q-03 | Mobile smoke checkliste žive? | MOB segmenti (dokumentacija) |
| Q-04 | ⚠️ F-001 stvarna lozinka? | **INF-02** |
| Q-05 | Coolify vs Traefik compose? | **INF-01, INF-03** |
| Q-06 | CI-01 prvi + rad bez CI-a do tada | **CI-01** (odobrenje kretanja) |
| Q-07 | Produkciona baza vs `init_postgres` | BE segmenti s migracijama |
| Q-08 | Tačan runtime host za verify-full | INF-03, deployment provjere |
| Q-09 *(novo)* | Odobrenje alata/zavisnosti iz §4 (vitest, Playwright, axe, Maestro, jest-expo, gitleaks) | **FE-02, FE-06, MOB-01, CI-01** |
| Q-10 *(novo)* | Odobrenje pristupa: trebam li ikad potvrde s produkcije (health, migracije) od tebe, ili sve preko tebe? | plan verifikacije u segmentima |

---

## 7. Dokazi o stanju prije početka

- `AUDIT/00_PROJECT_UNDERSTANDING.md` — razumijevanje + Q-01…Q-08
- `AUDIT/01_DOCS_VS_REALITY.md` — 21 tvrdnja + F-001…F-016
- `AUDIT/COVERAGE_MATRIX.csv` — inventar svih izvornih fajlova (FAZA 3)
- `scripts/audit/inventory.mjs` + `scripts/audit/check-coverage.mjs` — dokaz o pokrivenosti
- `AUDIT/STATE.md` — dnevnik
