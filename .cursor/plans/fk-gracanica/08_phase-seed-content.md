# Faza 8 — Seed demo sadržaj

## Cilj

Popuniti bazu demo sadržajem za javni portal i admin smoke test; povezati Hero na CMS blok.

## Backend

Modularni seed u `backend/prisma/seed/`:

- `prisma-client.ts` — Prisma 7 MariaDB adapter
- `rbac.ts` — role i permissions
- `settings-admin.ts` — settings registry + admin korisnik
- `demo/` — klubovi, sezona, vijesti, CMS, sponzori, utakmice (create-if-missing)

Pokretanje: `npm run db:seed` (root `.env`).

## Frontend

- `useCmsBlock(key)` hook
- `Hero.tsx` čita `home.hero` sa i18n fallbackom
- `Sponsor.url` usklađen sa Prisma poljem

## Seed podaci

| Entitet | Detalj |
|---------|--------|
| Klub | FK Gračanica (`isOwnClub`) + FK Slavija |
| Sezona | 2025/2026, Druga liga FBiH |
| Vijesti | 3 × PUBLISHED |
| CMS | `home.hero`, `footer.about` |
| Sponzori | 4 (bez logotipa) |
| Utakmice | 1 FINISHED + 1 SCHEDULED |

## Exit

Naslovna prikazuje vijesti, utakmice, sponzore; Hero iz CMS-a.

## Sljedeće

HANDOFF §7 korak 2 — admin smoke test.
