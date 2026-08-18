# HANDOFF — 35 Staff complete

> **Datum:** 2026-08-18  
> **Status:** Implementacija gotova. Ostaje rebuild dev clienta + device smoke.  
> **Plan:** `.cursor/plans/fk-gracanica/35_staff-complete/`  
> **Bez commita.**

## Status

Kompletan mobile staff po ulogama (Writer, Galerija, Komentator, Moderator, Ulaz/Redar, Admin minimum). Track 34 faza 03 je ovim zamijenjena; 34 ostaje Play Store.

## Šta je urađeno

- Writer news web-parity: native meta + DOM Tiptap HTML + pretraga veza
- Album kao web: create pa editor grid + biblioteka
- Komentator desk filter + semafor (`useLiveMatch`)
- Moderator queue UX
- Admin KPI/orders/images/users
- BE `admissions.scan` + uloga **Redar**; validate membership QR `membershipCard.qrCode`
- Hub: Writer, Galerija, Komentator, Moderator, Ulaz, Admin

## Sljedeće

1. Rebuild Expo dev client (webview)
2. Smoke Writer / album / Ulaz na uređaju
3. Track 34 faza 04 Play Store
4. Assign role Redar korisniku (seed/sync kreira ulogu)

## Ne dirati

- Showcase intercept u `mobile/app/_layout.tsx` i `(tabs)/_layout.tsx`
- Public Liga/Tim/Uživo polish iz Track 34
