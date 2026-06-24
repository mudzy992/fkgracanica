# Live Center Matrix

## States

| Match status | Report status | Public view |
|--------------|---------------|-------------|
| SCHEDULED | DRAFT | Countdown / scheduled info |
| LIVE | DRAFT | Live feed, score, events |
| FINISHED | PENDING_APPROVAL | Frozen live view, awaiting approval |
| FINISHED | APPROVED | Final report, stats updated |

## Socket events

- `match:score` — homeScore, awayScore, minute
- `match:event` — new MatchEvent
- `match:comment` — LiveComment
- `match:status` — status change

## Komentator actions

Map to `MatchEventType`: GOAL, YELLOW_CARD, SUBSTITUTION, etc.

## Approval flow

1. Komentator ends match → `reportStatus: PENDING_APPROVAL`
2. Moderator/Admin `POST /live/:id/approve`
3. StatisticsModule recalculates player/team stats

## Changelog

- 2026-06-24: Initial live center workflow matrix
