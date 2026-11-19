# B-05 — News — PLAN (2026-11-19, grana `arena/290a6f13-fkgracanica` @ `31701e0`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/news` (`NewsAdminPage` + `NewsEditorPage` `/:id/edit` + `/new`) — `app-routes.tsx` `ModuleRoute moduleKey="modules.news"` + `news.manage`/`news.submit`/`news.approve` |
| Fajl(ovi) | `pages/admin/NewsAdminPage.tsx` (184 lin) · `pages/admin/news/NewsEditorPage.tsx` (129 lin) · `pages/admin/news/NewsEditorMain.tsx` · `pages/admin/news/NewsEditorMeta.tsx` · `pages/admin/NewsCategoriesDialog.tsx` · `components/admin/AdminPageShell.tsx` (142 lin, nakon B-04 `isFetching/dataUpdatedAt/onRefresh/emptyRole`) · `hooks/use-news-admin.ts` (`useNewsCategories`/`useNewsById`/`useCreateNews`/`useUpdateNews`/`useUpdateNewsStatus`/`useSubmitNewsForReview`/`useDeleteNews`/`useCreate/DeleteNewsCategory`) · `hooks/index.ts` (`useNewsList` — već `staleTime30k retry1` nakon A-03) |
| Rola/permisije | `news.manage` (NewsAdminPage `canManage` za Kategorije/Nova, NewsEditor create/update) · `news.submit` (Predaj na pregled kad DRAFT && !canApprove) · `news.approve` (Odobri i objavi / Objavi) — rute gated `ModuleRoute`, akcije uslovno `canManage/canApprove ? : undefined`, čitanje dozvoljeno svima sa modulom |
| API | `GET /news?status=&categoryId=` (`useNewsList`) · `GET /news-categories` (`useNewsCategories`) · `GET /news/:id` (`useNewsById`) · `POST /news` · `PATCH /news/:id` · `PATCH /news/:id/status` · `PATCH /news/:id/submit` · `DELETE /news/:id` · `POST /news-categories` · `DELETE /news-categories/:id` |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `31701e0` (B-04 ZATVOREN 44479267958 6/6, A-07 6/6, B-02 6/6, B-03 44394740264 6/6, check:all 10/10, dead-guards 4/4) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`NewsAdminPage.tsx:11-184`:**
```
const canManage = hasPermission(news.manage), canApprove = news.approve, canSubmit = news.submit
const [categoryId, setCategoryId] = useState(''); const {data: categoriesRaw} = useNewsCategories() // bez isLoading/isError/isFetching/dataUpdatedAt
const categories = asArray(categoriesRaw)
const {data, isLoading, isError, refetch} = useNewsList(undefined, categoryId||undefined) // useNewsList ima staleTime30k retry1 (A-03), ali stranica ne koristi isFetching/dataUpdatedAt
const updateStatus = useUpdateNewsStatus(); const submitReview = useSubmitNewsForReview(); const deleteNews = useDeleteNews();
const [deleteTarget, setDeleteTarget] = useState(null); const [categoriesOpen, setCategoriesOpen] = useState(false);
publish = void runAction(updateStatus.mutateAsync({id, status:'PUBLISHED'})) // bez global disabled osim pojedinačnih dugmića
submit = void runAction(submitReview.mutateAsync(id))
archive = void runAction(updateStatus.mutateAsync({id, status:'ARCHIVED'})) // bez disabled
return <><Seo title=t('admin.news')/> <AdminPageShell isError={isError} onRetry={()=>void refetch()} title isLoading={isLoading} actions={Select kategorije + Button Kategorije + Link Nova}> <AdminDataTable rows={asArray(data)} empty="Nema vijesti..." columns=[title Link, category, status Badge, actions: Uredi Link + Predaj/Objavi/Odobri (disabled isPending) + Pregled Link + Arhiviraj Button + Obriši Button]> /> </AdminPageShell> <NewsCategoriesDialog> <ConfirmDialog open={!!deleteTarget} isPending={deleteNews.isPending}> />
// Nema isFetching/dataUpdatedAt/onRefresh/lastUpdated, nema aria-busy na tabeli, nema emptyRole, Arhiviraj/Obriši nisu disabled dok je updateStatus/deleteNews pending, Select kategorije nema disabled dok je categories isFetching
```

**`NewsEditorPage.tsx:11-129`:**
```
const {id}=useParams(); const isEdit = Boolean(id); const {data: item, isLoading} = useNewsById(id) // bez isError/isFetching/refetch, enabled: !!id, bez staleTime/retry/options
const create=useCreateNews(); const update=useUpdateNews(); const [error, setError]=useState(''); const form=useForm({resolver: zodResolver(newsFormSchema), defaultValues: emptyNewsForm})
const isDirty = formState.isDirty // Q-FE06-37 fix: pretplata na isDirty
useEffect if(item) reset(newsItemToForm(item))
requestBack = if(isDirty && !confirm) return; navigate('/admin/news')
onSubmit = setError(''); if(isInvalidChangedYouTubeUrl) setError; try { body=formToNewsBody(data, item?.videoUrl); if(isEdit) await update.mutateAsync({id,...body}); else created=await create.mutateAsync(body); navigate(...) } catch { setError(getApiErrorMessage) }
if(isEdit && isLoading) return <Skeleton className="h-96" />
return <><Seo title/> <div><Button ghost ← Vijesti onClick={requestBack}> + <h1>{isEdit? Uredi:Nova}> + <Button variant=outline Odustani> + <Button type=submit form="news-editor-form" disabled={isSubmitting}>{isEdit? Sačuvaj : Kreiraj}> </div> <form id="news-editor-form" onSubmit={handleSubmit(onSubmit)} grid lg:grid-cols-[1fr_20rem]><NewsEditorMain ...><NewsEditorMeta ...></form> {error ? <p role="alert">{error}</p> : null} </>
// Nema isError → role=alert + retry, nema aria-busy, nema lastUpdated/Osvježi, nema !title.trim() validacije (zod pokriva, ali disabled samo isSubmitting), nema isFetching/dataUpdatedAt na pozivaocu, nema enabled po permisiji (čitanje dozvoljeno)
```

**`NewsEditorMain/Meta`:** 2 kolone — title/content/excerpt/slug/cover/video/gallery/category + seo/schedule/tags/related — bez `aria-busy`, bez `disabled isPending`.

**`NewsCategoriesDialog.tsx`:** `useNewsCategories` + `useCreate/DeleteNewsCategory` — bez `isFetching`/`aria-busy`, bez `disabled isPending` na akcijama.

**Hookovi:**
- `useNewsList(status, categoryId, options?)` — **ima** `staleTime30k retry1 refetch false + ...options` (nakon A-03) — ok, ali stranica ne koristi `isFetching/dataUpdatedAt`.
- `useNewsCategories()` — `useQuery(['news-categories'], api.get('/news-categories'))` — **bez** `staleTime/retry/refetch false`, bez `options` overload, bez `enabled`.
- `useNewsById(id)` — `useQuery(['news','id',id], enabled: !!id)` — **bez** `staleTime/retry/refetch false`, bez `UseQueryOptions` overload.
- Ostali `use*News*` mutacije — `isPending` postoji ali se ne koristi za global disable (osim pojedinačnih dugmića `Predaj`/`Odobri`).

**Stanja danas:**
- `loading` → `AdminPageShell isLoading` renderuje 5× Skeleton (bez `aria-busy` na News wrapperu), `NewsEditorPage` skeleton `h-96` (sačuvan `Seo/h1`).
- `error` → `NewsAdminPage` ima `isError → DataError` sa `role=alert` preko shell-a, ali `Retry` nema `disabled={isFetching}` guard (shell ima ali stranica ne prosljeđuje `isFetching`); `NewsEditorPage` **nema** `isError` granu — pad `GET /news/:id` ostavlja prazan form bez `role=alert`.
- `empty` → `AdminDataTable` prazno je `Nema vijesti...` bez `role` (kao Gallery prije B-04) — nema `emptyRole="status"`.
- `forbidden` → akcije sakrivene (`canManage ? : undefined`), fetch se i dalje radi bez `enabled` (čitanje dozvoljeno, ok).
- `mutacija pending` → `Arhiviraj`/`Obriši` dugmad **nisu** `disabled` dok je `updateStatus/deleteNews.isPending` — dupli klik šalje dupli zahtjev.

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za news)

* **Korisnik:** editor/writer sa `news.manage`/`news.submit`/`news.approve` koji za <15s mora **vidjeti listu vijesti** (naslov, kategorija, status, akcije) filtriranu po kategoriji i **kreirati/uređivati/brisati** vijest, **predati na pregled / odobriti / arhivirati** bez gubitka konteksta, uz **jasne validacije** (naslov/content obavezno, YouTube URL validacija).
* **Ugovor:**
  * Čitanje: `modules.news` (ruta gate) — fetch uvijek, `staleTime 30s` da ne refetcha na svaki focus, `retry 1`, `refetchOnWindowFocus:false`, `UseQueryOptions` overload konzistentno sa `useNewsList`/`useGalleryDetail`/`useClubs`.
  * Mutacije: `news.manage` / `news.approve` / `news.submit` — akcije `disabled` dok `isPending`, `confirm` + `runAction` za grešku (već postoji na delete, ali ne na publish/archive/submit).
  * 4 stanja: `loading → skeleton aria-busy` (sačuvan `Seo/h1`), `error → role=alert + retry disabled isFetching`, `empty → role=status sa CTA`, `success → tabela`.
* **Ponašanje:**
  * `isLoading` → `AdminPageShell` skeleton sa `aria-busy="true"`, `isError` → `role=alert` + `Retry disabled={isFetching}` sa sačuvanim `Seo/h1`.
  * `!data` → `role=status` prazno (`Nema vijesti — kreirajte prvu.`).
  * `onDelete/onPublish/onArchive/onSubmit` → dugmad `disabled` dok je pripadni `isPending` + `aria-busy` na sekciji; `Select` kategorije disabled dok je `categories isFetching`.
  * `useNewsCategories`/`useNewsById` → `staleTime 30k`, `retry 1`, `refetchOnWindowFocus:false`, `UseQueryOptions` overload.
  * `Seo` title uvijek renderan, `h1` iz `AdminPageShell` mora ostati u DOM-u i na erroru.
  * `lastUpdated/Osvježi` ispod headera (`dataUpdatedAt` + `Button disabled isFetching`) kao B-02/B-03/B-04 i A-02..A-07.
* **A11y/i18n/perf:**
  * `AdminDataTable` prazno `emptyRole="status"` za News (kao Clubs/Players/Gallery), ne bez role.
  * Akcije `aria-label` već imaju `t('actions.delete')` implicitno preko `ConfirmDialog`, ali `Arhiviraj`/`Obriši` trebaju `disabled isPending`.
  * `t()` ključevi već postoje (`admin.news`, `admin.newsAdmin.*`, `admin.common.*`, `actions.*`) — ne dodavati nove bez potrebe.
  * 1 fetch po `news` / `news-categories` / `news/:id` sa `staleTime` da se ne refetcha na svaki tab focus.

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**P1-1 — `useNewsCategories`/`useNewsById` nemaju `staleTime/retry/refetchOnWindowFocus` ni `UseQueryOptions` overload — nekonzistentno sa `useNewsList`/`useGalleryDetail` (B-04) i `useClubs` (B-03)**
* Gdje: `hooks/use-news-admin.ts:15-30` `useNewsCategories()` i `useNewsById(id)` bez `staleTime`/`retry`; `hooks/use-news-admin.ts:55-65` `useNewsById` bez `options` spread.
* Zašto P1: svaki tab focus refetcha `/news-categories` i `/news/:id` sa default `retry 3`; nekonzistentno sa B-02/A-07/B-03/B-04 (`staleTime 30k retry1`). `useNewsById` prima `id` ali ne `UseQueryOptions`.
* Dokaz: `useNewsCategories` nema `...options`; `useNewsById` nema `staleTime`.

**P1-2 — `NewsAdminPage` `Arhiviraj`/`Obriši` + `publish`/`submit` djelimično nisu `disabled` dok je odgovarajući `isPending` — dupli klik šalje dupli zahtjev, nema `aria-busy`**
* Gdje: `NewsAdminPage.tsx:110-145` `Arhiviraj` Button bez `disabled`, `Obriši` Button bez `disabled` (ConfirmDialog ima `isPending` ali lista dugmad nema), `Select` kategorije bez `disabled={categoriesIsFetching}`.
* Zašto P1: korisnik može duplo kliknuti `Arhiviraj`/`Obriši` dok je zahtjev u toku; a11y nema `aria-busy`. `ClubsAdminPage` (B-03) već ima `disabled={remove.isPending}`, `GalleryAdminPage` (B-04) isto.
* Dokaz: `NewsAdminPage.tsx:132` `<Button size="sm" variant="ghost" onClick={() => archive(r)}>` bez `disabled`; `NewsAdminPage.tsx:135` `<Button onClick={() => setDeleteTarget(r)}>` bez `disabled`.

**P1-3 — `NewsAdminPage` nema `isFetching/dataUpdatedAt/onRefresh` ni `emptyRole` — nema `role=alert` + `retry disabled isFetching` za background refresh, `NewsEditorPage` nema `isError` granu**
* Gdje: `NewsAdminPage.tsx:44` `const {data, isLoading, isError, refetch} = useNewsList(...)` — samo `isLoading/isError`, bez `isFetching/dataUpdatedAt`; `AdminPageShell` prima samo `isLoading/isError/onRetry`; `NewsEditorPage.tsx:15` `const {data: item, isLoading} = useNewsById(id)` — samo `isLoading`.
* Zašto P1: admin na padu API-ja (`GET /news` 500) vidi `Nema vijesti` umjesto greške; `NewsEditorPage` pad `GET /news/:id` ostavlja prazan form bez `role=alert`. `GalleryEditorPage` (B-04) već ima `showInitialError` inline + `isFetching`/`dataUpdatedAt`.
* Dokaz: `NewsAdminPage.tsx:48` `<AdminPageShell isError={isError} onRetry={() => void refetch()} isLoading={isLoading}>` — nema `isFetching`; `NewsEditorPage.tsx:42` `if(isEdit && isLoading) return <Skeleton>` — nema error grane.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — `AdminPageShell isLoading` bez `isFetching` i `emptyRole` — prazno bez `role=status`, akcije nisu `aria-busy`**
* Gdje: `NewsAdminPage.tsx:48-55` `AdminPageShell isLoading={isLoading}`.
* Zašto P2: loading i error trebaju `aria-busy`/`role=alert` po sekciji, kao B-04; prazno treba `role=status`.
* Predlog: Q1 — da li dodati `lastUpdated/Osvježi` ispod headera i `emptyRole="status"`?

**P2-2 — `NewsEditorPage` `Button disabled={isSubmitting}` ne pokriva `create.isPending/update.isPending`, nema `lastUpdated/Osvježi`, `error` već `role=alert` ali nema `isFetching` guard**
* Gdje: `NewsEditorPage.tsx:55` `disabled={formState.isSubmitting}` — `create.isPending`/`update.isPending` nisu pokriveni; nema `isFetching`/`dataUpdatedAt`.
* Zašto P2: korisnik može duplo submitati dok je `create` pending ali `isSubmitting` false nakon validacije? `GalleryEditorPage` (B-04) ima `!title.trim() || create.isPending || update.isPending`.

**P2-3 — `useNewsCategories` se poziva bez `enabled` po permisiji — ok za čitanje, ali nema `lastUpdated`**
* Gdje: `NewsAdminPage.tsx:35` `useNewsCategories()` bez `dataUpdatedAt`.
* Zašto P2: admin ne zna koliko je lista svježa; `staleTime 30s` bez dugmeta je ok, ali dugme je standard za A-02..B-04.

**P2-4 — `NewsCategoriesDialog` nema `isFetching`/`aria-busy`**
* Gdje: `NewsCategoriesDialog.tsx` koristi `useNewsCategories` bez `isFetching`.

### P3 — UX/polish

**P3-1 — `NewsAdminPage` filter `Select` nema `aria-live` za broj rezultata nakon promjene kategorije.**

**P3-2 — `NewsEditorPage` `requestBack` koristi `window.confirm` umjesto `ConfirmDialog` (neblokirajući, i18n).**

---

## 4) Dokazi (file:line)

* `hooks/use-news-admin.ts:15-30` — `useNewsCategories`/`useNewsById` bez `staleTime/retry/options` — P1-1
* `NewsAdminPage.tsx:48-55` — `AdminPageShell` samo `isLoading/isError` bez `isFetching/dataUpdatedAt/onRefresh/emptyRole` — P1-3, P2-1
* `NewsAdminPage.tsx:110-145` — `Arhiviraj`/`Obriši` bez `disabled={updateStatus/deleteNews.isPending}` — P1-2
* `NewsEditorPage.tsx:15`, `42` — `useNewsById` samo `isLoading` bez `isError/isFetching` — P1-3
* `NewsEditorPage.tsx:55` — `disabled={isSubmitting}` bez `create/update.isPending` — P2-2
* `NewsCategoriesDialog.tsx` — nema `isFetching` — P2-4

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/hooks/use-news-admin.ts` (`useNewsCategories`, `useNewsById`) | Dodaj `UseQueryOptions` overload + `staleTime:30_000, retry:1, refetchOnWindowFocus:false, ...options` kao `useNewsList`/`useGalleryDetail` (B-04). `useNewsById` zadržava `id` kao prvi arg, drugi `options?` sa `enabled: !!id && (options?.enabled ?? true)`. | nizak | hook test: `enabled:false` ne fetch-a, `staleTime` |
| 2 | `frontend/src/pages/admin/NewsAdminPage.tsx` | a) `const {data, isLoading, isError, isFetching, dataUpdatedAt, refetch}=useNewsList(...)` + `const {data: categoriesRaw, isFetching: cf, dataUpdatedAt: cu} = useNewsCategories()` b) `AdminPageShell isError={isError} isFetching={isFetching||cf} onRetry={()=>void refetch()} isLoading dataUpdatedAt={dataUpdatedAt||cu} onRefresh={()=>void refetch()} emptyRole?` c) `AdminDataTable emptyRole="status"` d) `Arhiviraj`/`Obriši` `disabled={updateStatus.isPending||deleteNews.isPending}` (global disabled) + `aria-busy` na sekciji e) `Select` disabled kad `cf` | srednji | mock `isError:true` → `role=alert` + heading ostaje; `disabled isPending` |
| 3 | `frontend/src/pages/admin/news/NewsEditorPage.tsx` | a) `const {data: item, isLoading, isError, isFetching, dataUpdatedAt, refetch}=useNewsById(id)` b) `showInitialError = Boolean(id && isError && !item)` inline `role=alert` + `Retry disabled isFetching` sa sačuvanim `Seo/h1` (kao GalleryEditorPage B-04) c) `lastUpdated/Osvježi` ispod headera (`dataUpdatedAt` + `Button disabled isFetching`) d) `Button disabled={isSubmitting || create.isPending || update.isPending}` e) `error && <p role="alert">` već ok | srednji | `isError` alert + `isFetching` disabled; `lastUpdated` |
| 4 | `frontend/src/pages/admin/NewsCategoriesDialog.tsx` | Proslijedi `isFetching` za `aria-busy` na listi kategorija; dugmad `disabled={createCategory.isPending||deleteCategory.isPending}` | nizak | `disabled isPending` |
| 5 | `frontend/src/test/doubles/admin-shell-doubles.tsx` | Već ima `emptyRole` opt-in (B-03) — provjeri da `AdminPageShellDouble` podržava `emptyRole=status` za News (Gallery već koristi) | nizak | — |
| 6 | `frontend/src/pages/admin/fe06-b05-news.test.tsx` (novi, 7t) | 4 stanja: `isError→role=alert` + heading, `isLoading→aria-busy`, `empty→status`, `success→tabela` + `disabled isPending` + `lastUpdated/Osvježi` + `emptyRole` | — | — |
| 7 | `frontend/src/pages/admin/fe06-b05-news-form.test.tsx` (novi, 8t) | NewsEditorPage: `isError` inline alert + `isFetching` disabled + `lastUpdated` + `trim` validacija + `role=alert` na save error | — | — |
| 8 | `frontend/src/pages/admin/fe06-b05-news-categories.test.tsx` (novi, 6t) | CategoriesDialog: `isFetching aria-busy`, `disabled isPending` | — | — |
| 9 | `scripts/standards/baselines/file-size.txt` | Ako `NewsAdminPage.tsx` pređe 200 lin (184→~210) podigni baseline za 1 lin; `NewsEditorPage` 129→~150 ostaje ispod | — | `check:all` |
| 10 | `frontend/src/locales/bs+en/common.json` | Provjeri `admin.home.refresh/lastUpdated` + `admin.common.loadError` već postoje — ne treba novi ključ | — | — |

**Šta se NE dira:** `NewsEditorMain`/`NewsEditorMeta` direktno (osim `disabled` prosljeđivanja), `NewsFormUtils` zod schema, `backend` moduli, `router` gating (`ModuleRoute`), `NewsCategoriesDialog` validacija (ostaje `trim`).

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `enabled` po permisiji za čitanje:** odbačeno — `modules.news` već gate-a rutu, ali `useNewsCategories` bez `staleTime` fetch-a i na svaki focus.
* **Ne skrivati `Seo/h1` na erroru:** odbačeno — gubitak naslova i SEO; pattern sačuvanog headera je standard A-02..B-04.
* **Jedan globalni `AdminPageShell isLoading` vs po sekciji za News:** News ima jednu listu (za razliku od Media dvije), pa je global OR dovoljan — `isFetching` za disable dovoljan.
* **News prazno `emptyRole`:** treba `status` (kao Gallery/Clubs/Players), ne bez role (Media izuzetak zbog upload progress).
* **Form validacija `isSubmitting` vs `isPending`:** može i bez, ali `isPending` štiti od duplog klika dok je mutacija u toku.

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P1-1..P1-3 zatvoreni + testovi koji padaju bez fixa (`isError → role=alert` + naslov ostaje + `disabled isFetching`; `staleTime/retry` na `useNews*`; `Arhiviraj`/`Obriši` `disabled isPending` + `aria-busy`)
- [ ] P2-1..P2-4 zatvoreni: `UseQueryOptions` overload, `isLoading` `aria-busy`, `lastUpdated/Osvježi`, `emptyRole="status"`, `NewsEditor` inline error
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin/news` i `/admin/news/:id/edit`
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za admina sa `news.manage`/`news.approve` (lista + editor + kategorije)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `lastUpdated`/`Osvježi`:** Da li `NewsAdminPage` i `NewsEditorPage` trebaju `Osvježi` dugme + `lastUpdated` ispod headera (kao B-04 Gallery i B-03 Clubs/Players), ili samo `staleTime` bez dugmeta? Predlažem **dugme + lastUpdated** (`NewsAdminPage` `dataUpdatedAt` + `categoriesUpdatedAt` max, `NewsEditorPage` `dataUpdatedAt`).

**Q2 — `delete`/`publish`/`archive`/`submit` `disabled`:** Da li `Arhiviraj`/`Obriši`/`Objavi`/`Predaj` dugmad trebaju biti `disabled` dok je bilo koji pending (`updateStatus || deleteNews || submitReview` global) ili odvojeno po tipu? Predlažem **global** za NewsAdmin (kao B-04 Gallery `publish||remove` global) da spriječi dupli klik na različite akcije dok jedna traje.

**Q3 — `NewsEditorPage` validacija:** Da li `Naslov`/`Sadržaj` trebaju `trim` provjeru za `disabled` (kao Gallery `!title.trim()`) ili je dovoljno `zod` + `isSubmitting`? Predlažem **ostaviti `isSubmitting` + `create/update.isPending`** bez dodatnog `trim` disable, jer `zod` već validira i `NewsForm` je složeniji od galerije (više polja).

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija B-05 po tabeli iznad — jedan PR, `gh run watch` do `6/6`.
