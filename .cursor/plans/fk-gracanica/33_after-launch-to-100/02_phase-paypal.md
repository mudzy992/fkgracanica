# Faza 2 — PayPal sandbox → 100%

Preduslov: faza 1. Sandbox nalog: developer.paypal.com (besplatan).

## Tok (isti kao Stripe)

1. Checkout tickets/membership → redirect URL + `Payment.externalId`
2. Webhook `PAYMENT.CAPTURE.COMPLETED` **ili** return `confirm-session`
3. `confirmTicketOrderFlow` / `confirmMembershipFlow` (već provider-agnostički)

## Posao

1. `PaypalProvider.isReady()` → readiness (enabled + clientId + secret). Ne hardcoded false.
2. Orders API v2: create order (intent CAPTURE), vrati `approval` link.
   Currency iz `payments.paypal.currency` (default EUR). Iznos iz order/membership; dokumentovati da je prikaz u KM, charge u EUR ako currency ≠ BAM.
3. Capture na webhook ili na return (idempotentno — flow već skipa paid).
4. `PaymentsService.confirmTicketSession` / `confirmMembershipSession` granaju po provideru (iz `Payment.provider` ili query).
5. Webhook: verifikacija (transmission id + webhookId ako postoji).
6. Frontend: `OnlinePaymentChoice` već ima PayPal; return hook da šalje `provider: 'paypal'`.
7. Unit: create order mock, webhook paid → order `paid`.

Fajlovi ≤200: `paypal.provider.ts` + `paypal-api.util.ts` + `paypal-webhook.util.ts`.

## Fajlovi

- `backend/src/payments/providers/paypal.provider.ts`
- `backend/src/payments/payments.service.ts`
- `backend/src/payments/payments.controller.ts`
- `frontend/src/hooks/use-confirm-ticket-session.ts`
- `frontend/src/hooks/use-confirm-membership-session.ts`
- `.cursor/docs/matrices/payments/`

## 100%

Checkout + webhook + confirm za ulaznice i članstvo u sandboxu. Live = isti kod, `mode=live`. Katalog `paypal` 100 ready.

## Gate

Bez sandbox Client ID-a ne raditi live charge. Kod se merža; test u CI s mock HTTP.
