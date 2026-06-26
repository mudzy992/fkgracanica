# HANDOFF — 24 Public Identity Refactor

> Ažurirano: **2026-06-26**

## Status
Faze F0–F7 implementirane lokalno. Build prolazi.

## Ključno novo
- **Fontovi:** Inter + Plus Jakarta Sans
- **Primitives:** `PageHeroHeader`, `PublicSection`, `PremiumCard`, `FormShell`, `EmptyState`
- **Layout:** `PublicFooter` (3 kolone, settings kontakt), `PublicNavItems` (i18n fallback)
- **Hero:** `ClubProfileHero` rebuild s `PublicHeroShell` + motion
- **Match:** `MatchScoreHero` shared komponenta
- **Sve javne stranice** refaktorisane na novi identitet

## Test
```bash
cd frontend && npm run build
```

Provjeri: `/`, `/vijesti`, `/kontakt`, `/sponzori`, `/utakmice/:id` na 375px.

## Sljedeće
- Deploy + korisnikov APPROVED (CHECKLIST gate)
- EN locale admin sekcija (opciono)
