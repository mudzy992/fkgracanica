# HANDOFF — Showcase Mode

**Status:** IMPLEMENTED  
**Matrica:** `.cursor/docs/matrices/showcase/`

## Flag

`feature.showcaseMode` — PRIVATE, default `false`. Opt-in (`=== 'true'`).

Admin: Postavke → Privatne → Moduli → Prezentacija / u izradi  
Napomena: Postavke → Javne → Prezentacija → `showcase.launchNote`

## API

`GET /api/v1/public/showcase`

## Rute

- `/platforma` — uvijek showcase
- `?showcase=1` — preview javnog portala
- Flag ON: sav javni web + `/live/:id` → showcase
- Bypass: `/prijava`, `/admin`, `/admin/login`, mobile `/login` + `/staff` + `isStaffUser`

## overallPercent

Prosjek badgeova `ready` | `in_progress` | `web_only` (bez `after_launch`).
