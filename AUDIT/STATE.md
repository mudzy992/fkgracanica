# AUDIT STATE — živi dnevnik

> Ažurira se u **svakom** commitu. Slijedi strukturu iz protokola.

## Meta

| Polje | Vrijednost |
|-------|------------|
| **Aktivna grana** | `arena/290a6f13-fkgracanica` |
| **Trenutna faza** | CI-01 ✔ → **INF-01 ✔ ZATVOREN** → sljedeći: **INF-02** (.env.example čišćenje po D-004) |
| **Trenutni segment** | **INF-01 zatvoren 2026-11-02**; sljedeći segment **INF-02** |
| **Zadnji commit** | `2280928` docs(audit): INF-01 ZATVOREN — segment, matrica, STATE [INF-01] | |
| **Zadnji CI run** | ✅ **`41485825537` success** (`7c4fb5f`+`2a93534`, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41485825537 ; prije toga `41483596127` ✅ (`9a7fbc2`) i `41483038067` ❌ → secrets-ban allowlist (D-004 dokaz). CI-01 historija: 9 ❌ → `41463437281` ✅ → `41464319145` ✅ (tabela u segments/CI-01.md). |
| **check:all** | `npm run check:all` → **6/6** (check-coverage, file-size, console-ban, secrets-ban, layer-deps, docs-links); u CI-ju jobovi `audit-gate` + `standards`; pre-push hook pokreće `check:all` |

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

### SEGMENT INF-01 — 2026-11-02 (ZATVOREN ✅)

- Q-04 ✔ (D-004: `Mojalozinka!1` nije stvarna lozinka → bez rotacije/rewrite) i Q-05 ✔
  (D-005: samo Coolify, Traefik ne postoji) → segment odblokiran.
- I-01-01: `docker-compose1.yaml` penzionisan u `docs/_retired/` (banner + INDEX +
  INFRASTRUCTURE + inventory referenca).
- Odobrenje korisnika **„Može, odobravam sve"** (2026-11-02) → primijenjeno:
  - I-01-08: `frontend/Dockerfile` → `RUN npm ci` bez `--package-lock-only` (`7c4fb5f`);
  - I-01-02: frontend runner `USER node` — provjeren og-server: read-only, port 3000 (`7c4fb5f`);
  - I-01-03: `logging: json-file 10m×3` na backend + frontend (`2a93534`);
  - I-01-04: `security_opt: no-new-privileges:true` na oba servisa (`2a93534`);
  - I-01-05 (`condition: service_healthy`): odgođeno — preporuka DEFER prihvaćena
    (HEALTHCHECK alat u backend slici nije garantovan → rizik blokade starta frontenda).
- Prvi push segmenta ❌ `41483038067` (secrets-ban na D-004 dokazu u DECISIONS.md) →
  allowlist poprava `9a7fbc2` → ✅ `41483596127` → hardening → ✅ `41485825537`.
- Lokalno: `check:all` 6/6, compose YAML validan, matrica 1284 fajla (INF-01: 3 reda).
- Segment dokument: `AUDIT/segments/INF-01.md` (Status segmenta: ZATVOREN).

## Šta je sljedeće (tačan sljedeći korak)

1. **INF-02** — čišćenje `.env.example` po **D-004** (ukloniti F-001 lozinku → novi
   placeholder) + ukloniti `AUDIT/`/`.env.example` allowlist stavku za tu tajnu u
   `scripts/standards/secrets-ban.mjs` (sad se smije dirati: Q-04 odgovoren).
2. Zatim **BE-01** (error model/config/logging temelj) → BE-02…08 → FE → MOB → CI-02/03/04 → E2E-01.
3. Svaki segment: `AUDIT/segments/<ID>.md` + matrica + zelen CI + izvještaj (standard iz CI-01/INF-01).

## Otvorena pitanja za korisnika (BLOKATORI)

- **Q-01** root README: zadržati (ažuriran) ili penzionisati?
- **Q-02** `.cursor/plans/**` penzionisati? (preporuka: DA; matrice/`rules` ostaju)
- **Q-03** mobile smoke checkliste: žive? (preporuka: da, zadržati)
- **Q-04** ✔ ODGOVORENO (D-004): **nije stvarna lozinka** → bez rotacije/rewrite; čišćenje `.env.example` u **INF-02**
- **Q-05** ✔ ODGOVORENO (D-005): **Coolify; Traefik ne postoji** → `docker-compose1.yaml` penzionisan (INF-01)
- **Q-06** ✔ ODGOVORENO (KAPIJA 2): CI-01 prvi; raniji pushovi bez CI-a evidentirani.
- **Q-07** saglasnost produkcione baze sa jedinom `init_postgres` migracijom?
- **Q-08** tačan runtime host u `DATABASE_URL` za verify-full (interno ime vs javni)?
- **Q-09** ✔ ODGOVORENO (KAPIJA 2): alati iz §4 odobreni (instalacija ide u FE/MOB segmente).
- **Q-10** ✔ ODGOVORENO u principu (KAPIJA 2); detalji (pristup/backup) potvrđuju se kad segment zatreba (INF/BE).
