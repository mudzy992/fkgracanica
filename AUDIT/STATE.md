# AUDIT STATE — živi dnevnik

> Ažurira se u **svakom** commitu. Slijedi strukturu iz protokola.

## Meta

| Polje | Vrijednost |
|-------|------------|
| **Aktivna grana** | `arena/290a6f13-fkgracanica` |
| **Trenutna faza** | FAZA 1 završena → **KAPIJA 1** (čeka odobrenje) |
| **Trenutni segment** | nijedan otvoren (master plan = FAZA 2, čeka odobrenje) |
| **Zadnji commit** | `583214a` (docs(audit): FAZA 0+1…) — pushan na origin |
| **Zadnji CI run** | **N/A — nema runova**: `gh run list` prazan, `.github/` ne postoji (F-002 → Q-06, segment CI-01). Push `583214a` je BEZ CI-a i to je eksplicitno evidentirano. |
| **check:all** | ne postoji (scripts/standards/ = FAZA 3) |

## Šta je urađeno (hronološki)

### Sesija TLS (prethodno, commiti `09a292e`, `b0376a5` — pushani)
- F-SSL-1: audit korištenja Redis-a (BullMQ email red + keš; opciono preko `REDIS_URL`).
- F-SSL-2: TLS envs + mountovi u `docker-compose.yml`, `.env.example` (D-001).
- F-SSL-3: ispravka `self-signed certificate in certificate chain` — eksplicitni
  `REDIS_TLS_CA` → `tls.ca` (helper `common/utils/redis-tls.util.ts`), hardcode
  `NODE_EXTRA_CERTS`/`REDIS_TLS_CA` u compose; commit `b0376a5`.
- Napomena: workspace je bio re-clone-an (lokal pao na `b7f1d3d`) → poravnan sa remote
  (`git reset FETCH_HEAD`), sadržaj identičan.

### Sesija AUDIT (FAZA 0 + FAZA 1) — 2026-11-02
- F-000: Potvrđena aktivna grana `arena/290a6f13-fkgracanica` @ `b0376a5`.
- FAZA 0: pročitana sva dostupna dokumentacija (README, plan, docs/, .cursor aggregates,
  mobile smoke, scripts), mapiran stack po slojevima → `AUDIT/00_PROJECT_UNDERSTANDING.md`
  (Q-01…Q-08).
- FAZA 1: brzi docs-vs-reality audit → `AUDIT/01_DOCS_VS_REALITY.md` (21 tvrdnja + nalazi
  **F-001…F-016**; kritično: **F-001 tajne u repu**).
- FAZA 1 penzionisanje: 10 fajlova → `docs/_retired/` (+ baneri + `INDEX.md`) — D-003.
  Odgođeno uz pitanja: root README (Q-01), `.cursor/plans` (Q-02), smoke checkliste (Q-03).
- Nova dokumentacija (izvor istine): `docs/{ARCHITECTURE,INFRASTRUCTURE,BACKEND,FRONTEND,MOBILE,TESTING,CI,CONVENTIONS,DECISIONS}.md`; linkovi u root `README.md` ažurirani.
- Napomena: `.env.example` i dalje sadrži F-001 lozinku — **ne diram** dok ne stigne Q-04.
- Commit `583214a` pushan; `gh run list` → prazno (nema CI-ja). Lokalne provjere:
  eslint čist na TS izmjenama iz prethodne sesije; YAML compose validiran; `check:all`
  ne postoji (FAZA 3).

## Šta je sljedeće (tačan sljedeći korak)

1. **KAPIJA 1** — korisnik odobrava nalaze + pitanja Q-01…Q-08.
2. Nakon odobrenja → **FAZA 2**: `AUDIT/02_MASTER_AUDIT_PLAN.md` (segmenti + redoslijed).
3. **KAPIJA 2** → izvršavanje segmenata (preporuka redoslijeda: CI-01 → INF → BE → FE → MOB → E2E).

## Otvorena pitanja za korisnika (BLOKATORI)

- **Q-01** root README: zadržati (ažuriran) ili penzionisati?
- **Q-02** `.cursor/plans/**` penzionisati? (preporuka: DA; matrice/`rules` ostaju)
- **Q-03** mobile smoke checkliste: žive? (preporuka: da, zadržati)
- **Q-04** ⚠️ **F-001**: `Mojalozinka!1` u `.env.example` + docs — stvarna lozinka? (rotacija + čišćenje historije ako da)
- **Q-05** koji compose je produkcijski izvor istine (Coolify vs Traefik)? (preporuka: Coolify)
- **Q-06** odobrenje da CI-01 bude prvi segment i da pushovi do tada budu bez CI-a?
- **Q-07** saglasnost produkcione baze sa jedinom `init_postgres` migracijom?
- **Q-08** tačan runtime host u `DATABASE_URL` za verify-full (interno ime vs javni)?
