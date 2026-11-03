# Frontend (web + admin)

> Status: FE-01 zatvoren (design tokeni) · Ažurirano: 2026-11-03

## Stack

React 19 · Vite 8 (`tsc -b && vite build`) · Tailwind 4 · React Router 7 · TanStack Query 5 ·
Zod 4 + react-hook-form · i18next (bs/en) · PWA (manifest + service worker).

## Struktura

```
frontend/src/
  router/app-routes.tsx   — sve rute (public, /prijava, /admin/*, /platforma showcase)
  pages/public/           — javni portal (25 .tsx)
  pages/admin/            — admin dashboard (147 .tsx, 15 sekcija: users, settings, cms,
                            media, news, matches, live, ticketing, membership, analytics, …)
  pages/showcase/         — režim "u izradi" (ShowcasePage + frames/fx/mocks)
  pages/home/             — naslovnica (CMS blokovi)
  components/, hooks/, lib/ (theme.tsx, api…), i18n/, locales/{bs,en}, cms/, types/
```

## Skripte (kompletne — nema drugih)

```bash
npm run dev      # vite
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm run preview
```

## Poznato stanje (iz brzog audita)

| Tema | Stanje |
|------|--------|
| Testovi | ❌ **Nema test runner-a** (bez vitest/playwright/testing-library u package.json); postoji 1 spec fajl (`pages/admin/homes/commentator-desk.spec.ts`) pokretan ručno preko `npx tsx --test` (F-003, F-011) |
| PWA | ✅ `public/manifest.json`, `sw.js`, `offline.html` |
| Dark mode | ✅ `lib/theme.tsx` + CSS varijable |
| i18n | ✅ bs default + en (`src/i18n`, `locales/`) |
| A11y / vizuelni regression / bundle check | ❌ nema automatizacije |
| Tokeni dizajna | ✅ **FE-01**: semantički tokeni u `src/index.css` (`@theme` = jedini izvor boja); provjera `scripts/standards/token-check.mjs` u `check:all` (7/7) |
| `dark:` varijanta | ⚠️ aplikacija je dark-only (`<html class="dark">`, `ThemeProvider`), ali `dark:` klase još prate **OS** postavku (nema `@custom-variant dark`) — P-FE01-7 čeka odobrenje |
| Sirova Tailwind paleta | ⚠️ 417 pojava (`bg-slate-900`, `text-amber-200`…) u 121 fajlu; ratchet baseline u `scripts/standards/baselines/token-palette.txt` (smije samo padati) — migracija ide uz FE-03/FE-04 |

## Design tokeni (FE-01)

**Jedan izvor istine:** `frontend/src/index.css`.

- `@theme` — svi `--color-*`, `--font-*`, `--text-*` tokeni → Tailwind generiše
  utility klase (`bg-surface`, `text-text-muted`, `border-subtle`-tokeni, `bg-stripe`…).
  `:root` **ne redefiniše boje** (izuzetak: `--color-*-rgb` companions).
- `:root` — runtime tokeni koji nisu utility klase: gradijenti (`--gradient-*`,
  `--hero-*`), `--border-subtle`, `--ring-focus`, `--glass-bg`, `--shadow-premium`,
  `--color-primary-rgb` / `--color-brand-rgb` (za `rgba(var(--…-rgb), a)`).
- Paleta: `--color-primary #1e3a8a`, `--color-primary-light/--color-accent #60a5fa`,
  `--color-brand #0066ff`, površine (`background`, `surface`, `surface-deep/-night/-story/-mock/-chrome`,
  `wood-dark`, `frame-light`), stanja (`success`, `danger`), vendor (`stripe`, `paypal`, `monri` + `-hover`).

**Pravila (provjerava `token-check`, `check:all`):**

1. `var(--x)` mora biti definisan u `index.css` (`undefined-var`).
2. Nema proizvoljnih boja u klasama: `bg-[#123456]`, `text-[#abc]` (`hex-utility`).
3. Nema golog `#hex` u kodu/CSS-u — osim fallbacka `var(--token, #hex)`, maski i
   **allowliste** (`hex-literal`): print/PDF i QR dokumenti (`lib/*-document.ts`,
   `pass-print.ts`, `pass-qr.ts`, `MembershipQrCode`), vendor brand boje,
   `pages/showcase/**` (mock ekrani).
4. Boje samo u `@theme`, ne u `:root` (`theme-source`).
5. Broj sirovih palette klasa ≤ baseline (`palette-ratchet`; baseline samo pada).
6. `dark:` klase traže `@custom-variant dark` (`dark-variant`, upozorenje).

## Poznata pravila

- Ne dirati showcase intercept (mobile `_layout.tsx` — vidi MOBILE.md).
- Admin rute idu kroz `ProtectedRoute`; dva login toka: `/prijava` i `/admin/login`.
