# Faza 1 — Katalog + API

- `backend/src/showcase/showcase-settings.ts` — `feature.showcaseMode`, `showcase.launchNote`
- Spread u `SETTINGS_REGISTRY` (ne širiti tijelo registry fajla)
- `catalog-modules.ts`, `catalog-sections.ts`, `catalog-roles.ts`
- `GET /api/v1/public/showcase`
- Flag u BE + FE `module-definitions` (private). Ne u `route-module-map`.
- `overallPercent` = prosjek `ready` + `in_progress` + `web_only` (bez `after_launch`)
