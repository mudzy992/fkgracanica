# 26 — Mobile Full Parity

## Cilj

Proširiti postojeći `mobile/` na punu operativnu paritetu sa web aplikacijom po ulogama, uz Expo SDK 57, staff workspace i 3-kanalni notifikacijski sistem.

## Zaključane odluke

- Expo SDK `57` + `expo-router`
- Heavy CMS builderi ostaju samo na webu
- Push ide preko `expo-notifications` + Firebase/FCM
- In-app notif ostaje Socket.IO + `/notifications`
- Email ide preko BullMQ `email` queue + SMTP settings
- `User` se mapira na postojeću ulogu `Član`

## Faze

1. Foundation: SDK 57, nav shell, permission gates, design primitives
2. Public parity: read-only javni moduli
3. Notifications: push device registry, email worker, mobile push flow
4. Staff ops: Writer, Komentator, Moderator, Administrator workflowi
5. Polish: i18n, smoke, matrice, EAS preview

## Scope

### Mobile uvodi

- Public browse svih javnih web modula
- Member features: članstvo, ulaznice, notifikacije, profil
- Staff workspace po `permissions[]`
- QR validate na telefonu
- Push deep-linking i badge sync

### Web-only ostaje

- CMS drag-and-drop/page builder
- Slični teški builder/workbench ekrani koji nisu mobile-first

## Reference

- Existing v1: `../25_mobile-complete/HANDOFF.md`
- Web complete: `../21_web-complete/HANDOFF.md`
- Matrix: `../../../docs/matrices/mobile-parity/MATRIX.md`
