# Mobile public screens

Prosjek **23 ekrana: 69%**. Vizuel-only (V/40): **53%**.  
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
| membership | 36 | 23 | 18 | **77** | Kartica = lista, ne vizual | `MembershipCardVisual` |
| tickets | 35 | 23 | 18 | **76** | Nema “physical ticket” UI | Tear-line kartica |
| notifications | 36 | 22 | 18 | **76** | Nema type icon / deep link | Icon + `router.push` |
| login | 35 | 22 | 17 | **74** | Nema grb, forgot, inline valid | Crest + validacija |
| tickets-buy | 34 | 21 | 17 | **72** | `box_office` only | Step indicator |
| live/index | 33 | 19 | 16 | **68** | Nema socket na listi, nema crest | Poll/socket + RemoteImage |
| contact | 32 | 19 | 16 | **67** | Nema adresu/mapu; Alert | Settings info blok |
| tickets-browse | 29 | 19 | 17 | **65** | Nema sold-out | Availability badge |
| news | 28 | 17 | 16 | **61** | FlatList vs featured/bento | Featured + category chips |
| news/[slug] | 29 | 16 | 16 | **61** | `stripHtml` gubi format | Render HTML |
| search | 30 | 15 | 16 | **61** | Nema debounce/facets | Debounce 300ms + SectionList |
| gallery | 27 | 15 | 16 | **58** | Lista vs bento | 2-col + photo count |
| pages/[slug] | 23 | 11 | 16 | **50** | Widgeti → plain text | Hero + HTML widget |
| pages | 21 | 11 | 16 | **48** | Directory bez excerpt | Subtitle iz CMS |
| heritage | 21 | 7 | 14 | **42** | 5 web stranica = bullet lista | Tabovi + slike |
| gallery/[slug] | 18 | 14 | 9 | **41** | Hardcoded BS; nema retry/lightbox | i18n + error + modal |

**Dokaz (spot-check):** `heritage.tsx` samo `name` stringovi; `gallery/[slug].tsx` L54 `"Galerija nema fotografija."`

Predloženo `mobile-polish`: **69** (katalog 55).
