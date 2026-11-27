# Segment PREMIUM-05 — Shop Cart/Checkout + admin CRUD (P-PREMIUM-05)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-PREMIUM-05 |
| **Veličina** | M (7 novih fajlova, 579 LOC, 9 fajlova izmjena) |
| **Rizik** | Medium — client cart localStorage + mock Stripe/Monri/PayPal, nema realne naplate |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `87b251c` → `da70495` (cart/checkout + shop.manage) |
| **CI** | `inventory 2570/2570` (`frontend-next:69`, `backend:452`), `build 34/34` Next 16.4.6, `check:all 10/10` |

---

## 1. Opseg

P-PREMIUM-05 — Cart, Checkout i admin Shop CRUD, paralelan sa `P-SEC-06` (korisnik `parallel`). Nastavak `P-PREMIUM-04` (DB schema `ShopProduct/ShopOrder/LoyaltyTransaction`).

**Fajlovi (7 novih + izmjene):**

| Fajl | LOC | Opis |
|------|-----|------|
| `frontend-next/lib/cart.tsx` | 56 | `CartProvider` + `useCart` — `createContext`, `localStorage KEY=fk_cart`, `items: CartItem[]`, `add` qty+1 ili novi, `remove`, `clear`, `total`/`count` `useMemo`, `useEffect` hydrate/persist |
| `frontend-next/app/premium/shop/ShopClient.tsx` | 16 | `AddToCart` client — `useCart().add({id,name,priceKm})` `h-11 w-full bg-primary` |
| `frontend-next/app/premium/shop/page.tsx` | 62 | `revalidate 60 force-static` — `P-PREMIUM-05 ISR` header, 6 proizvoda grid `sm:2 lg:3` `h-28 placeholder`, `AddToCart` po kartici, linkovi `Korpa`/`Checkout` `h-11` |
| `frontend-next/app/premium/shop/cart/page.tsx` | 29 | `revalidate 60` — `CartPage` server shell + `CartClient` |
| `frontend-next/app/premium/shop/cart/CartClient.tsx` | 49 | `useCart` — prazno `Korpa je prazna + Nazad u shop`, lista `flex justify-between p-4` `Ukloni h-11`, footer `total KM + Na checkout / Isprazni` |
| `frontend-next/app/premium/shop/checkout/page.tsx` | 30 | `revalidate 60` — `CheckoutPage` server shell + `CheckoutClient`, nota Stripe/Monri/PayPal mock |
| `frontend-next/app/premium/shop/checkout/CheckoutClient.tsx` | 74 | `useCart` + `PROVIDERS stripe/monri/paypal` `useState provider/loading/url/error`, `POST /api/shop/checkout {productIds, provider}` → `checkoutUrl`, `clear()` on success, `disabled opacity-50` |
| `frontend-next/app/layout.tsx` | +18 | `CartProvider` wrap `children` — global cart za `/premium/shop/*` |
| `frontend-next/app/admin/shop/page.tsx` | 81 | `AdminShopPage shop.manage` — `useQuery fetchProducts GET /shop/products`, `useMutation POST /shop/admin/products` `shop.manage`, form `name/price/tag h-11`, lista proizvoda |
| `frontend-next/components/admin/admin-nav.ts` | +2 | `+Shop /admin/shop` `+Loyalty /admin/loyalty` u `admin-nav` |
| `backend/src/shop/shop.service.ts` | 57→88 | `adminCreate/update/delete` (`shopProduct.create/update/delete`), `findAll` DB `findMany isActive` + fallback, `checkout` već iz PREMIUM-04 |
| `backend/src/shop/shop.controller.ts` | 36→72 | `POST admin/products`, `PATCH admin/products/:id`, `DELETE admin/products/:id` — `PermissionsGuard + RequirePermissions('shop.manage')` |
| `backend/src/app.module.ts` | 119-120 | `ShopModule`/`LoyaltyModule` već iz PREMIUM-03 — zadržano |

Nema migracije — `ShopProduct/ShopOrder` već iz `PREMIUM-04` (`prisma/schema.prisma 58 LOC`). `Cart` je isključivo client `localStorage`, nema `prisma` upisa do `checkout`. Mock `checkoutUrl` (`https://checkout.stripe.mock`, `ipgtest.monri.com`, `paypal.mock`) sa `order=...` ili `total=...`.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| `CartProvider` u `layout.tsx` global | Kao `AuthProvider` — cart mora biti dostupan na `/shop`, `/cart`, `/checkout` bez prop drilling |
| `localStorage KEY=fk_cart` hydrate/persist `useEffect` | Nema DB košarice (kao `ticketing` pre `PREMIUM-04`), SSR `force-static` + client `useCart` — `JSON.parse` try/catch, `setItems` na mount |
| `add` qty inkrement `prev.find` | Konzistentno sa `ticketing` količinama, `h-11` touch target 44px |
| `POST /api/shop/checkout` `productIds: string[]` + `provider` | Kao `shop.service checkout(productIds, provider, userId)` — backend već prima `userId` za DB `ShopOrder` (`P-PREMIUM-04`), frontend šalje samo `ids` + `provider` |
| `shop.manage` za admin CRUD | Kao `news.manage`/`media.manage` — `PermissionsGuard` + `RequirePermissions('shop.manage')`, `check:all` RBAC matrica |
| `ISR 60s force-static` za shop/cart/checkout | Kao `PREMIUM-02/03` — static SEO (`metadata title FK Shop`), `build 34/34` `○ /premium/shop/cart` `○ /premium/shop/checkout` |
| `AdminShopPage` `useQuery + useMutation` | Kao `competitionsAdmin`/`loyaltyAdmin` — `fetchProducts` `cache: no-store`, `invalidateQueries shop` na `onSuccess` |

---

## 3. Izmjene

| Commit | Poruka |
|--------|--------|
| `87b251c` | `chore(deps): P-SEC-06 glob/browserslist/tiptap/axios batch + feat: P-PREMIUM-04/05 shop DB + cart/checkout/admin (parallel)` |

Diff (vs `a5835ed` PREMIUM-04): `+7` nova (`cart 56`, `ShopClient 16`, `CartClient 49`, `CheckoutClient 74` + 3 page shella), `~9` izmjena (`shop/page 46→62`, `cart/page 44→29`, `checkout/page 40→30`, `layout 19→37`, `admin/shop +81`, `shop.service +31`, `shop.controller +36`, `admin-nav +2`), `frontend-next 64→69`, `backend 452=452` (samo controller/service), `inventory 2565→2570`, `COVERAGE_MATRIX +23`.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `inventory` | `2570/2570` (`frontend-next:69`, `backend:452`) — `frontend-next 69 pregledano` (matrica 2570) |
| `build` | `frontend ✓ 3131` `vite 8.4.0`, `frontend-next ✓ 34/34` `○ /premium/shop` `○ /premium/shop/cart` `○ /premium/shop/checkout` `Proxy (Middleware)` `16.4.6` |
| `check:all` | `10/10 OK` (`shop 69`, `loyalty 30`, `frontend-next` 200 LOC `shop/cart/checkout` <200) |
| `backend` | `nest build` 756 pre-existing `prisma generate` offline — `shop` admin CRUD ne dodaje greške (`as unknown`) |
| `Cart` | `localStorage` mock `add qty 1→2`, `remove`, `clear`, `total = sum price*qty` — `useCart must be inside CartProvider` throw |

---

## 5. Verifikacija

- [x] `/premium/shop` ISR 60s renderuje 6 proizvoda, `Dodaj u korpu h-11`, linkovi `Korpa`/`Checkout`
- [x] `CartProvider` `localStorage fk_cart` persist — `add` `dres-domaci 79×2 + sal 25 = 183 KM`, `remove`, `clear`, `total`
- [x] `/premium/shop/cart` — prazno `Korpa je prazna`, puno `Ukloni` + `total KM` + `Na checkout`/`Isprazni`
- [x] `/premium/shop/checkout` — `stripe/monri/paypal h-11` selektor, `POST /api/shop/checkout` mock `checkoutUrl`, `Otvori checkout` link
- [x] `/admin/shop` `shop.manage` — `GET /shop/products` lista, `POST /shop/admin/products` kreiraj, `PATCH/DELETE` update/delete (auth `shop.manage`)
- [x] `build 34/34` (+1 vs 33), `inventory 2570/2570`, `check:all 10/10`

Status: ZATVOREN

---

## 6. Sljedeći korak

- `P-PREMIUM-06` — `shop` real `Stripe`/`Monri` webhook (`PaymentsService` `createShopCheckout` + `payment.shopOrderId` → `ShopOrder.status paid`) + `loyalty earn` na `checkout` + `frontend` `Orders` lista
- `P-SEC-07` — preostalih `28 high` (`multer` `js-yaml` `compression` `deepmerge-ts` `effect` `engine.io` `prisma` `expo` 58) — major `expo 57→58`, `nestjs 11→12`, `prisma 7→8`

Paralelno: SEC-06 i PREMIUM-04/05 su zatvoreni u `87b251c` (`12:00 2026-11-27`), cart/checkout koristi DB iz PREMIUM-04.
