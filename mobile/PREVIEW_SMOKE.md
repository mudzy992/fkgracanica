# Mobile Preview Smoke

Interni preview (bez store submita).

## Setup

- [ ] `mobile/.env` — `EXPO_PUBLIC_API_URL` → backend `/api/v1`
- [ ] Opciono: `EXPO_PUBLIC_REALTIME_URL`, `EXPO_PUBLIC_SOCKET_IO_PATH`
- [ ] `cd mobile && npm start` (Expo Go ili dev client)

## Guest

- [ ] Home bez logina (next match + latest news)
- [ ] News list → slug detail (cover + DD.MM.YYYY)
- [ ] Live tab lista → match detail + connected badge
- [ ] More tab → Galerija / Tim / Liga / Baština / Kontakt / Pretraga / CMS stranice
- [ ] „Nastavi bez prijave” sa logina → home

## Auth

- [ ] Članstvo / Ulaznice / Obavještenja → login gate + returnTo
- [ ] Membership ACTIVE → skenirabilan QR
- [ ] Tickets filter + fullscreen QR
- [ ] Notif mark one / mark all; badge pada
- [ ] Push permission prompt nakon logina
- [ ] Logout

## Flags / theme / live

- [ ] `feature.membership=false` / `modules.ticketing=false` → tab nestaje
- [ ] `modules.gallery=false` / `modules.cms=false` → More screen skriva module
- [ ] System dark mode
- [ ] Live: network drop → reconnect, eventi/score

## Staff

- [ ] Writer → create news + submit
- [ ] Komentator → odabir meča + start/HT/resume/end + komentar
- [ ] Moderator → pending approve akcije
- [ ] Admin → dashboard / users / settings / validate / membership / inbox

## EAS (opciono kasnije)

```bash
eas build --profile preview --platform android
```

Profili u `eas.json` — ne pokretati bez projekta / kredencijala.
