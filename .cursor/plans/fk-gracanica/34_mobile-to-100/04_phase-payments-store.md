# Faza 04 — Mobile buy + Play Store

Nakon P0–P2. Dva ishoda.

## A — Stripe na `tickets-buy`

Sad: `box_office` only (~72%). Meta: step indicator + Stripe tok ako je ticketing modul uključen.

Ref: web ticketing Stripe; `mobile/app/tickets-buy.tsx`.  
Ne reimplementirati PayPal/Monri (web already 100).

## B — Play Store (Track 33 faza 9)

Sad: katalog `play-store` 20%. Meta: Internal testing AAB + listing artefakti.

Doc: `.cursor/plans/fk-gracanica/33_after-launch-to-100/09_phase-play-store.md`

- `mobile/store/README.md`
- screenshots spec 1080×1920
- privacy URL CMS `privatnost`
- Data safety (kamera/QR, push)

iOS van opsega. Production rollout = klub, ne kod.
