# HANDOFF — Web Complete

> **Datum:** 2026-06-29  
> **Sesija:** #14 Ulaznice APPROVED + payments polish + Moj račun ulaznice + multi-provider UI  
> **Gate:** #1–#14 **APPROVED**; **#15 Kontakt READY_FOR_REVIEW**  
> **Sljedeći fokus:** #15 Kontakt → korisnički APPROVED → **#16 Newsletter**  
> **Git:** `main` @ `be03774` — **veliki uncommitted diff** (vidi §12)

---

## 1. Prvo pročitaj (agent)

1. [GATE_LOG.md](./GATE_LOG.md)
2. [.cursor/docs/matrices/ticketing/MATRIX.md](../../../docs/matrices/ticketing/MATRIX.md)
3. [.cursor/docs/matrices/payments/MATRIX.md](../../../docs/matrices/payments/MATRIX.md)
4. [.cursor/docs/matrices/membership/MATRIX.md](../../../docs/matrices/membership/MATRIX.md)
5. [.cursor/docs/matrices/contact/MATRIX.md](../../../docs/matrices/contact/MATRIX.md)
6. [../HANDOFF.md](../HANDOFF.md) — deploy, env, produkcija

---

## 2. Gate status

| # | Modul | Status |
|---|-------|--------|
| 1–12 | Vijesti → Live | **APPROVED** |
| 13 | Članstvo | **APPROVED** |
| 14 | Ulaznice | **APPROVED** |
| 15 | Kontakt | **READY_FOR_REVIEW** |
| 16–21 | Newsletter → Dashboard | nije gate-ovan |

---

## 3. Urađeno (akumulirano, uncommitted)

### 3.1 Unified auth + header

- Jedna prijava: `/prijava` — članovi + staff
- `PublicUserMenu` — inicijali, dropdown: Moj račun / Dashboard (staff) / Odjava
- `hasStaffAccess()`, `ProtectedRoute` — ne-staff → `/clanstvo`

### 3.2 Članstvo online

- Gost: `POST /membership/public/join` → Stripe → auto **ACTIVE** + kartica + QR
- Aktivacija: webhook **ili** `POST /payments/membership/confirm-session`
- PENDING (box office): banner „čeka odobrenje“, **bez** pay dugmeta
- Otkazana uplata: `?cancelled=1` → `OnlinePaymentChoice` retry

### 3.3 Ulaznice — sales modes

| Online | Blagajna | Ponašanje |
|--------|----------|-----------|
| ✓ | ✓ | Plati online **ili** rezerviši za blagajnu |
| ✓ | ✗ | Samo online |
| ✗ | ✓ | Samo rezervacija |
| ✗ | ✗ | Kupovina off |

- `paymentIntent: 'box_office' | 'online'` na reserve
- Limit blagajne samo za box-office rezervacije
- **Plati online** samo za neplaćene rezervacije (`RESERVED`, ne `CONFIRMED`)

### 3.4 Online plaćanje — auto-odobrenje

- Ulaznice: `POST /payments/tickets/confirm-session` + webhook → order `paid`, QR
- Članstvo: `confirm-session` + webhook → `ACTIVE` + kartica
- `usePaymentSessionReturn` — **jedan** confirm poziv (fix infinite loop)
- `sessionStorage` dedup + `useClearPaymentParams` (briše `?paid&session_id`)

### 3.5 Multi-provider UI (`OnlinePaymentChoice`)

- **1 spreman provajder** → dugme „Plati online“ + logo (Stripe/PayPal/Monri)
- **2+ spremna** → samo logotipi; klik → checkout tog provajdera
- Backend: `getReadyProviders()`, checkout prima `provider`
- Javno: `readyProviders` u `/ticketing/config`
- PayPal/Monri: još **stub 501** (samo Stripe live)

### 3.6 Moj račun — ulaznice

- `/clanstvo`: sekcija **Moje ulaznice** (`MyTicketsPanel`)
- Filteri: Kupljene | Rezervisane | Otkazane | Sve
- `TicketPassCard` — status badge, QR za plaćene, muted za otkazane

### 3.7 Gate #15 Kontakt (READY_FOR_REVIEW)

- Forma + admin inbox već postoje
- Polish: prefill imena/emaila, admin mailto link
- Matrica: `.cursor/docs/matrices/contact/MATRIX.md`

---

## 4. Stripe / env

```bash
# Admin → Ulaznice → Online plaćanje
payments.stripe.enabled = true
payments.stripe.secretKey = sk_test_...
payments.stripe.publishableKey = pk_test_...
payments.stripe.webhookSecret = whsec_...

ticketing.onlineEnabled = true
ticketing.boxOfficeEnabled = true   # default true
membership.onlineEnabled = true
membership.annualPrice = <KM>
```

Webhook: `POST /api/v1/payments/webhooks/stripe`  
Lokalno: `stripe listen --forward-to localhost:3000/api/v1/payments/webhooks/stripe`

---

## 5. Smoke checklist (#15 + regresija)

### Kontakt (#15)
- [ ] Javno `/kontakt` — submit poruke
- [ ] Admin `/admin/contact` — lista, filter, sheet, mailto
- [ ] Prefill za prijavljenog korisnika

### Regresija payments
- [ ] 1 provajder (Stripe): dugme + ikona → paid + QR
- [ ] confirm-session: **1 request** u Network tabu (ne loop)
- [ ] Rezervacija blagajna → bez „Plati online“ nakon uplate
- [ ] Moj račun: filteri ulaznica

---

## 6. Ključni fajlovi

| Područje | Putanja |
|----------|---------|
| Payments readiness | `backend/src/payments/payments-readiness.service.ts` |
| Stripe confirm flow | `backend/src/payments/stripe-confirm.flow.ts` |
| Checkout API | `backend/src/payments/payments.controller.ts` |
| Ticketing config | `backend/src/ticketing/ticketing-config.service.ts` |
| Payment choice UI | `frontend/src/components/payments/OnlinePaymentChoice.tsx` |
| Provider logos | `frontend/src/components/payments/PaymentProviderLogo.tsx` |
| Confirm hook (fix loop) | `frontend/src/hooks/use-payment-session-return.ts` |
| Moj račun ulaznice | `frontend/src/components/ticketing/MyTicketsPanel.tsx` |
| Ticket pass | `frontend/src/components/ticketing/TicketPassCard.tsx` |
| User menu | `frontend/src/components/layout/PublicUserMenu.tsx` |
| Membership flow | `frontend/src/components/membership/MembershipPurchasePanel.tsx` |
| Kontakt javno | `frontend/src/pages/public/ContactPage.tsx` |
| Kontakt admin | `frontend/src/pages/admin/ContactAdminPage.tsx` |

---

## 7. Migracije (deploy)

```bash
cd backend && npx prisma migrate deploy && npx prisma generate
```

| Migracija | Sadržaj |
|-----------|---------|
| `20260629120000_payment_online_fields` | `Payment.provider`, `externalId`, `PENDING_ONLINE` |

---

## 8. Poznati gapovi / backlog

- [ ] PayPal/Monri — implementacija (trenutno stub)
- [ ] E2E confirm-session (tickets + membership)
- [ ] `live_center/MATRIX.md` — nije ažuriran
- [ ] **Commit** cijelog diffa prije produkcijskog deploya
- [ ] Docker rebuild nakon deploya (stari image nema `/ticketing/config`)

---

## 9. Sljedeći segmenti

| # | Segment | Scope |
|---|---------|-------|
| **15** | **Kontakt** | Smoke → APPROVED |
| 16 | Newsletter | Pretplate |
| 17–21 | HoF, Muzej, Users, Settings, Dashboard | po planu |

---

## 10. Deploy

```bash
./scripts/docker-prod-build.sh && docker compose up -d
cd backend && npx prisma migrate deploy
```

---

## 11. Predloženi commit message (cijeli diff)

```
feat(web): payments, ulaznice, članstvo online, Moj račun

- Payments modul (Stripe checkout, webhook, confirm-session)
- Unified auth, PublicUserMenu, sales modes ulaznica
- Auto-aktivacija nakon online uplate, MyTicketsPanel
- OnlinePaymentChoice (multi-provider), confirm-session loop fix
- Kontakt prefill + contact matrix
- Gate #14 APPROVED, #15 Kontakt READY_FOR_REVIEW
```

---

## 12. Uncommitted promjene (⚠️)

```bash
git status
git diff --stat
```

**Novi direktoriji/moduli (izvan HEAD):**
- `backend/src/payments/` (+ stripe-confirm.flow.ts)
- `backend/src/membership/membership-public.controller.ts`
- `frontend/src/components/membership/`, `ticketing/`, `payments/`
- `frontend/src/components/layout/PublicUserMenu.tsx`
- hooks: checkout, confirm-session, payment-return, clear-params
- `.cursor/docs/matrices/payments/`, `contact/`

**Zadnja sesija (na vrhu diffa):** multi-provider UI, confirm loop fix, MyTicketsPanel.

---

## 13. Prompt za sljedeću sesiju (copy-paste)

```
Nastavi Web Complete iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

Gate #15 Kontakt READY_FOR_REVIEW — smoke → APPROVED → #16 Newsletter.
Cijeli payments/ulaznice/članstvo diff je uncommitted — commit prije deploya ako korisnik traži.

Pročitaj contact + payments MATRIX.
```
