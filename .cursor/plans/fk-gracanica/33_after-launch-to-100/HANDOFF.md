# HANDOFF — 33 after-launch to 100%

> Datum: **2026-08-17**  
> Track: `.cursor/plans/fk-gracanica/33_after-launch-to-100/`  
> Status: **faze 1–8 done**. Sljedeće: **faza 9 play-store**.  
> Prod: https://fkgracanica.ba101.top — compose stack; **Docker rebuild nakon svake faze** (`./scripts/docker-prod-build.sh && docker compose up -d`).

Nastavi FK Gračanica s `main`. Ne diraj mobile showcase intercept u `_layout.tsx`. Ne committaj osim ako korisnik traži.

---

## Katalog (8 after_launch → 100)

| id | % | badge | faza |
|----|---|-------|------|
| paypal | **100** | ready | 2 |
| monri | **100** | ready | 3 |
| financial-export | **100** | ready | 4 |
| pwa | **100** | ready | 5 |
| video-highlights | **100** | ready | 6 |
| newsletter-campaigns | **100** | ready | 7 |
| seasonal-tickets | **100** | ready | 8 |
| play-store | 20 | after_launch | **9 sljedeća** |

Katalog: `backend/src/showcase/catalog-modules.ts`.

Zaključano u planu: SeasonPass + Admission (ne N tickets); PayPal currency default **EUR** (isti broj kao KM); finance Excel bez LedgerEntry; Play 100% = Internal testing.

---

## PayPal (faza 2) — 100 ready

Orders API v2 CAPTURE. Sandbox/live preko `payments.paypal.mode`.

**Tok**
1. Checkout → Orders API, `custom_id` `t:{orderId}` / `m:{membershipId}`
2. Return: `?provider=paypal&token=` ili `session_id` → `confirm-session` capture + isti confirm flow kao Stripe
3. Webhook: treba `webhookId`; `ORDER.APPROVED` ili `CAPTURE.COMPLETED`; idempotentno. **Return URL radi i bez webhooka.**

**Charge:** `payments.paypal.currency` default **EUR**. Iznos = isti broj kao KM na narudžbi (nije konverzija).

**Settings (PRIVATE):** `enabled`, `clientId`, `clientSecret`, `mode` (sandbox\|live), `currency`, `webhookId`

**Ključni fajlovi**
- `backend/src/payments/paypal-api.util.ts`, `paypal-http.util.ts`, `paypal-webhook.util.ts`, `paypal-ops.ts`
- `backend/src/payments/providers/paypal.provider.ts`
- FE: success URL ima `provider=`; return hook šalje `{ sessionId, provider }`
- Matrica: `.cursor/docs/matrices/payments/MATRIX.md`

**Ops gate (nije blokada koda):** live merchant + webhook ID u adminu.

---

## Monri (faza 3) — 100 ready

WebPay v2 form POST. Nije Stripe Checkout.

**Tok**
1. Checkout → bridge `{origin}/placanje/monri?sid=` (`t-{ticketOrderId}` / `m-{membershipId}`, max 40)
2. `GET /payments/monri/form?sessionId&origin` (JWT) → hidden fields, auto-POST
3. IPG: `https://ipgtest.monri.com/v2/form` (test) ili `https://ipg.monri.com/v2/form` (live)
4. Return confirm **zahtijeva** `returnUrl: window.location.href` (digest `SHA512(key + urlWithoutDigest)`)
5. Callback: header `WP3-callback <sha512(key+rawBody)>`, JSON `status: approved`

**Spec**
- Digest form: `SHA512(key + order_number + amount + currency)` — amount u **minor units** (10.24 → 1024)
- `transaction_type: purchase`, valuta **BAM**
- Route `/placanje/monri` **nije** ticketing-module-gated (članstvo koristi isto)
- Confirm bez `returnUrl` + validnog digest-a **pada**

**Settings:** `enabled`, `merchantKey`, `authenticationKey` (authenticity token), `mode` (test\|live)

**Ključni fajlovi**
- `backend/src/payments/monri-digest.util.ts` + `.spec.ts`
- `backend/src/payments/monri-ops.ts`, `providers/monri.provider.ts`
- `GET /payments/monri/form`, `POST /payments/webhooks/monri` (raw body)
- FE: `MonriBridgePage.tsx`, ruta u `frontend/src/router/public-layout-routes.tsx`
- Confirm hooks šalju `returnUrl: window.location.href`

**Ops gate:** živi test charge s merchant ključevima. Katalog 100 je gated na ključeve (isti obrazac kao PayPal), ne čeka live charge.

---

## Payments foundation (faza 1) — done

- `CHECKOUT_IMPLEMENTED` = `['stripe', 'paypal', 'monri']` u `provider-gate.util.ts`
- Online toggle samo ako je provider **checkoutReady** (ne samo keys filled)
- Admin `/admin/ticketing`: badge Nedostaje / Ključevi / Spremno
- Settings registry: `backend/src/payments/payments-settings.ts`
- `confirm-session` prima `{ sessionId, provider?, returnUrl? }`

---

## Faza 4 — Finance 100 ready

- `/admin/finance`, RBAC `finance.read` (Administrator sync na boot: `rbac/sync-permissions.ts`)
- `GET /finance/summary`, `export.xlsx`, `export.pdf`
- Tickets = `Payment`; članarine = ACTIVE × `membership.annualPrice` (nema Payment reda — rupa u matrici)
- UX: statusi BS, datumi `dd.mm.yyyy.`, branded provider chipovi
- Matrica: `.cursor/docs/matrices/finance/`

---

## Faza 5 — PWA 100 ready

- PNG `frontend/public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`
- SW v3 `fk-gracanica-v3`: API network-only; navigate → `/offline.html`; SW samo `import.meta.env.PROD`
- Install banner `PwaInstallBanner` (Android `beforeinstallprompt`; iOS = Add to Home Screen)
- `og-server.mjs`: `/sw.js` Cache-Control no-cache
- Matrica: `.cursor/docs/matrices/pwa/`

---

## Faza 6 — Video highlights 100 ready

- Prisma `MatchHighlight` (migracija `20260817120000_match_highlights`)
- CRUD `matches.manage`: `POST/PATCH/DELETE /matches/:matchId/highlights`
- `GET /matches/:id` uključuje `highlights[]`
- Public: `MatchHighlights` ispod streama; `VideoEmbed` + `startSeconds` → `&start=`
- Admin: `MatchHighlightsEditor` u match sheet (i završene utakmice)
- Mobile: lista na `live/[id]` → `Linking.openURL` (nema WebView)
- `Match.youtubeUrl` ostaje full stream
- Matrica: `.cursor/docs/matrices/video-highlights/`

---

## Faza 7 — Newsletter kampanje 100 ready

- `NewsletterCampaign` DRAFT → SENDING → SENT/FAILED
- `unsubscribeToken` na pretplatniku; `GET /newsletter/unsubscribe?token=` + FE page
- Send: `enqueueEmailLater` + BullMQ limiter 10/min; tally sent/fail
- Admin tab Kampanje; `newsletter.manage`; flag `newsletter.blastEnabled` default **false**
- Matrica: `.cursor/docs/matrices/newsletter/`

SMTP bulk = ops flag (nije Mailgun).

---

## Faza 8 — seasonal-tickets (done)

Jedan `SeasonPass` / user×season. Admission po utakmici. Kapacitet = ticketi + ACTIVE/PENDING passevi.

Settings: `ticketing.seasonPassPrice`, `ticketing.seasonPassLabel`. Checkout metadata `season_pass` / PayPal `s:` / Monri `s-`. Validate `{ qrCode, matchId }`.

Matrica: `.cursor/docs/matrices/seasonal-tickets/`

---

## Sljedeće: faza 9 — play-store

Pročitaj: `.cursor/plans/fk-gracanica/33_after-launch-to-100/09_phase-play-store.md`

Internal testing AAB = 100%. Ne dirati mobile showcase intercept.

## Pravila koja vrijede

- Fajlovi ≤200 linija (config/schema do 400). Split prije prekoračenja.
- Plan pa execute; korisnik obično odobri sa „može faza N“.
- Docker rebuild **nakon svake faze**.
- i18n: BS default + EN infrastruktura.
- Ne dirati mobile showcase intercept.

## Van opsega (cijeli track)

iOS App Store, PayPal/Monri refund UI, video upload (samo YouTube), Mailgun, PayPal BAM, `mobile-polish`.
