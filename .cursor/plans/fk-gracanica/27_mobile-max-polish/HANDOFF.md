# HANDOFF — Mobile Max Polish

> **Datum:** 2026-07-16  
> **Status:** Faze 0–5 DONE  
> **Plan:** `.cursor/plans/fk-gracanica/27_mobile-max-polish/`  
> **Matrica:** `.cursor/docs/matrices/mobile-parity/`

---

## Status u jednoj rečenici

Max polish (dark mode, error/skeleton, i18n+theme/lang persist, search nav, a11y, score pulse, QR close) implementiran na Expo SDK 57 mobile app.

---

## Delivered

| Faza | Šta |
|------|-----|
| 0 | Plan docs u `27_mobile-max-polish/` |
| 1 | `useTheme()` svuda; SecureStore theme; More cycle toggle |
| 2 | `ListSkeleton`, error+retry na key listama |
| 3 | i18n keys; More bez debug stringa; BS/EN persist |
| 4 | `search-nav` flatten+href; ListRow/QR a11y; notif unread dot |
| 5 | `ScorePulse`; RemoteImage fallback; smoke + matrix + HANDOFF |

## Ključni pathovi

| Područje | Path |
|----------|------|
| Theme | `mobile/src/lib/theme-context.tsx` |
| i18n | `mobile/src/i18n/index.ts` |
| Search | `mobile/src/lib/search-nav.ts`, `mobile/app/search.tsx` |
| Skeleton | `mobile/src/components/ListSkeleton.tsx` |
| QR modal | `mobile/src/components/QrModal.tsx` |
| Score | `mobile/src/components/ScorePulse.tsx` |
| Smoke | `mobile/PREVIEW_SMOKE.md` |

## Sljedeća sesija

1. Manual smoke po `PREVIEW_SMOKE.md`
2. Git commit na eksplicitni zahtjev
3. Opciono: EAS preview / store

## Starter

Vidi [STARTER_PROMPT.md](./STARTER_PROMPT.md)
