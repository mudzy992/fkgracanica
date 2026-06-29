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
- `GET /ticketing/matches/:matchId/availability` — sold, remaining, member discount %

## Categories

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

- `POST /ticketing/validate` with `{ qrCode }` — RBAC `ticketing.manage`
- Admin: `TicketingValidatePanel` na tabu Narudžbe
- Rejects: RESERVED (nije plaćeno), USED, CANCELLED

## Payment

- Box office: `Payment.status: PENDING_BOX_OFFICE` → admin potvrda
- Online: Stripe Checkout → `PENDING_ONLINE` → webhook → `CONFIRMED`
- Member discount: `ticketing.memberDiscountPercent` (active membership)

## Admin UI (`/admin/ticketing`)

| Tab | Sadržaj |
|-----|---------|
| Narudžbe | Filteri, validate QR, potvrdi uplatu, povrat, detalj |
| Postavke | Kapacitet, popust, kategorije CRUD, toggle blagajna |
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
