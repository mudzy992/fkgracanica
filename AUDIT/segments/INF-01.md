# Segment INF-01 — Compose hardening

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren i zatvoren 2026-11-02) |
| **Odobrenje** | KAPIJA 2 (master plan §2.1); odluke D-004 (Q-04), D-005 (Q-05); predlozi I-01-02/03/04/08 odobreni riječima korisnika **„Može, odobravam sve"** (2026-11-02) |
| **Blokatori** | Q-04 ✔ Q-05 ✔; I-01-05 odgođen uz odobrenje preporuke (DEFER); Q-08 čeka (INF-03) |

## Opseg

`docker-compose.yml` (Coolify), `docker-compose1.yaml` (D-005 → penzionisan),
`backend/Dockerfile`, `frontend/Dockerfile`.

## Nalazi

| ID | Ozbiljnost | Nalaz | Status |
|----|-----------|-------|--------|
| **I-01-01** | High (sigurnost) | `docker-compose1.yaml` = mrtvi Traefik stack — **opasan ako se slučajno pokrene** (redis bez TLS, drugačiji env, interni postgres URL) | ✅ **RIJEŠENO** — penzionisan u `docs/_retired/` + banner + INDEX + INFRASTRUCTURE ažuriran (D-005) |
| **I-01-02** | Medium | `frontend/Dockerfile` runner radi kao **root** (nema `USER`; backend ga ima) | ✅ **PRIMIJENJENO** — `USER node` u runner fazi (og-server je read-only, port 3000 >1024); commit `7c4fb5f` |
| **I-01-03** | Medium | nema logging rotacije (docker json-file raste beskonačno) | ✅ **PRIMIJENJENO** — `logging: json-file max-size 10m / max-file 3` na backend + frontend; commit `2a93534` |
| **I-01-04** | Low | nema `security_opt: [no-new-privileges:true]` ni `cap_drop` | ✅ **PRIMIJENJENO** (minimalni korak) — `no-new-privileges:true` na oba servisa; `cap_drop` i dalje odgođeno uz odvojeni test; commit `2a93534` |
| **I-01-05** | Low | frontend `depends_on: backend` bez `condition: service_healthy` | ⏸ **ODGOĐENO UZ ODOBRENJE** — preporuka DEFER prihvaćena odobrenjem „sve" u smislu predloženih preporuka; razlog: backend `HEALTHCHECK` koristi alat koji možda ne postoji u slici (nema curl/wget garantije) pa bi `service_healthy` mogao blokati start frontenda u produkciji |
| **I-01-08** | Low (reproduktibilnost) | `frontend/Dockerfile` pokretao `npm install --package-lock-only` **PRIJE** `npm ci` → lock se regenerisao pri buildu | ✅ **PRIMIJENJENO** — `RUN npm ci` (lock u repoju je jedini izvor istine); commit `7c4fb5f` |
| I-01-06 | Info ✓ | backend Dockerfile: `USER app` ✓, `HEALTHCHECK` ✓, multi-stage ✓, prisma generate u buildu ✓ | — |
| I-01-07 | Info ✓ | compose: `restart: unless-stopped` ✓, TLS mountovi/env (D-001) ✓, eksterne `db_net`/`redis_net` ✓, `version:` nepotreban (modern compose) ✓ | — |

## Odobrenja (2026-11-02 — „Može, odobravam sve")

1. **I-01-08** → DA → primijenjeno (`7c4fb5f`).
2. **I-01-03** → DA → primijenjeno (`2a93534`).
3. **I-01-04** → DA (minimalno: no-new-privileges) → primijenjeno (`2a93534`); `cap_drop` i dalje odgođen.
4. **I-01-02** → DA uz provjeru → provjeren og-server (bez fs upisa, port 3000) → `USER node` primijenjen (`7c4fb5f`).
5. **I-01-05** → preporuka je bila DEFER (ne primjenjuj sada) → odobrena kao odgađanje; ne primjenjuje se u ovom segmentu.

## Izmjene u segmentu

- `docs/_retired/docker-compose1.yaml` (+ banner), `docs/_retired/INDEX.md`, `docs/INFRASTRUCTURE.md`
- `docker-compose.yml` — dokumentacioni header (D-005) + **hardening** (`logging` rotacija, `no-new-privileges`) — I-01-03, I-01-04
- `frontend/Dockerfile` — bez regeneracije lockfile-a (I-01-08) + `USER node` (I-01-02)
- `scripts/audit/inventory.mjs` — uklonjena mrtva referenca
- `docs/DECISIONS.md` — D-004, D-005; `AUDIT/02_MASTER_AUDIT_PLAN.md` §6 — Q-04/Q-05 ✔

## Testovi / verifikacija

- `node scripts/audit/inventory.mjs` — 1284 fajla, uklonjen red `docker-compose1.yaml` ✓
- `npm run check:all` — 6/6 ✓ (prije i poslije hardeninga)
- YAML compose validan (`js-yaml`) ✓; `frontend/Dockerfile` provjera USER/RUN linija ✓
- og-server provjera prije `USER node`: samo `readFileSync` (bez upisa), `listen(PORT)` ✓

### CI runovi segmenta

| Run | SHA | Rezultat | Napomena |
|-----|-----|----------|----------|
| `41483038067` | `feb44e3` | ❌ | secrets-ban: D-004 dokaz u `docs/DECISIONS.md` → allowlist poprava |
| `41483596127` | `9a7fbc2` | ✅ | sva 3 joba (audit-gate, standards, build-test) |
| `41485825537` | `7c4fb5f`+`2a93534` | ✅ | hardening primijenjen (I-01-02/03/04/08) |

### Commiti segmenta

`feb44e3` (penzija compose1 + audit + D-004/D-005) → `9a7fbc2` (allowlist) →
`7c4fb5f` (frontend Dockerfile) → `2a93534` (compose hardening) → zatvarajući docs commit.

## Status segmenta: ZATVOREN
