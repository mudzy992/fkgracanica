# HANDOFF — Showcase Mode

> Datum: **2026-08-15**  
> Status: **IMPLEMENTED** (na `main`, Docker rebuild OK)  
> Matrica: `.cursor/docs/matrices/showcase/`

## Šta je gotovo

In-app scroll-driven prezentacija umjesto 503. Jedan API hrani web i mobile.
Cinematic UI (device frames, mockovi, journey). Scroll: samo window (`overflow-x-hidden` skinut).

- Flag `feature.showcaseMode` PRIVATE, default `false`, ON samo `'true'`
- `showcase.launchNote` PUBLIC
- `GET /api/v1/public/showcase`
- Web: `/platforma` uvijek; `?showcase=1` preview; flag ON overlay javnog portala + `/live/:id`
- Bypass: `/prijava`, `/admin`, `/admin/login`
- Mobile: guest/član + flag → `ShowcaseScreen`; `isStaffUser` + `/login` + `/staff` rade
- Katalog: `mobile-polish` 69%, `mobile-staff` 70% (audit 2026-08-15, upisano)
- CTA: `POST /contact` + `POST /newsletter/subscribe`
- Admin banner kad je flag ON
- Lansiranje: Stripe + blagajna. PayPal/Monri/PWA/Excel = `after_launch`

## Commits

| Hash | Šta |
|------|-----|
| `b44b7e0` | Showcase modul, katalog, web gate, mobile intercept |
| `477af7b` | Docker `npm ci`: React `^19.2.7`, bez `react-native-svg` u frontend |

## Docker fix (obavezno znati)

`frontend/package.json` mora biti u sync s `frontend/package-lock.json`. Pin 19.2.3 + `react-native-svg` u web JSON-u je srušio `npm ci` (lock je 19.2.7, svg vuče react-native). Web ne importuje svg.

Ako opet padne `npm ci` u `frontend/Dockerfile` linija 6: uskladi JSON s lockom ili `./scripts/sync-docker-locks.sh` (opcija 2 u `menu.sh`).

## Admin

- Privatne → Moduli → **Prezentacija / u izradi**
- Javne → Prezentacija → `showcase.launchNote`

## overallPercent

Prosjek `ready` + `in_progress` + `web_only` (bez `after_launch`). Katalog: `backend/src/showcase/catalog-*.ts`.

## Lokalni PC (nije na gitu)

Mobile polish (home, liga, tim, i18n, theme, `30_mobile-league-clubs/`) ostaje uncommitted. Stash/pull/pop 2026-08-15 **bez konflikta**. Pri commitu polish-a zadrži showcase blokove u `_layout.tsx` fajlovima.

## Van opsega

PayPal, Monri, PWA, Excel/PDF, newsletter kampanje, Play Store submit.

## Reference

- Plan: `.cursor/plans/fk-gracanica/30_showcase-mode/`
- Root handoff: [../HANDOFF.md](../HANDOFF.md)
- `backend/src/showcase/`
- `frontend/src/pages/showcase/`
- `frontend/src/components/common/ShowcaseGate.tsx`
- `mobile/src/showcase/`
