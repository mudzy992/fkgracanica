# Faza 3 — Monri form + callback → 100%

Preduslov: faza 1. Živi charge čeka test merchant; kod se piše odmah.

## Tok

Monri nije Stripe Checkout. Form POST + digest, zatim server callback.

1. `createTicketCheckout` / `createMembershipCheckout` vrati URL naše **bridge** stranice ili direktan form action + fields (digest).
2. Korisnik plaća na Monri IPG (`test` vs `live` iz `payments.monri.mode`).
3. Callback `POST /payments/webhooks/monri` → verify digest → isti confirm flow.
4. Success/cancel URL nazad na portal (`sessionId` = order number).

## Posao

1. `MonriProvider.isReady()` → enabled + merchantKey + authenticationKey (authenticity token).
2. Digest SHA512 po Monri WebPay v2 speku (amount u minor units, currency BAM).
3. `order_number` = `Payment.id` ili `t-{orderId}` / `m-{membershipId}` (jedinstven, idempotent).
4. Bridge page na frontendu ako treba auto-submit form (kratka, ≤200).
5. Callback: odbij invalid digest; confirm samo `approved`.
6. Admin: test vs live hint (ipgtest vs ipg).
7. Unit: digest fixture + callback approve/reject.

## Fajlovi

- `backend/src/payments/providers/monri.provider.ts`
- `backend/src/payments/monri-digest.util.ts`
- `backend/src/payments/payments.service.ts` / `payments.controller.ts`
- `frontend/src/pages/public/MonriBridgePage.tsx` (ako form POST)
- `.cursor/docs/matrices/payments/`

## 100%

Kod + testovi zeleni. Katalog `monri` 100 ready kad je `isReady()` true s test ključevima **ili** kad je implementacija kompletna i gated na ključeve (isti obrazac kao Stripe prije unosa sk_test).

Ako merchant nije stigao: ostavi `badge: 'in_progress'` 90, ne after_launch. Ready tek kad jedan test charge prođe.

## Gate

Klub / banka: test `merchant_key` + `authenticity_token`.
