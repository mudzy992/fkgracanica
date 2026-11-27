# Segment SEC-05 — Next 16.4.6 + sharp 0.35.5 + zod 4.6.6 batch (major)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-SEC-05 |
| **Veličina** | M (4 fajla, ~14k diff lock, 4 LOC kod) |
| **Rizik** | Medium — major bump, ali build zelen |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `65281f8` → `SEC-05` |
| **CI** | `npm audit 92 (59 moderate, 33 high, 0 critical)` `check:all 10/10` `build` Vite 8.4.0 3131 modula + Next 16.4.6 31 rute + `frontend` 1.43s |

---

## 1. Opseg

P-SEC-05 — završni batch `P-SEC-02..04` (`next`, `sharp`, `zod`). Paralelan sa `P-PREMIUM-03` (korisnik `parallel`).

**Fajlovi:**

| Fajl | Prije | Poslije | Razlog |
|------|-------|---------|--------|
| `frontend-next/package.json` | `next 15.5.29` | `next 16.4.6` | GHSA `next` 9.3.4-canary-16.3.0-preview → fix `16.4.6` (`latest`). `npm@10` nije povlačio tarball (hoisting bug, `invalid: 15.5.29`), `npx npm@11 install` uspješno `next@16.4.6` `sharp 0.35.5 deduped`. |
| `backend/package.json` | `sharp ^0.34.5` | `sharp ^0.35.5` | GHSA `sharp` libvips/libheif/librsvg (`<0.35.5`). Sa `next 16.4.6` `sharp 0.35.5` je deduped (prije `next 15` pin `^0.34.5`). |
| `frontend/package.json` | `zod ^4.4.3`, `@hookform/resolvers ^5.4.0` | `zod ^4.6.6`, `@hookform/resolvers ^7.0.9` | GHSA `zod` `<4.6.6` (DoS). `zod 4.6.6` + `vite 8.4.0` `rolldown` puca `zod/v4/core` sa `resolvers 5.4.0` → `resolvers 7.0.9` fix (`zod ^3.25 || ^4.0`, `react-hook-form ^7.55`). Build `3131` modula 1.29s. |
| `package.json` | `overrides` vite 8.4.0 | isto | Zadržano |
| `package-lock.json` | 95 (59/36) vite 8.4.0 | 92 (59/33) | -3 high (`next`, `sharp`, `zod`), `npm@11 audit` 65→92 ručno, `npx npm@11 ls next 16.4.6` `sharp 0.35.5 deduped` |

`@testing-library/dom 10.4.2` iz `SEC-04` zadržan — `tsc -b` prolazi.

---

## 2. Verifikacija

| Test | Rezultat |
|------|----------|
| `npx npm@11 ls next` | `16.4.6` |
| `npm ls sharp` | `backend 0.35.5`, `frontend-next next 16.4.6 → sharp 0.35.5 deduped` |
| `npm ls zod` | `frontend 4.6.6`, `expo/cli zod 3.25.76` (zadržano) |
| `npm --workspace=frontend run build` | `✓ 3131 modules 1.43s vite 8.4.0` |
| `npm --workspace=frontend-next run build` | `✓ 31/31` `16.4.6` `○ /premium/shop/cart` `○ /premium/shop/checkout` `Proxy (Middleware)` |
| `npm audit --json` | `92 (59 moderate, 33 high, 0 critical)` — -3 high vs 95 |
| `npm run check:all` | `10/10 OK` |
| `inventory` | `2565/2565` sa `PREMIUM-03` |

---

## 3. Preostalo

`33 high` su tranzitivni `glob`, `browserslist`, `brace-expansion`, `js-yaml`, `multer`, `compression`, `axios` itd. — zahtijevaju `vite`/`vitest`/`@tiptap` major bump, odgođeno za `P-SEC-06` (poslije `PREMIUM-04`).

---

## 4. Rollback

```bash
git checkout HEAD -- frontend-next/package.json frontend/package.json backend/package.json package-lock.json
npx npm@11 install --legacy-peer-deps
```

Status: ZATVOREN
