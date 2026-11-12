# Segment INF-02 — Tajne i higijena repozitorija (F-001)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren i zatvoren 2026-11-02) |
| **Odobrenje** | KAPIJA 2 (master plan §2.1); blokator **Q-04 → D-004** („nije stvarna lozinka") |
| **Blokatori** | Q-04 ✔ (D-004) → git historija rewrite **nije potreban**; Q-01/Q-02/Q-03 ne blokiraju |

## Opseg (po master planu)

`.env.example`, docs (tragovi F-001), git historija (D-004: bez rewritea),
`scripts/rotate-secrets.sh`, tajni skaner (secrets-ban + hook).

## Nalazi

| ID | Ozbiljnost | Nalaz | Status |
|----|-----------|-------|--------|
| **J-02-01** | Critical→Info (D-004) | `.env.example` sadrži F-001 `Mojalozinka!1` na **2 mjesta** (`DATABASE_URL`, `POSTGRES_PASSWORD`) | ✅ **RIJEŠENO** — placeholder `change-me` + D-004 komentar; commit `6cd18d9` |
| **J-02-02** | Medium | `secrets-ban` allowlist `.env*` zastario (razlog „čeka Q-04/INF-02" ispunjen D-004-om) | ✅ **RIJEŠENO** — stavka uklonjena, `.env.example` sada skeniran; commit `f5ec734` |
| **J-02-03** | Medium | pre-commit tajni skaner ne postoji (plan: „pre-commit secret scan") — samo pre-push + CI | ✅ **RIJEŠENO** — `.githooks/pre-commit` (poziva secrets-ban); `hooksPath` vraćen (izgubljen re-klonom); commit `f5ec734` |
| **J-02-04** | Low | komentar `.env.example` (REDIS primjer `<URL_ENCODED_LOZINKA>`) okida conn-string pravilo nakon ukidanja allowlist-a | ✅ **RIJEŠENO** — `<CHANGE_ME_URL_ENCODED>` (pokriva placeholder regex); commit `6cd18d9` |
| J-02-05 | Info ✓ | `scripts/rotate-secrets.sh` zdrav: `openssl rand`, radi isključivo na `.env` (nije trackan), bez hardcoded tajni; hint `db:seed` postoji u root `package.json` | — (D-004 → rotacija nije potrebna; skripta ostaje za buduću upotrebu) |
| J-02-06 | Info ✓ | F-001 tragovi u trackanom repu ostaju **samo** u allowlist dokazima: `AUDIT/` ×3, `docs/DECISIONS.md` (D-004), `docs/_retired/` ×1; `.env` NIJE trackan; git historija **bez rewritea** (D-004) | — |

## Izmjene u segmentu

- `.env.example` — 2× F-001 → `change-me`; D-004 komentar; REDIS primjer očišćen (J-02-04)
- `scripts/standards/secrets-ban.mjs` — uklonjena `.env*` allowlist stavka + docstring + success poruka
- `.githooks/pre-commit` — novi brzi tajni skaner (pun `check:all` ide na pre-push + CI)
- `AUDIT/COVERAGE_MATRIX.csv` — 3 reda → segment INF-02 (`.env.example` je eksplicitni izuzetak inventara)

## Testovi / verifikacija

- **Negativni test**: F-001 vraćen u `.env.example` → `secrets-ban` **exit 1** ✓
  (dokaz da je allowlist stvarno uklonjen i da skaner sada vidi `.env.example`)
- `npm run check:all` — **6/6** ✓ (secrets-ban čist bez allowlist-a)
- pre-commit hook **upalio uživo** na commitima `6cd18d9`/`f5ec734` (2× pokretanje u izlazu)
- `node scripts/audit/check-coverage.mjs` — OK (R3: svi INF-01 redovi statusa OK)

### CI runovi segmenta

| Run | SHA | Rezultat |
|-----|-----|----------|
| `41504684855` | `6cd18d9` + `f5ec734` | ✅ sva 3 joba (audit-gate, standards, build-test) |

### Commiti segmenta

`6cd18d9` (.env.example čišćenje) → `f5ec734` (scanner + hook + matrica) → zatvarajući docs commit.

## Status segmenta: ZATVOREN
