# Mobilna aplikacija (Expo)

> Status: inicijalna verzija (FAZA 0/1) — MOB segmenti tek slijede · Ažurirano: 2026-11-02

## Stack

Expo **57** (`~57.0.16`) · React Native 0.86 · expo-router (`app/`) · i18next (bs/en) ·
TanStack Query **nije** korišten (vlastiti data/hooks sloj u `src/`).

## Struktura

```
mobile/
  app/                    — ekranu po putanjama (expo-router): (tabs)/, news/, live/,
                            gallery/, staff/, player/, membership, tickets-*, login, …
                            57 .tsx screenova
  src/                    — features/, components/, hooks/, lib/, i18n/, showcase/, types/
  eas.json                — profili: development / preview (APK) / production
  google-services.json    — push (FCM)
  PREVIEW_SMOKE.md        — interni smoke checklist (živi — Q-03)
  PRODUCTION_SMOKE.md     — production smoke checklist (živi — Q-03)
```

## Funkcionalni opseg

- **Gost**: home, vijesti, live, galerija, tim, liga, baština, pretraga, CMS stranice,
  browse ulaznica; login gate za članstvo/ulaznice/notifikacije.
- **Član**: članska kartica (QR), rezervacija ulaznica (QR), komentari, notifikacije, push.
- **Staff hub** (po ulozi): Writer (vijesti web-parity), Galerija (album editor),
  Komentator (desk + semafor), Moderator (queue), Ulaz/Redar (scan: `admission-scan`,
  inspect), Admin (KPI, orders, images, users).
- **Showcase**: režim "u izradi" — **NE DIRATI intercept** u `app/_layout.tsx` i
  `(tabs)/_layout.tsx` (pravilo iz TRACK 36 HANDOFF-a).

## Build

```bash
npm start                # Expo (dev)
eas build --profile preview --platform android     # APK (interni)
eas build --profile production --platform android  # produkcija (buildType: apk — ne AAB)
```

## Poznato stanje (iz brzog audita)

| Tema | Stanje |
|------|--------|
| Testovi | ❌ **Nikakvi** — nema jest/maestro/detox/appium u package.json (F-003) |
| Dokuacija | `AGENTS.md` (upućuje na Expo v57 docs), `CLAUDE.md` (→ AGENTS.md) — konfiguracija, ostaje |
| Smoke checkliste | ✅ `PREVIEW_SMOKE.md` + `PRODUCTION_SMOKE.md` (žive — Q-03) |
| Tokeni dizajna | ⚠️ usklađenost sa web tokenima → MOB segment |
