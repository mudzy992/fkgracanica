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
- `PermissionsGuard` + `@RequirePermissions()` on admin routes
- JWT payload includes `permissions[]` from user's roles

## Changelog

- 2026-06-24: Initial RBAC seed with 5 roles and permission keys
