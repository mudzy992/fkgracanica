# HANDOFF — 34 Mobile to 100%

> **Datum:** 2026-08-18  
> **Status:** P0+P1 + gallery/heritage/live polish. Next = leftover public <75, zatim P2 staff.  
> **Plan:** `.cursor/plans/fk-gracanica/34_mobile-to-100/`

---

## Status u jednoj rečenici

Native photo pager (nije lightbox), heritage tabovi po web logici, Live lista na Socket.IO. Ostaje login/buy/contact/browse, pa P2 staff.

---

## Šta je urađeno (2026-08-18)

- Gallery: `NativePhotoPager` (original, swipe, download, share kao fajl); bento lista; stack naslov albuma
- News: share `{WEB}/vijesti/{slug}` (OG s weba); foto tap → isti pager
- Heritage: sponzori po tieru, featured trofeji, timeline chapters, HoF year chips, museum filteri
- Live lista: uklonjen 15s poll; `match:join` + score/status. Gateway `match:score` sada šalje `id`
- Deps: `expo-sharing`, `expo-file-system`, `expo-media-library`

Ne dirano: Home/Liga/Tim/Klub, showcase intercept. Bez commita.

---

## Donesene odluke

1. Full-screen pager (`presentationStyle="fullScreen"`), ne dimmed lightbox.
2. WA/Viber share = lokalni fajl (`Sharing.shareAsync`), ne URL.
3. News share = web SEO URL (`EXPO_PUBLIC_WEB_URL` ili ba101.top).
4. Timeline = chapter film (ista sort logika kao web), ne CSS documentary 1:1.
5. Live list join LIVE/HALFTIME/SCHEDULED (da uhvati kickoff).

---

## Next steps

1. P1 leftover: login, tickets-buy, contact, tickets-browse
2. P2 staff
3. P04 Stripe + Play Store
4. Canvas % ručno; device smoke pager/share/socket

---

## Test status

- `cd mobile && npx tsc --noEmit` — PASS (2026-08-18)
- Device smoke pager/download/share/socket — nije rađen

---

## Starter za novi chat

```
Nastavi Track 34 leftover: login / tickets-buy / contact / tickets-browse, zatim P2 staff.

@.cursor/plans/fk-gracanica/34_mobile-to-100/HANDOFF.md
```
