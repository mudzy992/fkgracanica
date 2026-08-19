# Changelog — showcase-audit

## 2026-08-19 (mobile-staff gap closure)

- BE: `archiveOwn(id, authorId)` u `news.service.ts` — Writer može arhivirati vlastiti DRAFT (`news.submit` perm)
- BE: `PATCH /news/:id/archive` endpoint, zaštićen sa `news.submit`
- Mobile writer: `archive()` u `use-writer-editor.ts` + dugme "Obriši nacrt" u `writer/[id].tsx` (prikazuje se samo za DRAFT)
- Mobile moderation: `ModerationPreviewSheet` obavijena `ScrollView` (maxHeight 75%) — dugački excerptovi više nisu odsječeni
- Mobile moderation: live match approve potvrđen `Alert.alert` confirmation (`approveMatch`/`doApproveMatch`) — ireverzibilna akcija zaštićena
- i18n: `writerArchive`, `writerArchiveConfirm` (BS+EN); `approveMatchTitle`, `approveMatchConfirm` (BS+EN)
- catalog-modules.ts: mobile-staff 82 → 97, summary ažuriran

## 2026-08-19

- git pull eac5821: admission scan (Redar), komentator desk polish, live broadcast HUD, events sheet, YouTube orientation
- Nova showcase rola `redar` dodana u catalog-roles.ts
- mobile-staff: 70 → 82, mobile-polish: 69 → 72
- rbac/dashboard summary update — šest uloga, Redar validate panel
- MODULES.md rescore + otvorene stavke sa sljedećim koracima

## 2026-08-17

- Track 34 P0+P1: public ~78%, staff ~71%. Reject=`DRAFT`; news/heritage/gallery/search/CMS/live/membership.
- Track 33 faza 6: `video-highlights` 100 ready
- Track 33 faza 5: `pwa` 100 ready
- Track 33 faza 4: `financial-export` 100 ready (Excel/PDF)
- Track 33 faza 3: `monri` 100 ready (WebPay v2)
- Track 33 faza 2: `paypal` 100 ready

## 2026-08-16

- Track 32 web/admin: 19 ready + 3 web_only na 100; analytics/email/newsletter ~90; i18n-en ~60

## 2026-08-15

- Prvi code-review audit (nije device smoke)
- Rubrika F40+V40+H20
- 23 public ekrana, prosjek 69%; vizuel 53%
- 24 staff ekrana, prosjek 70%
- Katalog % upisan u catalog-modules.ts
- Spot-check: heritage dump, gallery hardcoded BS, moderation reject=archive, analytics bez H2H, PWA manifest+sw postoje
