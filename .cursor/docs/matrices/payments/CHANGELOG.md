# Payments Changelog

## 2026-06-29 (b)

- `POST /payments/membership/confirm-session` — aktivacija na povratku sa Stripe success URL
- Frontend: `use-membership-payment-return`, success URL s `session_id`

## 2026-06-29

- Novi `PaymentsModule` sa `PaymentsReadinessService`
- Stripe Checkout Sessions za ulaznice i članstvo
- Stripe webhook handler (`checkout.session.completed`)
- PayPal i Monri provider stubovi (501)
- Prisma: `Payment.provider`, `Payment.externalId`, `PENDING_ONLINE`
- Admin UI: tab „Online plaćanje” na `/admin/ticketing`
- Javno: „Plati online” na narudžbi i članstvu kad `onlineReady`
