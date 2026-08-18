# HANDOFF — 34 Mobile to 100%

> **Datum:** 2026-08-18  
> **Status:** Account + More + chrome (headers, skeleti, back) DONE. Next = P2 staff.  
> **Plan:** `.cursor/plans/fk-gracanica/34_mobile-to-100/`  
> **Bez commita.**

---

## Status u jednoj rečenici

Članstvo / Ulaznice / Obavještenja, More meni, skeleti i stack-back su ispolirani; ostaje P2 staff, pa Play Store + device smoke.

---

## Šta je urađeno (ova sesija)

### Account (prijavljeni korisnik)
- `membership`, `tickets`, `notifications` su **stack** rute (`/membership`, `/tickets`, `/notifications`) — swipe/back radi
- Uklonjeni hidden tabovi (`href: null`)
- Članstvo: kartica + status i18n, bez MemberHomeStrip
- Ulaznice: filteri, sezonska, `PrimaryButton`, status i18n
- Obavještenja: unread dot, mark-all
- Profil hub: Account / Preferences grupe; linkovi na stack rute

### More
- Grupe: Istraži / Klub / Postavke
- CMS rute **ukinute** (`app/pages.tsx`, `app/pages/[slug].tsx`) — nisu WebView, ali staff žargon i dupli CMS; home i dalje tira `/cms/pages/home` interno
- tickets-browse: stack naslov, koraci (active=1), tap kartice → buy, bez duplog in-page title

### Chrome
- Root stack: i18n naslovi, `gestureEnabled` + `fullScreenGestureEnabled`, `headerBackButtonDisplayMode: 'minimal'` (nema “More” kao back title)
- News detail i live meč također na stack (`/news/[slug]`, `/live/[id]`) radi back gestura
- `ListSkeleton`: pulse + a11y `loading`
- Content loading: ListSkeleton umjesto spinnera (tickets-buy, gallery detail, news, live)

Ne dirano: Liga / Tim / Klub UI (samo live href u `LeagueMatchesSection`), showcase intercept.

---

## Donesene odluke

1. CMS stranice u More **brisane**, ne sakrivene — native widgeti nisu WebView, ali nisu fan-facing.
2. Account i news/live detalji žive na root Stacku, ne kao hidden tabovi.
3. Stripe Checkout ostaje; povratak kroz backend bounce (`payment-return` → `/tickets` | `/membership`).

---

## Otvoreno / rizici

- `expo-web-browser` plugin — rebuild dev clienta preporučen
- Device smoke još nije rađen (Stripe round-trip, mapa, pager, heritage, account back, More)
- `mobile/src/i18n/common.ts` i dalje >200 linija (pre-existing)
- P2 staff nije startovan
- Canvas % ručno

---

## Next steps

1. **P2 staff** (`.cursor/plans/fk-gracanica/34_mobile-to-100/03_phase-p2-staff.md`):
   - dashboard — skeleton, KPI, error
   - gallery-manage — edit/delete photo
   - orders — status / refund
   - EntityList image — trophies, HOF, museum, sponsors, clubs
2. Play Store listing
3. Device smoke (Stripe return, mapa, profil, stack back, skeleti)

---

## Test status

- `cd mobile && npx tsc --noEmit` — PASS
- Device smoke — nije rađen

---

## Starter za novi chat

```
Nastavi Track 34. Account/More/chrome polish je DONE.
Sljedeće: P2 staff — dashboard, gallery-manage, orders, EntityList images.

Ne dirati Liga/Tim/Klub UI ni showcase intercept. Bez commita dok ne kažem.
Dark-only, fajlovi ≤200, i18n BS/EN.

@.cursor/plans/fk-gracanica/34_mobile-to-100/HANDOFF.md
@.cursor/plans/fk-gracanica/34_mobile-to-100/03_phase-p2-staff.md
```
