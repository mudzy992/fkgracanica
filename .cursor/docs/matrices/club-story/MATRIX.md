# Club Story (`/o-klubu`)

## Surface
Public web documentary. CMS `ClubTimelineEvent` unchanged (admin + API year-desc). Public sorts ASC.

## Beats
| Beat | Component | Notes |
|------|-----------|-------|
| Cold open | `ClubStoryColdOpen` | `-mt-16`, grb, jedna rečenica, chevron |
| Scene | `ClubStoryChapter` + `ClubStoryChapterBg` | `min-h-dvh`, watermark year, parallax if image |
| HUD | `ClubStoryProgress` | IO `threshold ~0.45`; desktop right / mobile chips |
| Coda | `ClubStoryCoda` | CTA `/tim`, `/clanstvo` |
| Empty | `EmptyState` | After cold open if no events |

## Motion
- `framer-motion` + `useReducedMotion`: no parallax, no bounce, no HUD year exit
- Window scroll only — no nested overflow scroller, no scroll-jacking

## Responsive
375 / 768 / 1280 — no horizontal overflow. Copy `px-4 sm:px-6`, chapter `pt-24`.
