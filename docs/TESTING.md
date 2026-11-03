# Testiranje

> Status: backend (jest) + frontend (vitest, **FE-02**) aktivni u CI-ju · Ažurirano: 2026-11-03 · Izvor istine za testove — ovaj dokument

## Trenutno stanje (dokazano, ne pretpostavljeno)

| Sloj | Alat | Pokrenuto | Pokrivenost |
|------|------|-----------|-------------|
| Backend unit | jest + ts-jest (`src/**/*.spec.ts`) | `npm test` / `test:cov` | 38 spec fajla; **bez coverage praga** |
| Backend e2e | jest (`test/jest-e2e.json`, 8 spec-a) | `npm run test:e2e` | auth/rbac, live-center, membership, notifications, ticketing-qr, upload, admin smoke, app; **traži bazu + redis** (`test/setup-e2e-env.ts` fallback `redis://127.0.0.1:6379`) |
| Frontend unit/komponente | **vitest 5 + jsdom + @testing-library/react** (`src/**/*.{test,spec}.{ts,tsx}`) | `npm run test -w frontend` (CI: korak u `build-test`) | 9 fajla / **34 testa** (FE-02); `commentator-desk.spec.ts` migriran sa `node:test` |
| Mobile | **nema alata** | — | 0 |
| E2E web (Playwright) | **nema** | — | 0 |
| A11y (axe) | **nema** | — | 0 |
| E2E web (Playwright) | planirano u **FE-06** | — | 0 |

## Frontend testovi (FE-02) — kako pisati

```bash
npm run test -w frontend         # vitest run (CI)
npm run test:watch -w frontend   # watch mode
```

- Fajl pored koda: `src/lib/foo.ts` → `src/lib/foo.test.ts`; komponenta → `foo.test.tsx`.
- Uvoz iz `vitest` (`describe/it/expect/vi`) — **bez globals**; jest-dom matchers su
  učitani kroz `src/test/setup.ts` (`toBeInTheDocument`, `toHaveClass`, …).
- Okruženje je `jsdom`; `matchMedia` je shimovan u setup-u. `cleanup()` ide automatski.
- Typecheck testova pokriva `tsconfig.test.json` (uključen u `tsc -b`), pa testovi ne
  ulaze u produkcioni bundle.
- Komponente se testiraju kroz **role/labelu** (`getByRole`, `getByLabelText`) — bez
  oslanjanja na CSS klase za semantiku (klasa se provjerava samo za varijantu).

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
2. ~~Frontend: test runner~~ ✅ **FE-02 urađeno**: vitest + jsdom + @testing-library/react
   (`frontend/vitest.config.ts`, setup `frontend/src/test/setup.ts`). Novi test ide uz svaki
   popravljeni bug u `frontend/src/**`; CI korak `frontend test (vitest)` u `build-test` jobu.
3. Frontend E2E: Playwright (trace/screenshot/video na failure, stabilni `data-testid`) — **FE-06**.
4. Mobile: Maestro flowovi (onboarding → login → glavni tokovi → logout) na Android
   emulatoru u CI-ju kao završni korak; alternativa Detox/Appium — obrazloženje u master planu.
5. Svi pragovi i izuzeci eksplicitni u konfiguraciji.
