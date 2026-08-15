# Phase 04 — Club public `/clubs/[slug]`

## Goal

Javni klub ≈ web `ClubPublicPage` / `/klub/:slug`. Omogućava kasniji tap sa League/Home tabele (Phase 05).

## API

- `GET /clubs/public/:slug` → `{ club, stadium, squad, seasonStats, players }`
- Source: `backend/src/clubs/club-public.service.ts`

## Target files

| File | Action |
|------|--------|
| `mobile/app/clubs/[slug].tsx` | NEW orchestrator ≤200; header hidden; flex root |
| `mobile/src/components/club/load-club-public.ts` | NEW: fetch + map (reuse TeamPlayer / pitch types where possible) |
| `mobile/src/components/club/ClubPublicHero.tsx` | NEW ≈ `ClubCinematicHero` |
| `mobile/src/components/club/ClubInfoSection.tsx` | NEW: city, stadium, short desc |
| Reuse | `TeamFormationPitch`, `TeamSpotlight`, `TeamRoster`, `TeamSeasonSummary`, `TeamPlayerCard` |
| `mobile/app/_layout.tsx` | Register `clubs/[slug]` → `headerShown: false` |
| `mobile/src/i18n/club.ts` | NEW BS/EN |

## Behavior

1. Load by slug; empty/404 → `ScreenEmpty`.
2. Ako je own club (`club.isOwnClub` ili slug === own) → **`router.replace('/team')`** (predloženo).
3. Inače: Hero → Info → Formation → Spotlight → Roster → Season stats.
4. Player tap → `/player/[id]`.
5. Back pill → Početna ili `router.back()`.

## Out of scope

- News; Home/League row wire-up (Phase 05)
- Competition tabs (web `ClubCompetitionTabs`) — defer ako preteško; optional minimal
- Commit bez zahtjeva

## Done when

- Vizuelno potvrđeno na uređaju
- `tsc --noEmit` PASS; fajlovi ≤200
- Own club redirect radi
- HANDOFF + CHECKLIST update

## Frontend reference

- `frontend/src/pages/public/ClubPublicPage.tsx`
- `ClubCinematicHero`, `ClubInfoSection`, `ClubPublicSections`
