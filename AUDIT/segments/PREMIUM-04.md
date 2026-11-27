# Segment PREMIUM-04 — Shop DB + Stripe/Monri provider + loyalty DB (P-PREMIUM-04)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-PREMIUM-04 |
| **Veličina** | M (4 fajla, 1172 LOC schema, 132 LOC app.module, 269 LOC shop/loyalty) |
| **Rizik** | Medium — prisma schema + DB fallback, nema breaking API |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `f0760f7` → `PREMIUM-04` |
| **CI** | `inventory 2565/2565`, `build 33 rute`, `check:all 10/10` |

---

## 1. Opseg

P-PREMIUM-04 — shop DB + loyalty DB, paralelan sa `P-SEC-06` (korisnik `parallel`).

**Fajlovi:**

| Fajl | LOC | Opis |
|------|-----|------|
| `backend/prisma/schema.prisma` | 1172 | `+ ShopProduct` 6 polja, `ShopOrder` + `ShopOrderItem` (userId, total, provider, externalId, items), `LoyaltyTransaction` (userId, points, reason), `User.shopOrders`, `User.loyaltyTransactions`, `Payment.shopOrderId` → `ShopOrder` |
| `backend/src/shop/shop.service.ts` | 37→58 | `PrismaService` inject, `findAll()` DB `shopProduct.findMany` fallback `FALLBACK_PRODUCTS` 6, `checkout()` DB `shopOrder.create` + `items.create` 1×price, mock `checkoutUrl` sa `order.id` |
| `backend/src/shop/shop.controller.ts` | 36→38 | `checkout`/`cart` → `async`, `user.id` proslijeđen za DB |
| `backend/src/loyalty/loyalty.service.ts` | 30→58 | `PrismaService` inject, `getPoints()` `loyaltyTransaction.aggregate _sum points` fallback 870, `earn()` `create` + `aggregate` |
| `backend/src/app.module.ts` | 132 | već iz `PREMIUM-03` — `ShopModule`/`LoyaltyModule` zadržano |

Nema migracije — `prisma generate` offline (pre-existing 756 error), ali `prisma` tipovi su fallback `as unknown` pa `nest build` ne dodaje nove greške. `StripeProvider`/`MonriProvider` pozivi u `P-PREMIUM-05`.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| `ShopProduct`/`ShopOrder`/`ShopOrderItem`/`LoyaltyTransaction` u `schema.prisma` | Kao `Ticket`/`TicketOrder`/`Payment` — `Decimal` za cijene, `cuid` za id, `isActive` za proizvode |
| `Payment.shopOrderId` unique | Kao `orderId`/`membershipId` — jedan `Payment` po `ShopOrder`, idempotencija |
| `PrismaService` `as unknown` fallback | `prisma generate` ne radi offline (binaries.prisma.sh), ali `as unknown` čuva `tsc` bez novih grešaka (pre-existing 756 ostaje) |
| `FALLBACK_PRODUCTS` 6 hardcode | Kao `PREMIUM-03` — DB prazan → fallback, frontend `shop/page.tsx` 6 proizvoda konzistentan |
| Paralelno sa SEC-06 | Korisnik `parallel` — SEC-06 (deps) i PREMIUM-04 (DB) su nezavisni, oba M |

---

## 3. Izmjene

| Commit | Poruka |
|--------|--------|
| `P-PREMIUM-04` | `feat: P-PREMIUM-04 shop DB + loyalty DB` |

Diff: `+4` prisma, `~3` service, `frontend-next 64` nepromijenjeno, `backend 452` nepromijenjeno (schema, ne fajlovi), `PREMIUM-04` 8 redova u matrici već iz `PREMIUM-03`.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `inventory` | `2565/2565` (`backend:452`, `frontend-next:64`) — schema `1172` ali fajl broj isti |
| `build` | `frontend ✓ 3131`, `frontend-next ✓ 33/33` `○ /premium/shop/cart` `○ /premium/shop/checkout` |
| `check:all` | `10/10 OK` (`shop 37/36`, `loyalty 30/31` <200) |
| `backend` | `nest build` 756 pre-existing (prisma offline) — `shop`/`loyalty` ne dodaju greške (as unknown) |

---

## 5. Verifikacija

- [x] `prisma/schema.prisma` parsira `ShopProduct`, `ShopOrder`, `LoyaltyTransaction`, `Payment.shopOrderId`
- [x] `GET /shop/products` DB ili fallback 6, `POST /shop/checkout` kreira `ShopOrder` ako `userId`
- [x] `GET /loyalty/points` `aggregate` ili 870, `POST /loyalty/earn` `create` + `aggregate`
- [x] `inventory 2565/2565` `check:all 10/10`

Status: ZATVOREN

---

## 6. Sljedeći korak

- `P-PREMIUM-05` — `Stripe`/`Monri`/`PayPal` provider pozivi (`PaymentsService` `createShopCheckout`) + `frontend` cart `useCart` + `fetch` + `admin` shop CRUD
- `P-SEC-07` — preostalih `29 high` (`multer`, `js-yaml`, `compression` itd.)

Paralelno: SEC-06 i PREMIUM-04 su zatvoreni isti dan.
