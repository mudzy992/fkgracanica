# Faza 02 — P1 public (rupe do kompletnosti)

Redoslijed iz canvasa / GAPS. Jedan ekran (ili usko povezan par) po iteraciji.

| # | Ekran | Sad | Meta | Posao |
|---|-------|-----|------|-------|
| 1 | news + news/[slug] | 61 | 85 | Featured, kategorije, HTML body |
| 2 | heritage | 42 | 85 | Tabovi + slike ≈ 5 web stranica |
| 3 | gallery lista | 58 | 80 | 2-col bento, photo count |
| 4 | gallery/[slug] | ~55 nakon P0 | 80 | Lightbox / modal |
| 5 | search | 61 | 80 | Debounce 300ms + SectionList grupe |
| 6 | pages + pages/[slug] | 48–50 | 75 | Excerpt; hero + HTML widget |
| 7 | live/index | 68 | 82 | Crest + poll/socket |
| 8 | membership + tickets UI | 76–77 | 88 | Kartica / tear-line ulaznica |
| 9 | Ostalo public <75 | login 74, tickets-buy 72, contact 67, browse 65 | +10 | Crest/forgot; sold-out; mapa; step indicator |

News je **prvi** veliki ekran (Track 29 queue #2).

**DONE 2026-08-17** za redove 1–8. Leftover: login, tickets-buy, contact, tickets-browse.

Ne dirati Home / Liga / Tim / Klub osim regresije.

Frontend ref: `NewsPage`, heritage pages, `GalleryPage`, `SearchPage`, CMS public, `LiveMatches`.
