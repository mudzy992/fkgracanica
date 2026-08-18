# Mobile public screens

Prosjek **23 ekrana: ~80%** (gallery/heritage/live polish 2026-08-18). Vizuel-only (V/40): **~64%**.  
Staff: [SCREENS-STAFF.md](./SCREENS-STAFF.md). Rubrika: [RUBRIC.md](./RUBRIC.md).

| Ekran | F | V | H | **%** | Zašto ne 100 | Sljedeći korak |
|-------|---|---|---|-------|--------------|----------------|
| home | 37 | 35 | 19 | **91** | Nema countdown; hero plići od web parallax | Countdown + HeroBlock i18n |
| team | 37 | 34 | 19 | **90** | Roster tap / klupa | `onPress` → `/player/[id]` |
| league | 37 | 32 | 19 | **88** | Match/club tap nepotpun | live/[id] + clubs/[slug] |
| player | 35 | 32 | 18 | **85** | Nema match history | Career/matches sekcija |
| more | 36 | 28 | 18 | **82** | Nema theme toggle; 176 linija | Extract auth blok |
| clubs/[slug] | 35 | 29 | 17 | **81** | Nema historiju kluba | Founded/timeline blok |
| live/[id] | 35 | 25 | 17 | **77** | Hardcoded `#FCA5A5`; nema crest/tabs | Theme token + crest |
| membership | 36 | 31 | 18 | **85** | Status i dalje raw enum | Localized status |
| tickets | 35 | 29 | 18 | **82** | Tear-line dashed; nije full stub | Perforation art |
| notifications | 36 | 22 | 18 | **76** | Nema type icon / deep link | Icon + `router.push` |
| login | 35 | 22 | 17 | **74** | Nema grb, forgot, inline valid | Crest + validacija |
| tickets-buy | 34 | 21 | 17 | **72** | `box_office` only | Step indicator |
| live/index | 35 | 30 | 18 | **83** | Socket lista; nema badge konekcije | Connected chip |
| contact | 32 | 19 | 16 | **67** | Nema adresu/mapu; Alert | Settings info blok |
| tickets-browse | 29 | 19 | 17 | **65** | Nema sold-out | Availability badge |
| news | 34 | 30 | 18 | **82** | Featured = prvi item, ne CMS flag | Featured API |
| news/[slug] | 35 | 30 | 18 | **83** | Share web SEO; HTML paragrafi | RN HTML renderer |
| search | 34 | 26 | 18 | **78** | Nema facets UI | Facet chips |
| gallery | 34 | 32 | 18 | **84** | Bento + header | Masonry |
| pages/[slug] | 30 | 24 | 16 | **70** | Hero + HTML; ostali widgeti plain | Više widgeta |
| pages | 30 | 22 | 16 | **68** | Excerpt iz seoDesc | CMS subtitle |
| heritage | 36 | 32 | 17 | **85** | Tabovi po web logici | Cold-open documentary |
| gallery/[slug] | 34 | 32 | 16 | **82** | Native pager + download/share | Pinch-zoom |

**Dokaz (spot-check 2026-08-18):** native pager, heritage per-tab, live socket.

Predloženo `mobile-polish`: **80** (katalog 55 — katalog nije diran).
