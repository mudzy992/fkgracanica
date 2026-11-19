# B-04 — Gallery / Media — PLAN (2026-11-18, grana `arena/290a6f13-fkgracanica` @ `9eeda51`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/gallery` (`GalleryAdminPage` + `GalleryEditorPage` `/:id/edit`) i `/admin/media` (`MediaPage`) — `app-routes.tsx` `ModuleRoute moduleKey="modules.gallery"` / `modules.media` + `gallery.manage`/`media.manage` |
| Fajl(ovi) | `pages/admin/GalleryAdminPage.tsx` (110 lin) · `pages/admin/gallery/GalleryEditorPage.tsx` (127 lin) · `pages/admin/GalleryAdminPhotos.tsx` (79 lin) · `pages/admin/MediaPage.tsx` (198 lin) · `pages/admin/MediaAssetFormSheet.tsx` (117 lin) · `pages/admin/media/MediaPageAssetsSection.tsx` (94 lin) · `pages/admin/media/MediaAssetsGrid.tsx` / `MediaAssetsTable.tsx` · `pages/admin/media/MediaFolderSheet.tsx` (58 lin) · `pages/admin/media/MediaPageToolbar.tsx` (160 lin) · `components/admin/MediaFolderTree.tsx` · `components/admin/AdminPageShell.tsx` (137 lin, nakon B-03 `isFetching/dataUpdatedAt/onRefresh/emptyRole`) · `hooks/use-content-admin.ts` (`useGalleryAdminList`/`useGalleryDetail`/`useCreateGallery`/`useUpdateGallery`/`useDeleteGallery`/`useUpdateGalleryStatus`/`useAddGalleryPhoto(s)`/`useRemoveGalleryPhoto`/`useReorderGalleryPhotos`) · `hooks/use-media-admin.ts` (`useMediaFolders`/`useMediaAssets`/`useCreateMediaFolder`/`useUpdateMediaFolder`/`useDeleteMediaFolder`/`useUploadMedia`/`useUpdateMediaAsset`/`useDeleteMedia`/`useReplaceMedia`) |
| Rola/permisije | `gallery.manage` (GalleryAdminPage `canManage`) + `gallery.approve` (`canApprove` za Objavi) ; `media.manage` / `media.upload` (`useMediaLibraryAccess` → `canManage`/`canUpload`) — rute gated `ModuleRoute`, akcije uslovno `canManage ? : undefined`, čitanje dozvoljeno svima sa modulom |
| API | `GET /gallery` (`useGalleryAdminList`) · `GET /gallery/:id` (`useGalleryDetail`) · `POST/PATCH/DELETE /gallery/:id` · `POST /gallery/:id/status` · `POST /gallery/:id/photos` / `DELETE .../photos/:photoId` / `POST .../photos/reorder` ; `GET /media/folders` · `GET /media/assets?folderId=&page=&search=` · `POST /media/folders` · `PATCH /media/folders/:id` · `DELETE /media/folders/:id` · `POST /media/upload` · `PATCH /media/assets/:id` · `DELETE /media/assets/:id` · `POST /media/assets/:id/replace` |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `9eeda51` (B-03 ZATVOREN 44394740264 6/6, A-07 6/6, B-02 6/6, check:all 10/10, dead-guards 2/2) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`GalleryAdminPage.tsx:11-110`:**
```
const canManage = hasPermission(gallery.manage)
const canApprove = hasPermission(gallery.approve)
const {data, isLoading, isError, refetch} = useGalleryAdminList() // staleTime 30k nakon B-03? useGalleryAdminList ima 30k, ali stranica ne koristi isFetching/dataUpdatedAt
const publish = useUpdateGalleryStatus(); const remove = useDeleteGallery();
onDelete = confirm → if(ok) void runAction(remove.mutateAsync(id)) // isPending se ne koristi za disable
return <><Seo title=t('admin.gallery')/> {dialog} <AdminPageShell isError={isError} onRetry={()=>void refetch()} title isLoading={isLoading} actions={canManage? Link Nova}> <AdminDataTable rows={data??[]} columns=[title Link, status Badge, actions: edit Link + publish Objavi + delete Trash]> /> </AdminPageShell></>
// Nema isFetching/dataUpdatedAt/onRefresh/lastUpdated, nema aria-busy na tabeli, nema emptyRole, akcije nisu disabled dok je remove/publish pending
```

**`GalleryEditorPage.tsx:25-127`:**
```
const {id}=useParams(); const create=useCreateGallery(); const update=useUpdateGallery();
const {data: detail, isLoading} = useGalleryDetail(id) // bez isError/isFetching/refetch, enabled: !!id, bez staleTime
const [title, description, error]=useState; const touched=useRef({id,title:false,description:false})
useEffect sync lastServerFields ↔ detail (v8 ignore)
save: setError(''); try { if(id) await update.mutateAsync({id,title,description||undefined}); else created=await create.mutateAsync(...); navigate(...) } catch { setError('Spremanje nije uspjelo.') }
if(id && isLoading) return <Skeleton className="h-96" />
return <><Seo title/> <Link ← Galerija> <h1>{id? Uredi:Nova}> {status} + <Link Nazad> + <Button disabled={!title || create.isPending || update.isPending} onClick=>void save()>...
  <Input value=title onChange={markTouched+setTitle} placeholder=titleRequired> <Textarea value=description ...>
  {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null} // bez role=alert, bez trim validacije, disabled ne pokriva !title.trim()
  {id ? <GalleryPhotoPicker galleryId existingPaths> <GalleryAdminPhotos photos> : <p>{t(afterCreate)}</p> }
```
- Nema `isError → role=alert + retry`, nema `aria-busy`, nema `lastUpdated/Osvježi`, nema `!title.trim()` validacije, error nema `role=alert`, photo picker ne poštuje `canManage` gating.

**`GalleryAdminPhotos.tsx:11-79`:**
```
const removePhoto=useRemoveGalleryPhoto(); const reorder=useReorderGalleryPhotos();
move: reorder.mutateAsync({galleryId, photoIds}) // void runAction, bez disabled dok je reorder pending
if(!photos.length) return <p className="text-sm text-text-muted">{t(galleryPhotos.empty)}</p> // bez role=status
return grid figure img + caption + hover Buttons: moveUp disabled={index===0} (ne i reorder.isPending), moveDown disabled={index===len-1}, delete void runAction(removePhoto...) // bez disabled={removePhoto.isPending || reorder.isPending}
```

**`MediaPage.tsx:22-198`:**
```
const {canUpload, canManage}=useMediaLibraryAccess(); const uploadRef/replaceRef, [folderId], [newFolder], [search/debouncedSearch 300ms], [page], [editAsset], [copied]
const selection=useMediaSelection(); const {enqueue, retryRefresh, clearReport, state: uploadState}=useMediaUploadQueue(user?.id)
const {data: foldersRaw, isLoading: fl}=useMediaFolders() // bez isError/isFetching/dataUpdatedAt
const folders=asArray(foldersRaw)
const globalSearch=!!debouncedSearch
const {data, isLoading: al}=useMediaAssets({folderId: globalSearch?undefined:folderId, page, search}) // bez isError/isFetching/dataUpdatedAt
assets=data?.data ?? []; visibleIds
createFolder/updateFolder/deleteFolder/replace/remove = hooks // isPending se ne koristi za global disable osim isCreating za folder
onDelete/onFolderDelete confirm → void runAction(remove/deleteFolder...)
return <><Seo title=t(admin.media)/> {dialog} <MediaPageFileInputs .../> <AdminPageShell title isLoading={fl||al}> // OR, bez isError/onRetry/isFetching/dataUpdatedAt/onRefresh
  <MediaPageToolbar search/globalSearch/debouncedSearch/totalResults/folderId/selectedFolderName/selectionMode/selectedCount/visibleCount/uploadDisabled ... uploadProgress={uploadState} onRetryUploadRefresh={retryRefresh} onClearUploadReport={clearReport} canUpload/canManage />
  {canUpload ? <MediaUploadZone folderId onFiles> : null}
  <div grid lg:grid-cols-[240px_1fr]><MediaFolderTree hidden lg:block> <MediaPageAssetsSection assets empty={emptyMediaMessage(...)} copied folders selectionMode ... onReplace/onDelete/onEdit gated canManage ... meta page onPageChange> /></div>
</AdminPageShell> <MediaFolderSheet open... {...folderTreeProps}> <MediaAssetFormSheet asset editAsset>
```
- `AdminPageShell` dobija samo `isLoading={fl||al}` — OR briše obje sekcije (folder stablo + assets) kad jedan fetch-a; nema `isError`/`role=alert`/`retry disabled isFetching`; nema `lastUpdated/Osvježi`; nema `isFetching`/`aria-busy` na grid/tabela; upload queue ima svoj `uploadState` ali tabela nema `isFetching`.
- `MediaFolderTree` / `MediaPageToolbar` / `MediaPageFileInputs` nisu direktno vezani na `isFetching`.

**`MediaAssetFormSheet.tsx:14-117`:**
```
const {data: foldersRaw}=useMediaFolders(); const update=useUpdateMediaAsset()
const [filename, tags, folderId, error]=useState
useEffect setFilename/Tags/folderId na asset
onSave: setError(''); try { await update.mutateAsync({id: asset!.id, filename, tags, folderId||null}); onOpenChange(false) } catch(err){setError(getApiErrorMessage(...))}
return <AdminFormSheet title><Input filename><Input tags><Select folderId>{error && <p role=alert>}<Button disabled={update.isPending}>Sačuvaj</Button></AdminFormSheet>
// Nema !filename.trim() validacije, nema disabled na Input dok je pending, error ima role=alert (dobro), ali nema trim guard; nema 1-99 validacije (nije broj), samo filename required
```

**`MediaPageAssetsSection.tsx:14-94` + `MediaAssetsGrid/Table`:**
```
return <div><MediaAssetsGrid assets empty copied ...><MediaAssetsTable assets empty ...>{selectedCount>0 && <MediaBulkActionBar selectedIds folders onClear/onDone/onConfirmDelete>} {meta && <AdminPagination meta page onPageChange>}</div>
// Grid/Table primaju empty string bez emptyRole (Media nema role da ne duplicira upload progress — nakon B-03 Media ostao bez role, to je namjerno)
// BulkActionBar ima busy+catch+role alert (Q-FE06-31 fix) — dobro
```

**Hookovi:**
- `useGalleryAdminList(options?)` — **ima** `staleTime30k retry1 refetch false + ...options` (nakon B-03 pattern) — ok.
- `useGalleryDetail(id)` — `useQuery(['gallery', id], enabled: !!id)` — **bez** `staleTime/retry/refetchOnWindowFocus`, bez `UseQueryOptions` overload, bez `dataUpdatedAt` na pozivaocu.
- `useMediaFolders()` — `useQuery(['media','folders'], api.get('/media/folders'))` — **bez** `staleTime/retry/refetch false`, bez `options` overload, bez `enabled`.
- `useMediaAssets(params)` — `useQuery(['media','assets', params], api.get('/media/assets'...))` — **bez** `staleTime/retry/refetch`, bez `UseQueryOptions` overload (samo `params` object, ne prosleđuje ostatak opcija).
- Ostali `use*Media*` mutacije — `isPending` postoji ali se ne koristi na pozivaocu za global disable (osim `isCreating` za folder).

**Stanja danas:**
- `loading` → `AdminPageShell isLoading` renderuje 5× Skeleton (bez `aria-busy` na Media/Gallery wrapperu za Media? GalleryAdmin ima shell loading, GalleryEditor ima Skeleton, Media ima shell OR skeleton) — bez `lastUpdated`, akcije nisu disabled.
- `error` → `GalleryAdminPage` ima `isError → DataError` sa `role=alert` preko shell-a, ali `Retry` nema `disabled={isFetching}` guard (shell ima ali stranica ne prosljeđuje `isFetching`); `MediaPage` i `GalleryEditorPage` **nemaju** `isError` granu — pad API-ja pokazuje prazno `Nema medija`/`Nema fotografija` ili beskonačan skeleton.
- `empty` → `AdminDataTable` prazno je `role=status` za Gallery (ako bi se proslijedio emptyRole kao Clubs/Players?), ali GalleryAdmin trenutno **ne** prosljeđuje `emptyRole` — vraća `<p>` bez role (nakon B-03 Media namjerno bez role, Gallery treba `status`); Media Grid prazno je bez role (namjerno zbog upload progress, ali Gallery ne treba taj izuzetak).
- `forbidden` → akcije sakrivene (`canManage/canApprove ? : undefined`), fetch se i dalje radi bez `enabled` (čitanje dozvoljeno, ok).
- `mutacija pending` → `Objavi`/`Obriši`/`Pomjeri`/`Zamijeni` dugmad **nisu** `disabled` dok je `publish/remove/reorder/replace.isPending` — dupli klik šalje dupli zahtjev.

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za galeriju i medije)

* **Korisnik:** editor/moderator sa `gallery.manage`/`media.manage` koji za <15s mora **vidjeti listu galerija** (naslov, status, akcije) i **biblioteku medija** (mape + assets grid/tabela + paginacija + pretraga), te **kreirati/uređivati/brisati** galeriju, **dodavati/premještati/brisati** fotografije, **uploadati/premještati/brisati** medije bez gubitka konteksta, uz **jasne validacije** (naslov obavezno, ime foldera trim, filename trim).

* **Ugovor:**
  * Čitanje: `modules.gallery` / `modules.media` (ruta gate) — fetch uvijek, `staleTime 30s` da ne refetcha na svaki focus, `retry 1`, `refetchOnWindowFocus:false`, `UseQueryOptions` overload konzistentno sa `useClubs`/`useCompetitions`/`useSeasons`.
  * Mutacije: `gallery.manage` / `media.manage` / `gallery.approve` — akcije `disabled` dok `isPending`, `confirm` + `runAction` za grešku (već postoji na delete, ali ne na publish/reorder).
  * 4 stanja: `loading → skeleton aria-busy` (sačuvan `Seo/h1` + `AdminBreadcrumbs`), `error → role=alert + retry disabled isFetching`, `empty → role=status sa CTA`, `success → tabela/grid`.
* **Ponašanje:**
  * `isLoading` → `AdminPageShell` skeleton sa `aria-busy="true"` (kao B-02 per-section ili B-03 shell), `isError` → `role=alert` + `Retry disabled={isFetching}` sa sačuvanim `Seo/h1`.
  * `!data` → `role=status` prazno sa porukom (`Nema galerija` / `emptyMediaMessage` već postoji za Media, ali Gallery treba `status`).
  * `onDelete/onPublish/move` → dugmad `disabled` dok je pripadni `isPending` + `aria-busy` na sekciji; global OR loading se razdvaja po sekciji (folders vs assets vs gallery list vs gallery detail).
  * `useMediaFolders`/`useMediaAssets`/`useGalleryDetail` → `staleTime 30k`, `retry 1`, `refetchOnWindowFocus:false`, `UseQueryOptions` overload.
  * `Seo` title uvijek renderan, `h1` iz `AdminPageShell title` mora ostati u DOM-u i na erroru.
  * `lastUpdated/Osvježi` ispod headera (`dataUpdatedAt` + `Button disabled isFetching`) kao B-02/B-03 i A-02..A-07.
* **A11y/i18n/perf:**
  * `AdminDataTable` prazno `emptyRole="status"` za Gallery (kao Clubs/Players), Media ostaje bez role (B-03 izuzetak zbog upload progress).
  * Akcije `aria-label` već imaju `t('actions.edit/delete')` i `t('admin.common.moveUp/Down')` — ok.
  * `t()` ključevi već postoje (`admin.gallery`, `admin.galleryPhotos.empty`, `admin.media`, `admin.mediaBulk.*`, `admin.common.*`, `actions.*`) — ne dodavati nove bez potrebe, osim `galleryEditor.titleRequired` već postoji.
  * 1 fetch po `gallery/admin` / `media/folders` / `media/assets` sa `staleTime` da se ne refetcha na svaki tab focus.

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**P1-1 — `useMediaFolders`/`useMediaAssets`/`useGalleryDetail` nemaju `staleTime/retry/refetchOnWindowFocus` ni `UseQueryOptions` overload — nekonzistentno sa `useGalleryAdminList`/`useClubs`/`usePlayers` (B-03) i `useCompetitions` (B-02)**
* Gdje: `hooks/use-media-admin.ts:15-45` `useMediaFolders()` i `useMediaAssets(params)` bez `staleTime`/`retry`; `hooks/use-content-admin.ts:19-28` `useGalleryDetail` bez `staleTime`/`options`.
* Zašto P1: svaki tab focus refetcha `/media/folders` i `/media/assets` sa default `retry 3`; nekonzistentno sa B-02/A-07/B-03 (`staleTime 30k retry1`). `useMediaAssets` prima `params` ali ne `UseQueryOptions`.
* Dokaz: `useMediaFolders` nema `...options` spread; `useMediaAssets` nema drugi argument za options.

**P1-2 — `GalleryAdminPage` `Objavi`/`Obriši` i `GalleryAdminPhotos` `Pomjeri`/`Obriši` + `MediaPage` `Obriši`/`Zamijeni`/`Bulk` nisu `disabled` dok je odgovarajući `isPending` — dupli klik šalje dupli zahtjev, nema `aria-busy`**
* Gdje: `GalleryAdminPage.tsx:62-89` `Button ... onClick={()=>void onDelete(r)}` bez `disabled`, `publish.mutateAsync` isto bez `disabled`; `GalleryAdminPhotos.tsx:38-64` `moveUp/Down` samo `index===0/len-1` ali ne `reorder.isPending`, `removePhoto` bez `disabled`; `MediaPage.tsx:84-96` `onDelete` bez `disabled`.
* Zašto P1: korisnik može duplo kliknuti `Obriši`/`Objavi` dok je zahtjev u toku; a11y nema `aria-busy`. `ClubsAdminPage` (B-03) već ima `disabled={remove.isPending}`, `SeasonRoundsPanel` isto.
* Dokaz: `GalleryAdminPage.tsx:78` `variant="ghost" size="icon" onClick={()=>void onDelete(r)}` bez `disabled`; `GalleryAdminPhotos.tsx:55` `disabled={index===0}` bez `|| reorder.isPending`.

**P1-3 — `MediaPage` nema `isError/isFetching/dataUpdatedAt/refetch` ni za `folders` ni za `assets` — nema `role=alert` ni `retry`, loading je `OR` (`fl || al`) cijele stranice, `GalleryEditorPage` nema `isError` granu**
* Gdje: `MediaPage.tsx:41-46` `const {data: foldersRaw, isLoading: fl}=useMediaFolders()` + `isLoading: al` — samo `isLoading`, bez `isError/isFetching`; `AdminPageShell` prima samo `isLoading`; `GalleryEditorPage.tsx:28-35` samo `isLoading` bez `isError`.
* Zašto P1: admin na padu API-ja (`GET /media/folders` 500) vidi prazno `Nema medija` ili beskonačan skeleton, screen reader ne najavljuje error; `AdminHome`/`B-02`/`B-03` pattern je sačuvan `h1` + `role=alert` + `disabled isFetching`.
* Dokaz: `MediaPage.tsx:118` `<AdminPageShell title isLoading={fl||al}>` — nema `isError` prop; `GalleryEditorPage.tsx:43` `if(id && isLoading) return <Skeleton>` — nema error grane.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — `AdminPageShell isLoading={fl || al}` je OR — ako jedna kolekcija učitava, cijela stranica (mape + assets) je skeleton (CLS), obje sekcije dijele jedan loading state**
* Gdje: `MediaPage.tsx:118` `isLoading={fl||al}`.
* Zašto P2: loading i error trebaju biti po sekciji (folders vs assets) sa `aria-busy` po sekciji, kao `CompetitionsAdminPage` per-section nakon B-02 i `SeasonHubPage` lijevo/desno.
* Predlog: Q1 — da li dodati `lastUpdated/Osvježi` ispod headera i razdvojiti loading/error po `folders` i `assets` (kao B-02), ili zadržati shell OR ali sa `isFetching`?

**P2-2 — `GalleryEditorPage` `Button disabled={!title || ...}` ne koristi `!title.trim()`, nema `role=alert` na error, nema `aria-busy` na formi, `MediaAssetFormSheet` `Save` `disabled` samo `isPending` bez `!filename.trim()`**
* Gdje: `GalleryEditorPage.tsx:51` `disabled={!title || create.isPending || update.isPending}` — prazan `"   "` prolazi; `GalleryEditorPage.tsx:57` `<p className="mb-4 text-sm text-danger">{error}</p>` bez `role=alert`; `MediaAssetFormSheet.tsx:58` `disabled={update.isPending}` bez `!filename.trim()`.
* Zašto P2: korisnik može sačuvati galeriju sa praznim naslovom (samo razmaci) — BE vraća 400 bez FE objašnjenja; a11y greška bez `role=alert` se ne najavljuje. B-03 forme već imaju `trim` + `role=alert` + `!name.trim()`.
* Predlog: Q3 — da li dodati `!title.trim()` / `!filename.trim()` + `role=alert` (kao Clubs/Players) ?

**P2-3 — `GalleryAdminPage` `AdminDataTable` prazno nema `emptyRole="status"` — koristi default `empty` bez `role`, a B-03 je uveo `emptyRole` za Clubs/Players**
* Gdje: `GalleryAdminPage.tsx:54` `<AdminDataTable rows={data??[]} columns=...>` bez `emptyRole`.
* Zašto P2: a11y prazno treba `role=status` (kao Clubs/Players). Media namjerno ostaje bez role (B-03 izuzetak), ali Gallery treba `status`.
* Predlog: dodati `emptyRole="status"` kao `ClubsAdminPage`.

**P2-4 — `useGalleryDetail` i `useMedia*` se pozivaju bez `enabled` po permisiji — ok za čitanje, ali nema `lastUpdated`/`Osvježi` kao A-02..B-03**
* Gdje: obje stranice nemaju `dataUpdatedAt` + `Button Osvježi`.
* Zašto P2: admin ne zna koliko je lista svježa; `staleTime 30s` bez dugmeta je ok, ali dugme je standard za A-02..B-03.
* Predlog: Q1 — da li dodati `lastUpdated/Osvježi` ispod headera kao B-03?

**P2-5 — `AdminDataTable` nema `isLoading` prop, koristi `empty` string za loading — isto kao prije B-02 `RoundMatchesPanel`**
* Gdje: `GalleryAdminPage.tsx:54` `AdminDataTable rows={data??[]}` bez `isLoading`.
* Zašto P2: loading i empty su različita stanja; skeleton sa `aria-busy` je standard (B-03). Danas `AdminPageShell` skeleton sakriva tabelu.

### P3 — UX/polish (radi, ali može profesionalnije)

**P3-1 — `MediaPageToolbar` search debounce 300ms radi, ali `totalResults` se prikazuje kao `totalResults ??0` bez `aria-live` — screen reader ne najavljuje promjenu broja rezultata.**
* Predlog: dodati `aria-live="polite"` na broj rezultata ili ostaviti.

**P3-2 — `GalleryAdminPhotos` hover-only akcije (`opacity-0 group-hover:opacity-100`) nisu dostupne tastaturom / na dodir — trebaju `focus-visible` ili uvijek vidljive na mobile.**

---

## 4) Dokazi (file:line)

* `hooks/use-media-admin.ts:15-45` — `useMediaFolders`/`useMediaAssets` bez `staleTime/retry/options` — P1-1
* `hooks/use-content-admin.ts:19-28` — `useGalleryDetail` bez `staleTime/retry/options` — P1-1
* `GalleryAdminPage.tsx:62-89` — `Button` Objavi/Obriši bez `disabled={remove.isPending || publish.isPending}` — P1-2
* `GalleryAdminPhotos.tsx:38-64` — `moveUp/Down` bez `|| reorder.isPending`, `removePhoto` bez `disabled` — P1-2
* `MediaPage.tsx:41-46`, `118` — `useMediaFolders/useMediaAssets` samo `isLoading`, `AdminPageShell isLoading={fl||al}` OR — P1-3, P2-1
* `GalleryEditorPage.tsx:28`, `43`, `51`, `57` — `useGalleryDetail` samo `isLoading`, `disabled={!title}` bez trim, `error` bez `role=alert` — P1-3, P2-2
* `MediaAssetFormSheet.tsx:58` — `disabled={update.isPending}` bez `!filename.trim()` — P2-2
* `GalleryAdminPage.tsx:54` — `AdminDataTable` bez `emptyRole` — P2-3

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/hooks/use-media-admin.ts` (`useMediaFolders`, `useMediaAssets`) | Dodaj `UseQueryOptions` overload + `staleTime:30_000, retry:1, refetchOnWindowFocus:false, ...options` kao `useClubs`/`useSeasons` (B-03/A-07). `useMediaAssets` zadržava `params` kao prvi arg, drugi arg `options?`. | nizak | hook test: `enabled:false` ne fetch-a, `staleTime` |
| 2 | `frontend/src/hooks/use-content-admin.ts` (`useGalleryDetail`) | Dodaj `UseQueryOptions` overload + `staleTime:30_000, retry:1, refetchOnWindowFocus:false, ...options` + `enabled: !!id && (options?.enabled ?? true)` | nizak | hook test: `staleTime`, `enabled` |
| 3 | `frontend/src/pages/admin/GalleryAdminPage.tsx` | a) `const {data, isLoading, isError, isFetching, dataUpdatedAt, refetch}=useGalleryAdminList()` b) Sačuvaj `Seo` + `AdminPageShell title` i u `isError` granama c) `AdminPageShell isError/isFetching/onRetry isLoading/dataUpdatedAt/onRefresh` + `lastUpdated/Osvježi` ispod headera (kao B-03) d) `AdminDataTable emptyRole="status"` e) `Objavi`/`Obriši` `disabled={publish.isPending || remove.isPending}` (global disabled kao B-03) + `aria-busy` | srednji | mock `isError:true` → `role=alert` + heading ostaje; `disabled isPending` |
| 4 | `frontend/src/pages/admin/gallery/GalleryEditorPage.tsx` | a) `const {data: detail, isLoading, isError, isFetching, refetch}=useGalleryDetail(id)` b) `isError → role=alert + Retry disabled isFetching` sa sačuvanim `Seo/h1` c) `isFetching`/`dataUpdatedAt`/`lastUpdated/Osvježi` ispod headera d) `Button disabled={!title.trim() || create.isPending || update.isPending}` e) `error && <p role="alert">` f) `Input` trim validacija na save (`title.trim()`) | srednji | `!title.trim()` disabled; `isError` alert |
| 5 | `frontend/src/pages/admin/GalleryAdminPhotos.tsx` | `moveUp/Down` `disabled={index===0 \|\| reorder.isPending}` itd., `removePhoto` `disabled={removePhoto.isPending \|\| reorder.isPending}` + `aria-busy` na grid | nizak | `disabled isPending` |
| 6 | `frontend/src/pages/admin/MediaPage.tsx` | a) `const {data: foldersRaw, isLoading: fl, isError: fe, isFetching: ff, dataUpdatedAt: fu, refetch: fr}=useMediaFolders()` + `const {data, isLoading: al, isError: ae, isFetching: af, dataUpdatedAt: au, refetch: ar}=useMediaAssets(...)` b) Sačuvaj `Seo` + `AdminPageShell title` i u `isError` granama; razdvoji po sekciji ili shell `isError={fe||ae}` + `isFetching={ff||af}` + `dataUpdatedAt={Math.max(fu,au)}` + `onRefresh` koji refetcha oba c) `AdminPageShell` ostaje OR za shell, ali `MediaPageAssetsSection` dobija `isFetching` za `aria-busy` d) `onDelete/onFolderDelete` `disabled` ostaje u tree (već `isCreating`), ali `MediaAssetFormSheet` i `BulkActionBar` već imaju `busy` | srednji | `isError → role=alert` + heading; `OR` loading ostaje ali `isFetching` proslijeđen |
| 7 | `frontend/src/pages/admin/MediaAssetFormSheet.tsx` | a) `disabled={!filename.trim() || update.isPending}` b) `filename`/`tags` `onChange` trim na save (`filename.trim()`) c) `error` već `role=alert` — ok, dodaj `disabled` na Input dok je pending | nizak | `!filename.trim()` disabled |
| 8 | `frontend/src/pages/admin/media/MediaPageAssetsSection.tsx` | Proslijedi `isFetching` za `aria-busy` na Grid/Table wrapper ako se koristi per-section loading; `empty` ostaje bez `emptyRole` (B-03 Media izuzetak) — ne dirati `role` da ne duplicira upload `status` | nizak | — |
| 9 | `frontend/src/pages/admin/media/*` test doubles | Novi `fe06-b04-gallery.test.tsx` (7t) + `fe06-b04-media.test.tsx` (6t) + `fe06-b04-gallery-form.test.tsx` (8t) — 4 stanja po sekciji + permisije + a11y (`role=alert`, `aria-busy`, `disabled isPending`, `lastUpdated`, `emptyRole`, `trim`) — ne briši postojeće `fe06-media*` | — | `check:all 10/10` |
| 10 | `scripts/standards/baselines/file-size.txt` | Ako `MediaPage.tsx` pređe 200 lin (198→~210) — podigni baseline za 1 lin; `GalleryEditorPage` 127→~145 ostaje ispod | — | `check:all` |
| 11 | `frontend/src/locales/bs+en/common.json` | Provjeri `admin.home.refresh/lastUpdated` + `admin.common.loadError` već postoje — ne treba novi ključ (eventualno `admin.gallery.*` već postoje) | — | — |

**Šta se NE dira:** `MediaBulkActionBar` (već ima `busy`+`catch`+`role=alert` Q-FE06-31), `MediaUploadQueue` / `MediaSelection` / `MediaFolderTree` direktno (osim `disabled` prosljeđivanja), `GalleryPhotoPicker`, `backend` moduli, `router` gating (`ModuleRoute`), `MediaUploadZone`/`MediaUploadProgress` (već imaju `role=status/progressbar`).

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `enabled` po permisiji za čitanje:** odbačeno — `modules.gallery`/`modules.media` već gate-a rutu, ali `useMedia*` bez `staleTime` fetch-a i na svaki focus; `enabled` nije potreban za čitanje, ali `staleTime` jeste.
* **Ne skrivati `Seo/h1` na erroru:** odbačeno — gubitak naslova i SEO; pattern sačuvanog headera je standard A-02..B-03.
* **Jedan globalni `AdminPageShell isLoading` OR vs po sekciji za Media:** OR je CLS ali Media ima dvije kolekcije (folders + assets) koje su uvijek zajedno vidljive (stablo + grid); po sekciji bi bio veći refaktor (dvije shell instance). Predlog: zadrži OR za shell, ali proslijedi `isFetching` za `disabled` i `lastUpdated` max od oba — kompromis kao `CompetitionsAdminPage` max `dataUpdatedAt`.
* **Gallery prazno `emptyRole`:** Media ostaje bez role (B-03 izuzetak zbog upload progress), ali Gallery **treba** `status` — suprotno bi dupliciralo progress i sakrilo prazno stanje.
* **FormSheet validacija `title.trim()`:** može i bez, ali BE vraća 400 — bolje disable na FE da korisnik ne šalje nevalidno (kao Clubs/Players).

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P1-1..P1-3 zatvoreni + testovi koji padaju bez fixa (`isError → role=alert` + naslov ostaje + `disabled isFetching`; `staleTime/retry` na `useMedia*`/`useGalleryDetail`; delete/publish/reorder `disabled isPending` + `aria-busy`)
- [ ] P2-1..P2-5 zatvoreni: `UseQueryOptions` overload, `isLoading` `aria-busy` po sekciji ili shell OR + `isFetching`, `lastUpdated/Osvježi`, FormSheet `trim` + `role=alert`, Gallery `emptyRole="status"`
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin/gallery` i `/admin/media` (admin)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za admina sa `gallery.manage`/`media.manage` (lista galerija + editor + fotke + library)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `lastUpdated`/`Osvježi`:** Da li `GalleryAdminPage` i `MediaPage` trebaju `Osvježi` dugme + `lastUpdated` ispod headera (kao B-03 Clubs/Players i B-02), ili samo `staleTime` bez dugmeta? Predlažem **dugme + lastUpdated** (Gallery `dataUpdatedAt`, Media `max(folders, assets)`).

**Q2 — `delete`/`publish`/`reorder` `disabled`:** Da li `Objavi`/`Obriši`/`Pomjeri`/`Zamijeni` dugmad trebaju biti `disabled` dok je bilo koji pending (`publish || remove || reorder` global) ili odvojeno po tipu (npr. `reorder` samo za move)? Predlažem **global** za Gallery (kao B-03 `remove.isPending` global), a za Media `folders` vs `assets` odvojeno (`deleteMedia`/`replace` global za assets, `deleteFolder` za stablo).

**Q3 — `FormSheet` validacija:** Da li `GalleryEditorPage` `naslov` i `MediaAssetFormSheet` `filename` trebaju `!value.trim()` disable + `role=alert` na grešku (kao Clubs/Players), ili ostaviti `!value`? Predlažem **trim + role=alert** (BE već vraća 400 za prazan naslov, bolje FE disable).

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija B-04 po tabeli iznad — jedan PR, `gh run watch` do `6/6`.
