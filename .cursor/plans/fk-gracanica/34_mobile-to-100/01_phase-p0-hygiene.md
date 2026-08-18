# Faza 01 — P0 higijena

Brzi bugovi. Ne širiti na P1 dok ovo nije DONE.

## Stavke

| # | Fajl | Sad | Meta | Fix |
|---|------|-----|------|-----|
| 1 | `mobile/app/staff/moderation.tsx` | 65 | ~75 | Reject ≠ archive (odvojeni status/endpoint) |
| 2 | `mobile/app/gallery/[slug].tsx` | 41 | ~55 | i18n BS/EN, ScreenEmpty retry, error state |
| 3 | `mobile/app/staff/index.tsx` | 74 | ~80 | `t()` za 3 hardcoded labele |
| 4 | `mobile/app/staff/admin/validate.tsx` | 58 | ~72 | i18n + try/catch; parsed card umjesto raw JSON |

## Done when

- `tsc --noEmit` PASS
- Fajlovi ≤200
- HANDOFF + CHECKLIST

**DONE 2026-08-17.** Reject=`DRAFT`. Gallery i18n+retry. `noStaffAccess`. Validate parsed card.

Lightbox na gallery album = P1 (faza 02), ne ovdje osim ako stane u isti fajl bez prekoračenja 200.
