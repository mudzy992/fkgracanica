# CI/CD (GitHub Actions)

> Status: **POSTOJI** od segmenta **CI-01** (2026-11-02) — `.github/workflows/ci.yml`.
> Historija: `.github/` nikada nije postojao prije (F-002). Ovaj dokument je izvor
> istine; ažurira se u ISTOM commitu kad se promijeni pipeline.

## Aktivna grana

**`arena/290a6f13-fkgracanica`** — okidači: `push` na ovu granu + `workflow_dispatch`.
**Nema `pull_request` okidača. Nikad PR prema main** (pravilo korisnika).

[![CI](https://github.com/mudzy992/fkgracanica/actions/workflows/ci.yml/badge.svg?branch=arena/290a6f13-fkgracanica)](https://github.com/mudzy992/fkgracanica/actions/workflows/ci.yml)

## Aktivni jobovi (CI-01)

| Job | Šta radi | Zašto |
|-----|----------|-------|
| `audit-gate` | `node scripts/audit/check-coverage.mjs` | matrica pokrivenosti — svaki izvorni fajl mora imati red (pravilo 4) |
| `standards` | `node scripts/standards/check-all.mjs` | file-size, console-ban, secrets-ban, layer-deps, docs-links (+ coverage) |
| `build-test` | `npm ci` → `prisma generate` → `prisma validate` → backend `nest build` → jest unit → backend eslint → frontend `tsc -b && vite build` → oxlint | build + testovi slojeva; e2e servisi dolaze u CI-02 |

Sve skripte su **zero-dep** (node built-ins) — ne zavise od `node_modules` osim gdje je navedeno.

## Lokalno (isti pipeline kao CI)

```bash
npm ci                      # F-015 — lock je usklađen (CI-01)
npm run check:all           # sve audit provjere (6/6)
npm run db:generate         # prisma generate (traži DATABASE_URL env — dummy ok)
npm run build -w backend && npm run test -w backend
npm run build -w frontend && npm run lint -w frontend
npx eslint "{src,apps,libs,test}/**/*.ts"   # u backend/
```

**Git hook:** `git config core.hooksPath .githooks` (po clone-u; aktivno u ovom clone-u) —
`pre-push` pokreće `check:all` prije svakog pusha.

## Budući koraci (ne blokiraju CI-01)

- **CI-02** — backend e2e (postgres + redis servisi, seed, health-wait, coverage prag).
- **CI-03** — frontend test jobovi (vitest — dolazi s FE-02).
- **CI-04** — mobile build + Maestro E2E (`needs: svi prethodni`).
- `gitleaks` (binarka u CI-ju) i `npm audit --audit-level=high` — dodaju se kad prođu
  Q-09/INF-02 (trenutno secrets-ban pokriva F-001 klasu kao zero-dep provjera).
- Pinovanje akcija po SHA + Dependabot — nakon prvih zelenih runova (R-2).

## Napomena

`scripts/menu.sh` opcija "Popravka CI" **nije CI** — to je `sync-docker-locks.sh`
(regeneracija lockova) — nalaz F-010.
