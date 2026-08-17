# Faza 9 — Play Store 20 → 100%

Ima: `mobile/eas.json` production AAB, `submit.production`, package `com.mudzahud.fkgracanica`, ikone u `app.json`.
Nema: store listing, privacy URL, screenshoti, dokumentovani submit.

## 100% definicija (kod + artefakti)

Listing spreman u repou. `eas build --profile production` + `eas submit` dokumentovani. Review Googlea je **ops gate** (3–14 dana) — katalog `ready` kad je AAB uploadan na Internal testing, ne kad je Production approved.

iOS van opsega.

## Posao

1. `mobile/store/README.md` — koraci: privacy CMS stranica, screenshots, content rating, Data safety (kamera/QR, push).
2. Screenshot spec: 1080×1920, min 2 (home + ulaznice/QR). Folder `mobile/store/screenshots/` — ako nema PNG u gitu, checklist „snimi s emulatora”.
3. Privacy: CMS slug `privatnost` (club-launch već traži tekst). Play listing URL = `https://fkgracanica.ba101.top/stranica/privatnost` (prilagodi stvarnoj ruti).
4. `eas.json` submit: service account path kao env, ne u git.
5. Provjeri `android.permissions` (CAMERA) usklađen s Data safety formom.
6. Internal testing track prvo, production kad klub potpiše.

## Fajlovi

- `mobile/store/README.md`
- `mobile/eas.json` (samo ako fali polje)
- `.cursor/docs/matrices/play-store/`
- `docs/club-launch/` checkbox Play Store

## 100%

Katalog `play-store` 100 ready kad je Internal testing live. Production rollout = klub, ne kod.
