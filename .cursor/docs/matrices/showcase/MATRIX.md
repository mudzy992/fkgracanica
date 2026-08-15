# Showcase Matrix

## Flag

- `feature.showcaseMode` PRIVATE boolean, default `false`
- Uključeno samo kad je vrijednost `'true'` (ne `!== 'false'`)
- `showcase.launchNote` PUBLIC string — hero napomena
- Admin UI: Postavke → Moduli (private tab)
- Nije u `route-module-map` (overlay, ne gašenje ruta)
- `showcase.launchNote` u Postavke → Javne → Prezentacija

## API

`GET /public/showcase` — javno. Payload: `modeOn`, `overallPercent`, `club`, `modules`, `sections`, `roles`.

`overallPercent` = aritmetička sredina modula s badge `ready` | `in_progress` | `web_only`.

## Web

- ShowcaseGate: PublicLayout + `/live/:id`
- Bypass: `/prijava`, `/admin`, `/admin/login`
- `/platforma` uvijek showcase (bez public nava)
- `?showcase=1` preview

## Mobile

- Guest / Član + flag ON → Showcase, bez tab bara
- `isStaffUser` → normalni tabovi / staff
- Bypass: `/login`, `/staff`

## CTA

Inline `POST /contact` i `POST /newsletter/subscribe` (kad je flag ON, `/kontakt` nije javni portal).

## Badgeovi

- `ready` — lansiranje
- `in_progress` — postoji, dorađuje se
- `after_launch` — ide u isporuku, nije blokada
- `web_only` — namjerno samo web admin
