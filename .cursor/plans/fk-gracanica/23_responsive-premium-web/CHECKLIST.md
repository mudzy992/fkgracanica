# Responsive Audit CHECKLIST

Test na 375px / 768px / 1280px. Bez horizontalnog overflowa.

| Ruta | P0 | 375 | 768 | 1280 | Napomena |
|------|----|-----|-----|------|----------|
| `/` | | | | | CMS widgets + AnimatedSection |
| `/o-klubu` | ✓ | | | | Mobile scroll-snap, no rail |
| `/tim` | ✓ | | | | Vertical pitch |
| `/klub/:slug` | ✓ | | | | Vertical pitch |
| `/liga` | | | | | Table scroll / mobile cards |
| `/utakmice/:id` | | | | | Scoreboard |
| `/live/:id` | | | | | Live layout |
| `/igrac/:id` | | | | | Stat grid |
| `/vijesti` | | | | | Grid cols |
| `/vijesti/:slug` | | | | | Hero image |
| `/galerija` | | | | | Grid |
| `/galerija/:slug` | | | | | Lightbox |
| `/sponzori` | | | | | Marquee |
| `/trofeji` | | | | | Cards |
| `/hall-of-fame` | | | | | Grid |
| `/muzej` | | | | | Grid |
| `/kontakt` | | | | | Form |
| `/clanstvo` | | | | | Form |
| `/ulaznice` | | | | | Form |
| `/pretraga` | | | | | Results |
| `/p/*` | | | | | CMS dynamic |
