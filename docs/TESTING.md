# Testiranje

> Status: inicijalna verzija (FAZA 0/1) · Ažurirano: 2026-11-02 · Izvor istine za testove — ovaj dokument

## Trenutno stanje (dokazano, ne pretpostavljeno)

| Sloj | Alat | Pokrenuto | Pokrivenost |
|------|------|-----------|-------------|
| Backend unit | jest + ts-jest (`src/**/*.spec.ts`) | `npm test` / `test:cov` | 32 spec fajla; **bez coverage praga** |
| Backend e2e | jest (`test/jest-e2e.json`, 8 spec-a) | `npm run test:e2e` | auth/rbac, live-center, membership, notifications, ticketing-qr, upload, admin smoke, app; **traži bazu + redis** (`test/setup-e2e-env.ts` fallback `redis://127.0.0.1:6379`) |
| Frontend | **nema runner-a** | — | 1 ručni spec (`npx tsx --test src/pages/admin/homes/commentator-desk.spec.ts`) |
| Mobile | **nema alata** | — | 0 |
| E2E web (Playwright) | **nema** | — | 0 |
| A11y (axe) | **nema** | — | 0 |
| CI | **nema** (`.github/` nikad nije postojao) | — | F-002 |

## Poznati problemi (blokatori za CI)

- **F-015**: root `npm ci` pada — `package-lock.json` nije sinhronizovan
  (`Missing: react@19.3.1, react-dom@19.3.1, react-native-screens@4.26.2`).
  Popravka: `npm install` na rootu (regeneracija locka) — traži odobrenje jer mijenja lock.
- **F-016**: dva lock sistema — root workspace lock (dev) i standalone per-package lock
  (Docker `npm ci`, održava `scripts/sync-docker-locks.sh`). CI mora provjeravati oba.
- Backend e2e zahtijeva servisne kontejnere (Postgres + Redis) u CI-ju → servisni
  kontejneri/seed/health-wait su preduslov (FAZA B).

## Plan (detalji u FAZA 2 master planu — AUDIT/02_MASTER_AUDIT_PLAN.md)

1. Backend: coverage prag (početni npr. 60% → diže se), regression test za svaki popravljeni bug.
2. Frontend: uvesti test runner (vitest + @testing-library/react — alternativa: node:test kao
   postojeći spec; preporuka: **vitest** zbog Vite integracije; čeka odobrenje u master planu).
3. Frontend E2E: Playwright (trace/screenshot/video na failure, stabilni `data-testid`).
4. Mobile: Maestro flowovi (onboarding → login → glavni tokovi → logout) na Android
   emulatoru u CI-ju kao završni korak; alternativa Detox/Appium — obrazloženje u master planu.
5. Svi pragovi i izuzeci eksplicitni u konfiguraciji.
