# Phase 1 — Foundation

## Cilj

Stabilizovati `mobile/` na Expo SDK 57 i uvesti shell koji podržava public/member/staff tokove bez velikog refaktora postojećih v1 ekrana.

## Target

- `mobile/package.json`
- `mobile/app.json`
- `mobile/app/_layout.tsx`
- `mobile/app/(tabs)/_layout.tsx`
- `mobile/src/lib/auth.tsx`
- `mobile/src/lib/api.ts`
- `mobile/src/lib/theme.ts`
- `mobile/src/hooks/use-module-flags.ts`
- novi `mobile/app/staff/**`
- novi `mobile/src/components/primitives/**`

## Deliverables

- SDK 57 dependency upgrade
- notification/device/image plugins i config scaffold
- shared screen/list/button primitives
- public/member/staff information architecture
- `permissions[]` u auth user modelu
- `hasPermission()` helper i staff gate

## Gate

- App boot bez type errors
- postojeći v1 flow i dalje radi
- staff entry se vidi samo staff korisnicima
