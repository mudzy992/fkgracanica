# Payments Matrix

## Providers

| Provider | Status | Checkout | Webhook |
|----------|--------|----------|---------|
| Stripe | **Live (test mode)** | Checkout Session redirect | `POST /payments/webhooks/stripe` |
| PayPal | Stub (501) | — | — |
| Monri | Stub (501) | — | — |

## Settings (PRIVATE unless noted)

- `payments.defaultProvider` — `stripe` \| `paypal` \| `monri`
- `payments.stripe.enabled`, `secretKey`, `webhookSecret`, `publishableKey` (PUBLIC)
- `payments.paypal.enabled`, `clientId`, `clientSecret`
- `payments.monri.enabled`, `merchantKey`, `authenticationKey`
- `ticketing.onlineEnabled` — javno online ulaznice samo ako provider spreman
- `membership.onlineEnabled` — online članstvo samo ako provider spreman

## Readiness (`PaymentsReadinessService`)

- `isProviderReady(provider)` — enabled + svi obavezni secreti
- `isOnlinePaymentsReady()` — default provider ready
- `getSalesModes()` — `{ boxOffice, online }` (online = toggle AND ready)
- `isMembershipOnlineAllowed()` — membership toggle AND ready

**Pravilo:** kad online nije spremno → blagajna ostaje dostupna (`ticketing.boxOfficeEnabled`, default true).

## API

| Endpoint | Auth | Opis |
|----------|------|------|
| `POST /payments/checkout/tickets` | JWT | `{ orderId, successUrl, cancelUrl }` → redirect URL |
| `POST /payments/checkout/membership` | JWT | `{ membershipId, amount, successUrl, cancelUrl }` |
| `POST /payments/tickets/confirm-session` | JWT | `{ sessionId }` — povratak ulaznice sa Stripe |
| `POST /payments/membership/confirm-session` | JWT | `{ sessionId }` — povratak članstva sa Stripe |
| `POST /payments/webhooks/stripe` | signature | `checkout.session.completed` → tickets paid / membership ACTIVE |

## Payment model

- `provider`: `box_office` \| `stripe` \| `paypal` \| `monri`
- `externalId`: Stripe session id
- `status`: `PENDING_BOX_OFFICE` \| `PENDING_ONLINE` \| `CONFIRMED` \| …

## Stripe flow (ulaznice)

1. Korisnik rezerviše (`POST /ticketing/reserve`) ili kupi online
2. `POST /payments/checkout/tickets` → Stripe Checkout
3. Aktivacija (bilo koji prvi):
   - Webhook `checkout.session.completed` (payment_status=paid)
   - Povratak: `POST /payments/tickets/confirm-session` + `session_id` u URL
4. Order `paid`, tickets `PAID_AT_BOX_OFFICE`, payment `CONFIRMED` → QR prikaz

## Stripe flow (članstvo)

1. `POST /membership/public/join` ili `register` → PENDING
2. `POST /payments/checkout/membership`
3. Webhook **ili** `confirm-session` na `/clanstvo?paid=1&session_id=…` → ACTIVE + MembershipCard + QR

## Changelog

- 2026-06-29 (c): `tickets/confirm-session`, auto-aktivacija ulaznica + članstva na uspješnoj uplati
- 2026-06-29 (b): `confirm-session` endpoint za membership povratak sa Stripe
- 2026-06-29: Inicijalni modul — Stripe Checkout + webhook; PayPal/Monri stub
