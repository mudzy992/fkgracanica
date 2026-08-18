# HANDOFF — 34 Mobile to 100%

> **Datum:** 2026-08-18  
> **Status:** P0+P1 + heritage (uklj. museum) + leftover public. Next = P2 staff.  
> **Plan:** `.cursor/plans/fk-gracanica/34_mobile-to-100/`  
> **Bez commita.**

---

## Status u jednoj rečenici

Museum tab i leftover public (`login`, `tickets-buy`, `contact`, `tickets-browse`) su na nivou; ostaje P2 staff, pa P04 Stripe + Store.

---

## Šta je urađeno (ova sesija)

### Museum tab (`HeritageMuseumTab` + split)
- Jezik: **arhiv / vitrina** (mesing `#C4A574`) — nije timeline-film ni HoF-zlato ni trophy-polica
- KPI strip (predmeta / godina / kategorije), kategorije pa godine kao zasebni drawer chipovi
- Featured eksponat + 2-col vitrine; tap slike → `NativePhotoPager`
- i18n u `heritage.ts`

### Leftover public
- **login:** `club.crestUrl` + forgot → `/contact` (nema reset endpointa)
- **tickets-buy:** sold-out banner + disabled reserve; step indicator (korak 2)
- **tickets-browse:** 3-step (Pregled → Rezervacija → Ulaznica); CTA → `/tickets-buy` (auth) ili login `returnTo`
- **contact:** email/tel + mapa ploča (`contact.address` → native maps)
- Shared: `usePublicSettings`, `PrimaryButton.disabled`

### Hygiene
- `tsc --noEmit` PASS (uklj. `timeline.span` catch type u `load-home-extras.ts`)

Ne dirano: Liga / Tim / Klub, showcase intercept.

---

## Donesene odluke

1. Museum = vitrina/arhiv (mesing), ne kopija timeline/HoF/trofeja.
2. Forgot password = kontakt klub (backend reset ne postoji).
3. Contact „mapa“ = adresa + open native maps (nema expo-maps / embed).
4. Browse CTA vodi na rezervaciju, ne na „moje ulaznice“.

---

## Otvoreno / rizici

- `expo-media-library` / sharing ne rade u Expo Go — treba rebuild dev clienta
- Pinch-zoom u pageru namjerno nije dodat
- Device smoke — nije rađen
- Canvas % ručno

---

## Next steps

1. **P2 staff:** dashboard (skeleton/KPI/error) → gallery-manage edit/delete → orders status/refund → EntityList image (trophies, HOF, museum, sponsors, clubs)
2. P04 Stripe + Play Store
3. Device smoke: pager, live socket, heritage tabs, login crest, sold-out, contact mapa
4. Canvas % ručno

---

## Test status

- `cd mobile && npx tsc --noEmit` — PASS (ova sesija)
- Device smoke — nije rađen

---

## Starter za novi chat

```
Nastavi Track 34. Museum + leftover public (login, tickets-buy, contact, tickets-browse) su DONE.
Sljedeće: P2 staff — dashboard, gallery-manage, orders, EntityList images.

Ne dirati Liga/Tim/Klub ni showcase intercept. Bez commita dok ne kažem.
Dark-only, fajlovi ≤200, i18n BS/EN.

@.cursor/plans/fk-gracanica/34_mobile-to-100/HANDOFF.md
```
