# Membership Matrix

## Status flow

```
PENDING  → ACTIVE | CANCELLED
ACTIVE   → EXPIRED | SUSPENDED | CANCELLED | ACTIVE (renew/uplata)
SUSPENDED → ACTIVE (admin) | CANCELLED
EXPIRED  → ACTIVE (admin ili uplata) | CANCELLED | PENDING (reuse re-join)
CANCELLED → ACTIVE (admin) | PENDING (reuse re-join ili uplata → confirm)
```

- Jedan tekući zapis po useru. `register` / `createForUser` reuse `CANCELLED`/`EXPIRED` → `PENDING` (ne novi red).
- Duplikat `PENDING`/`ACTIVE` → 400.
- `EXPIRED`: lazy resolve na čitanju kad `endDate < now` i status je `ACTIVE`.
- `SUSPENDED` je disciplinska mjera — samo admin aktivira; nije payable/confirmable.

## Guards

| Akcija | Dozvoljeni statusi |
|--------|-------------------|
| activate | PENDING, SUSPENDED, EXPIRED, CANCELLED |
| renew | ACTIVE, EXPIRED |
| suspend | ACTIVE |
| cancel | sve osim CANCELLED |
| payable / confirm | PENDING, ACTIVE, EXPIRED, CANCELLED (**ne** SUSPENDED) |

## Card generation

- On activation: `MembershipCard` with unique `cardNumber` + `qrCode`
- QR format: `member-{membershipId}` (via `generateQrCode`)
- Javni prikaz kartice/QR **samo** za `ACTIVE`

## Admin UI (`/admin/membership`) + staff mobile

- Filteri po statusu
- Akcije: Aktiviraj / Obnovi / Suspenduj / Otkaži (gated po tabeli iznad)
- Ručno dodavanje (`POST /membership/admin`) — reuse ako je CANCELLED/EXPIRED
- Detalj sheet s karticom i QR
- RBAC: `membership.manage`
- Bez hard delete — **Otkaži** (`CANCELLED`) je reverzibilan
- Link „Online postavke” → `/admin/ticketing` (payments tab)

## Javna stranica (`/clanstvo`)

| Auth | Status | UI |
|------|--------|-----|
| Gost | — | Join forma (online) ili box-office info |
| Da | nema zapisa | Pay / box-office |
| Da | PENDING | `MembershipPendingStatus` — pay retry ako je online; box-office copy inače |
| Da | ACTIVE | `MembershipCardPanel` (digitalna kartica) — **bez** pay dugmeta |
| Da | EXPIRED | Online: obnova checkout na isti id. Offline: box-office + „Prijavi se ponovo” |
| Da | CANCELLED | Online: pay na isti id. Offline: box-office + „Prijavi se ponovo” |
| Da | SUSPENDED | Kontakt forma (bez pay/register) |

**Moj račun:** tabovi **Članstvo** | **Ulaznice**; ulaznice grupisane po utakmici → dijalog s detaljima.

**Mobile tab:** `EXPIRED`/`CANCELLED` → `register` (reuse). `SUSPENDED` bez register. Kartica samo `ACTIVE`.

## Online payment (kad `membership.onlineEnabled` + provider ready)

1. `POST /membership/public/join` (gost) ili `POST /membership/register` (auth) → PENDING (reuse ako CANCELLED/EXPIRED)
2. `POST /payments/checkout/membership` → Stripe Checkout (payable: PENDING/ACTIVE/EXPIRED/CANCELLED)
3. Aktivacija (bilo koji prvi):
   - Webhook `checkout.session.completed`
   - Povratak: `POST /payments/membership/confirm-session` + `session_id` u URL
4. `confirmMembershipFlow` → ACTIVE + card za PENDING/EXPIRED/CANCELLED; ACTIVE produžava `endDate` +1 god; **SUSPENDED no-op**

**Box office:** admin aktivira ručno; korisnik vidi PENDING dok nije ACTIVE.

## Settings / KPI

- `membership.onlineEnabled` — gating (AND `PaymentsReadinessService`)
- `membership.annualPrice` — KM, javno u ticketing config
- Dashboard `members` = ACTIVE + PENDING + SUSPENDED + EXPIRED (bez CANCELLED)

## Changelog

- 2026-08-17: Reverzibilni CANCELLED/EXPIRED, reuse zapisa, admin+user re-join, confirm ne dira SUSPENDED
- 2026-06-29 (e): Ime člana u `/membership/me`, ID kartica (1.586), QR zoom, HTML print/download, admin bulk export
- 2026-06-29: Gate #13 — admin UI, javna kartica, lazy EXPIRED
- 2026-06-24: Initial matrix, box office only
