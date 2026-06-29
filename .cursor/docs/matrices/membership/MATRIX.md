# Membership Matrix

## Status flow

```
PENDING → ACTIVE → EXPIRED
         ↘ SUSPENDED
         ↘ CANCELLED
```

- `EXPIRED`: lazy resolve na čitanju kad `endDate < now` i status je `ACTIVE`
- `register` / `public/join`: odbija duplikat ako postoji `PENDING` ili `ACTIVE`

## Card generation

- On activation: `MembershipCard` with unique `cardNumber` + `qrCode`
- QR format: `member-{membershipId}` (via `generateQrCode`)

## Admin UI (`/admin/membership`)

- Filteri po statusu, akcije: aktiviraj / obnovi / suspenduj / otkaži
- Ručno dodavanje (`POST /membership/admin`)
- Detalj sheet s karticom i QR
- RBAC: `membership.manage`
- Bez hard delete — **Otkaži** (`CANCELLED`)
- Link „Online postavke” → `/admin/ticketing` (payments tab)

## Javna stranica (`/clanstvo`)

| Auth | Status | UI |
|------|--------|-----|
| Gost | — | Join forma (online) ili box-office info |
| Da | PENDING | `MembershipPendingStatus` — uplata zaprimljena, čeka odobrenje (bez pay dugmeta) |
| Da | ACTIVE | `MembershipCardPanel` + opcija obnove |
| Da | EXPIRED | Obnova (online ako spremno) |

**Moj račun:** prijavljeni korisnik vidi naslov „Moj račun”.

## Online payment (kad `membership.onlineEnabled` + provider ready)

1. `POST /membership/public/join` (gost) ili `POST /membership/register` (auth) → PENDING
2. `POST /payments/checkout/membership` → Stripe Checkout
3. Aktivacija (bilo koji prvi):
   - Webhook `checkout.session.completed`
   - Povratak: `POST /payments/membership/confirm-session` + `session_id` u URL
4. `confirmMembership()` → ACTIVE + card; obnova ACTIVE produžava `endDate` +1 god

**Box office:** admin aktivira ručno; korisnik vidi PENDING dok nije ACTIVE.

## Settings

- `membership.onlineEnabled` — gating (AND `PaymentsReadinessService`)
- `membership.annualPrice` — KM, javno u ticketing config

## Changelog

- 2026-06-29 (c): Online join, Stripe aktivacija, Moj račun pending UX, confirm-session
- 2026-06-29: Gate #13 — admin UI, javna kartica, lazy EXPIRED
- 2026-06-24: Initial matrix, box office only
