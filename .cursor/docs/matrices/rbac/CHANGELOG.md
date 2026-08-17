# Changelog — RBAC

## 2026-08-17

- `media.read` / `media.upload`; Writer vidi biblioteku i uploaduje u mape; `media.manage` ostaje brisanje/zamjena
- `@RequireAnyPermission` (OR) uz postojeći AND guard

## 2026-06-24 (b)

- `news.submit` permission; Writer role može predati vijest na pregled (`PATCH /news/:id/submit`)
- Login response uključuje `permissions[]` za frontend RBAC UI

## 2026-06-24

- Initial matrix: 5 roles, permission-based guards
