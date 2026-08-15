# HANDOFF — Track 30 League/Clubs

> **Datum:** 2026-07-28  
> **Status:** Phase 01–05 **DONE** (Track 30 complete)  
> **Plan:** `.cursor/plans/fk-gracanica/30_mobile-league-clubs/`

---

## Status u jednoj rečenici

Featured, `/league`, `/team`, `/clubs/[slug]`, i Home/League tabela taps gotovi. News van ovog tracka.

---

## Šta je urađeno

### Phase 01 — Featured players (DONE)
| Fajl | Šta |
|------|-----|
| `load-home-players.ts` | Top 5 own club by league goals + photo merge |
| `home-player-card.tsx` | G badge gore desno |
| `HomeFeaturedPlayers` | CTA **„Naš tim >”** → `/team` |
| `player/[id].tsx` + `PlayerCinematicHero` + `PlayerStatGrid` | Web-like detail |
| `i18n/player.ts`, `home.ts` | BS/EN |

### Phase 02 — League (DONE)
| Fajl | Šta |
|------|-----|
| `app/league.tsx` | Hero, season chips, tabela, matches, leaders; flex root |
| `league/*` | `load-league-screen`, Hero (leader crest bg), Standings, Matches, Leaders |
| `i18n/league.ts` | BS/EN; back → Početna |
| Root `_layout` | `league`, `team`, `player/[id]` → `headerShown: false` |

### Phase 03 — Own team (DONE)
| Fajl | Šta |
|------|-----|
| `app/team.tsx` | Orchestrator; flex root; order ≈ web |
| `team/load-team-screen.ts` | squad slots + stats + pitchSlots + totals; players fallback |
| `TeamHero` | crest bg/KPI/back |
| `TeamFormationPitch` + `TeamPitchMarkings` | Startna postava + prave linije terena |
| `TeamPlayerCard` / `TeamSpotlight` / `TeamRoster` | 2-col grid, pos/goals/apps |
| `TeamSeasonSummary` | KPIs, totals, player table |
| `i18n/team.ts` | BS/EN |

### Phase 04 — Club public (DONE)
| Fajl | Šta |
|------|-----|
| `app/clubs/[slug].tsx` | Orchestrator; flex root; own → `/team` redirect |
| `club/load-club-public.ts` | `GET /clubs/public/:slug` → Team* tipovi + stadium |
| `ClubPublicHero` | crest/KPI/back ≈ TeamHero |
| `ClubInfoSection` | stadion name/city/address/capacity/desc |
| Reuse | `TeamFormationPitch`, `TeamSpotlight`, `TeamRoster`, `TeamSeasonSummary` |
| `i18n/club.ts` | BS/EN |
| Root `_layout` | `clubs/[slug]` → `headerShown: false` |

### Phase 05 — Home Tabela wire-up (DONE)
| Fajl | Šta |
|------|-----|
| `HomeLeagueRow.slug` | map `clubSlug` u Home + League loaders |
| `HomeLeagueRowItem` | Pressable: own → `/team`, else `/clubs/[slug]` |
| `LeagueStandingsList` | auto via shared row item |
| `HomeLeagueSnippet` | „Sve” → `/league` (već postojao) |

### Layout bug fix (bitno)
Fragment + ScrollView → **visina 0**. Fix: root `View` `flex:1` + `headerShown: false`.

---

## Donesene odluke

1. Opcija B: Featured → League → Team → Club public → Home tabela (News later).
2. App **dark-only**; bez News u ovom tracku.
3. Featured = top 5 by goals.
4. `/team` ≈ FirstTeamPage; `/clubs/[slug]` ≈ ClubPublicPage.
5. Own club na `/clubs/[slug]` → `router.replace('/team')`.
6. Tabela row: own → `/team`, else → `/clubs/[slug]`.
7. Competition tabs / round filter — deferred.
8. Bez commita osim na eksplicitni zahtjev.

---

## Otvorena pitanja / rizici

- Necommitted promjene (Home + Track 30) — ne commitati bez zahtjeva.
- Loaders blizu 200 linija — ne nabujati bez splita.
- Expo push 503 swallow (starije).

---

## Next (van Track 30)

- Device smoke Phase 04–05 (club slug + tabela taps).
- Commit na zahtjev.
- News track kad owner odluči.

---

## Test status

- `cd mobile && npx tsc --noEmit` — PASS nakon Phase 04; Phase 05 tipovi trivijalni (re-run).
- Manual: Phase 01–03 potvrđeno; 04–05 — device smoke preostao.
