# 27 — Mobile Max Polish

## Cilj

Max polish svih površina Expo mobile app (visual + tokovi) nakon `25_mobile-complete` i `26_mobile-full-parity`.

## Zaključane odluke

- Dark mode: `useTheme().colors` svuda; `spacing`/`typography` statički
- Theme + jezik: `expo-secure-store`
- Skeletons / animacije: RN `Animated` + StyleSheet (bez reanimated)
- Error UI: `ScreenEmpty` + retry
- QR: Modal + close + a11y
- Jezik: BS/EN toggle u More
- Fajlovi ≤200 linija

## Faze

1. Theme foundation (dark mode + persist)
2. Loading / empty / error + skeletons
3. i18n + More polish + language toggle
4. Search nav + a11y + QR + notif dot
5. Micro-motion + smoke + matrix + HANDOFF

## Out of scope

- Novi feature moduli / staff CMS
- EAS store submit
- Heritage rich media redesign
