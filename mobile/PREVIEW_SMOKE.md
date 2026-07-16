# Mobile Preview Smoke

Interni preview (bez store submita).

## Setup

- [ ] `mobile/.env` — `EXPO_PUBLIC_API_URL` → backend `/api/v1`
- [ ] Opciono: `EXPO_PUBLIC_REALTIME_URL`, `EXPO_PUBLIC_SOCKET_IO_PATH`
- [ ] `cd mobile && npm start` (Expo Go ili dev client)

## Guest

- [ ] Home bez logina (next match + latest news); skeleton pa content
- [ ] News list → slug detail (cover + DD.MM.YYYY)
- [ ] Live tab lista → match detail + connected badge; score pulse na update
- [ ] More → Galerija / Tim / Liga / Baština / Kontakt / Pretraga / CMS
- [ ] Search: tap rezultat → odgovarajući ekran
- [ ] „Nastavi bez prijave” sa logina → home
- [ ] API fail → error + retry (ne prazan empty)

## Auth

- [ ] Članstvo / Ulaznice / Obavještenja → login gate + returnTo
- [ ] Membership ACTIVE → skenirabilan QR
- [ ] Tickets filter + QR modal sa dugmetom Zatvori
- [ ] Notif unread dot + mark one / mark all; badge pada
- [ ] Push permission prompt nakon logina
- [ ] Logout

## Theme / i18n / flags

- [ ] More → Izgled: system → light → dark (persist restart)
- [ ] More → Jezik: BS ↔ EN (persist restart)
- [ ] Dark mode na Home / News / Live / More / Staff
- [ ] `feature.membership=false` / `modules.ticketing=false` → tab nestaje
- [ ] `modules.gallery=false` / `modules.cms=false` → More skriva module
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
