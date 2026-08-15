# Phase 02 — League screen

## Goal

Full `/league` ≈ web `LeaguePage` / `/liga` (dark-only mobile).

## Target files

| File | Action |
|------|--------|
| `mobile/app/league.tsx` | Orchestrator ≤200: load + compose sections |
| `mobile/src/components/league/load-league-screen.ts` | NEW: seasons, standings, matches, top scorers |
| `mobile/src/components/league/LeagueHero.tsx` | NEW: season name, leader, rounds played |
| `mobile/src/components/league/LeagueStandingsList.tsx` | NEW: reuse `HomeLeagueRowItem` / form dots |
| `mobile/src/components/league/LeagueMatchesSection.tsx` | NEW: next + recent matches |
| `mobile/src/components/league/LeagueTopScorers.tsx` | NEW: horizontal/list top scorers |
| `mobile/src/i18n/league.ts` | NEW: BS/EN keys |
| Optional | Season picker (simple chips) if space |

## Visual / parity

- Crest + P / GD / Pts + form dots; own club highlight
- Header / hero with season + leader
- Matches list (tap → `/match/[id]` if route exists)
- Top scorers strip
- Row tap → `/clubs/[slug]` **disabled/stub** until Phase 04 (no crash)

## Out of scope

- News; club public page; Home Tabela wire-up (Phase 05)
- Round “up to” filter (defer if heavy; season switch OK)

## Done when

- Vizuelno ≈ web tabela + scorers + matches
- `tsc --noEmit` PASS; fajlovi ≤200
