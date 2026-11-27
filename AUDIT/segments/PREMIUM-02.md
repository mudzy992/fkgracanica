# Segment PREMIUM-02 — Premium loyalty + shop (P-PREMIUM-02)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-PREMIUM-02 |
| **Veličina** | S (3 fajla, 203 LOC) |
| **Rizik** | Low — static ISR, nema API mutacije |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `2a5ae62` → `PREMIUM-02` |
| **CI** | `inventory 2557/2557`, `build 32 rute`, `check:all 10/10` |

---

## 1. Opseg

P-PREMIUM-02 — drugi premium modul, paralelan sa `P-SEC-04` (korisnik `parallel`).

**Fajlovi:**

| Fajl | LOC | Opis |
|------|-----|------|
| `frontend-next/app/premium/page.tsx` | 56 | Update `P-PREMIUM-01` 56 → `P-PREMIUM-02` — Loyalty i Shop Card sada `Link → /premium/loyalty|/shop` `h-11` 44px, `hover:border-primary/40`, `Otvori →`. Donacije ostaje `Uskoro`. |
| `frontend-next/app/premium/loyalty/page.tsx` | 77 | `revalidate 60 force-static` `Loyalty` — `TIERS` Bronza 0/Srebro 500/Zlato 1500, `points 870` → Srebro, progress `((points-min)/(next-min))*100`, bar `bg-primary`, 3 tier Carda, CTA `U shop` + `Nazad` `h-11`. |
| `frontend-next/app/premium/shop/page.tsx` | 70 | `revalidate 60 force-static` `Shop` — `PRODUCTS` 6 (dres domaći/gostujući, šal, kapa, šalica, privjesak) `price KM`, `tag Hit/Novo/Top`, grid `sm:2 lg:3`, `h-28` placeholder `bg-surface-deep`, `Dodaj u korpu — uskoro` `h-11` `w-full`. |

Nema backend mutacije; `PRODUCTS` i `TIERS` su hardcode ISR — korpa/checkout + `shop` API dolaze u `PREMIUM-03`.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| Static ISR 60s, bez `GET /shop`/`/loyalty` | `backend` nema `shop`/`loyalty` module još — S mora biti mali i ne lomiti API ugovor; hardcode je dovoljan za premium preview (kao `PREMIUM-01`) |
| `Link` umjesto `span` za Loyalty/Shop | Konzistentno sa `vijesti`/`galerija` `next/link`, 44px touch, `token-check 327/327` ostaje |
| `h-11` CTA umjesto `px-4 py-2` | Premium 44px touch target kao `DASH-01` |
| Paralelno sa SEC-04 | Korisnik `parallel` — SEC-04 (`@testing-library/dom` fix) i PREMIUM-02 su nezavisni, oba S |

---

## 3. Izmjene

| Commit | Poruka |
|--------|--------|
| `P-PREMIUM-02` | `feat(frontend-next): P-PREMIUM-02 loyalty + shop` |

Diff: `+2` fajla, `~1` update, `frontend-next 60→62`, `PREMIUM-02` 3 reda.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `inventory` | `2557/2555→2557/2557` (`frontend-next:62`) |
| `build` | `✓ 32/32` `○ /premium 0 B 119kB` `○ /premium/loyalty 0 B 119kB` `○ /premium/shop 0 B 119kB` `shared 123kB` `vite 8.4.0` |
| `check:all` | `10/10 OK` (`loyalty 77 <200`, `shop 70 <200`, `premium 56 <200`) |

---

## 5. Verifikacija

- [x] `/premium` renderuje 2 Link Carda → loyalty/shop, 1 Uskoro
- [x] `/premium/loyalty` ISR 60s tier progress 870 → Srebro 74%? (870-500)/(1500-500)=37% — bar 37%, 3 tiera
- [x] `/premium/shop` ISR 60s 6 proizvoda grid, `Dodaj u korpu` disabled
- [x] `build 32/32` (+2), `inventory 2557/2557` `check:all 10/10`

Status: ZATVOREN

---

## 6. Sljedeći korak

- `P-PREMIUM-03` — `shop` korpa + `checkout` (Stripe/Monri) + `loyalty` API (`GET /loyalty/points`)
- `P-SEC-05` — `next 16.4.6 + sharp 0.35.5 + zod 4.6.6` batch (nakon `tsc` migracije)

Paralelno: SEC-04 i PREMIUM-02 su zatvoreni isti dan.
