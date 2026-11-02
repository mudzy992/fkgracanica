# AUDIT STATE — živi dnevnik

> Ažurira se u **svakom** commitu. Slijedi strukturu iz protokola.

## Meta

| Polje | Vrijednost |
|-------|------------|
| **Aktivna grana** | `arena/290a6f13-fkgracanica` |
| **Trenutna faza** | **CI-01 ZATVOREN** (2026-11-02) → sljedeći: **INF-01** (blokira Q-04/Q-05) |
| **Trenutni segment** | nijedan otvoren (CI-01 zatvoren, vidi AUDIT/segments/CI-01.md) |
| **Zadnji commit** | `9eb887c` fix(backend+ci): Socket generički… [CI-01] | |
| **Zadnji CI run** | ✅ **`41463437281` success** (2026-11-02, grana arena/290a6f13-fkgracanica, 2m32s; sva 3 joba: audit-gate, standards, build-test) — https://github.com/mudzy992/fkgracanica/actions/runs/41463437281 ; 9 prethodnih runova ❌ → popravljeno (tabela u segments/CI-01.md): `gh run list` prazan, `.github/` ne postoji (F-002 → Q-06, segment CI-01). Pushovi do CI-01 su BEZ CI-a i to je eksplicitno evidentirano (Q-06). |
| **check:all** | ne postoji kao `npm` skripta (Q-09); audit gate = `node scripts/audit/check-coverage.mjs` (lokalno; u CI-ju kao `audit-gate` job tek nakon CI-01) |

## Šta je urađeno (hronološki)

### Sesija TLS (prethodno, commiti `09a292e`, `b0376a5` — pushani)
- F-SSL-1: audit korištenja Redis-a (BullMQ email red + keš; opciono preko `REDIS_URL`).
- F-SSL-2: TLS envs + mountovi u `docker-compose.yml`, `.env.example` (D-001).
- F-SSL-3: ispravka `self-signed certificate in certificate chain` — eksplicitni
  `REDIS_TLS_CA` → `tls.ca` (helper `common/utils/redis-tls.util.ts`), hardcode
  `NODE_EXTRA_CERTS`/`REDIS_TLS_CA` u compose; commit `b0376a5`.
- Napomena: workspace je bio re-clone-an (lokal pao na `b7f1d3d`) → poravnan sa remote
  (`git reset FETCH_HEAD`), sadržaj identičan.

### Sesija AUDIT (FAZA 0 + FAZA 1) — 2026-11-02
- F-000: Potvrđena aktivna grana `arena/290a6f13-fkgracanica` @ `b0376a5`.
- FAZA 0: pročitana sva dostupna dokumentacija (README, plan, docs/, .cursor aggregates,
  mobile smoke, scripts), mapiran stack po slojevima → `AUDIT/00_PROJECT_UNDERSTANDING.md`
  (Q-01…Q-08).
- FAZA 1: brzi docs-vs-reality audit → `AUDIT/01_DOCS_VS_REALITY.md` (21 tvrdnja + nalazi
  **F-001…F-016**; kritično: **F-001 tajne u repu**).
- FAZA 1 penzionisanje: 10 fajlova → `docs/_retired/` (+ baneri + `INDEX.md`) — D-003.
  Odgođeno uz pitanja: root README (Q-01), `.cursor/plans` (Q-02), smoke checkliste (Q-03).
- Nova dokumentacija (izvor istine): `docs/{ARCHITECTURE,INFRASTRUCTURE,BACKEND,FRONTEND,MOBILE,TESTING,CI,CONVENTIONS,DECISIONS}.md`; linkovi u root `README.md` ažurirani.
- Napomena: `.env.example` i dalje sadrži F-001 lozinku — **ne diram** dok ne stigne Q-04.
- Commit `583214a` pushan; `gh run list` → prazno (nema CI-ja). Lokalne provjere:
  eslint čist na TS izmjenama iz prethodne sesije; YAML compose validiran; `check:all`
  ne postoji (FAZA 3).

### Sesija AUDIT (FAZA 2 + FAZA 3) — 2026-11-02
- **KAPIJA 1 odobrena** od korisnika ("Imaš moje odobrenje KAPIJE 1") — Q-01…Q-08 i dalje
  otvoreni (blokiraju INF-01/02/03, CI-01 start po Q-06).
- **FAZA 2**: `AUDIT/02_MASTER_AUDIT_PLAN.md` — 26 segmenata po slojevima (CI, INF, BE, FE,
  MOB, E2E), redoslijed s obrazloženjem, tačni kriterijumi završetka (npr. CI-01 = 15
  koraka; pragovi pokrivenosti baseline-first), rizici R-1…R-10, pitanja Q-09 (alati) +
  Q-10 (pristup produkciji), preporuka alata s alternativama.
- **FAZA 3**:
  - `scripts/audit/inventory.mjs` — inventar izvornih fajlova (eksplicitni izuzeci s
    razlogom), regenerira `AUDIT/COVERAGE_MATRIX.csv` čuvajući statuse;
  - `AUDIT/COVERAGE_MATRIX.csv` — **1277 fajlova** (backend 349, frontend 623, mobile 292,
    scripts 11, infra 2); svi `nepregledano`;
  - `scripts/audit/check-coverage.mjs` — gate: R1 fajl van matrice, R2 zastario red,
    R3 `ZATVOREN` segment s nepregledanim fajlom, R4 loš status/dupli red; poruke u formatu
    KOJE/GDJE/ZAŠTO/KAKO + exit 1;
  - **verifikacija**: test R1 (novi fajl van matrice) → exit 1 ✓; test R3 (zatvoren
    segment s `nepregledano`) → exit 1 ✓; čisto stanje → exit 0 ✓;
  - workflow matrice + segmenata dodan u `docs/CONVENTIONS.md`.
- Push bez CI-ja (Q-06); `gh run list` i dalje prazan (F-002).

### SEGMENT CI-01 — 2026-11-02 (ZATVOREN ✅)
- KAPIJA 2 odobrena ("Odobravam") → Q-06 ✔, Q-09 ✔ (alati §4), Q-10 ✔ (u principu).
- F-015: `npm ci` exit 0 (lock regenerisan + usklađen).
- F-016/dual-core: `@tiptap/*@3.28.0` overrides + exact pin (frontend/mobile) — `npm ls` 0 invalid.
- **F-017 (novi):** frontend build je bio pokvaren (`tsc -b` padao na ChainedCommands tipovima
  zbog dual @tiptap/core) — riješeno istim fixom; `npm run build -w frontend` = 0.
- **F-018 (novi):** oxlint 6 errors (uslovni hookovi u 3 admin stranice, EntitySelect,
  use-live-admin `phaseMutation`) — fixano; 0 errors.
- CI-01 artefakti: `.github/workflows/ci.yml` (audit-gate, standards, build-test;
  push na arena granu + workflow_dispatch; BEZ pull_request okidača), `scripts/standards/`
  (check:all 6/6), `.githooks/pre-push` + hooksPath, `docs/CI.md` ažuriran + badge.
- Lokalno zeleno: npm ci, check:all 6/6, frontend build, frontend lint.
- ⚠️ backend build/test/eslint + prisma generate **nije moguće lokalno** (binaries.prisma.sh
  blokran) → verifikacija preko CI-a.
- **KRAJ: 9 runova ❌ → popravljeno → run `41463437281` ✅ ZELEN** (sva 3 joba).
  Nalazi riješeni: F-015 ✓, F-016 dual-core ✓, **F-017** (FE build pokvaren — dual tiptap
  tipovi) ✓, **F-018** (6 oxlint rules-of-hooks) ✓, + eslint debt (prettier 212 fajlova,
  17 type-aware grešaka, zastarijeli newsInclude asert, unused importi).
  Segment dokument: `AUDIT/segments/CI-01.md` (Status segmenta: ZATVOREN).

## Šta je sljedeće (tačan sljedeći korak)

1. **INF-01** (compose/env audit) — ali INF-02 (tajne) čeka **Q-04**, INF-01/03 čekaju **Q-05**
   → zamoliti korisnika za Q-04/Q-05 prije nego krene INF.
2. Bez blokatora dalje: **BE-01** (error model/config/logging temelj) → BE-02…08 → FE → MOB.
3. Svaki segment: `AUDIT/segments/<ID>.md` + matrica + zelen CI (sada postoji!) + izvještaj.

## Otvorena pitanja za korisnika (BLOKATORI)

- **Q-01** root README: zadržati (ažuriran) ili penzionisati?
- **Q-02** `.cursor/plans/**` penzionisati? (preporuka: DA; matrice/`rules` ostaju)
- **Q-03** mobile smoke checkliste: žive? (preporuka: da, zadržati)
- **Q-04** ⚠️ **F-001**: `Mojalozinka!1` u `.env.example` + docs — stvarna lozinka? (rotacija + čišćenje historije ako da)
- **Q-05** koji compose je produkcijski izvor istine (Coolify vs Traefik)? (preporuka: Coolify)
- **Q-06** ✔ ODGOVORENO (KAPIJA 2): CI-01 prvi; raniji pushovi bez CI-a evidentirani.
- **Q-07** saglasnost produkcione baze sa jedinom `init_postgres` migracijom?
- **Q-08** tačan runtime host u `DATABASE_URL` za verify-full (interno ime vs javni)?
- **Q-09** ✔ ODGOVORENO (KAPIJA 2): alati iz §4 odobreni (instalacija ide u FE/MOB segmente).
- **Q-10** ✔ ODGOVORENO u principu (KAPIJA 2); detalji (pristup/backup) potvrđuju se kad segment zatreba (INF/BE).
