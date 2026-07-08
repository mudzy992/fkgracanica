# HANDOFF — Mobile Complete

> **Datum:** 2026-07-08  
> **Status:** Track **CLOSED** (Faze 1–4 DONE) — interni preview ready  
> **Sljedeći fokus (post-v1):** Push notifikacije · EAS store submit · smoke na uređaju  
> **Git:** `mobile/` + plan docs **nisu commitani** u ovoj sesiji — commit na eksplicitni zahtjev  
> **Web:** tracks #1–#21 CLOSED — ne diraj BE/FE osim dokazanog API gapa

---

## Product (v1)

| Ekran | Auth |
|-------|------|
| Home, Vijesti, Live | Guest OK |
| Članstvo, Ulaznice, Obavještenja | Login obavezan (`RequireAuth` + `returnTo`) |

Stack: Expo ~56 · expo-router · SecureStore · i18n BS(+EN) · Socket.IO · `@expo/vector-icons`  
API: `EXPO_PUBLIC_API_URL` → `/api/v1` (isti backend kao web)

---

## Faze — urađeno

### Faza 1 — Foundation
- `.env.example` + `EXPO_PUBLIC_API_URL`
- Theme light/dark/system
- Guest tabs; auth gate membership/tickets/notifications
- Index → `/(tabs)/home`; login `returnTo` + „Nastavi bez prijave”

### Faza 2 — Content + Live
- `formatDateBs` / `formatDateTimeBs` (`mobile/src/lib/format-date.ts`)
- Home: LIVE prioritet, covers, CTA „Prati uživo”
- News list covers + DD.MM.YYYY; Live tab lista (`live/index`)
- Public socket reconnect; **ne** disconnect singleton na unmount live detail

### Faza 3 — Member + Tickets + Notif
- `GET /settings/module-flags` → sakrij membership/tickets tabove
- Membership: ACTIVE QR ~220; PENDING/EXPIRED copy; `POST /membership/register` (renew je **admin-only** — ne zvati s mobile)
- Tickets: filter Sve/Važeće/Iskorištene; fullscreen QR modal
- Notif: mark-all; **odvojen** auth socket (`getAuthRealtimeSocket`) + shared unread badge

### Faza 4 — Polish + ship
- Ionicons tab ikone + logout
- `ScreenLoading` / `ScreenEmpty` (compact na home)
- [`mobile/PREVIEW_SMOKE.md`](../../../mobile/PREVIEW_SMOKE.md) + [`mobile/eas.json`](../../../mobile/eas.json)
- **Nije** pokrenut `eas build` (credentials out of scope)

---

## Ključni fajlovi

| Područje | Path |
|----------|------|
| Tabs + flags | `mobile/app/(tabs)/_layout.tsx` |
| Auth | `mobile/src/lib/auth.tsx`, `RequireAuth` |
| API / tokens | `mobile/src/lib/api.ts` |
| Public + auth socket | `mobile/src/lib/realtime.ts` |
| Live hook | `mobile/src/hooks/use-live-match.ts` |
| Unread badge | `mobile/src/hooks/use-unread-notifications.ts` |
| Module flags | `mobile/src/hooks/use-module-flags.ts` |
| i18n | `mobile/src/i18n/index.ts` |
| Smoke | `mobile/PREVIEW_SMOKE.md` |

---

## Poznati caveat-i

1. **Workspace npm hoist:** `@expo/vector-icons` živi u root `node_modules/`; Node ESM `require` može pasti — Metro/Expo OK. Glyphovi postoje (`id-card`, `ticket`, …).
2. **`feature.membership` / `modules.ticketing`:** javni `GET /settings/module-flags` (ne private settings).
3. **Auth vs public socket:** ne miješati — invalid JWT na auth socketu disconnecta klijenta.
4. **Membership renew:** samo admin API; member koristi `register`.
5. Commit/push nije urađen u chatovima Faze 2–4.

---

## Sljedeća sesija — predloženi redoslijed

1. Manual smoke po [`PREVIEW_SMOKE.md`](../../../mobile/PREVIEW_SMOKE.md) (`cd mobile && npm start`)
2. Ako OK → **git commit** (mobile + `.cursor/plans/fk-gracanica/25_mobile-complete/`) na zahtjev
3. Post-v1 (novi plan folder): push notifications · EAS preview build · store submit

## Starter za novi chat

```
Nastavi iz HANDOFF-a:
@.cursor/plans/fk-gracanica/25_mobile-complete/HANDOFF.md

Web CLOSED. Mobile track v1 CLOSED (Faze 1–4).
Fokus: [smoke na uređaju | git commit | post-v1 push/EAS].
Pravila: fajlovi ≤200; plan-then-execute; BS; bez secret commitova; ne diraj BE/FE bez gapa.
```

---

## Checklist

Sve Faze 1–4 ✓ — vidi [CHECKLIST.md](./CHECKLIST.md)  
Changelog: [CHANGELOG.md](./CHANGELOG.md)
