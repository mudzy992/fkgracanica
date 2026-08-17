# Ticketing Changelog

## 2026-08-17 (season pass)

- Kapacitet uključuje sezonske karte; validate `{ qrCode, matchId? }`
- Settings `ticketing.seasonPassPrice` / `ticketing.seasonPassLabel`

## 2026-06-29 (sales modes UX)

- `paymentIntent` na reserve: `box_office` | `online`
- Online + blagajna: dva dugmeta (Plati online / Rezerviši za blagajnu)
- Samo online ili samo blagajna prema postavkama
- Limit blagajne ne vrijedi za online kupovinu

## 2026-06-29 (settings + payments)

- Dinamičke kategorije iz `ticketing.categories` settinga
- Samo domaće utakmice (`homeClub.isOwnClub`) — API + reserve validacija
- `GET /ticketing/config`, `/ticketing/matches/ticketable`, `/public/next-home-match`
- Admin tabovi: Narudžbe | Postavke | Online plaćanje
- Prematch + home CTA → `/ulaznice?matchId=`
- `TicketsCtaWidget` mode `auto` (sljedeća domaća utakmica)
- Online checkout integracija (Stripe) uz postojeću blagajnu

## 2026-06-29 (gate #14)

- Availability API, admin cancel, QR validate panel, javne narudžbe

## 2026-06-24

- Reservation + box office model
