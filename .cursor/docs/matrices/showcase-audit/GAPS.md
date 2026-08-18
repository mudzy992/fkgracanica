# Gaps → put ka 100%

Redoslijed za kasnije trackove. Ne radi PayPal/Monri/PWA/Excel/newsletter blast u ovoj traci.

## P0 — bug / higijena (brzo) — DONE 2026-08-17

| # | Stavka | Sad | Meta | Zašto |
|---|--------|-----|------|-------|
| 1 | `moderation.tsx` reject≠archive | ~75 | ~75 | Reject=`DRAFT`, archive=`ARCHIVED` |
| 2 | `gallery/[slug].tsx` native pager | ~82 | ~82 | Original swipe + download/share |
| 3 | `staff/index.tsx` t() | ~80 | ~80 | `noStaffAccess` |
| 4 | `validate.tsx` i18n+try | ~72 | ~72 | Parsed card + try/catch |

## P1 — public polish (queue 29) — 5–11 DONE 2026-08-17

| # | Ekran | Sad | Meta | Korak |
|---|-------|-----|------|-------|
| 5 | heritage | ~85 | 85 | Per-tab UX (tiers, featured, chapters) |
| 6 | news + detail | ~82–83 | 85 | Share `/vijesti/{slug}` + photo pager |
| 7 | gallery lista | ~84 | 84 | Bento + stack header |
| 8 | search | ~78 | 80 | Debounce + SectionList |
| 9 | pages + [slug] | ~68–70 | 75 | Excerpt; hero + HTML |
| 10 | live/index | ~83 | 83 | Socket.IO `match:join` (nema poll) |
| 11 | membership/tickets UI | ~82–85 | 88 | Kartica / tear-line |

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
`paypal` = ready (2026-08-17).  
`monri` = ready (2026-08-17).  
`financial-export` = ready (2026-08-17).  
`pwa` = ready (2026-08-17).  
`video-highlights` = ready (2026-08-17).  
`newsletter-campaigns` = ready (2026-08-17).  
`seasonal-tickets` = ready (2026-08-17).  
`play-store` = after_launch.

## Upisano u katalog

`catalog-modules.ts` = kolona pred. (2026-08-15).  
**2026-08-17:** web 100% (32); after_launch 1–8 (33). Mobile Track 34 P0+P1 public. Leftover: login/buy/contact/browse; P2 staff.
