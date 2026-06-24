# Changelog — Live Center

## 2026-06-24 (QA)

- Produkcijski QA skripte: `qa-live-reset.sh`, `qa-live-commentator.mjs` — PASSED

## 2026-06-24 (mobile)

- Expo live ekran: `socket.io-client`, javni `match:join`, realtime događaji/rezultat
- Produkcijski URL: host `/realtime` + path `/backend/socket.io` (ne `/backend/realtime`)

## 2026-06-24

- Live E2E: javni socket join, `match:score`, komentator UI, live stranica
- Docker `SOCKET_IO_PATH` ispravljen na `/socket.io` (iza Traefik strip)

## 2026-06-24 (initial)

- Defined match/report status transitions and socket events
