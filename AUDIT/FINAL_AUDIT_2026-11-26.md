# ZAVRŠNI AUDIT IZVJEŠTAJ — 2026-11-26T21:45:09Z

head: a0fc503 branch: arena/290a6f13-fkgracanica

## 1. Matrica pokrivenosti
Matrica: /home/user/fkgracanica/AUDIT/COVERAGE_MATRIX.csv
Ukupno fajlova: 2495 | po slojevima: {"infra":4,"backend":446,"frontend":1473,"mobile":542,"scripts":30}
Pregledano (svi statusi osim nepregledano/u toku): 2495/2495
check-coverage: OK — matrica pokriva sve izvorne fajlove; nema zatvorenih segmenta s nepregledanim fajlovima.

## 2. Standards (check:all)
✓ check-coverage: check-coverage: OK — matrica pokriva sve izvorne fajlove; nema zatvorenih segmenta s nepregledanim fajlovima.
✓ file-size: file-size: OK
✓ console-ban: console-ban: OK (0 zabranjenih poziva u src)
✓ token-check: token-check: OK (palette 327/327; tokeni definisani samo u index.css)
✓ component-check: Button: kit 290 vs raw 0 → 0.0% raw OK (limit 0%)
✓ secrets-ban: secrets-ban: OK (nema tajni u trackanim fajlovima; F-001 dokaz samo u allowlist dokumentima — AUDIT/DECISIONS/_retired)
✓ layer-deps: layer-deps: OK (nema cross-layer importa; ciklički importi — v2, odgođeno)
✓ docs-links: docs-links: OK (svi relativni linkovi u docs/ i README vode na postojeće fajlove)
✓ docker-context: docker-context: OK (migrator(.), backend(.), worker(.), frontend(.); 3 workspace-a bez stranog locka)
✓ bundle-react: bundle-react: SKIP (nema frontend/dist — pokreni `npm run build -w frontend`)

check:all — OK (10/10)

## 3. npm audit (high+)
root: {'info': 0, 'low': 0, 'moderate': 60, 'high': 37, 'critical': 3, 'total': 100}
backend: {'info': 0, 'low': 0, 'moderate': 24, 'high': 17, 'critical': 2, 'total': 43}
frontend: {'info': 0, 'low': 0, 'moderate': 37, 'high': 15, 'critical': 1, 'total': 53}
mobile: {'info': 0, 'low': 0, 'moderate': 39, 'high': 20, 'critical': 1, 'total': 60}

## 4. CI status
Run 45899911288 a0fc503 in_progress None att1
- audit-gate (coverage matrix): completed/success
- browser mock + axe (web): in_progress/None
- standards (check:all): completed/success
- browser smoke (backend + postgres + redis): in_progress/None
- build + test (backend, frontend): in_progress/None
- e2e (postgres + redis): completed/success
