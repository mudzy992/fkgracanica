# Faza 11 — Live centar E2E

## Cilj

Komentator unosi gol → Socket.IO → javna live stranica ažurira rezultat i događaje u realnom vremenu.

## Backend

- `live-score.util.ts` — GOAL/PENALTY/OWN_GOAL ažurira rezultat
- `LiveService.addEvent` — emit `match:score` + `match:event`
- `RealtimeGateway` — javne konekcije (bez JWT), `match:join`/`match:leave`, `match:score`
- `SOCKET_IO_PATH=/socket.io` u Dockeru (Traefik strip `/backend`)

## Frontend

- `socket.io-client`, `lib/realtime.ts`
- `useMatchRealtime` — join soba, patch TanStack Query cache
- `CommentatorControls` — start, gol domaćin/gost, završi
- `LiveMatchPage` — live feed preko socketa

## Test

- `live-score.util.spec.ts`, `live-center.e2e-spec.ts`

## Ručni smoke

1. Admin → Utakmice → Live (komentator) na SCHEDULED utakmici
2. Započni → Gol domaćin
3. Otvori `/live/:id` u drugom tabu — rezultat i događaj se pojave bez refresha

## Sljedeće

HANDOFF §7 korak 5 — sigurnost (.env, JWT rotacija).
