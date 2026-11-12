# Finance matrix

## Scope

Admin izvještaj uplata. Nije sportska analitika (`/admin/analytics`).

## API (`finance.read`)

| Endpoint | Opis |
|----------|------|
| `GET /finance/summary?from&to&provider&status` | Broj/suma po provideru i statusu |
| `GET /finance/export.xlsx?...` | Sheet Ulaznice + Sezona + Clanstvo |
| `GET /finance/export.pdf?...` | Jednostrani sažetak |

Filter `from`/`to` na `Payment.createdAt` (ulaznice + članstvo) i `SeasonPass.updatedAt` (sezona). Default: 1. jan tekuće godine → danas.

## Izvori

| Sheet | Izvor | Iznos |
|-------|--------|-------|
| Ulaznice | `Payment` + order.user (`orderId not null`) | `Payment.amount` |
| Sezona | `SeasonPass` (updatedAt) | `SeasonPass.price` |
| Članstvo | `Payment` + membership.user (`membershipId not null`) | `Payment.amount` (samo plaćeno; `estimated:false`) |

Nema `LedgerEntry`. Od **BE-07/P-B07-2** članstvo **ima** `Payment(membershipId)` — rupa zatvorena (`openMembershipPayment` + `finance-loaders.loadMembership`). Sezonska karta nema `Payment`; iznos je `SeasonPass.price`. Ako je `provider`/`status` filter set, filtrira se po `Payment.provider`/`status` za ulaznice i članstvo, te `SeasonPass.paymentProvider`/`status` za sezonu. Status `CONFIRMED` → pass `ACTIVE`.

## RBAC

`finance.read` — Administrator (sync na boot). UI: `/admin/finance`.
