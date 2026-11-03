# Frontend (web + admin)

> Status: FE-01 (tokeni) + FE-02 (test infra) zatvoreni · Ažurirano: 2026-11-03

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
npm run dev         # vite
npm run build       # tsc -b && vite build
npm run lint        # oxlint
npm run preview
npm run test        # vitest run (FE-02; 9 fajla / 34 testa)
npm run test:watch  # vitest watch
```

## Poznato stanje (iz brzog audita)

| Tema | Stanje |
|------|--------|
| Testovi | ✅ **FE-02**: vitest + jsdom + @testing-library/react; 9 fajla / 34 testa; CI korak `frontend test (vitest)`; stari `node:test` spec migriran (F-003/F-011 zatvoreni) |
| PWA | ✅ `public/manifest.json`, `sw.js`, `offline.html` |
| Dark mode | ✅ `lib/theme.tsx` + CSS varijable |
| i18n | ✅ bs default + en (`src/i18n`, `locales/`) |
| A11y / vizuelni regression / bundle check | ❌ nema automatizacije |
| Tokeni dizajna | ✅ **FE-01**: semantički tokeni u `src/index.css` (`@theme` = jedini izvor boja); provjera `scripts/standards/token-check.mjs` u `check:all` (7/7) |
| `dark:` varijanta | ✅ **P-FE01-7**: `@custom-variant dark (&:where(.dark, .dark *))` — `dark:` prati app temu (`<html class="dark">`), ne OS postavku; `token-check` to sada **traži** |
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

## HTML iz CMS-a i vijesti (FE-03 / P-FE03-1)

Sav HTML se renderuje **samo** kroz `RichContent`, koji prvo poziva
`sanitizeHtml()` (`src/lib/sanitize-html.ts`, DOMPurify + allowlista):
`script/style/form/input/object/embed/link` su zabranjeni, `on*` atributi uklonjeni,
`javascript:`/`data:text/html` linkovi odbijeni, `iframe` dozvoljen samo sa
YouTube/Vimeo domena, `target="_blank"` dobija `rel="noopener noreferrer"`.
**Nikad ne koristi `dangerouslySetInnerHTML` van `RichContent`** — za to postoji
`token-check`-susjedno pravilo u reviziji (vidi `AUDIT/segments/FE-03.md`).

## Formatiranje

`.prettierrc.json`: `singleQuote: true`, `printWidth: 100`. Bez ovog fajla je
`npx prettier` pravio style churn (double quotes) — ne mijenjati postavke bez
dogovora.

## i18n (FE-03b)

- Javne stranice (`pages/public/**`) i home sekcije (`pages/home/**`) **nemaju**
  hardkodiran tekst — sve ide kroz `t('pages.<sekcija>.<ključ')`; ključevi žive u
  `src/locales/{bs,en}/common.json` (`pages.*` namespace).
- Testovi koji to čuvaju: `src/i18n/i18n-keys.test.ts` (bs↔en parity + svaki `t()` ključ
  postoji) i `src/i18n/no-hardcoded-text.test.ts` (nema literala u JSX-u/propsima).
- Novi tekst: prvo ključ u **oba** locale fajla, pa `t()` u komponenti — testovi padaju
  ako jedno od toga izostane.
- Ostaje: `components/**` i `cms/**` (~261 string, dijele ih javni portal i admin) —
  migracija uz FE-04.

## Poznata pravila

- Ne dirati showcase intercept (mobile `_layout.tsx` — vidi MOBILE.md).
- Admin rute idu kroz `ProtectedRoute`; dva login toka: `/prijava` i `/admin/login`.
