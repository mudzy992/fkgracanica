# AUDIT STATE — živi dnevnik

> Ažurira se u **svakom** commitu. Slijedi strukturu iz protokola.

## Meta

| Polje | Vrijednost |
|-------|------------|
| **Aktivna grana** | `arena/290a6f13-fkgracanica` |
| **Trenutna faza** | CI-01 ✔ INF-01 ✔ INF-02 ✔ BE-01…**BE-09 ✔** → **FE-01 ✅** → **FE-02 ✅** → **FE-03 ✅** (javni portal: DataError, i18n ključevi, lazy slike, SearchPage) → sljedeće: **FE-03b** ili **FE-04** (frontend test infra) |
| **Trenutni segment** | **FE-03 ✅ ZATVOREN** (error+retry na 10 stranica, i18n ključevi + test, 31 slika lazy, SearchPage sync, **XSS sanitizacija (dompurify)**, `noindex` za prijavu/plaćanje) ; **FE-02 ✅ ZATVOREN** (vitest + jsdom + testing-library, 34 testa u 9 fajlova, CI korak `frontend test (vitest)`) ; **FE-01 ✅ ZATVOREN** (tokeni u `@theme`, `token-check` u `check:all` 7/7, ratchet palete 417; P-FE01-7 `@custom-variant dark` i P-FE01-8 migracija palete čekaju odobrenje/FE-03-04) ; **BE-09c ✅ ZATVOREN** (12 nalaza: 11 odobrenih predloga implementirano, B-09c-11 → backlog; novi CI job `e2e` zelen 18/18); **BE-09a ✅, BE-09b ✅, BE-09c ✅** |
| **Zadnji commit** | `1b76eca` fix(frontend): sanitizacija CMS/news HTML-a (dompurify) i noindex za prijavu/placanje [FE-03] |
| **Zadnji CI run** | ✅ **`41666291342` success** (`docs(audit): status FE-01 i CI run-ID` — sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41666291342 ; ✅ **`41665768088` success** (`e9b46cb` — FE-01 tokeni + token-check, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41665768088 ; ✅ **`41663339512` success** (`0c04198` — run-ID dokumentacija, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41663339512 ; ✅ **`41662863623` success** (`9ca8abb` — zatvaranje BE-09 u dokumentaciji, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41662863623 ; ✅ **`41662277103` success** (`010ba4f` — e2e specovi usklađeni, **sva 4 joba** uključujući novi `e2e`) https://github.com/mudzy992/fkgracanica/actions/runs/41662277103 ; ❌ `41661451237` (`c53b46c` — e2e 2/18 testa pala (drift specova) + 1 eslint greška u `upload-quota.util.spec.ts`), ❌ `41660810750` (`f2b368f` — prvi run e2e joba: 2/18 pala) — oba popravljena ; ✅ **`41657925166` success** (`ef53cc2` — BE-09c audit + matrica, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41657925166 ; ✅ **`41655986522` success** (`7b8371e` — run-ID dokumentacija, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41655986522 ; ✅ **`41655487255` success** (`07f1085` — zatvaranje BE-09b u dokumentaciji, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41655487255 ; ✅ **`41654943345` success** (`212ec80` — BE-09b implementacija, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41654943345 ; ❌ `41654422296` (`3449470` — 3 eslint greške u novim specovima/DTO-u, popravljeno) ; ✅ **`41652033940` success** (`96f1833` — BE-09b nalazi/predlozi + matrica, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41652033940 ; ✅ **`41651332872` success** (`2ab4675` — zatvaranje BE-09a u dokumentaciji, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41651332872 ; ✅ **`41647575733` success** (`2591b39` — run-ID, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41647575733 ; ✅ **`41646963311` success** (`28fb5f2` — BE-09a docs/run-ID, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41646963311 ; ✅ **`41646330945` success** (`d1d261d` — BE-09a implementacija, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41646330945 ; ❌ `41644096377` (`3a78c94` — DI: PermissionsGuard tražio AuditService u controller specovima), ❌ `41644777234` (`b9d3bdf` — eslint unsafe-* u novim specovima), ❌ `41645566467` (`fd41c42` — matcher u users-account specu) — sve tri popravljeno; ranije ✅ **`41640408790` success** (`ff833ce` — BE-09a audit, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41640408790 ; ✅ **`41639946345` success** (`719423d` — zatvaranje BE-08, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41639946345 ; ✅ **`41638624709` success** (`86b3179` — BE-08 implementacija P-B08-1/2/3/4/5/7, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41638624709 ; ranije ✅ **`41634063555` success** (`ed4df65` — BE-08 audit docs, sva 3 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41634063555 ; ranije ✅ **`41630034505` success** (`7b00aa9` — idempotencija + Q-15 + P-B07-6, sva 3 joba, 203 testa) https://github.com/mudzy992/fkgracanica/actions/runs/41630034505 ; ❌ `41629707127` (`19bf9ed` — 1 test tvrdio staro `includeMembership` ponašanje → popravljeno); ✅ `41627914148` (`c16385f`); ❌ `41627571734` (TS2724 import `PaymentProviderId`); ✅ BE-07 audit `41583848187`/`41584048206`/`41584323691` |
| **check:all** | `npm run check:all` → **7/7** (check-coverage, file-size, console-ban, **token-check**, secrets-ban, layer-deps, docs-links); u CI-ju jobovi `audit-gate` + `standards`; pre-push hook pokreće `check:all` |

## Šta je urađeno (hronološki)

### Sesija FE-03 follow-up — 2026-11-03 (odobreni blokeri)

Korisnik: „Odobravam sve preporuke u blokatorima kako si rekao."

- **P-FE03-1 (High, stored XSS) RIJEŠEN:** `dompurify@3.4.17` + `src/lib/sanitize-html.ts`
  (allowlista, zabrana script/style/form/embed, `javascript:`/`data:text/html` odbijeni,
  `iframe` samo YouTube/Vimeo, `rel="noopener noreferrer"`); `RichContent` sanitizuje
  prije `dangerouslySetInnerHTML` → pokrivene vijesti, CMS, muzej, trofeji, klupska historija.
  **7 novih XSS regresionih testova** (ukupno 47 testa / 12 fajlova).
- **P-FE03-7 RIJEŠEN:** `Seo` `noindex` prop → `/prijava` i Monri payment bridge.
- **Ispravljen style churn:** dodan `.prettierrc.json` (`singleQuote`, `printWidth 100`)
  i vraćena 39 fajla koja je `prettier` bez konfiguracije preformatirao u FE-02/FE-03.
- **Napomena o okruženju:** tokom sesije se lokalni `.git` vratio na stariji commit
  (`b7f1d3d`) dok je radni direktorijum bio aktuelan — stanje oporavljeno sa
  `git reset --mixed origin/arena/290a6f13-fkgracanica` (`251db73`), bez gubitka rada;
  remote je bio ispravan.
- Otvoreno: **P-FE03-6** (i18n migracija 21 stranice → FE-03b).

### Sesija FE-03 — 2026-11-03 (javni portal)

- **B-FE03-01 (High, sigurnost):** `RichContent` renderuje nesanitizovan HTML iz
  `news.body`/CMS → **stored XSS**; u frontendu nema sanitizera. Predlog **P-FE03-1**
  (`dompurify` + allowlista) **čeka odobrenje** (novi dep + moguć vidljiv efekat).
- **B-FE03-02:** 17/25 javnih stranica nije imalo error stanje → nova `DataError`
  komponenta (`role="alert"` + retry) i error grane na **10 stranica**.
- **B-FE03-03/04:** i18n — 6 `home.*Subtitle` + `actions.retry` + `common.loadError`
  dodani u bs/en; novi test čuva **bs/en parity** i provjerava da svaki literalni
  `t('…')` ključ postoji (40 testa / 11 fajlova ukupno).
- **B-FE03-05:** `loading="lazy" decoding="async"` na 31 sadržajnu sliku (hero ostaje eager).
- **B-FE03-06:** `SearchPage` — `q` se sinhronizuje sa URL-om, validacija `page`, `Seo url`.
- Otvoreno: **P-FE03-1** (XSS), **P-FE03-6** (i18n migracija 21 stranice → FE-03b),
  **P-FE03-7** (`noindex` → FE-06).

### Sesija FE-02 — 2026-11-03 (frontend test infra)

Korisnik: „Možeš nastaviti dalje na FE-02 — frontend test infra" + „Što se blokera tiče,
po tvojoj preporuci odobravam" (→ i **P-FE01-7**).

- **P-FE01-7 implementiran:** `@custom-variant dark (&:where(.dark, .dark *));` —
  `dark:` sada prati `<html class="dark">` (app tema), ne OS; `token-check/dark-variant`
  od upozorenja postao **greška**. FE-01 ZATVOREN.
- **FE-02:** novi devDeps (`vitest 5`, `jsdom 30`, `@testing-library/react 16`,
  `jest-dom 7`, `user-event 14`), `frontend/vitest.config.ts`, `src/test/setup.ts`
  (jest-dom + `matchMedia` shim + `cleanup`), `tsconfig.test.json` (testovi se
  **typecheckuju** u `tsc -b`, izuzeti iz app projekta).
- **34 testa u 9 fajlova:** `lib/{utils,as-array,html-content,match-status-label}`,
  `ui/{button,badge,card,input}` + migriran `commentator-desk.spec.ts` (bio `node:test`,
  ručno pokretanje → F-003/F-011 zatvoreni).
- **CI:** korak `frontend test (vitest)` u `build-test` jobu — frontend testovi se od
  sada izvršavaju na svaki push. Coverage prag + bundle budget → CI-03.

### Sesija FE-01 — 2026-11-03 (design tokeni + token-check)

Korisnik: „Kreni FE-01 blokatori po preporuci riješi".

- **Jedan izvor istine:** `@theme` u `frontend/src/index.css` sada drži sve boje/fontove/
  veličine teksta; dupli `:root` blok boja uklonjen; `--color-primary-rgb` (nije bio
  definisan!) i `--color-brand-rgb` dodani → live-goal glow više ne visi na hardkodiranom
  fallbacku.
- **15 novih tokena:** `--color-brand #0066ff`, `--color-surface-deep/-night/-story/-mock/-chrome`,
  `--color-wood-dark`, `--color-frame-light`, vendor `stripe/paypal/monri` (+ hover).
- **23 proizvoljne hex klase → tokeni sa identičnim vrijednostima** (bez vizuelne promjene);
  `premium-landing.css` bez hardkodirane brend boje.
- **Nova provjera `token-check`** (6 pravila + ratchet baseline 417) u `check:all` → **7/7**;
  self-test: 3 namjerne greške uhvaćene.
- **Nije primijenjeno (vidljivo, čeka dozvolu):** P-FE01-7 `@custom-variant dark`
  (`dark:` po app temi, ne po OS-u); P-FE01-8 migracija 417 palette klasa (FE-03/FE-04).
- Verifikacija: `build -w frontend` ✅, `lint -w frontend` 0 grešaka, izlazni CSS ima
  identične vrijednosti boja; `check:all` 7/7.

### Sesija BE-09c zatvaranje — 2026-11-03 (CI e2e + drift specova)

- Novi CI job `e2e` pokrenut prvi put → 2 od 18 testa pala (specovi su odstupali od
  API ugovora: `GOAL` bez `playerId`, `round` van DTO-a, `reserve` bez zakazane
  domaće utakmice i sa hardkodiranom labelom kategorije).
- Job dobio `--json --outputFile` + `::error` anotaciju (`failureMessages`) jer su
  GitHub logovi iz sandboxa nedostupni — dijagnostika ide kroz check-run anotacije.
- `DATABASE_URL` u CI-ju bez ugrađene lozinke (`POSTGRES_HOST_AUTH_METHOD: trust`) —
  secrets-ban čist; prvi pokušaj (`postgres:postgres@…`) je oborio `standards` job.
- **Rezultat:** run `41662277103` — sva 4 joba zelena, e2e **18/18**.
- **BE-09 (a/b/c) ZATVOREN.** Backlog: **P-B09c-11** (uklanjanje legacy `Match.round`),
  B-09c-13 (Docker digest + `migrate deploy` van `CMD`).

### Sesija BE-09c implementacija — 2026-11-03 (odobreni predlozi)

Korisnik: „Možeš nastaviti sljedeći korak! … P-B08-6, P-B09-3/4/6 takođe po tvojoj
preporuci slažem se" → odobreni **P-B09c-1…10 + P-B09c-12**, uz P-B08-6, P-B09-3, P-B09-4, P-B09-6.

- **Seed sigurnost (P-B09c-1, 8):** `ADMIN_PASSWORD` obavezan (min 8; `change-me`
  odbijen u produkciji), hash samo pri kreiranju admina, reset samo uz
  `ADMIN_RESET_PASSWORD=1`; demo sadržaj samo uz `SEED_DEMO=1`.
- **Docker (P-B09c-2, 3):** `DATABASE_URL` više ne ostaje u slojevima slike
  (`RUN DATABASE_URL=… prisma generate`), compose šalje dummy build arg,
  `npm prune --omit=dev` u runner stage-u.
- **CI (P-B09c-4):** novi job `e2e` — `postgres:16` + `redis:7`, health-wait,
  `prisma migrate deploy`, seed, `test:e2e`; na pad `::error` anotacija.
  `DATABASE_URL` bez lozinke (`POSTGRES_HOST_AUTH_METHOD: trust`) — secrets-ban čist.
- **RBAC seed (P-B09c-5):** definicija rola/dozvola preseljena u
  `src/rbac/rbac-seed.constants.ts`, seed u `$transaction`, fail-fast na nepoznat ključ.
- **Skripte (P-B09c-6, 10, 12):** QA skripte bez produkcijskog defaulta, traže
  `--yes`; `git.sh` bez „commit-all" (`':!.env*' ':!uploads'`), potvrda za push;
  `setup-upload-dir.sh` pada ako `chown` ne uspije.
- **Indeksi (P-B09c-7, odobrena schema izmjena):** 14 `@@index` na FK kolone +
  migracija `20261103140000_be09c_fk_indexes`.
- **Uz to:** P-B08-6 (insensitive pretraga + `q` ≤ 100), P-B09-3 (upload throttle
  10/60 s + kvota 20/dan → 429), P-B09-4 (transliteracija `đ/ß/æ/ø/ł`),
  P-B09-6 (users `sort` allowlist, nepoznato → 400).
- **Testovi:** 25 novih testova u 5 novih specova; `npx jest src/upload` 16/16.
- **Verifikacija:** `check:all` 6/6; matrica +30 redova. Lokalno **nije** bilo
  moguće: `prisma validate` (sandbox nema mrežu do Prisma binarija) i 19 jest
  suite koje traže generisan `@prisma/client` → gate je CI.

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

### INCIDENT nakon zatvaranja — F-019 (Coolify build pao, 2026-11-02 17:12)

- **Lanac**: CI-01 tačni pinovi u `frontend/package.json` (@types/react 19.2.18,
  @types/react-dom 19.2.7, tiptap 3.28.0) → root lock sinhron (GitHub CI zelen),
  ALI standalone `frontend/package-lock.json` (njega koristi Docker build)
  **nikad regenerisan** (`scripts/sync-docker-locks.sh` postojao — nepokrenut) →
  I-01-08 (odobren) uklonio `--package-lock-only` masku → Coolify `npm ci`
  (npm 10.9.9) pao: `lock file's @types/react@19.2.17 does not satisfy 19.2.18`.
- **Fix `2f4ce40` (F-019)**: hirurška sinhronizacija **15+/15−** — 2 @types bloka
  (version/resolved/integrity) + 9 root-mirror stavki; `package.json` netaknut;
  svih 22 `libc` polja sačuvano (alpine/musl build).
- **Odbijen puni regen `sync-docker-locks.sh`**: regeneriše lock OD NULE →
  react 19.2.7→19.3.1, vite 8.1.5→8.3.5 (1629 reda) = nedozvoljena promjena
  ponašanja → revertiran; preporuka za hardening alata čeka odobrenje.
- **Verifikacija**: standalone `npm ci` exit 0 na npm 10.9.8 i **npm 10.9.9
  (tačno Coolify)**; GitHub CI ✅ `41501622108`.
- **Otvoreno (pitanje korisniku)**: Coolify log pokazuje `Dockerfile:37`
  (COPY na liniji 35) — naš `frontend/Dockerfile` ima COPY na 10 i nijedna
  historijska verzija ne odgovara → provjeriti Coolify git izvor/branch/Dockerfile.

### SEGMENT INF-02 — 2026-11-02 (ZATVOREN ✅)

- Q-04 ✔/D-004 → čišćenje **sprovedeno**: `.env.example` 2× F-001 → `change-me`
  (+ D-004 komentar), REDIS primjer `<CHANGE_ME_URL_ENCODED>` (J-02-04).
- `secrets-ban`: uklonjena zastarjela `.env*` allowlist stavka → `.env.example`
  sada skeniran; **negativni test** (F-001 vraćen u fajl) → exit 1 ✓.
- Novi `.githooks/pre-commit` (brzi tajni skaner; pun `check:all` ide na
  pre-push + CI); `core.hooksPath` **vraćen** nakon re-kloanja — hook upalio
  uživo na commitima `6cd18d9`/`f5ec734`.
- `rotate-secrets.sh` audit ✓ (zdrav: `openssl rand`, radi na nepostojećem
  `.env`-u; D-004 → rotacija nije potrebna; hint `db:seed` postoji).
- F-001 dokaz ostaje **samo** u allowlist dokumentima (`AUDIT/` ×3,
  `docs/DECISIONS.md`, `docs/_retired/` ×1); `.env` nije trackan;
  git historija **bez rewritea** (D-004).
- CI ✅ `41504684855`; `check:all` 6/6; matrica 1285 fajlova (INF-02: 3 reda).
- Segment dokument: `AUDIT/segments/INF-02.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-01 — 2026-11-02 (ZATVOREN ✅)

- KAPIJA: audit + predlozi (P1–P8, Q-11…Q-13) → korisnik **„Odobravam
  preporuke"** → **D-006** zapisan u `docs/DECISIONS.md`.
- **Implementirano** (`675d5ce` + `f062097`):
  - P1: `config/env.validate.ts` — fail-fast env validacija (zero-dep);
  - P2: `config/configuration.ts` + migracija main/prisma/common(+cache/jobs
    pozivaoci) na ConfigService — common/ više ne čita `process.env`;
  - Q-11(a): throttler globalno **100/60s**, auth **10/60s**, `trust proxy=1`;
  - P5: error ugovor zadržan + additivno `path`;
  - Q-13: Prisma **P2002→409 / P2025→404 / P2006→400** + **7 unit testova**;
  - Q-12(a): audit javnih ruta — **192 zaštićene / 71 javna** (aneks u
    segments/BE-01.md) → globalni guard ide u **BE-02**; sumnja: `clubs/own`.
- Verifikacija: lokalno jest 7/7 + eslint čist (moji fajlovi) + check:all 6/6;
  **CI ✅ `41512922531`** (nest build + cijeli jest + eslint s generisanom Prisma).
- Segment dokument: `AUDIT/segments/BE-01.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-02 — 2026-11-02 (ZATVOREN ✅)

- Audit auth/rbac/users: **sloj zdrav** (bcrypt10, jednokratna refresh rotacija,
  per-request permissions, RBAC vezan — 0 violacija). Nalazi: B-02-01 (timing
  enumeration), B-02-02 (logout ownership), B-02-03 (JWT_EXPIRES format) =
  **trivijalni predlozi otvoreni**; B-02-04 `clubs/own` = site-level javan
  (false alarm iz BE-01 aneksa — riješen `@Public`).
- **Q-12(a) implementiran** (`245f066`+`a087b66`): globalni JwtAuthGuard
  (default-deny, **http-only** — WS preskače jer gateway ima vlastitu auth +
  public live klijente) + `@Public` na **71** javnoj ruti + strip JwtAuthGuard
  iz41 kontrolera. **Korekcija BE-01**: throttler `skipIf` → samo HTTP (B-02-05).
- **Testovi** (`f357813`): `route-access.spec` — invariant preko STVARNIH Nest
  metapodataka (71==71), `jwt-auth.guard.spec` — public/ws skip; lokalno 13/13.
- **Incident**: treći re-klon workspacea (`.git`→`b7f1d3d`, node_modules obrisan)
  → `fetch --unshallow` + mixed reset; sav rad na GitHubu, ništa izgubljeno.
- CI ✅ **`41525406239`**; `check:all` 6/6; matrica: 54 reda → BE-02 (ukupno1291).
- Segment dokument: `AUDIT/segments/BE-02.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-03 — 2026-11-02 (ZATVOREN ✅)

- Audit settings/audit/notifikacije/email-log (25 fajlova): **sloj zdrav** —
  registry = jedini izvor settings redova (cross-scope = tihi no-op), audit
  **bez tajni** (password nikad u metadata), notifikacije **user-scoped**,
  zavisnosti modula rade. Nalazi: B-03-06 (datum validacija → predlog
  P-B03-1 otvoren), B-03-07 info.
- Izmjene: **3 nova unit speca** (scope enforcement, audit filteri, ownership)
  — 32→**38** specova; testovi lokalno **14/14**; matrica 25 redova → BE-03.
- `docs/TESTING.md` + `docs/BACKEND.md` brojevi ažurirani.
- Segment dokument: `AUDIT/segments/BE-03.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-04 — 2026-11-02 (ZATVOREN ✅)

- Audit 29 fajlova → **6 kritičnih nalaza** (B-04-01…06): draft leak kroz
  `GET /news`, `news/:id`, `gallery`, CMS `?admin=1` + upload XSS/OOM.
- Odobrenje korisnika **„odobravam P-B04-1 i 2"** → implementirano:
  - **P-B04-1** (`9159db1`): **tiha autorizacija** u JwtAuthGuard (@Public +
    Bearer → `req.user`, anon → i dalje javan) + filtri: anon→PUBLISHED
    (news/gallery liste), news/:id + komentari → 404 za draft, `gallery/:id`
    bez @Public (invariant **71→70**), CMS admin flag samo uz `req.user`.
    **0 FE/MOB izmjena** (admin paneli/mobile staff rade bez promjena).
  - **P-B04-2** (`34145b5`): upload mime+ext allowlist + **16MB** (413/400).
- Testovi (`e386d48`):5 novih/uređenih speca — leak regresija, silent auth,
  upload validacija; CI zelen nakon4 krpa (tsc tip → komitano → castovi):
  **`41533952042` ✅ (build + 157 testova + eslint)**.
- `hooksPath` ponovo vraćen (izgubljen re-klonom #3); matrica: 15 redova → BE-04.

### SEGMENT BE-05 — 2026-11-02 (ZATVOREN ✅)

- Audit 75 fajlova (~4.900 LOC): **sloj zdrav** — write rute sve
  perm-guardane (0 rupa), 0 admin-flag obrazaca, `season-stats-rebuild`
  interni util, PII ok (sha256, bez raw IP), standings tie-breaker već
  specovan (b7f1d3d), 11 postojećih speca.
- **2 invisible fixa** (`6930be8`): B-05-01 sweep `visit-rate-limit` Mape
  (memory leak), B-05-02 `getClientIp` → `req.ip` (anti-spoof geo, usklađen
  s BE-01 trust proxy). **2 nova speca** (`d7de4c8`): 8 testova.
- CI ✅ **`41535738687`** (iz prve); `check:all` 6/6; matrica 75 redova → BE-05.
- Segment dokument: `AUDIT/segments/BE-05.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-06 — 2026-11-02 (ZATVOREN ✅)

- Audit 39 fajlova: **zdrav** — queue limiter 10/60s, newsletter:join
  authentikovan, unsubscribe token, live-report class-guarded, utili specovani.
- **Invisible** (`90b6021`): **6 `process.env` → ConfigService/configuration**
  (BE-01 P2, **0 preostalo** u segmentu) + **`match:join` cap 32** (WS bez
  throttlera → memory zaštita) + idempotentan rejoin.
- **Spec** (`991759c`): gateway handleri —7 testova; lokalno **76/76** (16 suiteova).
- **2 predloga otvorena**: P-B06-1 (contact DTO validacija → 400),
  P-B06-2 (matchId postojanje → ok:false).
- CI ✅ **`41538504328`** (iz prve); matrica 39 redova → BE-06.
- Segment dokument: `AUDIT/segments/BE-06.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-07 — 2026-11-03 (drugi krug: P-B07-2 A, Q-15, P-B07-6)

- **Odobrenje „odobravam P-B07-2 (A) i Q-15 = da i P-B07-6"** → **D-007**.
- `fa97684` **šema + migracija**: `PaymentEvent(provider, externalId @unique,
  kind, refId)` + `Payment.membershipId` (`orderId` postaje opcionalan),
  migracija `20261103120000_be07_payment_event_membership_payment`.
- `0fb3d4b` **P-B07-2 (A)**: `payment-event.util.ts` (claim/release +
  `runPaymentEventOnce`), `webhook-confirm.util.ts` (zajednička potvrda iz
  webhooka), wiring u Stripe/PayPal/Monri (webhook **i** confirm-session) —
  retry ne može dvaput produžiti članstvo. **7 testova**.
- `a2d16b0` **Q-15**: checkout otvara `Payment` red za članstvo
  (`PENDING_ONLINE`), potvrda ga zaključava; `finance/` čita prihod iz
  Payment redova (`finance-loaders.ts`, servis 203→103 linije), API polje
  `estimated` ostaje ali je `false` za plaćena članstva; izvoz članstva dobija
  `Provider` kolonu.
- `9072e3c` **P-B07-6** (vidljivo, odobreno): otkazivanje samo `pending`
  (payment → `CANCELLED`), povrat samo `paid` + bez `USED` ulaznica
  (ulaznice → `REFUND_REQUESTED`), admin ne otkazuje plaćeno, `confirmRefund`
  gasi ulaznice atomski. **7 testova** (`ticketing-orders.service.spec.ts`).
- Ukupno u segmentu: **24 nova testa** u 5 novih spec fajlova.

### SEGMENT BE-07 — 2026-11-03 (U TOKU — audit ✅ + 5 fixeva)

- **Odobrenje „nastavi dalje"** → implementirano 5 invisible predloga:
  - `4a721c7` **P-B07-1** (klijent je mogao platiti 0,01 KM za članstvo —
    sada cijena iz `membership.annualPrice`, `membership-price.util.ts`) +
    **P-B07-4** (`checkout-validate.util.ts`: provider allowlist, obavezni
    id-evi, http(s) URL → **400** mj. 500; paginacija 1…100);
  - `f5896ee` **P-B07-5** (`payment-origin.util.ts`: allowlist origin-a za
    Monri formu = `CORS_ORIGINS` + `API_PUBLIC_URL`; `process.env` → `ConfigService`);
  - `209336c` **P-B07-3** (**IDOR**: narudžbu sa QR kodovima vidio svaki
    prijavljeni korisnik → sada vlasnik ili `ticketing.manage`, inače 404) +
    **P-B07-7** (atomski claim ulaznice `updateMany` + `count===1`).
  - **17 novih testova** (3 nova speca + IDOR/race u `ticketing.service.spec`).
- **Čeka odluku**: P-B07-2 (idempotencija plaćanja — A `PaymentEvent`
  tabela / B no-op na ACTIVE; Q-14), P-B07-6 (cancel/refund po statusima,
  vidljivo), Q-15 (`Payment` red za članstvo).
- `docs/BACKEND.md` dopunjen sekcijom „Plaćanja / ulaznice (BE-07)".

### SEGMENT BE-07 — audit (2026-11-03)

- Opseg: `membership/` 9 + `ticketing/` 21 + `payments/` 25 + `finance/` 10
  = **65 fajlova, 5.454 LOC, 10 speca, 35 testova**; sva 4 javna webhook-a
  + `mobile-return` provjereni protiv aneksa od 70 javnih ruta ✓.
- **Nalazi: 3 High + 6 Medium + 4 Low/Info + 8 eksplicitnih ✅ provjera**:
  - **B-07-01 (High)** klijent šalje `amount` za članstvo → Stripe/PayPal
    naplate proizvoljan iznos (Monri već koristi `membership.annualPrice`);
  - **B-07-02 (High)** članstvo **nije idempotentno** — `confirm-session` +
    webhook na `ACTIVE` članstvu dodaju +365 dana svaki put (nema
    `Payment` reda za članstvo; ulaznice i sezonske su ispravne);
  - **B-07-03 (High)** **IDOR**: `GET /ticketing/orders/:orderId` ignoriše
    korisnika → curenje tuđih QR kodova (ulaz bez plaćanja);
  - Medium: bez DTO (500 mj. 400), `process.env.API_PUBLIC_URL` u
    `monri.provider`, `monri/form?origin=` bez allowlista, cancel/refund bez
    provjere statusa, članstvo nema `Payment` red (finansije = procjena),
    race na skeniranju ulaznice;
  - ✅ zdravo: Stripe potpis (raw body), PayPal verify API, Monri
    `sha512`+`timingSafeEqual`, `mobile-return` allowlist, QR
    `randomBytes(16)`, serverska cijena ulaznice, limit blagajne/kapacitet.
- **Predlozi P-B07-1…7** + pitanja **Q-14** (online obnova aktivnog
  članstva?) i **Q-15** (`Payment` red za članstvo = šema) — **čekaju
  izričitu riječ korisnika** (segment je novac/QR → bez izmjena koda do
  odobrenja).
- Matrica: 65 redova → BE-07 (`pregledano`/`pokriveno testom`).
- Segment dokument: `AUDIT/segments/BE-07.md`.

### SEGMENT BE-08 — 2026-11-03 (ZATVOREN ✅)

- Opseg: `showcase` 10 + `seo` 9 + `search` 5 + `dashboard` 3 +
  `app-releases` 8 + `health` 2 + `museum` 3 + `hall-of-fame` 3 +
  `club-timeline` 3 + `trophies` 3 + `sponsors` 3 = **52 fajla, 2.744 LOC,
  samo 2 speca (3 testa)**; svih 13 javnih ruta provjereno protiv aneksa (70/70).
- **Nalazi: 3 Medium + 4 Low + 5 Info + 1 ✅ blok**:
  - **B-08-01 (Medium)** mass assignment u 5 CRUD modula (sirovi body →
    `prisma.create/update`, `data as never`; `ids` bez validacije → 500);
  - **B-08-02 (Medium)** APK upload do **200 MB u RAM** (`memoryStorage`);
  - **B-08-03 (Medium)** `GET /seo/share?path=` prihvata apsolutni URL →
    OG meta sa tuđim domenom;
  - Low: `process.env` u `seo/` (3×) + sirovi `UPLOAD_PATH` u app-releases
    (P2 konvencija), sitemap bez XML escape-a, pretraga case-sensitive bez
    `MaxLength`, pokrivenost 2 speca;
  - ✅ zdravo: sve write rute iza `*.manage`/`dashboard.read`, APK traversal
    guard + streaming, sitemap/robots bez tajni, share resolveri samo PUBLISHED.
- **Korisnik odobrio P-B08-1,2,3,4,5,7; P-B08-6 (case-insensitive pretraga +
  `q MaxLength`) NIJE odobren → nije implementiran** (ostaje u backlogu).
- Implementacija (`6a6ca14`, `f4757fa`, `cae229e`, `34d31e4`):
  - **P-B08-2**: novi `common/utils/entity-payload.util.ts`
    (`parseEntityPayload`, `parseIdList`) + allowliste u `sponsors`, `trophies`,
    `museum`, `hall-of-fame`, `club-timeline` → nepoznato/sistemsko polje = 400,
    `ids` validiran (ne-array/duplikati/predugo → 400), `clearFeatured(exceptId)`,
    `sortOrder` se računa iz `aggregate _max` (ne iz bodyja).
  - **P-B08-1**: `seo-url.util` bez `process.env` (API base iz `ConfigService`);
    sirovi `UPLOAD_PATH` ključ → `uploadPath` u seo/app-releases/auth/media/upload/
    newsletter.
  - **P-B08-4**: `/seo/share?path=` prima samo site-relativnu putanju
    (`normalizeSharePath`), apsolutni/protokol-relativni URL → `/`.
  - **P-B08-5**: sitemap XML-escape (`escapeXml`) + `changefreq` po tipu
    (vijesti/galerije `weekly`, statične/arhivske `monthly`); gradnja izdvojena u
    `seo-sitemap.util.ts` + `seo-sitemap-sources.ts` → `seo.service.ts` 225 → 180
    linija i **uklonjen iz file-size baseline-a**.
  - **P-B08-3**: APK upload `memoryStorage` → `diskStorage` (temp) + strim sha256
    + move u `uploads/app-releases/<g>/<m>/`; logika u `apk-storage.util.ts`
    (`app-releases.service.ts` 205 → 175).
  - **P-B08-7**: 4 nova speca, **39 testova** lokalno zeleno (entity-payload 13,
    seo-url 13, seo-sitemap 5, apk-storage 5 + postojeći apk-download 3).
- Matrica: 52 → **64 reda** → BE-08, statusi `popravljeno`/`pokriveno testom`/
  `pregledano` (0 neobrađenih); `check:all` **6/6** lokalno.
- **CI ✅ `41638624709`** (`86b3179`, implementacija) i **✅ `41639125072`**
  (`cc6959b`, docs) — sva 3 joba.
- Segment dokument: `AUDIT/segments/BE-08.md` (**Status segmenta: ZATVOREN**).
- Backlog nakon zatvaranja: **P-B08-6** (pretraga, vidljivo — nije odobreno),
  Info nalazi B-08-08…B-08-11 (prihvaćeni kao stanje).

### SEGMENT BE-09 — 2026-11-03 (U TOKU — BE-09a ✅ ZATVOREN, BE-09b audit ✔ / čeka odobrenje)

- **Zašto**: nakon BE-08 matrica je pokazivala **59 backend fajlova bez segmenta**
  (48 u `backend/src`, 1.948 LOC) — moduli BE-02/BE-04 pregledani su tada samo
  djelimično. BE-09 ih zatvara u dva podsegmenta.
- **BE-09a opseg (29 fajlova)**: `common/` (12), `rbac/` (4), `users/` (4),
  `auth/` (8), `prisma/prisma.module.ts`.
- **BE-09b (sljedeća sesija, 20 fajlova)**: `cms/` (5), `news/` (5),
  `gallery/` (2), `media/` (3), `upload/` (4), `prisma` util.
- **Nalazi BE-09a: 2 Medium + 5 Low + 4 Info + 1 ✅ blok**:
  - **B-09-01 (Medium)** RBAC `updateRolePermissions`/`deleteRole` bez
    transakcije → uloga može ostati **bez ijedne dozvole**;
  - **B-09-02 (Medium)** `UsersService.update` nije atomska, duplikat emaila →
    **500** (treba 409), `roleIds` bez validacije → 500;
  - Low: `POST /upload` (avatar) bez dozvole/kvote (16 MB × 100/min),
    `slugify` mrvi `đ/Đ`, `parseExpiresToMs` tihi default bez gornje granice,
    `sort` u `PaginatedQueryDto` je mrtav API, `PermissionsGuard` fail-open na
    praznu listu + nema audita 403;
  - Info: nema refresh-token reuse detection/cleanup, brisanje avatar fajlova
    prije DB update-a, `syncPermissions` bez batch transakcije, dupli upit za
    dozvole (`getUserPermissions` vs `JwtStrategy`);
  - ✅ zdravo: **0 drifta dozvola** (kod ↔ `PERMISSIONS`), `@Throttle(10/60s)`
    na login/refresh, DB provjera `isActive/deletedAt` na svakom zahtjevu,
    login ne odaje email, Administrator/sistemske role zaštićene, traversal
    guard za avatar, `limit` clamp 100.
- **Korisnik odobrio P-B09-1,2,5,7,8; P-B09-3/4/6 (upload kvota, slugify đ,
  sort) NISU odobreni** → nisu implementirani, ostaju u backlogu.
- Implementacija (`2cd99c4`, `b26a919`, `74bc781`, `bd391c3`, `8cf7aa9`):
  - **P-B09-5**: `parseExpiresToMs` baca grešku na neispravan format/nulu/>90d;
    `JWT_REFRESH_EXPIRES` se validira i na bootu (`env.validate`).
  - **P-B09-7**: `PermissionsGuard` fail-closed na praznu listu dozvola + svaki
    403 upisuje `authz.denied` (actorId, metoda+put, IP, tražene dozvole).
  - **P-B09-1**: `updateRolePermissions`/`deleteRole` u `$transaction`;
    `createRole` 409 na duplikat imena + trim.
  - **P-B09-2**: `users.update` transakcija (role + update), 409 zauzet email,
    400 nepoznata uloga; `users.service` 209 → 198 linija.
  - **P-B09-8**: **54 testa** u 5 novih spec fajlova (+ `users-service.mock.ts`),
    uključujući regresiju drifta dozvola (kod ↔ `PERMISSIONS`).
  - Follow-up (`b9d3bdf`, `fd41c42`, `d1d261d`): `AuditService` u guard-u je
    `@Optional()` (controller specovi bez AuditModule-a), tipizirani mock-ovi
    (eslint unsafe-*), precizan soft-delete matcher — CI zelen.
- Matrica: **29 redova → BE-09** (status `pregledano`); ostalo bez segmenta:
  **20 fajlova** (BE-09b).
- **BE-09a zatvoren** (`2ab4675`, CI ✅ `41651332872`): P-B09-1/2/5/7/8
  implementirano, P-B09-3/4/6 u backlogu, Info B-09-08…11 evidentirani.
- **BE-09b audit ZAVRŠEN** (20 fajlova, 961 LOC) — **12 nalaza
  (5 Medium + 7 Low) + 4 Info**:
  - **Medium:** `gallery.update` mass assignment → zaobilazi `gallery.approve`
    (B-09b-01); `cms-menus.saveItems` bez transakcije + `parentId` bez provjere
    ciklusa/vlasništva (B-09b-02); `cms-pages.reorderSections` mijenja sekcije
    **tuđe** stranice (B-09b-03); `NewsPublishScheduler.tick()` bez try/catch,
    bez overlap guarda, update bez uslovnog statusa (B-09b-04); tagovi/relacije
    vijesti van transakcije (B-09b-05);
  - **Low:** 403 umjesto 400 za widget validaciju + tiho `{}` (B-09b-06),
    kategorije vijesti `P2002` → 500 (B-09b-07), komentari bez DTO validacije
    (B-09b-08), galerija 500 umjesto 404 + fotka bez provjere vlasništva
    (B-09b-09), orphan original kod rendicija (B-09b-10), `isImageMime`
    substring heuristika + mrtva grana (B-09b-11), `deleteStoredFiles` guta
    greške + bez traversal guarda (B-09b-12);
  - Info: `custom-html`/`rich-text` bez sanitizacije → **stored XSS**
    (B-09b-13, predmet FE segmenta), `removeSection` bez `refreshAutoSeoDesc`
    (B-09b-14), `uniqueSlug` race (B-09b-15), ✅ zdravo (B-09b-16).
  - **Predlozi P-B09b-1…13** — preporuka: odobriti 1,2,3,4,5,10,11,12,13
    (bez vidljive promjene) + 6,7,8,9 (samo statusni kodovi 500→400/404/409).
- Matrica: **20 redova → BE-09** (BE-09b), status `pregledano`; 0 neobrađenih
  u `backend/src`; bez segmenta ostaje **49 fajlova** (`prisma/seed`,
  migracije, `backend/test/**` e2e, `Dockerfile`, `prisma.config.ts`) —
  predlog **BE-09c**.
### BE-09c — audit (2026-11-03)

- **Opseg:** 37 fajlova / 3.338 LOC — `prisma/` (schema je u BE-07, init migracija
  1.370 linija, `seed.ts` + `seed/rbac.ts` + `seed/settings-admin.ts` + 11
  `seed/demo/**`), `backend/Dockerfile`, `prisma.config.ts`, 8 e2e specova +
  `setup-e2e-env.ts`, 8 infra skripti (`scripts/`).
- **12 nalaza (6 Medium + 6 Low) + 2 Info bloka:**
  - Medium: seed postavlja admin lozinku na `change-me` i **resetuje je na svakom
    pokretanju** (B-09c-01); `DATABASE_URL` ide kao **build arg** i ostaje u
    slojevima Docker slike (B-09c-02); runner slika nosi **devDependencies**
    (B-09c-03); **e2e testovi se ne izvršavaju u CI** + neusklađene default
    lozinke (B-09c-04); `seed/rbac.ts` bez transakcije i tiho odbacuje nepoznate
    dozvole (B-09c-05); QA skripte defaultno gađaju **produkciju** i mijenjaju
    live utakmicu (B-09c-06);
  - Low: **14 FK kolona bez indeksa** (B-09c-07, traži schema izmjenu), seed
    uvijek puni demo sadržaj (B-09c-08), demo seed sitnice (B-09c-09),
    `git.sh` = `git add .` + push (B-09c-10), `Match.round` vs `roundId` (B-09c-11),
    tihi `|| true` u `setup-upload-dir.sh` (B-09c-12);
  - ✅ zdravo: seedovi idempotentni, CMS seed konfiguracije prolaze novu
    validaciju, schema ↔ migracija **bez drifta**, sve e2e rute postoje,
    `.dockerignore` korektan, kontejner non-root + `HEALTHCHECK`.
- **Matrica:** 37 redova → `BE-09`, status `pregledano`; **0 fajlova bez
  segmenta izvan `frontend/` i `mobile/`**.

### BE-09b — implementacija i zatvaranje (2026-11-03)

- **Korisnik odobrio SVE P-B09b-1…13** („Po preporuci možeš postupiti i po
  pitanju ovih blokatora, i nastaviti dalje").
- Implementirano: gallery allowlist + 404/400 (P-B09b-1/9), menus
  `$transaction` + validacija `parentId` (2), reorder scoping (3), scheduler
  overlap/try-catch/uslovni update (4), news transakcija sa tagovima i
  relacijama (5), widget 400 + pravila po tipu (6), kategorije 409 (7),
  `CommentCreateDto` (8), rendition čišćenje + 400 (10), MIME allowlist (11),
  `deleteStoredFiles` traversal + log (12), **78 novih testova** (13).
- Refaktor: `cms-pages.service.ts` 211 → **188 linija** (auto-SEO u
  `cms/cms-auto-seo.util.ts`).
- Matrica: **30 redova ažurirano** (`popravljeno`/`pokriveno testom`),
  **14 novih fajlova** dodano.
- **Vidljive promjene (odobrene):** 403→400 za neispravnu widget konfiguraciju,
  500→409 za duplikat sluga kategorije, 500→400/404 za galeriju i komentare,
  `PATCH /gallery/:id` ignoriše `status`/`slug`.
- **CI ✅ `41654943345`** (`212ec80`) — 3/3 joba; prvi run `41654422296` pao na
  3 eslint greške (popravljeno istog dana).
- **BE-09b ✅ ZATVOREN** — 12/12 nalaza popravljeno, 0 preostalih predloga.
- Segment dokument: `AUDIT/segments/BE-09.md`.

## Šta je sljedeće (tačan sljedeći korak)

1. **BE-09c — čeka odobrenje korisnika** za P-B09c-1…10/12 (audit ✔, matrica ✔).
   Nakon odobrenja: implementacija → testovi → zelen CI → zatvaranje **BE-09**
   (matrica tada pokriva **sve** fajlove izvan `frontend/` i `mobile/`).
   Backlog (ne blokira): **P-B08-6**, P-B06-1/2, P-B02-1/2/3, P-B03-1,
   B-07-10…13.
   ⚠️ Deploy: potreban `prisma migrate deploy` za `20261103120000_…`
   (PaymentEvent + Payment.membershipId).
2. Zatim BE-02…08 → FE → MOB → CI-02/03/04 → E2E-01 (INF-03 paralelno kad zatreba).
3. Svaki segment: `AUDIT/segments/<ID>.md` + matrica + zelen CI + izvještaj (standard iz CI-01/INF-01/INF-02).

## Otvorena pitanja za korisnika (BLOKATORI)

- **Q-01** root README: zadržati (ažuriran) ili penzionisati?
- **Q-02** `.cursor/plans/**` penzionisati? (preporuka: DA; matrice/`rules` ostaju)
- **Q-03** mobile smoke checkliste: žive? (preporuka: da, zadržati)
- **Q-04** ✔ ODGOVORENO (D-004): **nije stvarna lozinka** → bez rotacije/rewrite; čišćenje `.env.example` **Sprovedeno u INF-02** ✔
- **Q-05** ✔ ODGOVORENO (D-005): **Coolify; Traefik ne postoji** → `docker-compose1.yaml` penzionisan (INF-01)
- **Q-06** ✔ ODGOVORENO (KAPIJA 2): CI-01 prvi; raniji pushovi bez CI-a evidentirani.
- **Q-07** saglasnost produkcione baze sa jedinom `init_postgres` migracijom?
- **Q-08** tačan runtime host u `DATABASE_URL` za verify-full (interno ime vs javni)?
- **Q-09** ✔ ODGOVORENO (KAPIJA 2): alati iz §4 odobreni (instalacija ide u FE/MOB segmente).
- **Q-10** ✔ ODGOVORENO u principu (KAPIJA 2); detalji (pristup/backup) potvrđuju se kad segment zatreba (INF/BE).
- **Q-11** ✔ ODGOVORENO (D-006/„Odobravam preporuke"): **(a)** — throttler 100/60s + auth 10/60s + trust proxy
- **Q-12** ✔ ODGOVORENO (D-006): **(a)** — audit javnih ruta u BE-01 (71), globalni APP_GUARD u **BE-02** s testovima
- **Q-13** ✔ ODGOVORENO (D-006): **DA** — P2002→409, P2025→404, P2006→400 (implementirano + testovi)
- **Q-14** (BE-07, traži odgovor): prodaje li se **obnova aktivnog članstva online**? (`PAYABLE_STATUSES` uključuje `ACTIVE`; odgovor bira P-B07-2 opciju A ili B)
- **Q-15** (BE-07, traži odgovor): uvesti `Payment` red za članstvo (tačan prihod umjesto procjene) = **šema-dodatak** uz P-B07-2 (A)?
