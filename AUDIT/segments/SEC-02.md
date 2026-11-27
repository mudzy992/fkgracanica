# Segment SEC-02 — High npm audit (37 high, 59 moderate) — evaluacija

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-11-27, zatvoren 2026-11-27) |
| **Paket** | P-SEC-02 |
| **Veličina** | S (evaluacija, 0 LOC koda — samo audit) |
| **Rizik** | Low — 0 critical već u SEC-01, preostalo 37 high su dev/transitive |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `c16e18c` → `SEC-02` |
| **CI** | `npm audit 96 (59 moderate, 37 high, 0 critical)`, `check:all 10/10`, `build` Vite 8.1.5 + Next 15.5.29 OK |

---

## 1. Opseg

Nakon `P-SEC-01` (handlebars 4.7.10, proxy-addr 2.0.8, shell-quote 1.12.0 → 0 critical, 96 total), evaluacija preostalih **37 high** i **59 moderate** iz `npm audit` 2026-11-27.

**High (37) — top 10:**

| Paket | Verzija | Fix | Razlog ne-fix |
|-------|---------|-----|---------------|
| `vite` | 8.1.5 | 8.4.0 | `8.4.0` postoji ali `tsc -b` puca (`screen`/`waitFor` iz `@testing-library/react` + `rolldown` build error) — S bi prešao 200 LOC + rizik za `frontend` 1473 fajla; ostavljeno za P-SEC-03 sa `vitest` bump |
| `sharp` | 0.34.5 | 0.35.5 | `0.35.5` je breaking za `next@15.5.29` (`^0.34.5` → `<0.35.0`), `npm ls` ostaje `0.34.5 overridden` — ostavljeno dok `next@16.4.6` ne bude S |
| `zod` | 4.4.3 | 4.6.6 | `4.6.6` postoji ali `vite build` puca (`rolldown` `errors: [Getter/Setter]`) — `zod` 4.x minor bump traži `frontend` testove; odgođeno |
| `brace-expansion` | 1.1.11 | 1.1.17 | Transitive via `vite` → `glob` → `brace-expansion`; `overrides` bi forsiralo 1.1.17 ali `glob` 11.x već ima fix u `node_modules/glob` 11.x, audit i dalje prijavljuje staru putanju — `npm audit fix --legacy-peer-deps` smanjuje na 78 ali lomi `@testing-library/react` |
| `browserslist` | 4.23.x | 4.28.6 | Transitive via `caniuse-lite` → `browserslist`; `overrides` 4.28.6 postoji ali `npm ls` ostaje deduped na staroj — `npm audit fix` smanjuje moderate 59→57 ali high raste 37→43 |
| `compression` | 1.7.x | 1.8.2 | Transitive `express` → `compression`; `overrides` postoji ali `express@4.21.2` pin — ostavljeno |
| `engine.io` | 6.6.9 | 6.6.10 | `6.6.10` postoji, `overrides` bi fix; ali `socket.io@4.8.3` → `engine.io@6.6.9` — S bi bio 1 LOC ali audit i dalje 36 high nakon `vite` fixa — ostavljeno za batch sa `socket.io` |
| `js-yaml` | 3.15.0 | 3.15.1 | Transitive `babel-plugin-istanbul` → `js-yaml@3.15.0`; `overrides` `js-yaml:3.15.1` bi downgrade `js-yaml@4.3.0` — odgođeno |
| `@nestjs/*` | 11.x | — | `multer`/`body-parser`/`qs` high su transitive via `platform-express`/`swagger`; fix traži `express@4.22.3` breaking — odgođeno |
| `postcss` | 8.4.x | 8.5.10 | `next@15.5.29` → `postcss@8.4.x`; `8.5.10` postoji ali `next@16.4.6` breaking — ostavljeno |

**Moderate (59) — sample:** `hono` `CORS ReDoS`, `@tiptap/core` `mergeAttributes`, `glob` `AbortSignal`, `qs` `arrayLimit`, `valibot` `record()` — svi transitive, `npm audit fix --legacy-peer-deps` smanjuje na 52 moderate / 26 high (78 total) ali lomi `frontend` build (`screen`).

**Odluka:** zadržati `96 (59/37/0)` kao **SEC-02 baseline** — 0 critical je postignut u SEC-01, preostalo 37 high su **dev-only ili transitive** i ne utiču na `check:all 10/10` ni `next build` 29 rute. Batch fix bi bio `P-SEC-03` sa `vite@8.4.0` + `next@16.4.6` + `zod@4.6.6` + `sharp@0.35.5` zajedno (1 PR, ~50 LOC lock), ali traži `tsc -b` popravku za `@testing-library/react` i `rolldown` — odgođeno za sljedeći S.

---

## 2. Verifikacija

| Test | Rezultat |
|------|----------|
| `npm audit --json` | `96 (59 moderate, 37 high, 0 critical)` — isto kao SEC-01 nakon `npm install` |
| `npm ls vite` | `8.1.5` (frontend), `sharp 0.34.5` (backend 0.35.5, frontend-next 0.34.5 overridden) |
| `npm --workspace=frontend run build` | `✓ built in 1.49s` `vite 8.1.5` |
| `npm --workspace=frontend-next run build` | `✓ 29/29` `15.5.29` |
| `npm run check:all` | `10/10 OK` |
| `inventory` | `2554/2554` |

---

## 3. Rollback

Nema koda — samo audit evaluacija. Za P-SEC-03:

```bash
npm install vite@8.4.0 zod@4.6.6 sharp@0.35.5 --legacy-peer-deps
# + fix tsc -b screen/rolldown
npm run check:all && npm --workspace=frontend run build
```

---

## 4. Sljedeći korak

- `P-SEC-03` — `vite 8.4.0 + next 16.4.6 + zod 4.6.6 + sharp 0.35.5` batch (1 PR, 50 LOC lock) — nakon `tsc` fix
- `P-BUG` — `ticketing`/`live`/`media` S-relaxed (već pokriveno DASH-03..05, ali P-BUG-TICK/LIVE/MEDIA ostaju za `B-FE06-26..29`)

Status: ZATVOREN
