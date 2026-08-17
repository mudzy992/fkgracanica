# Ticketing Matrix

## Ticket status flow

```
RESERVED → PAID_AT_BOX_OFFICE → USED
        ↘ CANCELLED
        ↘ REFUND_REQUESTED (order) → refunded
```

## Order status

```
pending → paid → (refund_requested) → refunded
       ↘ cancelled
```

## Capacity

- Global: `ticketing.stadiumCapacity` setting (default 5000)
- `GET /ticketing/matches/:matchId/availability` — sold, passes, remaining
- Occupied = prodati ticketi + ACTIVE/PENDING sezonske karte sezone

## Settings (ulaznice)

- `ticketing.ticketCardBackground` — putanja u media; backdrop (PNG transparent → crna podloga, `object-contain`)
- `ticketing.seasonPassPrice` / `ticketing.seasonPassLabel` — sezonska karta (vidi [seasonal-tickets](../seasonal-tickets/MATRIX.md))

## Digitalna ulaznica (prikaz)

- Širina ~520px; grbovi domaćin/gost, takmičenje · sezona · kolo
- Podaci iz `match.season.competition`, `roundRel`, `homeClub/awayClub.crestPath` (API `/ticketing/orders`)

- JSON setting `ticketing.categories`: `[{ id, label, price, isActive }]`
- Admin CRUD na `/admin/ticketing` → Postavke
- Javno: `GET /ticketing/config` (samo aktivne)

## Domaće utakmice

- `GET /ticketing/matches/ticketable` — SCHEDULED + `homeClub.isOwnClub`
- `POST /ticketing/reserve` odbija gostujuće utakmice

## Sales modes

- `boxOffice`: `ticketing.boxOfficeEnabled` (default true)
- `online`: `ticketing.onlineEnabled` AND aktivni provider spreman (Stripe / PayPal / Monri)
- Kad online nije spremno → samo blagajna (ako je uključena)

### Javno ponašanje

| Online | Blagajna | Korisnik |
|--------|----------|----------|
| ✓ | ✓ | **Plati online** ili **Rezerviši za blagajnu** |
| ✓ | ✗ | Samo online plaćanje |
| ✗ | ✓ | Samo rezervacija za blagajnu |
| ✗ | ✗ | Kupovina onemogućena |

- Članovi i gosti (prijavljeni korisnici) imaju isti pristup
- Limit po korisniku (`maxBoxOfficeTicketsPerUser`) vrijedi samo za rezervaciju blagajne
- Online kupovina: limit je kapacitet stadiona

## QR validation

- `POST /ticketing/validate` with `{ qrCode, matchId? }` — RBAC `ticketing.manage`
- Ticket path pa SeasonPass; pass treba `matchId` (sljedeća domaća)
- Admin: `TicketingValidatePanel` na tabu Narudžbe
- Rejects: RESERVED (nije plaćeno), USED, CANCELLED; pass već skeniran za utakmicu

## Payment

- Box office: `Payment.status: PENDING_BOX_OFFICE` → admin potvrda
- Online: Stripe Checkout → `PENDING_ONLINE` → webhook → `CONFIRMED`
- Member discount: `ticketing.memberDiscountPercent` (active membership)

## Admin UI (`/admin/ticketing`)

| Tab | Sadržaj |
|-----|---------|
| Narudžbe | Filteri, validate QR, potvrdi uplatu, povrat, detalj |
| Sezona | Lista SeasonPass + blagajna issue po emailu |
| Postavke | Kapacitet, popust, sezona cijena/label, kategorije CRUD, toggle blagajna |
| Online plaćanje | Toggle online ulaznice/članstvo, provideri, Stripe keys |

**Napomena:** ticketing/payment ključevi nisu u globalnom `/admin/settings` — samo `modules.ticketing` i `feature.membership` ostaju tamo kao feature flagovi.

## Javna stranica (`/ulaznice`)

- Deep link: `/ulaznice?matchId={id}`
- Rezervacija: ticketable utakmice + API kategorije + dostupnost
- Moje narudžbe: QR za plaćene, „Plati online” za pending kad online OK
- Copy blagajna kad nema online

## CTA

- `LivePreMatchShell`: „Kupi ulaznice” za domaću SCHEDULED utakmicu
- `TicketsCtaWidget` mode `auto`: `HomeNextMatchTicketsBanner` + `useNextHomeMatch`

## Changelog

Vidi [CHANGELOG.md](./CHANGELOG.md)
