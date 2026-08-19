# Changelog — Live Center

## 2026-08-18 (mobile stream picture + rotate)

- YouTube u WebView više nije nested iframe (audio-only); bounce na embed + Referer `baseUrl`
- Broadcast ekran otključava landscape; ostali ekrani ostaju portrait (`expo-screen-orientation`)

## 2026-08-18 (mobile fullscreen broadcast)

- Detalj LIVE/HT sa YouTube URL-om: WebView `absoluteFill` + `controls=0` (letterbox, bez croa)
- Native overlay kao web: compact/expand semafor, 1s sat, event toast 12s, HT panel, sheet Događaji
- Uživo tab ostaje native; featured 16:9 je teaser s CTA

## 2026-08-18 (mobile Uživo sat + stream)

- Mobile sat ide lokalnim 1s tickom iz `clockStartedAt` (socket `match:clock` nije ticker)
- `parseYouTubeId` podržava `/live/` i `/shorts/` (web + mobile)
- Uživo tab: featured YouTube player; lista badge Stream
- Detalj: HT overlay umjesto praznog playera
- Komentator stream panel učitava postojeći `liveStreamUrl`
- Mobile YouTube embed: HTML + `baseUrl` (Referer) — Error 153 u WebView

## 2026-08-18 (komentator dashboard polish)

- Web home: 4 KPI (uživo / danas / nacrti / čeka odobrenje), live hero, grupisana desk lista
- Desk rute: live/scheduled → `/admin/live/:id`; FINISHED → `/admin/matches/:id/report`
- GOAL i svi quick eventi zahtijevaju igrača; Završi ide kroz confirm
- Socket online/offline badge na desk headeru

## 2026-08-18 (Track 36)

- Klub akcije zahtijevaju `playerId`; izmjena out+in
- Live push (`notifyLiveMatch`) + mute; fanout na evente i start/HT/FT
- Mobile LIVE: YouTube stream, clock overlay, toast

## 2026-07-02

- Retroaktivne utakmice: admin može kreirati FINISHED utakmicu u prošlosti, postavu i izvještaj bez live toka
- Kaskadno brisanje kola: `DELETE /rounds/:id?cascade=true` + impact preview
- `rebuildSeasonPlayerStatistics` nakon brisanja utakmice/kola sa odobrenim izvještajem

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
