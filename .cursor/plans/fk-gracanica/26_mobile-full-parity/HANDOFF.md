# HANDOFF — Mobile Full Parity

> **Datum:** 2026-07-16  
> **Status:** Faze 1–5 DONE · lokalni Android development build OK  
> **Plan:** `.cursor/plans/fk-gracanica/26_mobile-full-parity/`  
> **Matrica:** `.cursor/docs/matrices/mobile-parity/`

---

## Status u jednoj rečenici

Mobile full parity (public + član + staff ops) na Expo SDK 57; push/email delivery na backendu; lokalni EAS development APK uspješno buildan.

---

## Locked decisions

- Staff = **mobile-ops** (CMS drag-drop ostaje web-only)
- Push = Expo Push + FCM (`google-services.json`), ne raw `@react-native-firebase`
- User role label = **Član**
- Menu: `scripts/menu.sh` **5** = local development, **6** = local production

---

## Delivered

| Faza | Šta |
|------|-----|
| 1 | SDK 57, auth/`permissions`, More tab, staff shell, dark surfaces |
| 2 | gallery, team, player, league, heritage, contact, search, pages |
| 3 | `PushDevice` + notify prefs; device register; email + Expo push worker |
| 4 | Writer / Komentator / Moderator / Admin hub |
| 5 | smoke, matrica, EAS channels, RemoteImage → expo-image |

**Lokalni build:** `eas build --profile development --local` → APK (~125 MB).  
**Artifacts:** `*.apk` / `*.aab` u gitignore (root + `mobile/`); ne commitati APK.

---

## Ključni pathovi

| Područje | Path |
|----------|------|
| App config / FCM | `mobile/app.json`, `mobile/google-services.json` |
| EAS | `mobile/eas.json` (`EAS_BUILD_DISABLE_EXPO_DOCTOR=1`) |
| Push client | `mobile/src/lib/push.ts` |
| Permissions | `mobile/src/lib/permissions.ts` |
| Staff | `mobile/app/staff/**` |
| Delivery BE | `backend/src/notifications/notification-delivery.service.ts` |
| Migracija | `backend/prisma/migrations/20260716113000_push_devices_notification_preferences/` |

---

## Ops / gotchas

- `google-services.json` mora biti u `mobile/` (nije gitignored) — bez njega EAS prebuild pada
- `minSdkVersion: 35` u build-properties — testirati samo novije uređaje
- Monorepo: react / react-native-svg duplikati → doctor noise; doctor disabled u EAS env
- Prisma migracija: deploy na DB ako još nije (`migrate deploy`)
- iOS: `GoogleService-Info.plist` ostaje ignored

---

## Sljedeća sesija (prioritet)

1. Smoke APK na uređaju + Metro (`npx expo start`)
2. Deploy Prisma migracije na target DB
3. Opciono: menu **6** production local build / EAS cloud
4. Fix monorepo react pin (frontend `react-dom` vs mobile `react`) ako doctor treba 20/20
