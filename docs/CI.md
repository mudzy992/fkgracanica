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
| `build-test` | `npm ci` → `prisma generate` → `prisma validate` → backend `nest build` → jest unit → backend eslint → frontend `tsc -b && vite build` → bundle budget gate → **vitest + V8 coverage** → scope/gate → oxlint | build + testovi slojeva (frontend testovi od FE-02) |
| `browser-fullstack` | zasebni Postgres + Redis, migracije i minimalni sintetički seed, backend health-wait, web build i Playwright smoke | P-FE06-2; stvarni backend, samo testni podaci; trace samo na padu |
| `browser-mock` | Izolovani API mock i axe | P-FE06-1/3; nije full-stack |
| `e2e` | `postgres:16` + `redis:7` servisi → `prisma migrate deploy` → `prisma:seed` (RBAC + settings + admin + demo) → `npm run test:e2e` | **BE-09c/P-B09c-4**: e2e suite (8 specova) se prije nije izvršavao nigdje; sada je pokriven u CI-ju |

Sve skripte su **zero-dep** (node built-ins) — ne zavise od `node_modules` osim gdje je navedeno.

## Lokalno (isti pipeline kao CI)

```bash
npm ci                      # F-015 — lock je usklađen (CI-01)
npm run check:all           # sve audit provjere (6/6)
npm run db:generate         # prisma generate (traži DATABASE_URL env — dummy ok)
npm run build -w backend && npm run test -w backend
npm run build -w frontend && npm run test -w frontend && npm run lint -w frontend
npx eslint "{src,apps,libs,test}/**/*.ts"   # u backend/
```

**Git hook:** `git config core.hooksPath .githooks` (po clone-u; aktivno u ovom clone-u) —
`pre-push` pokreće `check:all` prije svakog pusha.

## Budući koraci (ne blokiraju CI-01)

- **CI-02** — backend coverage prag i dodatni health-wait u `e2e` jobu (servisi i seed su uvedeni u BE-09c; frontend V8 coverage je P-FE06-9).
- **CI-03** — odvojeni frontend job (frontend budget i Vitest/V8 koraci već su u `build-test`).
- **CI-04** — mobile build + Maestro E2E (`needs: svi prethodni`).
- `gitleaks` (binarka u CI-ju) i `npm audit --audit-level=high` — dodaju se kad prođu
  Q-09/INF-02 (trenutno secrets-ban pokriva F-001 klasu kao zero-dep provjera).
- Pinovanje akcija po SHA + Dependabot — nakon prvih zelenih runova (R-2).

## Napomena

`scripts/menu.sh` opcija "Popravka CI" **nije CI** — to je `sync-docker-locks.sh`
(regeneracija lockova) — nalaz F-010.

## Docker build kontekst (CI-04)

`check:all` uključuje `docker-context` (8. provjera):
- sve `COPY` putanje iz Dockerfile-ova moraju postojati u build kontekstu iz
  `docker-compose.yml`,
- workspace koji se gradi iz **root** konteksta (frontend) ne smije imati svoj
  `package-lock.json` (drift vodi u `npm ci` EUSAGE na deployu — vidi
  `AUDIT/segments/CI-04.md`).

Napomena: CI **ne** gradi Docker image; build se prvi put izvršava na Coolify
deployu (predlog **P-CI04-2**).

## Budžet frontend bundlea (P-FE06-7)

Poslije čistog `npm run build -w frontend` pokrenuti:

```sh
node --test scripts/standards/bundle-budget.test.mjs
node scripts/standards/bundle-budget.mjs
```

Vite manifest identifikuje `index.html` i sve **statičke tranzitivne** importe;
početni JS/CSS sabira njihove jedinstvene izlazne datoteke. Ukupni JS/CSS
obuhvata sve `.js`/`.css` datoteke u Vite `dist/assets`, uključujući dinamičke
chunkove. Broji se raw i zbir gzip veličina svakog fajla (Node zlib level 6).
HTML, slike, fontovi i public/service-worker resursi nisu dio ovog budžeta;
gzip je reproducibilna procjena, ne dokaz kompresije na produkcijskom proxyju.

Osam metrika poredi se s verzionisanim
`scripts/standards/baselines/bundle-budget.json`; rast **preko 5%** ruši CI,
kao i nedostajući/neispravan manifest ili output. Prag se ne ažurira automatski
i ne povećava tiho; nakon optimizacije može se sniziti uz evidentiranje.
`--report` je samo lokalni izvještaj, nije CI gate.

P-FE06-8: nakon prvog route-splitting batcha smanjen je **samo početni JS**
baseline (raw/gzip). Ukupni baseline ostaje originalni; tolerancija i svih
osam gate metrika nisu povećani. Per-file gzip zbir obično raste kada se bundle
podijeli u više fajlova; taj rast je dio ukupnog budžeta, ne mrežno mjerenje.

## Frontend test coverage (P-FE06-9)

```sh
npm ci
npm run test:coverage -w frontend
node --test scripts/standards/frontend-coverage.test.mjs
node scripts/standards/frontend-coverage.mjs
```

Vitest i `@vitest/coverage-v8` su tačno usklađeni i pinovani. V8 uključuje
sve `frontend/src/**/*.{js,jsx,ts,tsx,mjs,cjs}`, uključujući fajlove koje
nijedan test nije učitao; isključeni su samo `*.test.*`, `*.spec.*`, `.d.ts`
deklaracije i testna infrastruktura `src/test/**`. Izvještaj ne obuhvata
`frontend/server`, `public/sw.js`, CSS, browser/Playwright pokrivenost, backend
ni mobile. Posebna scope provjera upoređuje svaku datoteku s JSON izvještajem
i pada ako nedostaje izvor ili ako su test/vendor fajlovi dodani u nazivnik.

Tri početna identična lokalna mjerenja pokrivaju **631 izvor**, od čega 38 ima
barem jedan izvršeni statement. Polazni udio linija **4,74% (377/7953)**,
statements **4,91% (439/8926)**, funkcija **4,10% (139/3390)**, grana
**3,68% (287/7784)**. Početni CI minimumi bili su redom **4,6%, 4,8%,
4,0%, 3,6%**. Nakon prvog paketa dodatnih testova lokalno mjerenje je **7,28%**
linija, **7,64%** statements, **6,16%** funkcija i **5,79%** grana, uz isti
obuhvat od 631 izvora; ratchet je podignut na **7,1%, 7,5%, 6,0%, 5,6%**.
To **nije** tvrdnja da je dostignut cilj ≥50% / poželjnih ≥70%. Pad bilo koje
metrike ispod praga ruši CI.
CI uspoređuje pragove i s verzijom prije pusha (ili roditeljem pri ručnom
pokretanju), te odbija sniženje bilo koje od četiri metrike, i kad push sadrži
više commitova. Pri prvom uvođenju baselina nema prethodnog praga za poređenje.

U `frontend/coverage/` nastaju JSON i HTML izvještaji (gitignored). CI dodaje
sažetak u `GITHUB_STEP_SUMMARY` i zadržava `frontend-coverage` artefakt sedam
dana. Ovo je unit coverage, ne audit matrica niti dokaz ispravnosti UI tokova.
Kada novi testovi povećaju pokrivenost, nakon kompletnog mjerenja pokrenuti
`node scripts/standards/frontend-coverage.mjs --ratchet`, pregledati i commitati
promijenjeni `frontend/coverage-baseline.json`. Komanda podiže pragove samo
prema gore, u koracima 0,1 pp sa 0,1 pp rezerve pri novom podizanju; ne radi
implicitno u CI. Sniženje ili promjena obuhvata zahtijeva posebnu evidenciju
i odobrenje; trenutni CI ne dozvoljava sniženje. Cilj je planski povećavati
stvarne testove, ne smanjivati nazivnik.
