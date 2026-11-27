# Segment SEC-06 — Glob/browserslist/brace-expansion + tiptap/axios batch

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-SEC-06 |
| **Veličina** | M (2 fajla, ~930 linija lock, 42 LOC overrides) |
| **Rizik** | Medium — overrides za tranzitivne, nema breaking runtime |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `f0760f7` → `SEC-06` |
| **CI** | `npm audit 60 (31 moderate, 29 high, 0 critical)` `check:all 10/10` `build` Vite 8.4.0 + Next 16.4.6 |

---

## 1. Opseg

P-SEC-06 — preostalih `33 high` iz `SEC-05` (`92` total). Fokus `glob`, `browserslist`, `brace-expansion` (korisnik `glob`, `browserslist`, `brace-expansion`) + `tiptap` + `axios`. Paralelan sa `P-PREMIUM-04` (korisnik `parallel`).

**Fajlovi:**

| Fajl | Prije | Poslije | Razlog |
|------|-------|---------|--------|
| `package.json` overrides | `vite 8.4.0`, `tiptap 3.28.0` | `+ browserslist 4.29.6`, `brace-expansion 5.1.0`, `glob 11.1.0`, `tiptap 3.28.0→3.35.0` (14 paketa), `axios 1.18.1→1.21.1` | GHSA `browserslist ≤4.28.6` → `4.29.6`, `brace-expansion ≤1.1.20/2.1.6/5.0.11` → `5.1.0`, `glob` via `@expo/cli`/`@nestjs/cli`, `tiptap ≤3.30.4` → `3.35.0`, `axios 1.0-1.19` → `1.21.1` |
| `package-lock.json` | 92 (59/33) | 60 (31/29) | -32 total (-28 moderate, -4 high) — `npx npm@11 install --legacy-peer-deps` `changed 39` |

**Nije dirano (odgođeno za P-SEC-07):** `@nestjs/platform-express`/`multer`, `@nestjs/swagger`/`js-yaml`, `@prisma/config`/`deepmerge-ts`/`effect`, `@xmldom/xmldom`, `compression`, `engine.io`, `prisma`/`mysql2`, `nodemailer`, `react-router` itd. — zahtijevaju major bump `expo`/`prisma`/`nestjs` (4 high + 31 moderate ostaje).

---

## 2. Verifikacija

| Test | Rezultat |
|------|----------|
| `npm ls browserslist` | `4.29.6` deduped |
| `npm ls brace-expansion` | `5.1.0` |
| `npm ls glob` | `11.1.0` |
| `npm ls axios` | `1.21.1` |
| `npm ls @tiptap/core` | `3.35.0` |
| `npm --workspace=frontend run build` | `✓ 3131 modules 1.52s vite 8.4.0` |
| `npm --workspace=frontend-next run build` | `✓ 33/33` `16.4.6` |
| `npm audit --json` | `60 (31 moderate, 29 high, 0 critical)` — kao `SEC-05` 92 → 60 |
| `npm run check:all` | `10/10 OK` |

---

## 3. Preostalo

`29 high` su `multer`, `js-yaml`, `compression`, `deepmerge-ts`, `effect`, `engine.io`, `mysql2`, `node-forge`, `nodemailer`, `prisma` itd. — zahtijevaju `nestjs 12`, `prisma 7`, `expo 58` major, odgođeno.

---

## 4. Rollback

```bash
git checkout HEAD -- package.json package-lock.json
npx npm@11 install --legacy-peer-deps
```

Status: ZATVOREN
