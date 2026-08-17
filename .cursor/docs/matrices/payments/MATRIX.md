# Payments Matrix

## Providers

| Provider | Status | Checkout | Webhook |
|----------|--------|----------|---------|
| Stripe | **Live (test mode)** | Checkout Session redirect | `POST /payments/webhooks/stripe` |
| PayPal | **Sandbox/live Orders v2** | Approve redirect + capture | `POST /payments/webhooks/paypal` |
| Monri | **Test/live WebPay v2** | Bridge form POST + digest | `POST /payments/webhooks/monri` |

`CHECKOUT_IMPLEMENTED = ['stripe', 'paypal', 'monri']`. Online toggle samo `checkoutReady`.

PayPal charge: `payments.paypal.currency` (default EUR). Iznos = isti broj kao KM na narudžbi.

## Settings (PRIVATE unless noted)

- `payments.defaultProvider` — `stripe` \| `paypal` \| `monri`
- `payments.stripe.enabled`, `secretKey`, `webhookSecret`, `publishableKey` (PUBLIC)
- `payments.paypal.enabled`, `clientId`, `clientSecret`, `mode` (sandbox\|live), `currency` (default EUR), `webhookId`
- `payments.monri.enabled`, `merchantKey`, `authenticationKey` (authenticity token), `mode` (test\|live)
- Registry: `backend/src/payments/payments-settings.ts`

## Readiness

- `hasProviderKeys` / `getProviderGate` / `isProviderReady` = checkoutReady
- Admin badge: Nedostaje / Ključevi / Spremno

## API

| Endpoint | Auth | Opis |
|----------|------|------|
| `POST /payments/checkout/tickets` | JWT | redirect URL |
| `POST /payments/checkout/membership` | JWT | redirect URL |
| `POST /payments/tickets/confirm-session` | JWT | `{ sessionId, provider?, returnUrl? }` |
| `POST /payments/membership/confirm-session` | JWT | isto |
| `GET /payments/monri/form` | JWT | `{ action, fields }` za IPG POST |
| `POST /payments/webhooks/stripe` | signature | checkout.session.completed |
| `POST /payments/webhooks/paypal` | PayPal headers | treba `webhookId`; ORDER.APPROVED ili CAPTURE.COMPLETED |
| `POST /payments/webhooks/monri` | `Authorization: WP3-callback` | digest + `status: approved` |

## PayPal flow

1. Checkout → Orders API CAPTURE, `custom_id` `t:{orderId}` / `m:{membershipId}`
2. Return: `?provider=paypal&token=` ili `session_id` → confirm-session capture + confirm flow
3. Webhook (ako je webhookId set) isto, idempotentno

## Monri flow

1. Checkout → `{origin}/placanje/monri?sid=t-{orderId}` / `m-{membershipId}`
2. Bridge GET form fields, POST na ipgtest/ipg `/v2/form` (BAM, amount feningi)
3. Return: `returnUrl` = `window.location.href` (digest SHA512(key+urlWithoutDigest))
4. Callback: `WP3-callback` header, `status: approved` → isti confirm flow
