# APK download matrix

## Javno

- Guest vidi footer CTA i `/aplikacija` samo kad postoji `PUBLISHED` Android `AppRelease`.
- CTA vodi na `/aplikacija` (uputstvo), ne na sirovi fajl.
- Download: zadnja published verzija (`versionCode` desc). Starije ostaju `RETIRED`.

## API

- `GET /public/app-releases/android/latest` — meta (404 ako nema published)
- `GET /public/app-releases/android/latest/download` — stream APK, bez auth
- Admin: `POST /app-releases/upload`, `POST /app-releases`, `PATCH /app-releases/:id` — `app-releases.manage`

## RBAC

- `app-releases.manage` — upload, draft, publish (Administrator)
- Javni download — bez dozvole

## UX

- Unknown sources: uključiti tek ako Android blokira instalaciju, samo za Chrome/Files.
- `/aplikacija`: vizualni Android mockup (Chrome, warning, notifikacija, unknown apps, installer).
- Native APK ≠ PWA prečica. iOS: web portal.
