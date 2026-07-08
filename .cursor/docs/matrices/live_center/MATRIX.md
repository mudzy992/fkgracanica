# Live Center Matrix

## States

| Match status | Report status | Public view |
|--------------|---------------|-------------|
| SCHEDULED | DRAFT | Countdown / scheduled info |
| LIVE | DRAFT | Live feed, score, events |
| FINISHED | DRAFT (retro, no live) | Admin report entry; lineup editable until approved |
| FINISHED | PENDING_APPROVAL | Frozen live view, awaiting approval |
| FINISHED | APPROVED | Final report, stats updated |

## Retroactive match entry

- Admin creates match with `status: FINISHED`, past `scheduledAt`, scores; `clockStartedAt` stays null
- `isRetrospectiveMatch`: FINISHED + no clock + report not APPROVED
- Lineup editable for retrospective matches; report via `/admin/matches/:id/report` (no live required)
- Standings include FINISHED matches immediately; player season stats update on report approval only

## Round cascade delete

- `GET /rounds/:id/delete-impact` — preview counts (matches, reports, tickets, events)
- `DELETE /rounds/:id?cascade=true` — deletes all round matches (DB cascade) then round
- Rebuilds `PlayerStatistics` for season when any deleted match had `reportStatus: APPROVED`

## Socket events

- `match:join` / `match:leave` — client room subscription
- `match:score` — homeScore, awayScore, minute
- `match:event` — new MatchEvent
- `match:comment` — LiveComment
- `match:status` — status change

Public clients: connect without JWT, emit `match:join`. Komentator: JWT + REST `POST /live/matches/:id/events`.

## Komentator actions

Map to `MatchEventType`: GOAL, YELLOW_CARD, SUBSTITUTION, etc.

## Approval flow

1. Komentator ends match → `reportStatus: PENDING_APPROVAL`
2. Moderator/Admin `POST /live/:id/approve`
3. StatisticsModule recalculates player/team stats

## Changelog

- 2026-06-24: Initial live center workflow matrix
