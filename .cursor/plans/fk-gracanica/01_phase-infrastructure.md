# Faza 1 — Infrastruktura

## Cilj

Monorepo scaffold, auth, RBAC, Settings Registry, notifikacije, Socket.IO stub, Expo scaffold.

## Backend moduli

PrismaModule, AuthModule, UsersModule, RbacModule, SettingsModule, UploadModule, NotificationsModule, AuditModule, RealtimeModule, HealthModule

## Prisma modeli (F1)

User, Role, Permission, UserRole, RolePermission, RefreshToken, Setting, Notification, AuditLog, MediaAsset

## API rute

- `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`
- `GET/PUT /api/v1/settings/public`, `GET/PUT /api/v1/settings/private`
- `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read`
- `GET /api/v1/health`, Swagger `/api/docs`

## Frontend

Admin login, settings UI, layout sa drawer na mobile, design tokens, i18n BS

## Mobile

Splash, Login, Home placeholder, Notifications stub

## Testovi

Auth unit, RBAC guard integration

## Exit

Admin login, settings promjena, mobile API konekcija, audit log na login, Swagger radi.
