# HANDOFF — 34 Mobile to 100%

> **Datum:** 2026-08-18  
> **Status:** Museum + leftover + login UX + Stripe return-to-app + profil hub. Next = P2 staff.  
> **Plan:** `.cursor/plans/fk-gracanica/34_mobile-to-100/`  
> **Bez commita.**

---

## Status u jednoj rečenici

Login, Stripe povratak u app, contact mapa i korisnički profil su urađeni; ostaje P2 staff, pa Play Store.

---

## Šta je urađeno (ova sesija)

### Login
- Full-screen dark plate, veći grb, `loginLead`, show/hide lozinka, `PrimaryButton`

### Stripe return-to-app (bug)
- Uzrok: `successUrl` je bio web (`/ulaznice`, `/clanstvo`)
- Tok: in-app `WebBrowser.openAuthSessionAsync` → `GET /payments/mobile-return` 302 na `fkgracanica://` ili `exp://` → confirm-session u app
- Ulaznice (online), članstvo, sezonska karta
- Dep: `expo-web-browser`

### Contact mapa
- `geo:` / `maps:` + Google/Apple https fallback (stari `maps/search/?api=1` je bio neispravan URL)

### Profil
- Tab **Profil** (samo auth): članstvo, ulaznice, kupovina, notifikacije, jezik, staff, odjava
- Header ikona profila umjesto logout
- Membership / tickets / notifications i dalje `href: null` u tab baru

Ne dirano: Liga / Tim / Klub, showcase intercept.

---

## Donesene odluke

1. Stripe Checkout ostaje (nema Payment Sheet); povratak ide kroz backend bounce, ne custom scheme kao Stripe `success_url`.
2. `to` query na mobile-return dozvoljava samo `fkgracanica:` / `exp:` / `exps:`.
3. Korisnički ekrani žive u Profil hubu; More ostaje javni moduli.

---

## Otvoreno / rizici

- `expo-web-browser` plugin u `app.json` — rebuild dev clienta preporučen (Expo Go AuthSession radi)
- Device smoke: Stripe round-trip, mapa, login, profil tab
- P2 staff još nije startovan
- Canvas % ručno

---

## Next steps

1. **P2 staff:** dashboard → gallery-manage → orders → EntityList images
2. Play Store listing
3. Device smoke (Stripe return, mapa, profil)

---

## Test status

- `cd mobile && npx tsc --noEmit` — PASS
- Device smoke — nije rađen

---

## Starter za novi chat

```
Nastavi Track 34. Login UX, Stripe return-to-app, contact mapa i profil hub su DONE.
Sljedeće: P2 staff — dashboard, gallery-manage, orders, EntityList images.

Ne dirati Liga/Tim/Klub ni showcase intercept. Bez commita dok ne kažem.
Dark-only, fajlovi ≤200, i18n BS/EN.

@.cursor/plans/fk-gracanica/34_mobile-to-100/HANDOFF.md
```
