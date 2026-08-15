# Showcase modules — audit % (upisano u katalog 2026-08-15)

Izvor: code review. Kolona **pred.** = `catalog-modules.ts`.

| id | kat. | **pred.** | badge | Zašto ne 100 | Evidence |
|----|------|-----------|-------|--------------|----------|
| public-portal | 95 | **92** | ready | EN copy; CMS edge | `frontend/src/pages/home` |
| news | 95 | **92** | ready | Web OK; mobile 61 | NewsList/NewsDetail |
| gallery | 90 | **90** | ready | Web bento+lightbox | GalleryListBento |
| timeline | 90 | **90** | ready | Mobile heritage dump | ClubTimelinePage |
| team | 95 | **92** | ready | Web+mobile cinematic | FirstTeamPage, team.tsx |
| league | 90 | **90** | ready | Round filter web-only | LeaguePage |
| live | 90 | **88** | ready | Mobile lista bez socket | LiveMatchPage |
| heritage | 90 | **88** | ready | Mobile 42 | Trophies/HoF/Museum |
| sponsors | 95 | **92** | ready | EN | SponsorsPage |
| cms | 90 | **88** | ready | Mobile pages text-only | CmsPageBuilder |
| media | 90 | **88** | ready | Mobile upload jednostavan | MediaPage |
| rbac | 95 | **92** | ready | Mobile roles bez create | UsersRolesPage |
| dashboard | 95 | **90** | ready | Mobile dashboard 60 | DashboardPage |
| audit | 95 | **90** | ready | Mobile limit 50 | AuditPage |
| contact | 95 | **92** | ready | Mobile bez mape | ContactPage |
| membership | 90 | **88** | ready | Mobile kartica plain | MembershipPage |
| ticketing | 85 | **82** | ready | Buy = box_office; Stripe web | TicketsPage |
| notifications | 95 | **90** | ready | Mobile bez deep link | NotificationsPage |
| seo | 80 | **74** | ready | Sitemap/robots OK; OG SPA-only | `seo.service.ts`, Seo.tsx |
| mobile-staff | 82 | **70** | in_progress | Prosjek 24 staff ekrana | SCREENS-STAFF.md |
| mobile-polish | 55 | **69** | in_progress | Prosjek 23 public ekrana | SCREENS.md |
| email | 70 | **68** | in_progress | Nodemailer; klub mora SMTP | `jobs.module.ts` |
| push | 75 | **72** | in_progress | Expo token postoji | `mobile/src/lib/push.ts` |
| newsletter | 80 | **78** | in_progress | Subscribe OK; blast = after | subscribe API |
| analytics | 60 | **42** | in_progress | **Nema H2H, nema admin page** | grep 0 hits |
| i18n-en | 30 | **28** | in_progress | Infrastruktura; puno inline BS | locales + hardcoded |
| cms-builder | 90 | **90** | web_only | Namjerno | CmsPageBuilderPage |
| formation-dnd | 90 | **90** | web_only | Namjerno | ClubFormationTab |
| media-tree | 90 | **80** | web_only | Folder sheet, ne tree UI | MediaPickerDialog |
| paypal | 5 | **5** | after_launch | Settings stub | TicketingPaymentsTab |
| monri | 5 | **5** | after_launch | Settings stub | isto |
| newsletter-campaigns | 10 | **10** | after_launch | Nema blast | — |
| financial-export | 0 | **0** | after_launch | Nema xlsx/pdf | grep prazan |
| pwa | 5 | **22** | after_launch | manifest + sw.js postoje | `public/manifest.json` |
| seasonal-tickets | 20 | **20** | after_launch | VIP kategorija only | — |
| video-highlights | 10 | **10** | after_launch | Match center, nema klipova | — |
| play-store | 20 | **20** | after_launch | EAS profil; nema submit | eas.json |

`overallPercent` (bez after_launch) bi pao malo: staff 82→70, analytics 60→42, seo 80→74; `mobile-polish` 55→69 vuče gore.
