# Finance matrix

## Scope

Admin izvještaj uplata. Nije sportska analitika (`/admin/analytics`).

## API (`finance.read`)

| Endpoint | Opis |
|----------|------|
| `GET /finance/summary?from&to&provider&status` | Broj/suma po provideru i statusu |
| `GET /finance/export.xlsx?...` | Sheet Ulaznice + sheet Clanstvo |
| `GET /finance/export.pdf?...` | Jednostrani sažetak |

Filter `from`/`to` na `Payment.createdAt` (ulaznice) i `Membership.updatedAt` (članarine). Default: 1. jan tekuće godine → danas.

## Izvori

| Sheet | Izvor | Iznos |
|-------|--------|-------|
| Ulaznice | `Payment` + order.user | `Payment.amount` |
| Clanstvo | `Membership` status ACTIVE | `membership.annualPrice` (procjena) |

Nema `LedgerEntry`. Članstvo nema `Payment` red — rupa zabilježena. Ako je `provider` filter set, članarine se isključuju. Status filter: članarine samo uz prazan ili `CONFIRMED`.

## RBAC

`finance.read` — Administrator (sync na boot). UI: `/admin/finance`.
