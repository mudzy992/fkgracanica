# Gaps → put ka 100%

Redoslijed za kasnije trackove. Ne radi PayPal/Monri/PWA/Excel/newsletter blast u ovoj traci.

## P0 — bug / higijena (brzo)

| # | Stavka | Sad | Meta | Zašto |
|---|--------|-----|------|-------|
| 1 | `moderation.tsx` reject=archive | 65 | ~75 | Oba dugmeta šalju `ARCHIVED` |
| 2 | `gallery/[slug].tsx` i18n+retry | 41 | ~55 | Hardcoded BS, nema error |
| 3 | `staff/index.tsx` t() | 74 | ~80 | 3 labele BS |
| 4 | `validate.tsx` i18n+try | 58 | ~72 | Nula prijevoda, raw JSON |

## P1 — public polish (queue 29)

| # | Ekran | Sad | Meta | Korak |
|---|-------|-----|------|-------|
| 5 | heritage | 42 | 85 | Tabovi + slike (5 web stranica) |
| 6 | news + detail | 61 | 85 | Featured, kategorije, HTML |
| 7 | gallery lista | 58 | 80 | Bento 2-col |
| 8 | search | 61 | 80 | Debounce + grupisanje |
| 9 | pages/[slug] | 50 | 75 | Hero + HTML widget |
| 10 | live/index | 68 | 82 | Crest + live update |
| 11 | membership/tickets UI | 76–77 | 88 | Kartica/ulaznica vizual |

## P2 — staff ops

| # | Ekran | Sad | Meta | Korak |
|---|-------|-----|------|-------|
| 12 | dashboard | 60 | 80 | Skeleton, KPI kartice |
| 13 | gallery-manage | 62 | 78 | Edit/delete |
| 14 | orders | 62 | 78 | Status/refund |
| 15 | EntityList image | 67–69 | 78 | Logo/photo u thin CRUD |

## P3 — web moduli (showcase ring)

| # | Modul | Sad→pred. | Korak |
|---|-------|-----------|-------|
| 16 | analytics | 60→42 | Ili spusti katalog, ili H2H+page |
| 17 | seo | 80→74 | Edge OG ili ostavi SPA napomenu |
| 18 | i18n-en | 30→28 | EN string pass (veliki) |
| 19 | ticketing | 85→82 | Stripe na mobile buy |

## Namjerno van 100% sada

`cms-builder`, `formation-dnd`, `media-tree` = web_only.  
`paypal`, `monri`, `newsletter-campaigns`, `financial-export`, `pwa`, `seasonal-tickets`, `video-highlights`, `play-store` = after_launch.

## Upisano u katalog

`catalog-modules.ts` = kolona pred. (2026-08-15). Sljedeća sesija: backend → frontend → mobile. After_launch van opsega.
