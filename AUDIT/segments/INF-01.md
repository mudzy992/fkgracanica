# Segment INF-01 — Compose hardening

| Polje | Vrijednost |
|-------|------------|
| **Status** | **u toku** (otvoren 2026-11-02) — čeka odluku o predlozima I-01-02…08 |
| **Odobrenje** | KAPIJA 2 (master plan §2.1); odluke D-004 (Q-04), D-005 (Q-05) |
| **Blokatori** | Q-04 ✔ Q-05 ✔ (odblokirani 2026-11-02); Q-08 čeka (INF-03) |

## Opseg

`docker-compose.yml` (Coolify), `docker-compose1.yaml` (D-005 → penzionisan),
`backend/Dockerfile`, `frontend/Dockerfile`.

## Nalazi

| ID | Ozbiljnost | Nalaz | Status |
|----|-----------|-------|--------|
| **I-01-01** | High (sigurnost) | `docker-compose1.yaml` = mrtvi Traefik stack — **opasan ako se slučajno pokrene** (redis bez TLS, drugačiji env, interni postgres URL) | ✅ **RIJEŠENO** — penzionisan u `docs/_retired/` + banner + INDEX + INFRASTRUCTURE ažuriran (D-005) |
| **I-01-02** | Medium | `frontend/Dockerfile` runner radi kao **root** (nema `USER`; backend ga ima) | ⏳ predlog — čeka odobrenje |
| **I-01-03** | Medium | nema logging rotacije (docker json-file raste beskonačno) | ⏳ predlog — čeka odobrenje |
| **I-01-04** | Low | nema `security_opt: [no-new-privileges:true]` ni `cap_drop` | ⏳ predlog — čeka odobrenje |
| **I-01-05** | Low | frontend `depends_on: backend` bez `condition: service_healthy` (HEALTHCHECK postoji u Dockerfileu) | ⏳ predlog — čeka odobrenje |
| **I-01-08** | Low (reproduktibilnost) | `frontend/Dockerfile` pokreće `npm install --package-lock-only` **PRIJE** `npm ci` → lock se regeneriše pri buildu (može povući nove verzije = F-016/F-017 klasa) | ⏳ predlog — čeka odobrenje (preporuka: ukloniti) |
| I-01-06 | Info ✓ | backend Dockerfile: `USER app` ✓, `HEALTHCHECK` ✓, multi-stage ✓, prisma generate u buildu ✓ | — |
| I-01-07 | Info ✓ | compose: `restart: unless-stopped` ✓, TLS mountovi/env (D-001) ✓, eksterne `db_net`/`redis_net` ✓, `version:` nepotreban (modern compose) ✓ | — |

## Predlozi (čekaju eksplicitno odobrenje — pravilo 1: vidljivo ponašanje)

1. **I-01-08** (preporuka: DA) — ukloniti `--package-lock-only` iz frontend builda → build tačno koristi commitani lock.
2. **I-01-03** (preporuka: DA) — `logging: {driver: json-file, options: {max-size: 10m, max-file: 3}}` na backend + frontend.
3. **I-01-04** (preporuka: DA, minimalno) — `security_opt: [no-new-privileges:true]` na oba servisa (cap_drop nakon odvojenog testa).
4. **I-01-02** (preporuka: DA uz provjeru) — `USER` za frontend runner (port 3000 >1024; og-server ne piše disk — provjeriti prije).
5. **I-01-05** (preporuka: DA) — `depends_on: backend: condition: service_healthy`.

## Izmjene u segmentu (za sada)

- `docs/_retired/docker-compose1.yaml` (+ banner), `docs/_retired/INDEX.md`, `docs/INFRASTRUCTURE.md`
- `docker-compose.yml` — samo dokumentacioni header (0 promjena ponašanja)
- `scripts/audit/inventory.mjs` — uklonjena mrtva referenca
- `docs/DECISIONS.md` — D-004, D-005; `AUDIT/02_MASTER_AUDIT_PLAN.md` §6 — Q-04/Q-05 ✔

## Testovi / verifikacija

- `node scripts/audit/inventory.mjs` — 1284 fajla, uklonjen red `docker-compose1.yaml` ✓
- `npm run check:all` — 6/6 ✓
- YAML compose validan (`js-yaml`) ✓
- **CI**: zelen run nakon pusha (vidi STATE)

## Status segmenta: OTVOREN
