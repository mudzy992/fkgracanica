# Frontend (web + admin)

> Status: inicijalna verzija (FAZA 0/1) — FE segmenti tek slijede · Ažurirano: 2026-11-02

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
| Tokeni dizajna | ⚠️ postoji `aplikacijski-plan.md` tabela boja (pensionisana) — treba CONFIRM u FE segmentu da li su uvedeni semantički tokeni; skripta za hardkodirane boje ne postoji |

## Poznata pravila

- Ne dirati showcase intercept (mobile `_layout.tsx` — vidi MOBILE.md).
- Admin rute idu kroz `ProtectedRoute`; dva login toka: `/prijava` i `/admin/login`.
