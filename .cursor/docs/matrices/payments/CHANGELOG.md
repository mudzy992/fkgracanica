# Payments Changelog

## 2026-08-17 (c)

- Faza 3 Monri: WebPay v2 form + SHA512 digest, bridge `/placanje/monri`, callback WP3.
- Katalog `monri` 100 ready. Valuta BAM. Confirm treba `returnUrl`.

- Faza 2 PayPal: Orders v2 checkout + capture, webhook verify, confirm-session `provider=paypal`.
- Katalog `paypal` 100 ready. Currency default EUR.

## 2026-08-17

- Faza 1 foundation: `keysOk` vs `checkoutReady`; online samo Stripe checkout.
- Settings: `paypal.mode`, `paypal.currency`, `paypal.webhookId`, `monri.mode`.
- Rute `POST /payments/webhooks/paypal|monri` (501). confirm-session prima `provider`.
- Admin badge Nedostaje / Ključevi / Spremno. Monri label: authenticity token.

## 2026-06-29 (c)

- `tickets/confirm-session`, auto-aktivacija ulaznica + članstva na uspješnoj uplati

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
