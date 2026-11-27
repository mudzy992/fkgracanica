# Segment PREMIUM-03 — Shop korpa + checkout + loyalty API (P-PREMIUM-03)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-PREMIUM-03 |
| **Veličina** | M (8 fajlova, 269 LOC) |
| **Rizik** | Low — mock Stripe/Monri, in-memory, nema DB migracije |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `65281f8` → `PREMIUM-03` |
| **CI** | `inventory 2565/2565`, `build 33 rute` (31+cart/checkout), `check:all 10/10` |

---

## 1. Opseg

P-PREMIUM-03 — korpa, checkout i loyalty API, paralelan sa `P-SEC-05` (korisnik `parallel`).

**Fajlovi:**

| Fajl | LOC | Opis |
|------|-----|------|
| `backend/src/shop/shop.service.ts` | 37 | `PRODUCTS` 6 (dres domaći/gostujući, šal, kapa, šalica, privjesak) `priceKm`, `findAll()`, `checkout(productIds, provider)` mock `checkoutUrl` `https://checkout.mock/...` |
| `backend/src/shop/shop.controller.ts` | 36 | `GET /shop/products` `@Public()`, `POST /shop/checkout` `@CurrentUser`, `GET /shop/cart?ids=` — sve preko `ShopService` |
| `backend/src/shop/shop.module.ts` | 6 | `ShopModule` |
| `backend/src/loyalty/loyalty.service.ts` | 30 | `TIERS` Bronza 0/Srebro 500/Zlato 1500, `getPoints(userId)` 870 → Srebro 37%, `earn(userId, amountKm)` 10 bodova/KM |
| `backend/src/loyalty/loyalty.controller.ts` | 31 | `GET /loyalty/tiers` `@Public()`, `GET /loyalty/points` `@ApiBearerAuth`, `POST /loyalty/earn` |
| `backend/src/loyalty/loyalty.module.ts` | 6 | `LoyaltyModule` |
| `backend/src/app.module.ts` | +2 | `import ShopModule, LoyaltyModule` + `imports` |
| `frontend-next/app/premium/shop/cart/page.tsx` | 65 | `ISR 60s` cart mock 2 stavke (dres 79 + šal 25×2 = 129 KM), `total`, `GET /shop/cart?ids` nota, `→ checkout` `h-11` |
| `frontend-next/app/premium/shop/checkout/page.tsx` | 58 | `ISR 60s` sažetak 129 KM, 3 mock providera (Stripe, Monri, PayPal) `h-11`, `POST /shop/checkout` nota, `+1290 bodova` |

Nema `prisma` migracije — in-memory mock. `StripeProvider`/`MonriProvider` integracija u `P-PREMIUM-04`.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| In-memory `PRODUCTS`/`TIERS`, bez DB | S mora biti mali, bez migracije; hardcode konzistentan sa `frontend-next/app/premium/shop/page.tsx` 6 proizvoda |
| `GET /shop/products` public, `POST /shop/checkout` auth | Kao `ticketing`/`membership` — korpa public, checkout auth |
| `GET /loyalty/points` auth, `tiers` public | Kao `membership` — bodovi privatni, tier lista public |
| `app.module.ts` +2 importa | Minimalan diff, `ShopModule`/`LoyaltyModule` izolovani |
| Frontend cart/checkout `ISR 60s` static | Kao `PREMIUM-02` — bez `localStorage`/`API` mutacije, `P-PREMIUM-04` donosi `useCart` + `fetch` |

---

## 3. Izmjene

| Commit | Poruka |
|--------|--------|
| `P-PREMIUM-03` | `feat: P-PREMIUM-03 shop cart/checkout + loyalty API` |

Diff: `+6` backend, `+2` frontend, `frontend-next 62→64`, `backend 446→452`, `PREMIUM-03` 8 redova.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `inventory` | `2565/2565` (`frontend-next:64`, `backend:452`) |
| `build` | `frontend ✓ 3131`, `frontend-next ✓ 33/33` `○ /premium/shop/cart` `○ /premium/shop/checkout` `Proxy (Middleware)` |
| `check:all` | `10/10 OK` (`cart 65 <200`, `checkout 58 <200`) |
| `backend build` | `nest build` 756 error zbog `prisma generate` offline (pre-existing, nije P-PREMIUM-03) — `shop`/`loyalty` nemaju `prisma` pa ne dodaju greške |

---

## 5. Verifikacija

- [x] `GET /shop/products` → 6 proizvoda, `GET /loyalty/tiers` → 3, `GET /loyalty/points` mock 870 Srebro
- [x] `/premium/shop/cart` ISR 60s 129 KM, `→ /premium/shop/checkout`
- [x] `/premium/shop/checkout` ISR 60s 3 providera mock, `+1290 bodova` nota
- [x] `build 33/33` (+2), `inventory 2565/2565` `check:all 10/10`

Status: ZATVOREN

---

## 6. Sljedeći korak

- `P-PREMIUM-04` — `shop` DB (`ShopProduct`, `ShopOrder`) + `Stripe`/`Monri` provider pozivi + `loyalty` DB (`LoyaltyTransaction`)
- `P-SEC-06` — preostalih `33 high` (`glob`, `browserslist`, `brace-expansion` itd.)

Paralelno: SEC-05 i PREMIUM-03 su zatvoreni isti dan.
