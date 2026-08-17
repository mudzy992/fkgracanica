# Finance matrix

## Scope

Admin izvještaj uplata. Nije sportska analitika (`/admin/analytics`).

## API (`finance.read`)

| Endpoint | Opis |
|----------|------|
| `GET /finance/summary?from&to&provider&status` | Broj/suma po provideru i statusu |
| `GET /finance/export.xlsx?...` | Sheet Ulaznice + Sezona + Clanstvo |
| `GET /finance/export.pdf?...` | Jednostrani sažetak |

Filter `from`/`to` na `Payment.createdAt` (ulaznice) i `Membership.updatedAt` (članarine). Default: 1. jan tekuće godine → danas.

## Izvori

| Sheet | Izvor | Iznos |
|-------|--------|-------|
| Ulaznice | `Payment` + order.user | `Payment.amount` |
| Sezona | `SeasonPass` (updatedAt) | `SeasonPass.price` |
| Clanstvo | `Membership` status ACTIVE | `membership.annualPrice` (procjena) |

Nema `LedgerEntry`. Članstvo nema `Payment` red — rupa zabilježena. Sezonska karta također nema `Payment`; iznos je `SeasonPass.price`. Ako je `provider` filter set, članarine se isključuju (sezona ostaje jer ima `paymentProvider`). Status `CONFIRMED` → pass `ACTIVE`.

## RBAC

`finance.read` — Administrator (sync na boot). UI: `/admin/finance`.
