# FK Gračanica — Plan pregled

## Cilj

Produkcijska full-stack platforma: javni portal, admin CMS, statistički/live centar, članstvo, ulaznice, Expo mobile.

## Stack

- **backend/** — NestJS, Prisma 7, MySQL, Socket.IO, JWT
- **frontend/** — React, Vite, Tailwind, shadcn, TanStack Query
- **mobile/** — Expo, TypeScript, i18n

## Faze

| Faza | Fokus | Dokument |
|------|-------|----------|
| 1 | Infrastruktura, auth, RBAC, settings, mobile scaffold | [01_phase-infrastructure.md](01_phase-infrastructure.md) |
| 2 | Admin dashboard, CMS, media, audit | [02_phase-admin-cms.md](02_phase-admin-cms.md) |
| 3 | Javni portal | [03_phase-public-portal.md](03_phase-public-portal.md) |
| 4 | Tim, liga, statistika | [04_phase-competition-stats.md](04_phase-competition-stats.md) |
| 5 | Live centar | [05_phase-live-center.md](05_phase-live-center.md) |
| 6 | Članstvo, ulaznice (bez online plaćanja) | [06_phase-membership-ticketing.md](06_phase-membership-ticketing.md) |
| 7 | Premium, PWA, optimizacija | [07_phase-premium-optimization.md](07_phase-premium-optimization.md) |

## Izvori

- [aplikacijski-plan.md](../../../aplikacijski-plan.md) — master plan
- Global User Rules — baseline konvencije

## Exit kriterij projekta

Svaki modul funkcionalan, API-first, dokumentovan, spreman za produkciju i mobile parity.
