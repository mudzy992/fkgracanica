# Phase 03 — Own team `/team`

## Goal

`/team` ≈ web `FirstTeamPage` / `/tim` (dark-only).

## Target files

| File | Action |
|------|--------|
| `mobile/app/team.tsx` | Orchestrator ≤200; header hidden + back |
| `mobile/src/components/team/load-team-screen.ts` | NEW: own club + squad slots + stats |
| `mobile/src/components/team/TeamHero.tsx` | NEW: crest, KPIs, formation label, back |
| `mobile/src/components/team/TeamPlayerCard.tsx` | NEW: 3/4 portrait + goals badge |
| `mobile/src/components/team/TeamSpotlight.tsx` | NEW: top scorers strip |
| `mobile/src/components/team/TeamRoster.tsx` | NEW: Klupa + groups GK/DEF/MID/FWD |
| `mobile/src/components/team/TeamSeasonSummary.tsx` | NEW: season KPIs + W/D/L + form |
| `mobile/src/i18n/team.ts` | NEW: BS/EN |

## Out of scope

- Formation pitch / skica (defer; show formation text in hero only)
- Club public page (Phase 04)
- News

## Done when

- Vizuelno potvrđeno; `tsc` PASS; fajlovi ≤200
