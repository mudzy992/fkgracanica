# Segment SEC-03 — Vite high fix (8.1.5→8.4.0) + @tailwindcss/vite 4.3.5

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-SEC-03 |
| **Veličina** | S (3 fajla, ~14k diff lock, 0 LOC koda) |
| **Rizik** | Low — minor bump, build 1.49s→1.34s |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `7f0bebf` → `SEC-03` |
| **CI** | `npm audit 95 (59 moderate, 36 high, 0 critical)` `check:all 10/10` `build` Vite 8.4.0 + Next 15.5.29 29 rute |

---

## 1. Opseg

P-SEC-02 evaluacija je ostavila `vite 8.1.5` high (GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-587h-7wmj-h5pm, GHSA-9jrq-w75r-8gcw, GHSA-rq7h-c2jc-7f22). Fix je `8.4.0` (8.1.6-8.1.7 ne postoje kao 8.1.8, sljedeći patch je 8.4.0).

**Fajlovi:**

| Fajl | Prije | Poslije | Razlog |
|------|-------|---------|--------|
| `frontend/package.json` | `vite ^8.1.0`, `@tailwindcss/vite ^4.3.1` | `vite ^8.4.0`, `@tailwindcss/vite ^4.3.5` | `8.4.0` postoji, `8.1.8` ne postoji (404), `4.3.5` je zadnji 4.3.x koji podržava vite 8.4.0 (`ERR_MODULE_NOT_FOUND` sa 4.3.1) |
| `package.json` | `overrides` 3 (handlebars, proxy-addr, shell-quote) | + `vite 8.4.0` | Hoisting za `vitest`/`@tailwindcss/vite` deduped `8.4.0` |
| `package-lock.json` | 96 (59/37/0) | 95 (59/36/0) | -1 high (vite), `frontend` 21→21 (9/12) ostaje, `backend`/`mobile` nepromijenjeno |

`zod 4.4.3→4.6.6` i `sharp 0.34.5→0.35.5` su probani ali `vite build` puca (`rolldown` `errors: [Getter/Setter]` za zod, `next@15.5.29` `^0.34.5` <0.35.0 za sharp) — ostavljeno za `P-SEC-04` sa `next@16.4.6`.

---

## 2. Verifikacija

| Test | Rezultat |
|------|----------|
| `npm audit --json` | `95 (59 moderate, 36 high, 0 critical)` — -1 high vs 96 |
| `npm ls vite` | `8.4.0 deduped` (frontend, @vitejs/plugin-react, @tailwindcss/vite, vitest) |
| `npm --workspace=frontend run build` | `✓ 3115 modules` `1.34s` (prije 1.49s) `vite 8.4.0` `rolldown 1.34s` |
| `npm --workspace=frontend-next run build` | `✓ 29/29` `15.5.29` `shared 123kB` |
| `npm run check:all` | `10/10 OK` |
| `inventory` | `2554/2554` |

---

## 3. Rollback

```bash
git checkout HEAD -- frontend/package.json package.json package-lock.json
npm install
```

---

## 4. Sljedeći korak

Paralelno `P-SEC-03` (ovaj) + `P-PREMIUM` (fan & commerce). `P-SEC-04` će biti `next 15.5.29→16.4.6` + `zod 4.6.6` + `sharp 0.35.5` batch (1 PR, ~50 LOC lock) nakon `tsc` fix za `screen`/`rolldown`.

Status: ZATVOREN
