# Faza 9 — Admin smoke test

## Cilj

Omogućiti i verificirati admin tok: login → postavke → kreiranje/objava vijesti → javni prikaz.

## Frontend

- `NewsAdminPage` — lista, kreiranje (Sheet), objava, arhiviranje, brisanje
- `NewsAdminFormSheet` — forma za novi nacrt
- `use-news-admin.ts` — mutacije create/status/delete
- `SettingsPage` — čitljivi labeli (`settings-labels.ts`)
- `AdminPageShell` — opcioni `actions` slot

## Backend test

- `test/admin-smoke.e2e-spec.ts` — login → settings → news → publish → public list
- `test/app.e2e-spec.ts` — health check (ispravljen)

Pokretanje: `cd backend && npm run test:e2e`

## Exit

Admin može kreirati i objaviti vijest; javna `/vijesti` i naslovna prikazuju objavljeni sadržaj.

## Sljedeće

HANDOFF §7 korak 3 — upload renditions (`sharp`).
