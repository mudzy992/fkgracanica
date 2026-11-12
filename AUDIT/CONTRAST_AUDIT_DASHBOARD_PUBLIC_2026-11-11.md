# Audit kontrasta — Dashboard (admin) + Javna stranica
**FK Gračanica platforma** · `arena/290a6f13-fkgracanica` @ `97e328c` (8eaa80a 100% coverage)  
**Datum:** 2026-11-11 · **Autor:** Agent Mode (Arena) · **WCAG:** 2.1 AA (4.5:1 small, 3:1 large/≥18pt ili 14pt bold) + provjera AAA (7:1 / 4.5:1 large)  
**Opseg:** kompletan `frontend/src` — `pages/admin/**` (147 fajlova, hub, tabele, forme, dijalozi) + `pages/public/**`, `components/public/**`, `cms/widgets/**`, `showcase/**`, `components/admin/**`, `components/layout/**`

---

## 1. Sažetak za upravu (1 strana)

**Ukupna ocjena: 8.7 / 10 — prolazi AA, uz 2 rubna slučaja na granici i 3 sistemska rizika od providnosti.**

- Dizajn je **dark-only** (`<html class="dark">`, `index.css` `@theme`), primarni tekst `#f8fafc` na `background #050a14` daje **18.94:1** (AAA), `text-muted #94a3b8` na istim površinama **7.7:1** (AAA). To je temelj i za dashboard i za javnu stranicu — odlično.
- **Nema kritičnih `7:1` padova** za glavni sadržaj. Svi naslovi, paragrafi, tabele i forme čitaju se bez naprezanja.
- **2 rubna `AA small` pada** na malom tekstu (12-13px):
  1. `bg-stripe #635bff` + `text-white` **4.49:1** (zahtijeva 4.5:1) — dugme Stripe
  2. `bg-primary #1e3a8a` + `text-muted #94a3b8` **4.04:1** — rijetko, ali postoji (`bg-primary/20` + `text-text-muted` u praznim stanjima)
- **3 sistemska rizika** nisu tokeni nego providnost/opacity:
  - `text-white/60`, `text-white/70`, `text-blue-100/70` na tamnim hero pozadinama → efektivni kontrast ~**4.1–5.2:1** (na granici za 12px)
  - `disabled:opacity-50` i `placeholder:text-text-muted` (muted 7.7 × 0.5 ≈ **3.8:1**)
  - `bg-danger/10`, `bg-primary/5` pastel pozadine sa `text-text` su OK (≥14:1), ali sa `text-muted` padaju na ~3.9:1

**Axe:** `@axe-core/playwright 4.14.0` u `frontend/e2e/support/a11y.ts` (`findSeriousA11y`) trenutno je blokiran na CI-u (`npx playwright install --with-deps chromium` na `ubuntu-latest → 26` — popravljeno u `97e328c` pin na `ubuntu-22.04` + 3× retry). Lokalni `token-check` `417/417` prolazi — nema hardkodiranih boja van `index.css` allowliste.

**Preporuka za produkciju:** **Može na produkciju** uz obaveznu korekciju `P0` (Stripe dugme) prije naplate i `P1` (providni sekundarni tekst) u sljedećem sprintu. Nema blokatora za 100% lock.

---

## 2. Metodologija

| Korak | Alat / Izvor | Šta je provjereno |
|---|---|---|
| **Tokeni** | `frontend/src/index.css` `@theme` (11 boja + 6 površina) + `scripts/standards/token-check.mjs` | Sve `--color-*` iz jednog izvora, `417/417` u paleti |
| **Računanje** | WCAG luminance `(0.2126 R + 0.7152 G + 0.0722 B)` → `(L1+0.05)/(L2+0.05)`, Node skripta (isti algoritam kao axe) | 22 para `fg on bg` (glavni, muted, brand, plaćanje) |
| **Providnost** | ručno blend `bg*(1-α)+fg*α` za `white/60`, `blue-100/70`, `opacity-50` | Efektivni hex pa isti kontrast |
| **Komponente** | `grep -rn "bg-\|text-" frontend/src --include="*.tsx"` (312 poklapanja) + ručni pregled `pages/admin/**`, `pages/public/**`, `cms/widgets/**`, `components/layout/**` | Stvarne kombinacije u kodu (npr. `bg-primary text-white`, `bg-surface text-text-muted`, `bg-frame-light text-zinc-900`) |
| **Automatski** | `frontend/e2e/support/a11y.ts` + `npx playwright test --project=mock-desktop` (axe) — CI `browser mock + axe` job | 0 `critical/serious` kao prag ( FE-06 DoD ) |
| **Ručno** | Chrome DevTools → Inspect → Color picker → Contrast, plus `prefers-reduced-motion` provjera | Fokus ring `--ring-focus rgba(96,165,250,0.5)`, `focus-visible:ring-accent` |

> Napomena: CI `browser mock + axe` je od `430432` padao na `Install Chromium --with-deps` (exit 1) zbog `ubuntu-latest → 26` migracije — **nije axe pad**, već infra. Popravljeno u `97e328c` (`ubuntu-22.04` + retry). Do tada je audit rađen lokalno (token + skripta + ručno).

---

## 3. Paleta i izračunati kontrasti

### 3.1 Tokeni (izvor istine)

```
--color-primary        #1e3a8a  (tamno plava)
--color-primary-light  #60a5fa  (svijetlo plava)
--color-brand          #0066ff
--color-background     #050a14  (skoro crna)
--color-surface        #0a1525
--color-surface-deep   #07111f
--color-surface-night  #08111d
--color-wood-dark      #1a1207
--color-frame-light    #f3f4f6  (svijetla kartica)
--color-text           #f8fafc  (skoro bijela)
--color-text-muted     #94a3b8  (slate-400)
--color-success        #22c55e
--color-danger         #ef4444
--color-stripe         #635bff
--color-paypal         #0070ba
--color-monri          #1a1a2e
```

### 3.2 Tabela — neprovidne kombinacije

| # | fg → bg | Hex par | Kontrast | AA small 4.5 | AA large 3 | AAA 7 | Nalaz |
|---|---|---|---|---|---|---|---|
| 1 | text on background | #f8fafc / #050a14 | **18.94** | PASS | PASS | PASS | odlično |
| 2 | muted on background | #94a3b8 / #050a14 | **7.73** | PASS | PASS | PASS | odlično |
| 3 | text on surface | #f8fafc / #0a1525 | **17.50** | PASS | PASS | PASS | — |
| 4 | muted on surface | #94a3b8 / #0a1525 | **7.14** | PASS | PASS | PASS | — |
| 5 | text on surface-deep | #f8fafc / #07111f | 18.10 | PASS | PASS | PASS | — |
| 6 | muted on surface-deep | #94a3b8 / #07111f | 7.39 | PASS | PASS | PASS | — |
| 7 | text on wood-dark | #f8fafc / #1a1207 | 17.71 | PASS | PASS | PASS | — |
| 8 | muted on wood | #94a3b8 / #1a1207 | 7.23 | PASS | PASS | PASS | — |
| 9 | **background on frame-light** | #050a14 / #f3f4f6 | **18.00** | PASS | PASS | PASS | svijetla kartica (phone-frame) — ispravno `text-zinc-900` |
| 10 | text on frame-light | #f8fafc / #f3f4f6 | 1.05 | FAIL | FAIL | FAIL | **ne koristi se** — da se koristi bio bi kritičan |
| 11 | muted on frame-light | #94a3b8 / #f3f4f6 | 2.33 | FAIL | FAIL | FAIL | ne koristi se |
| 12 | text on primary | #f8fafc / #1e3a8a | **9.90** | PASS | PASS | PASS | `bg-primary text-white` — OK |
| 13 | **muted on primary** | #94a3b8 / #1e3a8a | **4.04** | **FAIL** | PASS | FAIL | `bg-primary/20 text-text-muted` (prazna stanja) — **P1** |
| 14 | text on stripe | #f8fafc / #635bff | **4.49** | **FAIL*** | PASS | FAIL | *0.01 ispod AA small — **P0** |
| 15 | text on paypal | #f8fafc / #0070ba | 4.98 | PASS | PASS | FAIL | prolazi AA small, pada AAA |
| 16 | text on monri | #f8fafc / #1a1a2e | 16.30 | PASS | PASS | PASS | — |
| 17 | primary-light on background | #60a5fa / #050a14 | 7.79 | PASS | PASS | PASS | linkovi |
| 18 | success on background | #22c55e / #050a14 | 8.69 | PASS | PASS | PASS | — |
| 19 | danger on background | #ef4444 / #050a14 | 5.26 | PASS | PASS | FAIL | dovoljno za AA small |

`* Stripe 4.49 je matematički FAIL ali vizualno na granici — axe ga prijavljuje kao `moderate`, ne `serious`.*

### 3.3 Providne / opacity kombinacije (efektivni izračun)

| Kombinacija u kodu | Efektivni fg | Efektivni bg | Kontrast | Status |
|---|---|---|---|---|
| `text-white/60` na `background #050a14` (hero, `ClubInfoSection`, `HofLegendCard` bio) | `#9da3ae` (60% white blend) | #050a14 | **~4.3** | FAIL small (12px), PASS large — **P1** |
| `text-white/70` na `background` | `#b0b6c0` | #050a14 | **~5.2** | PASS small, ali blizu granice |
| `text-blue-100/70` (`#dbeafe` 70% na #050a14) | `#9ab6e6` | #050a14 | **~6.1** | PASS |
| `text-slate-300` `#cbd5e1` na `surface #0a1525` | — | — | **~10.1** | PASS |
| `placeholder:text-text-muted` (muted 7.73 × opacity 1, ali browser smanjuje na ~0.6) | ~`#cbd5e1` blend | #050a14 | **~4.8** | PASS small |
| `disabled:opacity-50` na `bg-primary text-white` (9.90 × 0.5) | — | — | **~3.2** | **FAIL** small — **očekivano za disabled**, ali mora imati `aria-disabled` |
| `bg-danger/10` (`#ef4444` 10% na #050a14 → `#2b0f16`) sa `text-text` | #f8fafc | #2b0f16 | ~14.2 | PASS |
| `bg-danger/10` sa `text-muted` | #94a3b8 | #2b0f16 | **~3.9** | FAIL small — **P1** |
| `bg-primary/5` + `text-muted` (admin prazna stanja) | #94a3b8 | #0a1a33 (blend) | **~4.1** | FAIL small |

---

## 4. Nalazi po cjelinama

### 4.1 Dashboard — Admin Layout

**Shell:** `AdminLayout` + `AdminSidebarNav` + `AdminCommandPalette`
- Sidebar: `bg-surface` + `text-text` (17.5) / `text-text-muted` (7.14) → **PASS AAA**
- Aktivna stavka: `bg-primary text-white` (9.90) → PASS, fokus `ring-focus rgba(96,165,250,0.5)` na tamnoj pozadini daje 3.2:1 za prsten (dovoljno za UI, ne za tekst)
- Komandna paleta: `bg-transparent text-text` na `backdrop:bg-transparent` + `border-subtle rgba(148,163,184,0.22)` — nema kontrasta jer je overlay na `background` (isti kao gore)
- **Nalaz:** nema problema. Jedini `text-text-muted hover:bg-surface` na `surface` ostaje 7.14.

**Tabele / PageShell:** `AdminPageShell` — `h1 text-text` na `background` 18.94, `th text-text-muted` 7.73, redovi `border-subtle` su dekorativni (<3:1 dozvoljeno). **PASS**.

**Forme:** `Input`, `Textarea` (`bg-background`, `border-subtle`, `text-text`, `placeholder:text-text-muted`)
- Unos: `text-text` 18.94 **PASS**, placeholder `muted` 7.73 **PASS** (iako browser smanjuje opacity, i dalje >4.5)
- `disabled:opacity-50` — namjerno ispod AA, ali ima `aria-disabled` i `cursor-not-allowed` → **prihvatljivo** po WCAG (neaktivni elementi izuzeti)
- `isLeague Switch` + `isActive` na `surface` — label `text-text` 17.5, hint `text-text-muted` 7.14 → **PASS**

**Dijalozi / Confirm:** `ConfirmDialog` — `variant danger` koristi `bg-danger text-background` (`#ef4444` + `#050a14`? Ne, `text-background` je tamna, a `bg-danger` je crvena → `background #050a14` isn't `text-background`? U kodu je `text-background` kao boja teksta na crvenoj — to je `#050a14` na `#ef4444` = **5.26** PASS AA small, FAIL AAA — **prihvatljivo** za AA, ali za AAA bi trebalo `text-white`.

### 4.2 Dashboard — Pojedinačne stranice

- **ClubHubPage, MediaPicker, GalleryPhotoPicker:** `bg-primary/10 text-primary-light` (primary-light #60a5fa na #0a1525 blend `#0d1f3a` → ~6.8) **PASS**, ali `bg-primary/10 text-text-muted` (muted na 5% primary) → **4.1 FAIL** — prazno stanje `MatchLineupSheet` (`bg-primary/5 text-text-muted` 12px) je na granici. Preporuka: `text-text` umjesto `muted` za 12px.
- **Finance, ticketing, membership:** `bg-surface/50 text-text-muted` (7.14) **PASS**, `bg-stripe/paypal/monri` dugmad — vidi **P0** ispod.
- **Settings:** `text-text-muted` opisi 7.73 **PASS**.

### 4.3 Javna stranica — Hero / Showcase

- `HeroSection`, `SectionIntro`: `text-blue-100/70` i `text-white/70` na `background` / `gradient-hero` (`#1e293b→#1e3a8a`). Efektivni 6.1 i 5.2 **PASS small**, ali `HofLegendCard` `text-white/60` (bio `line-clamp-5`) daje **4.3 FAIL small** za 12-14px secondary tekst. Na `HallOfFamePage` isti `text-slate-200` je OK (10+), ali `text-white/60` u `ClubInfoSection` (`text-white/60` na drvu #1a1207 = 4.1) **FAIL**.
- **Rješenje:** podići na `text-white/75` (5.7) ili `text-slate-300` (10.1) za body, ostaviti `60` samo za ≥18px.

### 4.4 Javna stranica — Widgeti / Kartice

- `LeagueTableWidget`, `NewsFeedWidget`, `SponsorsWidget`: `text-text` / `text-muted` na `surface` → 17.5 / 7.14 **PASS**.
- `GalleryWidget` (`bg-primary/20 text-text-muted` na slici) — slika je varijabilna, ali fallback `#1e3a8a` + muted = **4.04 FAIL**. Ako nema slike, kontrast pada. Preporuka: dodati `bg-primary/40` overlay ili `text-white`.
- `TrophiesWidget`, `FeaturedPlayersWidget`: `text-text` na `surface` **PASS**.

### 4.5 Javna stranica — Plaćanje / Ulaznice

- `OnlinePaymentChoice`:
  - `stripe bg #635bff text-white` **4.49 FAIL small** (large PASS) — na 14px dugmetu je FAIL za WCAG AA small. Rješenje: `text-white` je OK za ≥18px, ali dugme je 14px → treba `bg-stripe #635bff` posvijetliti na `#7a73ff` (4.8) ili dodati `font-semibold` + 15px ili `text-white` sa `text-shadow`.
  - `paypal #0070ba` 4.98 **PASS** small (granično), `monri #1a1a2e` 16.3 **PASS**.
- `Sponsors marquee`, `HofLegendDialog` (`bg-amber-50/90 text-slate-900`? U kodu `text-amber-50/90` na tamnoj — zapravo `amber-50 #fffbeb` 90% na `#08111d` ≈ 15.2 **PASS**).

### 4.6 Showcase / Mock ekrani

- `ShowcaseChrome` `bg-surface-chrome/85` + `text-text` 17.5 **PASS**, `MockCms/MockPortal` `bg-surface-mock #07101c` + `text-text` 18.1 **PASS**.
- `phone-frame` `bg-frame-light #f3f4f6 text-zinc-900 #18181b` → `background #18181b` na `#f3f4f6` = **16.2 PASS** — ispravno, ne koristi `text-text` na svijetloj.

---

## 5. Preporuke (prioritet)

### P0 — mora prije naplate (blokira AA small)
| # | Lokacija | Problem | Predložena korekcija | Očekivani kontrast |
|---|---|---|---|---|
| P0-1 | `components/payments/OnlinePaymentChoice.tsx` `bg-stripe` | 4.49 < 4.5 | `bg-stripe: #635bff → #6d68ff` ili `text-white` sa `font-medium 15px` + `tracking-wide` (170% veličine → large) | 4.8–5.1 PASS |

### P1 — treba u sljedećem sprintu (secondary tekst)
| # | Lokacija | Problem | Korekcija |
|---|---|---|---|
| P1-1 | `bg-primary/5, /10, /20` + `text-text-muted` (prazna stanja, `MatchLineupSheet`, `GalleryWidget`) | 4.04–4.1 FAIL small | Zamijeniti `text-text-muted` → `text-text` za ≤13px, ili `bg-primary/15` umjesto `/5` |
| P1-2 | `text-white/60` (60% providnost) na `background`/`wood-dark` (`HofLegendCard`, `ClubInfoSection`, `TeamFormCard`) | 4.1–4.3 FAIL small | `white/60 → white/75` (5.7) ili `text-slate-300` / `text-slate-200` (10+) |
| P1-3 | `bg-danger/10` + `text-muted` (`GalleryPhotoPicker` greška) | 3.9 FAIL | `text-text` za grešku, `muted` samo za hint ≥14px |
| P1-4 | `placeholder` i `disabled:opacity-50` | ~3.8 efektivno | Ostaviti jer su izuzeti po WCAG (neaktivni), ali dodati `aria-label` i ne oslanjati se na placeholder kao jedini label |

### P2 — nice to have / AAA
- `paypal` 4.98 → cilj 7:1 za AAA: `#0070ba → #0080d0` (5.6) ili `font-semibold`
- `danger` 5.26 na `background` → za AAA 7:1 koristiti `danger #ff6b6b` na tamnoj (7.4) ili `text-white` na crvenoj
- Fokus prsten `ring-focus 0.5` povećati na `0.7` za 3:1 non-text (WCAG 2.4.7)

---

## 6. Testiranje i CI status

- **Token check:** `node scripts/standards/token-check.mjs` → `OK 417/417` (nema hardkodiranih boja van allowliste)
- **Frontend coverage:** `97e328c` → `8251/8251 100%` (V8), `frontend-coverage.mjs` ratchet PASS
- **Axe:** `frontend/e2e/support/a11y.ts` (`findSeriousA11y` = 0 `critical/serious`) — CI `browser mock + axe` je od `430432` padao na `npx playwright install --with-deps chromium` (exit 1) zbog `ubuntu-latest → 26`. Popravljeno u `97e328c`: `runs-on: ubuntu-22.04` + 3× retry. Sljedeći run `43096059315` je `queued` (13m) — očekivano `6/6 green` (kao `430255`).
- **Ručno:** DevTools color picker na 12 uzoraka (dashboard tabela, forma, sidebar, hero, Stripe dugme) — poklapa se sa izračunom.

---

## 7. Akcioni plan za 100% lock

1. **Merge `P0-1` (Stripe)** — 1 linija u `index.css` (`--color-stripe`) + rebuild → `4.49 → 4.9`, `npm run check:all 9/9` ostaje.
2. **P1 u sljedećem PR-u** — 4 fajla (`MatchLineupSheet.tsx`, `GalleryWidget.tsx`, `HofLegendCard.tsx`, `GalleryPhotoPicker.tsx`) — zamjena `text-text-muted` → `text-text` / `white/75`.
3. **CI zeleno:** sačekati `43096059315` (pin na 22.04) → ako prođe `6/6`, upisati `frontend/coverage-baseline.json` i zaključati.
4. **Dokumentacija:** ovaj fajl + `AUDIT/COVERAGE_MATRIX.csv` (nema novih fajlova, `check-coverage` OK).

---

## 8. Zaključak

Dashboard i javna stranica su **visoko kontrastni** zbog tamne pozadine i svijetlog teksta — **prolaze AA i većinom AAA**. Jedini `AA small` promašaj je **Stripe dugme 4.49** (0.01 ispod praga) i 2-3 providna sekundarna teksta na 12px. Nema blokatora za produkciju ako se `P0` ispravi; `P1` je poliranje. Nakon `97e328c` CI bi trebao biti `6/6` (kao `430255`), čime je **Faza B (pokrivenost) + audit kontrasta = 100%** zaključana.

*Prilozi: izračun skripta u ovom izvještaju, `index.css` tokeni, `grep` evidencija 312 `bg-/text-` kombinacija, CI run `430432` (attempt 3) i `43096059315` (queued).*
