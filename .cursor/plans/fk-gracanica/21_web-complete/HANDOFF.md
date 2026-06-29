# HANDOFF — Web Complete

> **Datum:** 2026-06-29  
> **Sesija:** Gate #14 Ulaznice + članstvo online + unified auth + Stripe aktivacija  
> **Gate:** #1–#14 APPROVED; **#15 Kontakt READY_FOR_REVIEW**  
> **Sljedeći fokus:** #15 Kontakt smoke → APPROVED → **#16 Newsletter**  
> **Git:** `main` @ `be03774` — **veliki uncommitted diff** (vidi §11)

---

## 1. Prvo pročitaj (agent)

1. [GATE_LOG.md](./GATE_LOG.md)
2. [.cursor/docs/matrices/ticketing/MATRIX.md](../../../docs/matrices/ticketing/MATRIX.md)
3. [.cursor/docs/matrices/payments/MATRIX.md](../../../docs/matrices/payments/MATRIX.md)
4. [.cursor/docs/matrices/membership/MATRIX.md](../../../docs/matrices/membership/MATRIX.md)
5. [../HANDOFF.md](../HANDOFF.md) — deploy, env, produkcija

---

## 2. Gate status

| # | Modul | Status |
|---|-------|--------|
| 1–12 | Vijesti → Live | **APPROVED** |
| 13 | Članstvo | **APPROVED** (prošireno online join + pending UX) |
| 14 | Ulaznice | **READY_FOR_REVIEW** |
| 15–21 | Kontakt → Dashboard | nije gate-ovan |

---

## 3. Urađeno u zadnjoj sesiji

### 3.1 Unified auth (javni web)

- Jedna prijava: `/prijava` (`LoginPage.tsx`) — članovi + staff
- `/admin/login` → redirect na `/prijava`
- `hasStaffAccess()` — staff = bilo koja permission; uloga Član = `[]`
- `ProtectedRoute` — ne-staff → `/clanstvo` (ne admin)
- Header: `PublicAuthButton` — „Prijavi se“ / „Moj račun“ / Dashboard (samo staff)
- Footer: Dashboard link samo za staff

### 3.2 Članstvo — online kupovina + aktivacija

- `POST /membership/public/join` — gost kreira nalog (Član) + PENDING članstvo + JWT
- Stripe: `POST /payments/checkout/membership` → redirect
- **Aktivacija:** webhook `checkout.session.completed` **ili** povratak s `session_id`:
  - `POST /payments/membership/confirm-session` (JWT)
  - `confirmMembership()` → ACTIVE + `MembershipCard` + QR
- Success URL: `/clanstvo?paid=1&session_id={CHECKOUT_SESSION_ID}`
- **Moj račun** (`/clanstvo`, prijavljen):
  - `ACTIVE` → digitalna kartica + opcija obnove
  - `PENDING` → `MembershipPendingStatus` (amber banner „čeka odobrenje“)
  - online uključen → dugme „Plati online“; samo blagajna → poruka o uplati na stadionu
- Otkazana uplata: `?cancelled=1` → ponovni pokušaj

### 3.3 Gate #14 Ulaznice (akumulirano, još nije APPROVED)

**Backend:** ticketing settings, `TicketingConfigService`, domaće utakmice only, `PaymentsModule` (Stripe), migracija `20260629120000_payment_online_fields`, max box-office limit po korisniku, jedna SCHEDULED domaća utakmica.

**Frontend:** admin tabovi Narudžbe | Postavke | Online plaćanje; `/ulaznice` bez dropdowna (auto match); prematch + home CTA; online checkout; ticketing keys **ne** u globalnom `/admin/settings` (`managedIn: 'ticketing'`, strip u `settingDefToCreate` — fix Prisma crash).

**Fix:** `managedIn` metadata se ne šalje u Prisma upsert (login crash).

---

## 4. Stripe / env (test)

```bash
# Admin → Ulaznice → Online plaćanje
payments.stripe.enabled = true
payments.stripe.secretKey = sk_test_...
payments.stripe.publishableKey = pk_test_...
payments.stripe.webhookSecret = whsec_...

ticketing.onlineEnabled = true
membership.onlineEnabled = true
membership.annualPrice = <KM>
```

Webhook URL: `POST /backend/api/v1/payments/webhooks/stripe`  
Lokalno: `stripe listen --forward-to localhost:3000/api/v1/payments/webhooks/stripe`

---

## 5. Smoke checklist (#14 + članstvo online)

### Ulaznice
- [ ] Admin: kategorije CRUD, cijene
- [ ] Online disabled bez Stripe secrets
- [ ] Javno: samo domaća SCHEDULED utakmica
- [ ] Prematch/home CTA → `/ulaznice`
- [ ] Box office rezervacija
- [ ] Stripe test → narudžba `paid`

### Članstvo online
- [ ] Gost: join forma → Stripe → povratak → ACTIVE + kartica
- [ ] Registracija bez plaćanja → prijava → Moj račun → PENDING banner
- [ ] Box-office-only (online off) → PENDING bez pay dugmeta
- [ ] Webhook + confirm-session (oba idempotentna)

### Auth
- [ ] Član vidi Moj račun, ne admin
- [ ] Staff vidi Dashboard u headeru/footeru

---

## 6. Ključni fajlovi (nova sesija)

| Područje | Putanja |
|----------|---------|
| Public join | `backend/src/membership/membership-public.controller.ts` |
| Stripe confirm | `backend/src/payments/providers/stripe.provider.ts` |
| Payments API | `backend/src/payments/payments.controller.ts` |
| Login unified | `frontend/src/pages/public/LoginPage.tsx` |
| Moj račun | `frontend/src/pages/public/MembershipPage.tsx` |
| Pending UX | `frontend/src/components/membership/MembershipPendingStatus.tsx` |
| Purchase flow | `frontend/src/components/membership/MembershipPurchasePanel.tsx` |
| Payment return | `frontend/src/hooks/use-membership-payment-return.ts` |
| Staff gate | `frontend/src/lib/staff-access.ts` |
| Settings filter | `frontend/src/lib/setting-field-utils.ts` |
| Ticketing admin | `frontend/src/pages/admin/TicketingAdminPage.tsx` |

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

- [ ] Success toast nakon uplate (opcionalno UX)
- [ ] PayPal/Monri — stub 501
- [ ] `live_center/MATRIX.md` — nije ažuriran za Live polish
- [ ] E2E za membership Stripe confirm-session
- [ ] **Commit** cijelog diffa prije produkcijskog deploya

---

## 9. Sljedeći segmenti (#15+)

| # | Segment | Predloženi scope |
|---|---------|------------------|
| **14** | **Ulaznice** | Smoke → APPROVED |
| 15 | Kontakt | Forma + admin inbox |
| 16 | Newsletter | Pretplate |
| 17–21 | HoF, Muzej, Users, Settings, Dashboard | po planu |

---

## 10. Deploy

```bash
./scripts/docker-prod-build.sh && docker compose up -d
cd backend && npx prisma migrate deploy
```

---

## 11. Uncommitted promjene (⚠️)

Sve iz §3–§4 je u working tree, **nije commitano**. Prije deploya:

```bash
git status
git diff --stat
```

Novi moduli/direktoriji: `backend/src/payments/`, `membership-public.controller`, `frontend/src/components/membership/`, `LoginPage`, hooks za checkout/confirm.

---

## 12. Prompt za sljedeću sesiju (copy-paste)

```
Nastavi Web Complete iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

Gate #14 Ulaznice READY_FOR_REVIEW — smoke Stripe (ulaznice + članstvo), pa APPROVED.
Unified auth i membership online aktivacija su implementirani ali uncommitted.

Pročitaj ticketing/payments/membership MATRIX.
Ako smoke prođe, predloži commit message za cijeli diff.
Zatim #15 Kontakt.
```
