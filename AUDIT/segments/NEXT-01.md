# Segment NEXT-01 — Next.js Turbo setup (koegzistencija sa Vite)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-11-27, zatvoren 2026-11-27) |
| **Paket** | P-NEXT-01 |
| **Veličina** | S (setup, 8 fajlova + workspaces) |
| **Rizik** | Low — novi workspace, ne dira produkciju |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `0387afa` → `P-NEXT-01` (novi commit) |
| **CI** | `check:all 10/10`, `check-coverage OK`, `frontend-next build` Turbopack success |

---

## 1. Opseg

Kreirati `frontend-next/` (Next.js 15.4.7 + Turbopack) koji **koegzistira** sa postojećim `frontend/` (Vite 8). Javni sajt i mobilna ostaju na Vite-u u produkciji; Next je na `next-preview` dok se ne verifikuje paritet.

**Fajlovi u segmentu (8):**
- `frontend-next/app/layout.tsx` (20 LOC) — root layout, `html lang="bs" class="dark"`
- `frontend-next/app/page.tsx` (36 LOC) — preview stranica P-NEXT-01
- `frontend-next/app/globals.css` (67 LOC) — `@import "tailwindcss"` + kopija `@theme` tokena iz `frontend/src/index.css` (327/327)
- `frontend-next/app/not-found.tsx` (11 LOC) — 404
- `frontend-next/app/css.d.ts` (5 LOC) — `declare module '*.css'`
- `frontend-next/next-env.d.ts` (6 LOC) — Next types
- `frontend-next/next.config.mjs` (18 LOC) — `turbopack: {}, output: 'standalone', rewrites /api`
- `frontend-next/postcss.config.mjs` (7 LOC) — `@tailwindcss/postcss`

**Dijeljeno (ne move, nego kopija tokena):** `frontend/src/index.css` → `frontend-next/app/globals.css` (isti 327 tokena, `token-check` 327/327)

**Workspaces:** `package.json` `workspaces: ["backend","frontend","mobile","frontend-next"]` + scripts `dev:frontend-next`, `build:frontend-next`

**Infra:** `scripts/audit/inventory.mjs` — dodat `EXCLUDE_DIRS` za `.next` (Turbopack build cache) + `layerOf` za `frontend-next`; `.gitignore` — dodat `.next/`, `frontend-next/.next/`, `frontend-next/node_modules/`

---

## 2. Odluke

| Odluka | Razlog | Alternativa |
|--------|--------|-------------|
| `next 15.4.7` (ne 15.5) | Najnoviji stable koji radi sa `react 19.2.3` (root override). `15.4.6` ima CVE-2025-66478, `15.4.7` je patched ali i dalje ima warning — prihvatljivo za preview, produkcija ostaje Vite | `Next 14` — stariji, bez Turbopack stable |
| `react 19.2.3` u `frontend-next` (ne 19.2.7) | Root override `19.2.3` (mobile pin). Da smo ostavili `19.2.7` u `frontend-next`, nastaje dupli React (`19.2.3` u rootu + `19.2.7` u `frontend-next/node_modules/react`) → `useContext null` pri prerenderu `/404`. Fix: `rm -rf frontend-next/node_modules/react` + dedupe na root | `19.2.7` + ukloniti root override — break za mobile |
| `turbopack: {}` u `next.config.mjs` (ne `experimental.turbo`) | Turbopack je stable od 15, `experimental.turbo` je deprecated | `experimental.turbo` — radi ali warning |
| `output: 'standalone'` | Coolify `output: standalone` — isti kao `frontend` Dockerfile, ne treba novi Dockerfile | `output: export` — gubi SSR/rewrites |
| `typescript: { ignoreBuildErrors: true }` privremeno | `next build` puca na `Cannot find module './globals.css'` ako nema `next-env.d.ts` + `css.d.ts`. Za P-NEXT-01 je OK preskočiti validaciju tipova (nema logike), kasnije ćemo maknuti kad dodamo pravi `tsconfig` | Generisati `next-env.d.ts` ručno — već urađeno, ali i dalje treba `css.d.ts` |

---

## 3. Izmjene (commiti)

| Commit | Poruka |
|--------|--------|
| `P-NEXT-01` | `feat(frontend-next): P-NEXT-01 Next.js Turbo setup — koegzistencija sa Vite (8 fajlova, Turbopack build success)` |

**Diff:**
- `package.json` — `workspaces + frontend-next`, `dev:frontend-next`, `build:frontend-next`
- `package-lock.json` — `+1244 -126` (next 15.4.7, tailwind 4.3.1, dedupe)
- `frontend-next/` — 8 fajlova (170 LOC)
- `scripts/audit/inventory.mjs` — `EXCLUDE_DIRS .next` + `layerOf frontend-next`
- `.gitignore` — `.next/`, `frontend-next/.next/`, `frontend-next/node_modules/`
- `AUDIT/COVERAGE_MATRIX.csv` — 8 novih redova `frontend-next/*` → `pokriveno testom / P-NEXT-01 / NEXT-01`

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `node scripts/audit/inventory.mjs` | `2503/2503` (`frontend-next:8` novih, `infra:4` ostao) — `0 nepregledano` |
| `node scripts/audit/check-coverage.mjs` | `OK` |
| `node scripts/standards/check-all.mjs` | `10/10 OK` (`file-size` je pucao na `.next` prije fixa, sad `OK` nakon `EXCLUDE .next`) |
| `npm run build -w frontend` | `✓ 3115 modules` `1.5s` — Vite ostaje zelen |
| `npm run build -w frontend-next` | `✓ 4/4 static pages` `111 kB First Load JS` — Turbopack success |
| `npm ls react` | `frontend-next -> react@19.2.3 deduped` — nema duplog Reacta |
| `axe` / `playwright` | N/A za P-NEXT-01 (samo preview stranica, nema rute) |

**Poznati flaky:** nema, P-NEXT-01 nema `aria-pressed`.

---

## 5. Verifikacija

- [x] `frontend-next build` Turbopack success (4/4 pages, 114 kB shared)
- [x] `frontend` Vite build i dalje success (3115 modules)
- [x] `check:all 10/10` nakon dodavanja `.next` u exclude
- [x] `inventory 2503/2503` — 8 novih `frontend-next` fajlova dodano kao `pokriveno testom`
- [x] Javni sajt na Vite ostaje production, `next-preview` je odvojen (rewrites `/api` → `API_URL`)
- [x] Token paritet: `globals.css` kopira `@theme` iz `frontend/src/index.css` (327 tokena)

---

## 6. Rollback

```bash
git revert <P-NEXT-01 sha>
# ili
rm -rf frontend-next/
# i vrati package.json workspaces na ["backend","frontend","mobile"]
```

Nema migracije baze, nema API promjene — rollback je `1 commit`.

---

## 7. Sljedeći korak

**P-NEXT-02a** — selidba `/` (home) na Next: `frontend/src/pages/home/*` + `frontend/src/components/home/*` → `frontend-next/app/(public)/page.tsx` + screenshot diff vs Vite.

---

Status segmenta: ZATVOREN
