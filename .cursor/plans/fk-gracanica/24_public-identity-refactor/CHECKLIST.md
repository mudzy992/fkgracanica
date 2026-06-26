# Public Identity Refactor — CHECKLIST

Test: 375px / 768px / 1280px, dark mode spot-check, `prefers-reduced-motion`.

| Ruta | Hero | PremiumCard | Motion | Status |
|------|------|-------------|--------|--------|
| `/` | CMS HeroWidget | widgets | AnimatedSection | done |
| `/o-klubu` | ClubProfileHero | TimelineEventCard | motion + snap | done |
| `/tim` | ClubProfileHero | pitch + cards | motion | done |
| `/klub/:slug` | ClubProfileHero | sections | motion | done |
| `/liga` | inline | LeagueStandingsMobile | — | done |
| `/utakmice/:id` | MatchScoreHero | events | — | done |
| `/live/:id` | MatchScoreHero | events | pulse | done |
| `/igrac/:id` | header | stat cards | — | done |
| `/vijesti` | PageHeroHeader | PremiumCard | Reveal | done |
| `/vijesti/:slug` | cover gradient | PremiumCard | — | done |
| `/galerija` | PageHeroHeader | PremiumCard | Reveal | done |
| `/galerija/:slug` | title | lightbox | — | done |
| `/sponzori` | PageHeroHeader | tier tiles | — | done |
| `/trofeji` | PageHeroHeader | TrophyCard | Reveal | done |
| `/hall-of-fame` | PageHeroHeader | PremiumCard | Reveal | done |
| `/muzej` | PageHeroHeader | PremiumCard | Reveal | done |
| `/kontakt` | PageHeroHeader | FormShell | Reveal | done |
| `/clanstvo` | PageHeroHeader | FormShell | — | done |
| `/ulaznice` | PageHeroHeader | FormShell | — | done |
| `/pretraga` | PageHeroHeader | search shell | — | done |
| `/p/*` | CMS | widgets | AnimatedSection | done |

## Gate F7
- [x] `npm run build` prolazi
- [ ] Korisnik APPROVED na produkciji
