# Segment SEC-04 — Next/sharp/zod batch + tsc `screen` fix

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-SEC-04 |
| **Veličina** | S (2 fajla, ~90 linija lock, 1 LOC kod `frontend/package.json`) |
| **Rizik** | Low — `skipLibCheck` fix, nema breaking bump |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `2a5ae62` → `SEC-04` |
| **CI** | `npm audit 95 (59 moderate, 36 high, 0 critical)` `check:all 10/10` `build` Vite 8.4.0 + Next 15.5.29 30 rute + `frontend` 3115 modula |

---

## 1. Opseg

Nastavak `P-SEC-03` (`vite 8.1.5→8.4.0`). `P-SEC-04` je batch `next 15.5.29→16.4.6` + `sharp 0.34.5→0.35.5` + `zod 4.4.3→4.6.6` (GHSA za `next`, `sharp` libvips/libheif/librsvg, `zod` GHSA-mrhx). Paralelan sa `P-PREMIUM-02` (korisnik `parallel`).

**Ispitano:**

| Paket | Pokušaj | Rezultat | Odluka |
|-------|---------|----------|--------|
| `next` 15.5.29→16.4.6 | `npm install next@16.4.6 --workspace=frontend-next` | Lock `16.4.6` ali `frontend-next/node_modules/next` ostaje `15.5.29 invalid`, `npm ls next invalid`, `next build` i dalje `15.5.29`. Root workspaces hoisting + `npm install` ne povlači tarball (cache/lock nedosljedan). `next 16` je major (async `params`/`headers`, `turbopack` default) — zahtijeva migraciju. | **Odgođeno** za `P-SEC-05` sa `npm ci --force` + migracija `app/*` `params` |
| `sharp` 0.34.5→0.35.5 | `npm install sharp@0.35.5 --workspace=backend` | `backend` `0.35.5` OK, ali `frontend-next` `next@15.5.29 → sharp 0.34.5` ostaje (`next` pin `^0.34.5 <0.35.0`), audit `sharp high` ostaje `36 high` (audit 95→94 -1 moderate samo). | **Odgođeno** uz `next 16.4.6` (next 16 podržava `0.35.5`) |
| `zod` 4.4.3→4.6.6 | `npm install zod@4.6.6 --workspace=frontend` | `✓ added`, ali `vite build` `tsc -b` puca `screen`/`waitFor`, `rolldown Getter/Setter` sa `vite 8.4.0`. Fix je `4.6.6` ali `frontend` `zod` je `3 high` via `@expo/cli` `zod 3.25.76` — global audit ostaje 95. | **Odgođeno** za `P-SEC-05` (zod 4.6.6 + vitest bump) |

**Fix koji je zadržan:**

| Fajl | Prije | Poslije | Razlog |
|------|-------|---------|--------|
| `frontend/package.json` | nema `dom` | `+ "@testing-library/dom": "^10.4.2"` | `vite 8.4.0` + `npm ci` je obrisao tranzitivni `@testing-library/dom 10.4.2` (iz `c16e18c` locka) pa `tsc -b` puca `Module '"@testing-library/react"' has no exported member 'screen'/'waitFor'` ( `react 16.3.3` `export * from '@testing-library/dom'` ). Eksplicitni `devDependency` vraća `10.4.2` i `tsc` prolazi `3115 modules 1.49s`. Lock `+7 paketa`, audit ostaje 95 (59/36/0). |

---

## 2. Verifikacija

| Test | Rezultat |
|------|----------|
| `npm ls @testing-library/dom` | `10.4.2 deduped` (react, jest-dom, user-event) |
| `npm --workspace=frontend run build` | `✓ 3115 modules 1.49s vite 8.4.0` (prije pucao) |
| `npm --workspace=frontend-next run build` | `✓ 30/30` `○ /premium 0 B 116kB` `shared 123kB` `15.5.29` |
| `npm run check:all` | `10/10 OK` |
| `npm audit` | `95 (59 moderate, 36 high, 0 critical)` — kao `SEC-03` (vite fix zadržan), `next/sharp/zod` odgođeni |
| `inventory` | `2555/2555` (PREMIUM-01) + `SEC-04` fix, bez novih fajlova |

---

## 3. Rollback

```bash
git checkout HEAD -- frontend/package.json package-lock.json
npm install --legacy-peer-deps
```

---

## 4. Sljedeći korak

`P-SEC-05` — `next 16.4.6` (major) + `sharp 0.35.5` + `zod 4.6.6` batch sa `tsc` migracijom i `npm ci` (1 PR, ~50 LOC lock). Paralelno `P-PREMIUM-02` (loyalty/shop) je zatvoren isti dan.

Status: ZATVOREN
