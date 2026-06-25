# Faza 1 — Data model + Widget Registry + API

## Backend

### Prisma migracija
- Dodati: `CmsPage`, `CmsPageSection`, `CmsMenu`, `CmsMenuItem`
- `CmsBlock` — ostaviti privremeno, označiti deprecated u seedu

### API (`backend/src/cms/`)
| Endpoint | Auth | Opis |
|----------|------|------|
| `GET /cms/pages` | public (published) / admin (all) | Lista |
| `GET /cms/pages/:slug` | public | Stranica + sekcije |
| `POST/PATCH/DELETE /cms/pages` | cms.manage | CRUD |
| `POST/PATCH/DELETE /cms/pages/:id/sections` | cms.manage | Sekcije |
| `PATCH /cms/pages/:id/sections/reorder` | cms.manage | sortOrder |
| `GET /cms/menus/:key` | public | Meni |
| `PUT /cms/menus/:key` | cms.manage | Cijeli meni |

### Widget registry (`backend/src/cms/widgets/`)
- `registry.ts` — mapa tip → Zod schema + meta (label, category, icon)
- Validacija `config` pri save sekcije

## Frontend

### `frontend/src/cms/widgets/`
```
registry.ts          # export widget meta + schemas
types.ts             # CmsPage, CmsPageSection, WidgetConfigMap
HeroWidget.tsx       # public render (izvući iz Hero.tsx)
NewsFeedWidget.tsx   # iz LatestNews.tsx
...
```

### Hooks
- `useCmsPage(slug)`, `useCmsPages()`, admin mutations

## Seed
- `home` stranica sa sekcijama = trenutni `HomePage` redoslijed
- Hero config sa CTA: `[{label:"Sljedeća utakmica",url:"/liga"},{label:"Vijesti",url:"/vijesti"}]`
- `main` meni = trenutni `navItems`

## Exit
- API vraća home stranicu sa widget sekcijama
- Postojeći `CmsBlock` API radi (backward compat)
