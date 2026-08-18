# Seasonal tickets

Jedan `SeasonPass` po korisniku × kalendarska `Season`. Jedan QR. Ulaz po utakmici = `SeasonPassAdmission` (`@@unique([passId, matchId])`).

## Status

```
PENDING → ACTIVE
       ↘ CANCELLED | REFUNDED
```

## Kapacitet

`occupied = soldTickets + count(ACTIVE|PENDING passes)` vs `ticketing.stadiumCapacity`.

## Settings (PUBLIC, managedIn ticketing)

- `ticketing.seasonPassPrice` (number, KM; 0 = nije u prodaji)
- `ticketing.seasonPassLabel` (string, default „Sezonska karta”)

## Tok

- Online: `POST /ticketing/season-pass/open` → checkout `type: season_pass` / PayPal `s:{id}` / Monri `s-{id}`
- Blagajna: `POST /ticketing/season-pass/admin/issue` `{ email }`
- Validate: `POST /ticketing/validate` `{ qrCode, matchId }` — ticket path pa pass; pass zahtijeva `matchId` (domaća utakmica sezone)

## UI

- Public `/ulaznice` tab Sezona — `SeasonPassVisual` (grb + sezona, bez VS meča)
- Print/HTML: `buildSeasonPassHtml`
- Admin Ulaznice → Sezona
- Mobile strip: SEZONA; QR samo `ACTIVE`; `PENDING` (napušten checkout) — pay retry, bez QR
- Staff scan šalje `matchId`
