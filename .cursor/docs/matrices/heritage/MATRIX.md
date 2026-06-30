# Heritage Matrix (Hall of Fame + Muzej)

## Hall of Fame

| Površina | Putanja | Scope |
|----------|---------|-------|
| Javno | `/hall-of-fame` | Grid kartica, filter po godini |
| Admin | `/admin/hall-of-fame` | CRUD, slika, rich text |
| API | `/hall-of-fame` | Javno GET; admin POST/PATCH/DELETE |

- RBAC: `hall-of-fame.manage`
- Polje `years` (String) — filter po godini na javnoj stranici
- `PermissionRoute` na admin ruti

## Changelog

- 2026-06-30: Gate #17 polish — `years` migracija, admin forma, EmptyState, PermissionRoute, seed
- 2026-06-29: Gate #17–#18 READY_FOR_REVIEW

## Muzej

| Površina | Putanja | Scope |
|----------|---------|-------|
| Javno | `/muzej` | Grid predmeta, filter kategorija |
| Admin | `/admin/museum` | CRUD, slika, kategorija, godina |
| API | `/museum` | Javno GET; admin POST/PATCH/DELETE |

- RBAC: `museum.manage`
- `PermissionRoute` na admin ruti
- Kategorije: label map (`museum-categories.ts`)

## Changelog

- 2026-06-30: Gate #17 **APPROVED**; Gate #18 polish — EmptyState, PermissionRoute, category labels, seed
- 2026-06-30: Gate #17 polish — `years` migracija, admin forma, EmptyState, PermissionRoute, seed
- 2026-06-29: Gate #17–#18 READY_FOR_REVIEW
