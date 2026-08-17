# RBAC Matrix

## Roles

| Role | Scope |
|------|-------|
| Administrator | Full system access including Settings Registry |
| Moderator | Content + match approval, no Settings |
| Writer | Create news/gallery → PENDING |
| Komentator | Live match management |
| Član | Profile, comments, membership, tickets |

## Permission model

- Permissions stored as `key` strings (e.g. `news.manage`, `settings.manage`)
- `PermissionsGuard` + `@RequirePermissions()` (AND) / `@RequireAnyPermission()` (OR)
- JWT payload includes `permissions[]` from user's roles

## Media

- `media.read` — pregled biblioteke (Writer + Moderator + Admin)
- `media.upload` — nova mapa + upload (Writer + Moderator + Admin)
- `media.manage` — rename/delete/replace (Moderator + Admin)
- Writer ne objavljuje fajlove; javni gate ostaje `gallery.approve` / `news.approve`

## Changelog

- 2026-08-17: `media.read` / `media.upload`; Writer vidi biblioteku i uploaduje; brisanje ostaje manage
- 2026-06-24: Initial RBAC seed with 5 roles and permission keys
