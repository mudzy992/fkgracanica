# Odluke (odobrene od korisnika)

> Dnevnik odluka. **Samo** odluke koje je korisnik eksplicitno odobrio. Nova odluka =
> novi red + referenca na sesiju/commit. Bez unosa = nije odobreno.

| ID | Datum | Odluka | Kontekst / referenca |
|----|-------|--------|----------------------|
| D-001 | 2026-11-02 | **TLS za Redis i Postgres (Coolify).** Mount-ovi: `/data/coolify/ssl/redis-core/redis-ca.crt` → `/run/secrets/redis-ca.crt:ro` i `/data/coolify/ssl/coolify-ca.crt` → `/etc/ssl/certs/coolify-ca.crt:ro`; env: `DATABASE_URL=…?sslmode=verify-full&sslrootcert=/etc/ssl/certs/coolify-ca.crt`, `REDIS_URL=rediss://…:6380`, `REDIS_TLS_CA=/run/secrets/redis-ca.crt`, `NODE_EXTRA_CERTS=/etc/ssl/certs/coolify-ca.crt`; backend čita `REDIS_TLS_CA` i proslijeđuje `tls.ca` (helper `redis-tls.util.ts`); ACL korisnik `fkgracanica` kreiran redis-cli-jem (ograničeni ključevi `~fk:* ~bull:*`, oduzeti admin komande). | Korisnikov zahtjev u sesiji; commiti `09a292e` (infra envs + mountovi) i `b0376a5` (eksplicitni CA + hardcode envs) |
| D-002 | 2026-11-02 | **Radni protokol:** nikad PR; rad samo na aktivnoj grani `arena/290a6f13-fkgracanica`; zelen CI nakon svakog pusha (dok CI postoji); audit dokumentacija u `AUDIT/`; penzionisanje stare dokumentacije u `docs/_retired/` sa banerima. | Korisnikov protokol (ULOGA/FAZE) |
| D-003 | 2026-11-02 | **Penzionisanje stare dokumentacije (prvi val):** `aplikacijski-plan.md`, `BUILDIN_PROBLEMS.md`, `docs/mysql-to-postgres-migration.md`, `docs/club-launch/**`, `backend/README.md`, `frontend/README.md` → `docs/_retired/` (+ baneri + INDEX); linkovi u root `README.md` ažurirani. Odgođeno uz pitanja: root README (Q-01), `.cursor/plans` (Q-02), smoke checkliste (Q-03). | FAZA 1; AUDIT/01 + docs/_retired/INDEX.md |
