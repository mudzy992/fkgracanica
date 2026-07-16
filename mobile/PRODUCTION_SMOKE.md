# Mobile Production Smoke

## Guest
- [ ] Home / News (HTML body) / Live detail
- [ ] Gallery, Team, Player, League→match, Heritage show-all
- [ ] Contact + newsletter (odvojen email)
- [ ] Search deep-link, CMS page sections render
- [ ] Tickets browse (guest), Membership CTA → login

## Član
- [ ] Membership card/register + error retry
- [ ] Reserve ticket → My tickets QR + refund
- [ ] News comment create/delete own
- [ ] Notifications mark read

## Writer
- [ ] List/edit/create news, cover, category, submit

## Komentator
- [ ] Clock phases, events, comment, stream, report submit

## Moderator
- [ ] Approve + reject news/gallery/live
- [ ] Gallery manage, Comms read/delete, Audit list

## Administrator
- [ ] Dashboard labels, users+roles, settings all keys
- [ ] Membership admin, QR validate, ticketing orders
- [ ] Heritage/clubs/players/competitions CRUD
- [ ] No CMS builder entry

## Store
- [ ] Production AAB (`eas build --profile production`)
- [ ] Preview APK (`eas build --profile preview`) when needed
- [ ] HTTPS API only (`usesCleartextTraffic: false`)
- [ ] minSdk 26; archs arm64-v8a + armeabi-v7a
- [ ] `.env` from `.env.example` (API + realtime URLs)
