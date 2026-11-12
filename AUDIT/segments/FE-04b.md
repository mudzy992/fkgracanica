# FE-04b — Admin: forme i editori

> Nastavak FE-04 (FE-04a pokrio liste/hub/navigaciju). Ovaj dio pokriva
> `*FormSheet.tsx` (13), `competition-hub/*FormSheet`, `RichTextEditor`/
> `CustomHtmlEditor`, `NewsEditorPage`, `CmsPageBuilderPage` i
> `components/admin/**` helperе. Sesija: 2026-11-03. Korisnik: „kreni FE-04b slobodno".

## 1. Nalazi

| ID | Ozbiljnost | Nalaz |
|----|-----------|-------|
| **B-FE04-07** | **Medium** | **3 forme tiho gutaju grešku pri spremanju:** `MediaAssetFormSheet` (`await update.mutateAsync(...)` bez `catch` → unhandled rejection; dijalog ostane otvoren, spinner stane, **nikakve poruke**), `AppReleaseCreateForm` (upload APK-a i kreiranje releasea bez `catch`), `CmsPageBuilderPage` (SEO/meta spremanje kroz `void updatePage.mutateAsync(...)`). Korisnik ne zna je li izmjena sačuvana i ponavlja unos. |
| **B-FE04-08** | **Medium** | **21 od 23 forme ne prosljeđuje `dirty`** u `AdminFormSheet` — iako komponenta ima `preventClose` logiku, niko je ne koristi, pa **zatvaranje dijaloga (X, Escape, klik izvan) tiho gubi sve otkucano**. Samo `CmsPageBuilderPage`, `CmsSectionEditDialog` i `NewsEditorPage` imaju neku zaštitu. |
| **B-FE04-09** | **Low (a11y)** | **43 icon-only dugmeta bez `aria-label`** u adminu → ekranski čitač objavljuje samo „button" (npr. dugme za brisanje i dugme za uređivanje zvuče identično). Mjerilo: `grep 'size="icon"'` = 43, sa `aria-label` = **0**. |
| **B-FE04-10** | Info ✓ | **Zdravo:** `AdminFormSheet`/`AdminPageShell`/`ConfirmDialog`/`useConfirm` su konzistentni; `getApiErrorMessage` postoji i koristi se u 12 formi; RHF + zod validacija u `UserAdminFormSheet` i `NewsEditorPage` je ispravna; `MediaPicker`/`SlugField`/`EntitySelect` imaju labelе. |

## 2. Predlozi i implementacija

| ID | Predlog | Vidljivo? | Status |
|----|---------|-----------|--------|
| **P-FE04-4** | `aria-label` na **svih 43** icon-only dugmadi (`Uredi`, `Obriši`, `Pomjeri gore/dolje`, `Nazad`, `Dodaj`, `Zatvori`, `Odobri`). | ne vizuelno (a11y) | ✅ **implementirano** |
| **P-FE04-6** | **Generička zaštita od gubitka izmjena:** nova `form-dirty.ts` (snapshot svih `input/textarea/select`, uključujući `checkbox`) + `AdminFormSheet` sam detektuje izmjene, traži potvrdu pri zatvaranju i registruje `beforeunload` dok je dijalog otvoren. Ne traži izmjene u 20+ formi. | DA — samo pri pokušaju zatvaranja sa nesačuvanim izmjenama | ✅ **implementirano** |
| **P-FE04-7** | Greške pri spremanju se **uvijek prikazuju** (`role="alert"`, `getApiErrorMessage`) u 3 forme koje su ih gutale. | DA — samo u stanju greške (prije: ništa) | ✅ **implementirano** |
| **P-FE04-8** | i18n admina (138 fajlova bez `t()`). | DA (ako se koristi EN) | ⏳ FE-04c / FE-05 |

## 3. Detalji implementacije

| Fajl | Promjena |
|------|----------|
| `components/admin/form-dirty.ts` (**novi**) | `snapshotForm(root)` / `isFormDirty(root, initial)` — čita `input`/`textarea`/`select`, `checkbox`/`radio` po `checked`, `file` preskače (ne može se vratiti) |
| `components/admin/form-dirty.test.ts` (**novi**) | **5 testova**: nije dirty bez izmjene, detekcija inputa, textarea + select, checkbox (uz preskakanje `file`), ponašanje bez snimljenog stanja |
| `components/admin/AdminFormSheet.tsx` | `bodyRef` + snapshot nakon montiranja; `requestClose()` traži potvrdu (`window.confirm`, i18n `admin.unsavedChanges`) kad ima izmjena; `beforeunload` dok je otvoren; eksplicitni `dirty` prop i dalje ima prioritet (CMS builder) |
| `pages/admin/MediaAssetFormSheet.tsx` | `try/catch` + `role="alert"` poruka |
| `pages/admin/app-releases/AppReleaseCreateForm.tsx` | `try/catch` za upload i create + `role="alert"` |
| `pages/admin/cms/CmsPageBuilderPage.tsx` | `saveMeta()` sa `try/catch` + poruka iznad forme (uz potvrdu brisanja sekcije iz FE-04a) |
| **20 fajlova** | `aria-label` na 43 dugmeta (skener koji poštuje JSX zagrade i navodnike) |
| `locales/{bs,en}/common.json` | `admin.unsavedChanges` (+ `match.highlightDelete*` iz FE-04a) |

**Napomena o formatiranju:** masovni `prettier` ponovo reformatira ~95 admin fajlova
i diže `file-size` preko limita → vraćeni su svi fajlovi bez funkcionalne izmjene,
a `aria-label` je u tri granična fajla (`CompetitionsAdminPage`, `CmsMenuSortableList`,
`MatchFormSheet`) ubačen **bez** reformatiranja. `file-size` je zelen.

## 4. Verifikacija

| Provjera | Rezultat |
|----------|----------|
| `npm run test -w frontend` | ✅ **57 testa / 15 fajlova** (+5 za `form-dirty`) |
| `npx tsc -b` | ✅ čisto |
| `npm run build -w frontend` | ✅ vite build |
| `npm run lint -w frontend` | ✅ 0 grešaka |
| `npm run check:all` | ✅ **9/9** |
| A11y mjerenje | `size="icon"` bez `aria-label`: **43 → 0** |
| Vidljivo ponašanje | potvrda pri zatvaranju dijaloga sa izmjenama; poruka kad spremanje padne — oboje bugfix/UX, prijavljeno |

## 5. Otvoreno / sljedeće

- **FE-04c** — i18n admina (138 fajlova) + validacijske poruke na svim poljima.
- **FE-05** — interna IA (KAPIJA 2: navigacija/hubovi) prije MOB segmenata.

## Status segmenta: ZATVOREN (FE-04b)


**Naknadna dopuna FE-06 / P-FE06-12:** zaštita je proširena na SPA navigaciju;
snapshot sada uključuje file, rich-text i označene kontrole. Pojedinosti i
ograničenja su u [FE-06](FE-06.md); raniji opis file izuzetka je historijski.
