# Checklist — 33 after-launch to 100%

## Faza 1 — Payments foundation

- [x] Split `keysOk` vs `checkoutReady`
- [x] Online toggle samo na checkoutReady
- [x] Settings: paypal.mode, paypal.currency, paypal.webhookId, monri.mode
- [x] Webhook rute paypal + monri (stub ok)
- [x] confirm-session prihvata `provider`
- [x] Admin badge + copy box
- [x] payments MATRIX + CHANGELOG

## Faza 2 — PayPal

- [x] PaypalProvider.isReady iz settings
- [x] Orders API tickets + membership (sandbox)
- [x] Webhook capture → confirm flow
- [x] Frontend return hook provider=paypal
- [x] Unit test mock
- [x] Katalog paypal 100 ready

## Faza 3 — Monri

- [x] Digest util + form/bridge
- [x] Callback verify + confirm
- [x] mode test/live URL
- [x] Unit digest fixture
- [x] Katalog monri 100 ready (gated na ključeve, isti obrazac kao PayPal)
- [ ] Živi test charge (ops gate, nije blokada koda)

## Faza 4 — Financial export

- [x] GET summary + xlsx + pdf
- [x] RBAC finance.read
- [x] Admin /admin/finance
- [x] Tickets iz Payment; membership sheet B
- [x] Katalog financial-export 100 ready
- [x] matrices/finance/

## Faza 5 — PWA

- [x] PNG 192/512 + manifest
- [x] Install banner
- [x] SW v3 + /offline.html
- [x] API network-only
- [x] Katalog pwa 100 ready

## Faza 6 — Video highlights

- [x] MatchHighlight migracija
- [x] Admin CRUD
- [x] Match center + mobile lista
- [x] Katalog video-highlights 100 ready

## Faza 7 — Newsletter kampanje

- [x] Campaign model + unsubscribeToken
- [x] Send preko JobsService + limiter
- [x] Admin panel + feature flag
- [x] Katalog newsletter-campaigns 100 ready

## Faza 8 — Sezonske ulaznice

- [x] SeasonPass + Admission migracija
- [x] Kapacitet oduzima activePassCount
- [x] Checkout + blagajna issue
- [x] Validate QR dual path
- [x] Public + mobile karta
- [x] Katalog seasonal-tickets 100 ready

## Faza 9 — Play Store

- [ ] mobile/store/README.md
- [ ] Privacy URL + Data safety notes
- [ ] Internal testing AAB
- [ ] Katalog play-store 100 ready
