---
name: Mobile staff 82→100
overview: Dovesti `mobile-staff` modul sa 82% na 100% rješavanjem konkretnih funkcionalnih i UX gap-ova u Writer, Moderation i Ulaz tokovima, te ažuriranjem catalog summary-ja.
todos:
  - id: be-archive-service
    content: "BE: news.service.ts — dodati archiveOwn(id, userId) metodu"
    status: completed
  - id: be-archive-endpoint
    content: "BE: news.controller.ts — PATCH /:id/archive sa news.submit permissionom"
    status: completed
  - id: mobile-writer-hook
    content: "Mobile: use-writer-editor.ts — dodati archive() metodu"
    status: completed
  - id: mobile-writer-ui
    content: "Mobile: writer/[id].tsx — dugme 'Obriši draft' za DRAFT status"
    status: completed
  - id: mobile-mod-scroll
    content: "Mobile: ModerationPreviewSheet.tsx — ScrollView unutar sheeta"
    status: completed
  - id: mobile-mod-alert
    content: "Mobile: moderation.tsx — Alert confirm za live match approve"
    status: completed
  - id: catalog-update
    content: catalog-modules.ts — percent 82→97, ažurirati summary
    status: completed
  - id: matrix-changelog
    content: MATRIX/CHANGELOG — zabilježiti zatvorene gap-ove
    status: completed
isProject: false
---

# Mobile staff: 82% → 100%

## Zašto je na 82%

`catalog-modules.ts` linija 38 — summary i percent su ručno postavljeni u Tracku 34/35. Komentator/events/live broadcast su urađeni u Tracku 36, ali ovi flow-ovi imaju **stvarne funkcionalne gap-ove** koji su razlog niskog procenta:

---

## Gap analiza

### Gap 1 — Writer: nema brisanja vlastitog drafta
- `DELETE /news/:id` na BE zahtijeva `news.manage`; Writer ima samo `news.submit`
- Na mobilnom nema ni UI ni BE podrške za brisanje drafta od strane autora
- **Fix**: BE — dodati `PATCH /news/:id/archive` (ili status na ARCHIVED) sa permissionom `news.submit` + UI akcija na listi

### Gap 2 — Writer: WriterList nema swipe/long-press akciju
- Lista prikazuje titl + status, bez ikakve sekundarne akcije (samo tap → editor)
- Nema načina da se draft obriše/arhivira bez ulaska u editor, a ni editor nema delete
- **Fix**: dugme "Obriši draft" u editoru (za DRAFT status, uz confirmation), poziva `DELETE /news/:id` — ali tada BE treba dozvoliti `news.submit` za brisanje **vlastitih** vijesti

### Gap 3 — Moderation: PreviewSheet nema ScrollView
- [`ModerationPreviewSheet.tsx:28`](mobile/src/components/staff/ModerationPreviewSheet.tsx) — Modal bez ScrollView-a; ako je excerpt dug, sadržaj je odsječen
- **Fix**: obaći unutrašnji `View` u `ScrollView`

### Gap 4 — Moderation: live match approve/reject nema warning
- Live match approve je ireverzibilan (objavljuje statistike igrača), ali nema `Alert.alert` confirmacije
- **Fix**: `Alert.alert(t('approveMatchConfirm'), ..., buttons: Cancel + Confirm)` u `moderation.tsx` za `kind === 'live'`

### Gap 5 — Summary string zastarjeo
- `catalog-modules.ts:38` kaže "Komentator desk + live broadcast + events sheet" kao pending — ali sve to radi od Tracka 36
- Percent treba popeti na 97 (ne 100 jer delete/archive vijesti zahtijeva i BE promjenu i testiranje)

---

## Izmjene po fajlu

### BE — [`backend/src/news/news.controller.ts`](backend/src/news/news.controller.ts)
- Linija ~107: dodati novi endpoint `PATCH /:id/archive` sa `@RequirePermissions('news.submit')` koji poziva `newsService.archiveOwn(id, user.id)` (provjerava da je `authorId === user.id` i da je status `DRAFT`)

### BE — [`backend/src/news/news.service.ts`](backend/src/news/news.service.ts)
- Dodati `archiveOwn(id, userId)`: provjeri `authorId`, provjeri `status === DRAFT`, postavi status na `ARCHIVED`

### Mobile — [`mobile/src/components/writer/use-writer-editor.ts`](mobile/src/components/writer/use-writer-editor.ts)
- Dodati `archive()` metodu: `api.patch('/news/:id/archive')` + Alert confirm + navigate back

### Mobile — [`mobile/app/staff/writer/[id].tsx`](mobile/app/staff/writer/%5Bid%5D.tsx)
- Ako `!editor.isNew && editor.article.status === 'DRAFT'` → prikaži "Obriši draft" dugme koje poziva `editor.archive()`

### Mobile — [`mobile/src/components/staff/ModerationPreviewSheet.tsx`](mobile/src/components/staff/ModerationPreviewSheet.tsx)
- Linija 29: `<View style={styles.sheet}>` → `<ScrollView style={styles.sheet} contentContainerStyle={{ gap: spacing.sm }}>` (bez promjene visine)

### Mobile — [`mobile/app/staff/moderation.tsx`](mobile/app/staff/moderation.tsx)
- U `setStatus` za `kind === 'live'` i `status === 'PUBLISHED'`: omotati u `Alert.alert` confirmation prije API poziva

### Catalog — [`backend/src/showcase/catalog-modules.ts`](backend/src/showcase/catalog-modules.ts)
- Linija 38: `percent: 82` → `percent: 97`, ažurirati summary da reflektuje stvarno stanje

### Matrix — [`.cursor/docs/matrices/live_center/MATRIX.md`](.cursor/docs/matrices/live_center/MATRIX.md)
- Zabilježiti da je mobile-staff gap zatvoren u ovoj sesiji

---

## Redosljed izvršavanja

1. BE: `archiveOwn` service metoda + controller endpoint
2. Mobile writer: `archive()` u hooku + dugme u editoru
3. Mobile moderation: ScrollView u sheetu + Alert za live approve
4. Catalog: ažurirati percent + summary
5. Matrix: CHANGELOG entry
