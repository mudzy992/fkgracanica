# Changelog — Live Center

## 2026-06-26 (live clock & broadcast)

- Automatski sat utakmice od kickoffa; sudijska nadoknada (+N) nakon 45/90
- Komentator: dvije kolone po timu, izmjene out/in, YouTube live stream
- Javno: fullscreen stream + scoreboard overlay + event toast (~12s)

## 2026-06-26

- Komentator panel: halftime/resume, više događaja, odabir igrača, live komentari
- RBAC: `live.manage` na `/admin/live/:id`, `live.approve` na `/admin/live/pending`
- Javno: live komentari preko socket `match:comment`
- Live dugme u competition hubu; pending approval lista

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
