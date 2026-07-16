# HANDOFF — Mobile Production Parity

> **Status:** CLOSED  
> **Plan:** `.cursor/plans/fk-gracanica/28_mobile-production-parity/`

## Deliverables

- Full role parity vs web (guest → admin), excluding CMS builder/menu and web-only UIs
- Public, member, writer, live desk, mod/admin ops, entity CRUD screens
- Store hardening (Phase 7):
  - `eas.json`: production `app-bundle`, preview APK (internal), development APK
  - `app.json`: `usesCleartextTraffic: false`, `minSdkVersion: 26`, `buildArchs: arm64-v8a + armeabi-v7a`
  - `mobile/.env.example` + `.env` gitignored
  - `PRODUCTION_SMOKE.md` store checks updated

## Next steps (owner)

1. Device smoke: walk `mobile/PRODUCTION_SMOKE.md` against staging/prod API
2. `eas build --profile production` (AAB) when credentials ready
3. Submit to Play Store on request (`eas submit --profile production`)
4. Optional: `eas build --profile preview` for internal APK QA
