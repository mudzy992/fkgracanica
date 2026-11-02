# CI/CD (GitHub Actions)

> Status: **CI NE POSTOJI** — `.github/` nikada nije bio u historiji repozitorija (F-002).
> Ovaj dokument je izvor istine; ažurira se u ISTOM commitu kad se promijeni aktivna grana.

## Aktivna grana

**`arena/290a6f13-fkgracanica`** — na ovoj grani se radi; workflow filter mora glasiti
tačno na ovu granu (`branches:` + `workflow_dispatch`). **Bez `pull_request` okidača. Nikad PR.**

## Trenutno stanje

| Stavka | Status |
|--------|--------|
| `.github/workflows/*` | ❌ ne postoji |
| Okidači | — |
| Runovi | — (nema čega provjeriti; `gh run list` prazan) |
| Blokator prije prvog CI-a | **F-015** (root `npm ci` pada — lock neusklađen) |

## Planirani pipeline (iz protokola FAZA B — puni detalji u AUDIT/02_MASTER_AUDIT_PLAN.md)

1. **Static** — lint, format, type-check, konvencije, secret scan, dependency audit,
   license check, guardrail skripte (`scripts/standards/check:all`).
2. **Backend** — unit + integration/API + coverage prag.
3. **Frontend** — unit/component, Playwright E2E (artefakti na failure), axe a11y,
   build + provjera bundle veličine.
4. **Audit gate** — `check-coverage` skripta (matrica) + konzistentnost dokumentacije.
5. **Mobile** — build + E2E na emulatoru kao **posljednji** korak (`needs: svi prethodni`),
   JUnit izvještaji, snimke kao artefakti.
6. **Izvještaji** — JUnit/coverage artefakti, `GITHUB_STEP_SUMMARY`, badge.

Pravila: paralelni jobovi gdje je moguće, `concurrency` (cancel-in-progress), minimalna
`permissions`, pinovane akcije po SHA, caching, timeouti, determinizam.

## Napomena

`scripts/menu.sh` opcija "Popravka CI" **nije CI** — to je `sync-docker-locks.sh`
(regeneracija lockova) — nalaz F-010.
