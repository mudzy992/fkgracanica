# Segment SEC-07 — Preostalih 28 high (expo/nestjs/prisma major)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **OTVOREN** (2026-11-27) — plan, paralelno sa `P-PREMIUM-05` |
| **Paket** | P-SEC-07 |
| **Veličina** | L (3 sub-batche, ~15 fajlova, major bumps) |
| **Rizik** | High — `expo 57→58`, `@nestjs/* 11→12`, `prisma 7→8` breaking |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `da70495` (trenutno `60 (31 moderate, 28 high)` nakon tiptap sync) |
| **CI** | `npm audit 60 (31/28)` `check:all 10/10` `build` Vite 8.4.0 Next 16.4.6 |

---

## 1. Opseg

P-SEC-07 — preostalih `28 high` nakon `P-SEC-06` (92→60). `SEC-06` je zatvorio `glob`, `browserslist`, `brace-expansion`, `tiptap 3.28→3.35`, `axios 1.18→1.21`. Preostalo zahtijeva **major** bumpe `expo`/`nestjs`/`prisma` (`parallel` sa `P-PREMIUM-05 docs` po dogovoru `2026-11-27`).

**Trenutno `npm audit --json` (28 high, 30 moderate, 1 low, 0 critical):**

| # | Paket | Range | Via | Fix | Major? | Workspace |
|---|-------|-------|-----|-----|--------|-----------|
| 1 | `@expo/cli` | `0.19-canary..57.0.32` | `glob` | `→ 58.1.0` | **expo 57→58** | `mobile` |
| 2 | `expo-router` | `1.2.2-3.1.2 / 5.2-canary..58.0.12` | `query-string` | `→ 58.0.33` | **expo 57→58** | `mobile` |
| 3 | `query-string` | `5.0.0-9.4.1` | `decode-uri-component` | `→ expo-router 58` | **expo 57→58** | `mobile` |
| 4 | `decode-uri-component` | `≤0.5.0` | `query-string` | `→ expo 58` | **expo 57→58** | `mobile` |
| 5 | `@nestjs/platform-express` | `≤11.2.5` | `multer` | `→ 11.2.6+ / 12.6.3` | `nestjs 11→12` | `backend` |
| 6 | `multer` | `<2.3.0` | `@nestjs/platform-express` | `→ 2.5.0` | `nestjs 11→12` | `backend` |
| 7 | `@nestjs/swagger` | `5.3-next..11.4.5` | `js-yaml` | `→ 11.4.6+` | `nestjs` patch | `backend` |
| 8 | `js-yaml` | `≥3.0 <3.15.1 / ≥4.0 <4.3.1` | `swagger/eslintrc` | `→ 4.3.1 / 3.15.1` | patch | `backend` |
| 9 | `@prisma/config` | `≥6.13-dev` | `deepmerge-ts` | `→ prisma 8` | **prisma 7→8** | `backend` |
| 10 | `prisma` | `6.13-dev..7.10 / 7.11-dev..8.1-dev` | `deepmerge-ts` | `→ 8.0.0-rc.36` | **prisma 7→8** | `backend` |
| 11 | `deepmerge-ts` | `<8.0.0` | `@prisma/config` | `→ 8.x` | **prisma 7→8** | `backend` |
| 12 | `effect` | `≤3.22.0` | `@prisma/config` | `→ 3.23+` | **prisma 7→8** | `backend` |
| 13 | `compression` | `<1.8.2` | `expo/cli` | `→ 1.8.2` | minor | `backend/mobile` |
| 14 | `engine.io` | `6.6.0-6.6.9` | `socket.io` | `→ 6.6.10+` | `socket.io 4→4.8` | `backend` |
| 15 | `fast-uri` | `3.0.0-3.1.8` | `ajv` via `prisma` | `→ 3.1.9` | `ajv` update | `backend` |
| 16 | `image-size` | `0.6.3-2.0.2` | `@nestjs/swagger?` | `→ 2.0.3` | minor | `backend` |
| 17 | `mysql2` | `≤3.23.0` | `prisma` mysql | `→ 3.23.0` | **CLOSED** (migriran na `pg`, backup u `backend/prisma-mysql-backup/`) — audit lažno pozitivno, `mysql2` nije u `dependencies` |
| 18 | `node-forge` | `≤1.4.0` | `nodemailer?` | `→ 1.4.1` | minor | `backend` |
| 19 | `react-router` | `7.12.0-7.18.1` | `frontend` | `→ 7.18.2` | **frontend** | `frontend` |
| 20 | `react-router-dom` | `7.12-pre..7.18.1` | `react-router` | `→ 7.18.2` | **frontend** | `frontend` |
| 21 | `brace-expansion` | `≤1.1.20 / 2.0-2.1.6 / 4-5.0.11` | tranzitivni | `→ 5.1.0` | **VEĆ override 5.1.0** — audit još `1.1.x` via `@nestjs/cli`? `npm ls brace-expansion` pokazuje `5.1.0 deduped` ali `js-yaml 3.15.0` vuče `brace-expansion 1.1.15` — treba `overrides` + `npm ci --force` |
| 22 | `zod` | `<4.6.6` | `frontend` | `→ 4.6.6` | **VEĆ 4.6.6** — audit lažno pozitivno via `expo/cli zod 3.25.76` (expo 57 pin) — fix sa `expo 58` |
| 23-28 | `body-parser`, `express`, `path-to-regexp`, `@react-navigation/core`, `@xmldom/xmldom`, `nodemailer` | moderate/high | tranzitivni | — | ostaje `31 moderate` | — |

**Nije high ali moderate:** `31 moderate` ostaje (`@xmldom`, `nodemailer` itp.) — ne blokira `high` cilj.

---

## 2. Strategija (3 sub-batcha, paralelno sa PREMIUM-05)

### SEC-07a — expo 57→58 (mobile, 8 high: glob/query-string/decode-uri-component/zod/compression-image-size)
- **Head:** `mobile/package.json` `expo ~57.0.16 → ~58.1.0`, `expo-router ~57.0.16 → ~58.0.33`, `react-native 0.86.2 → 0.87.x` (expo 58 peer)
- **Rizik:** **High** — `expo 58` zahtijeva `Node ≥24` (audit `geoip-lite` već `>=24`), `react-native` major, `expo-build-properties` 57→58, `eas build` test
- **Komanda:** `npx expo install expo@58 expo-router@58 --fix` + `npx npm@11 install --legacy-peer-deps` (`--legacy` jer `react-native` peer)
- **Verifikacija:** `npm ls expo 58.1.0`, `npm audit` -8 high (glob/zod/query-string), `npm run test -w mobile 382/382`, `expo start --web` smoke
- **Rollback:** `git checkout HEAD -- mobile/package.json package-lock.json && npx npm@11 install`

### SEC-07b — nestjs/prisma major (backend, 12 high: multer/js-yaml/deepmerge-ts/effect/prisma/multer/fast-uri/image-size)
- **Head:** `backend/package.json` `@nestjs/* 11.0.1 → 12.6.3`, `@nestjs/swagger 11.4.5 → 12.x`, `prisma 7.8.0 → 8.0.0-rc.36`, `@prisma/client/adapter-pg 7.8.0 → 8.x`, `multer 2.2.0 → 2.5.0`, `js-yaml 4.3.0 → 4.3.1`
- **Rizik:** **High** — `nestjs 12` breaking `platform-express`/`swagger` dekoratori, `prisma 8` `prisma.config.ts` + `generator` + `adapter-pg` breaking, `prisma generate` offline (`756` već) — `as unknown` fallback mora ostati
- **Komanda:** `npm install @nestjs/common@12 @nestjs/core@12 @nestjs/platform-express@12 @nestjs/swagger@12 prisma@8 @prisma/client@8 --workspace=backend --legacy-peer-deps` (jedan PR, ne `npm audit fix`)
- **Verifikacija:** `npm ls @nestjs/common 12.6.3`, `npm ls prisma 8.0.0-rc.36`, `npm run build -w backend` (`nest build` + `prisma generate` offline fallback 756 ne raste), `npm audit` -12 high
- **Rollback:** `git checkout HEAD -- backend/package.json package-lock.json && npx npm@11 install`

### SEC-07c — frontend minor (2 high: react-router)
- **Head:** `frontend/package.json` `react-router 7.18.0 → 7.18.2`, `react-router-dom 7.18.0 → 7.18.2`, `compression 1.8.1 → 1.8.2`, `multer` već u 07b
- **Rizik:** **Low** — patch, nema breaking
- **Komanda:** `npm install react-router@7.18.2 react-router-dom@7.18.2 --workspace=frontend && npx npm@11 install --legacy-peer-deps`
- **Verifikacija:** `npm ls react-router 7.18.2`, `npm run build -w frontend 3131 modules`, `npm audit` -2 high → `6 high` ostaje (samo `expo` ako odgođen)

**Ukupno cilj:** `60 (31/28) → 38 (31/6)` ako sva 3 batcha, ili `→ 32 (31/0 high)` ako `brace-expansion`/`zod` lažno pozitivno nestane sa `expo 58`. `29 high` iz `SEC-06` je sad `28 high` (tiptap sync `da70495` -1).

---

## 3. Odluke

| Odluka | Razlog |
|--------|--------|
| 3 batcha, ne 1 PR | `expo 58` + `nestjs 12` + `prisma 8` svaki je breaking major — 1 PR bi imao ~5000 LOC lock + 3 breaking runtime, `CI` ne može bisectati. Kao `SEC-03..06` batch strategija |
| `parallel` sa `PREMIUM-05 docs` | `PREMIUM-05` je docs-only (cart već u `87b251c`), nema kod rizika — SEC-07 majori su nezavisni, mogu paralelno po dogovoru `2026-11-27` |
| `mysql2` ignorisan | `backend` je migriran na `pg` (`@prisma/adapter-pg`), `mysql2` je backup u `backend/prisma-mysql-backup/` — audit `mysql2 3.22.0` je tranzitivni preko `prisma` ali ne runtime, `npm ls mysql2` prazno u `backend` |
| `overrides` za `brace-expansion` ostaje `5.1.0` | `npm ls brace-expansion 5.1.0 deduped` već, ali `js-yaml 3.15.0` vuče `brace-expansion 1.1.15` — `npm ls` pokazuje 2 verzije, treba `overrides` + `resolutions` ili `npm ci --force` sa `dedupe` u `07b` |

---

## 4. Plan izvršenja (2026-11-27 →)

| Korak | Komanda | CI gate |
|-------|---------|---------|
| 0 | `npm audit --json > /tmp/audit-07a.json` + `npm ls` snapshot | `60 (31/28)` |
| 1 | `SEC-07c` frontend patch `react-router 7.18.2` (Low) | `build 3131`, `check:all 10/10`, audit `28→26` |
| 2 | `SEC-07b` backend `@nestjs/* 12` + `prisma 8` (High) | `nest build` 756, `prisma generate` fallback, audit `26→14` |
| 3 | `SEC-07a` mobile `expo 58` (High) | `mobile test 382/382`, audit `14→6` |
| 4 | Final `npx npm@11 install --legacy-peer-deps` + `npm audit 38 (31/6)` ili `0 high` ako `expo 58` riješi `glob/zod` | `inventory 2570/2570`, `build 34/34`, `check:all 10/10` |

**Ako `expo 58` zahtijeva `Node 24` (Coolify `node:22-bookworm-slim`):** `frontend/Dockerfile` i `backend/Dockerfile` ostaju `node:22`, `expo` je samo `mobile` workspace — ne utječe na Docker `npm ci`. `geoip-lite` već traži `>=24` ali radi na `22` sa `EBADENGINE warn`.

---

## 5. Verifikacija (nakon svakog batcha)

- [ ] `npm audit --json` `vulnerabilities high` `28 → 26 → 14 → 6/0`
- [ ] `npm ls <pkg>` verzija `12.6.3`/`8.0.0-rc.36`/`58.1.0`/`7.18.2`
- [ ] `npm --workspace=frontend run build` `✓ 3131` `vite 8.4.0`
- [ ] `npm --workspace=frontend-next run build` `✓ 34/34` `16.4.6`
- [ ] `npm --workspace=backend run build` `nest build` 756 pre-existing
- [ ] `npm --workspace=mobile run test` `382/382` (ako `expo 58`)
- [ ] `npm run check:all` `10/10 OK`
- [ ] `inventory 2570/2570` `COVERAGE_MATRIX` sync

Status: OTVOREN — čeka `ask_user` za `SEC-07a/b` majore (expo/nestjs/prisma) pre izvršenja.

---

## 6. Rollback

```bash
git checkout da70495 -- package.json package-lock.json backend/package.json frontend/package.json frontend-next/package.json mobile/package.json
npx npm@11 install --legacy-peer-deps
npm audit  # → 60 (31/28)
```

---

## 7. Sljedeći korak

- `ask_user` `p_sec_07_major_approve` — da li pokrenuti `07a` (expo 58) i `07b` (nestjs12/prisma8) odmah ili odgoditi majore i zatvoriti samo `07c` (react-router) za `6 high`?
- Paralelno `P-PREMIUM-05 docs` zatvoren u ovom PR — `PREMIUM-05.md` 82L + `SEC-07.md` plan.
