# 30 — Mobile League + Clubs + Featured players

> Nastavak nakon Home DONE (Track 29). Paritet s web `/liga`, `/tim`, `/klub/:slug` + polish Home „Naši igrači”.

## Goal

1. Home **Istaknuti igrači** — premium parity s `FeaturedPlayersWidget`
2. Full **`/league`** ≈ web `LeaguePage` / `/liga`
3. Own team **`/team`** ≈ web `FirstTeamPage` / `/tim`
4. Other clubs **`/clubs/[slug]`** ≈ web `ClubPublicPage` / `/klub/:slug`
5. Wire Home Tabela: row → club; „Sve” → league

## Phases

| # | Phase | Deliverable |
|---|--------|-------------|
| 01 | Featured players Home polish | `HomeFeaturedPlayers` cinematic cards + number; i18n |
| 02 | League screen | Full standings (crest, P/GD/Pts, form, own highlight); match list; row → club |
| 03 | Own team screen | `/team` redesign ≈ FirstTeamPage |
| 04 | Club public screen | `/clubs/[slug]` + API `/clubs/public/:slug` |
| 05 | Home Tabela wire-up | slug/id on rows; press → own `/team` or `/clubs/[slug]` |

## Rules

- Fajlovi ≤200 linija; useTheme (dark-only); i18n BS/EN
- Jedna faza po sesiji/iteraciji dok nije potvrđena
- Bez commita osim na zahtjev
- Ne dirati News dok ovaj track nije dogovoren / završen (owner bira)

## Frontend reference

- `frontend/src/pages/public/LeaguePage.tsx`
- `frontend/src/pages/public/FirstTeamPage.tsx`
- `frontend/src/pages/public/ClubPublicPage.tsx`
- `frontend/src/cms/widgets/FeaturedPlayersWidget.tsx`
- Routes: `/liga`, `/tim`, `/klub/:slug`, `/igrac/:id`

## Mobile stubs

- `mobile/app/league.tsx`, `team.tsx`, `player/[id].tsx`
- `HomeLeagueSnippet`, `HomeFeaturedPlayers`, `load-home-extras.ts`

## API (audit — dostupno, još nekorišteno na mobile)

- `GET /clubs/public/:slug` (ClubPublicPage source)
- `GET /clubs/:id/stats?seasonId`, `GET /clubs/:id/stadium`
- `GET /players?clubId=&activeOnly=true` (featured players parity)
- `GET /statistics/standings?seasonId&upToRound`, `top-scorers`, `top-assists`
- `GET /rounds?seasonId`

## Napomena redoslijeda

Audit predlaže club page prije league (row-tap unblocking); zadržan owner-ov redoslijed 01=Featured → 02=League, ali Phase 02 može interno linkovati na `/clubs/[slug]` stub ako Phase 04 još nije gotova (fallback: disable tap dok ne postoji ruta).
