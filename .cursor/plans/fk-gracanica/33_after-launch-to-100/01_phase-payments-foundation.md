# Faza 1 — Payments foundation (PayPal + Monri contract)

Cilj: postavke i readiness **ne lažu**. Checkout još 501, ali badge nije „OK” dok provider ne implementira.

## Problem

- Registry već ima `payments.paypal.*` i `payments.monri.*` (`settings.registry.ts` ~343–397).
- Admin tab već ima polja (`TicketingPaymentsTab.tsx` L108–141).
- `PaymentsReadinessService.isProviderReady('paypal')` = enabled + ključevi.
- `PaypalProvider.isReady()` = **hardcoded false**; checkout 501.
- `confirm-session` i webhook idu samo na Stripe (`payments.service.ts` L72–82).

Ako klub upiše PayPal ključeve, `onlineReady` može postati true, a naplata puca.

## Posao

1. **Split statusa** u `getProviderStatus()`:
   - `keysOk` — enabled + secreti
   - `checkoutReady` — provider `isReady()` koji zna da checkout nije stub
   - Badge: Nedostaje / Ključevi / Spremno
2. `isOnlinePaymentsReady()` broji samo providere s **checkoutReady** (Stripe danas, PayPal/Monri nakon faze 2/3).
3. Novi settings (PRIVATE, `managedIn: 'ticketing'`):
   - `payments.paypal.mode` `sandbox` | `live` (default sandbox)
   - `payments.paypal.currency` default `EUR` (BAM nije pouzdan na PayPalu)
   - `payments.paypal.webhookId` (opciono)
   - `payments.monri.mode` `test` | `live` (default test)
4. Rute (handler može vratiti 501 dok faza 2/3 ne spoji):
   - `POST /payments/webhooks/paypal`
   - `POST /payments/webhooks/monri`
5. `confirm-session`: body `{ sessionId, provider? }` — default stripe; paypal/monri 501 do faze 2/3.
6. Admin copy box za PayPal sandbox i Monri test URL (kao Stripe box L57–66).
7. Monri labele: Merchant key, Authenticity token (ne „Authentication key”).

## Fajlovi

- `backend/src/settings/settings.registry.ts`
- `backend/src/ticketing/ticketing-config.service.ts` (`TICKETING_ADMIN_KEYS`)
- `backend/src/payments/payments-readiness.service.ts`
- `backend/src/payments/payments.controller.ts`
- `backend/src/payments/payments.service.ts`
- `frontend/src/pages/admin/ticketing/TicketingPaymentsTab.tsx`
- `frontend/src/types/ticketing-config.ts`
- `.cursor/docs/matrices/payments/`

## Exit

- Stripe i dalje jedini `checkoutReady`.
- PayPal/Monri ključevi se spremaju; online toggle se ne pali na stubu.
- Katalog ostaje after_launch (faza 2/3 diže %).
