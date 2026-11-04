# FE-04c — i18n admina

> Migracija admina (147 stranica) sa hardkodiranog bosanskog na `t()`, u batch-evima.
> Sesija 2026-11-03: **infrastruktura + batch 1** (shared komponente + 5 rolnih
> početnih stranica). Segment ostaje **otvoren** dok se ne spusti cijeli baseline.

## 1. Nalazi

| ID | Ozbiljnost | Nalaz |
|----|-----------|-------|
| **B-FE04-10** | **Medium (i18n)** | **Admin je praktično BS-only**: 170 fajlova, samo 21 koristi `useTranslation`. Kad korisnik prebaci na EN, javni portal je preveden (FE-03b), a **cijeli admin ostaje na bosanskom**. Najveći dio su labele formi, kolone tabela, empty/error stanja i potvrde. |
| **B-FE04-11** | Low (proces) | **Nema zaštite od regresije** — novi admin fajl može donijeti hardkodiran tekst, a da to niko ne primijeti; migracija „sve ili ništa" na 170 fajlova nije izvodljiva u jednom koraku. |
| **B-FE04-12** | Info ✓ | Navigacija **je** prevedena (32 ključa), kao i `AdminLayout`, paleta ⌘K, breadcrumbs i `AdminFormSheet` (FE-04b/FE-05). Zdravo: `i18n-keys.test.ts` hvata ključ koji postoji u bs a nema u en. |

### Mjerenje (heuristika: JSX tekst + tekstualni propovi sa literalom)

| | Prije | Batch 1 | Batch 2 | Batch 2b |
|---|---|---|---|---|
| Nalaza | **496** | **454** | **386** | **347** |
| Fajlova | **130** | **113** | **109** | **104** |

> Napomena: heuristika namjerno ne broji literale u objektima (`label: 'Vijesti'`),
> pa je stvarni broj veći; migrirani su i takvi literali gdje su bili u fokusu.

## 2. Predlozi

| ID | Predlog | Status |
|----|---------|--------|
| **P-FE04-9** | **Ratchet guard**: `src/i18n/admin-no-hardcoded-text.test.ts` + `admin-i18n-baseline.json` (fajl → dozvoljeni broj nalaza). Test pada ako bilo koji fajl pređe baseline ili se pojavi **nov** fajl sa hardkodiranim tekstom; dozvoljava smanjenje. Baseline se spušta komandom `UPDATE_I18N_BASELINE=1 npx vitest run src/i18n/admin-no-hardcoded-text.test.ts`. | ✅ implementirano |
| **P-FE04-10** | **Batch 1 — shared sloj** (koristi ga cijeli admin): media picker, rich text, season picker, entity select, slug, formation pool, `ConfirmDialog`, `ErrorBoundary`, `LanguageSwitcher`. | ✅ implementirano |
| **P-FE04-11** | **Batch 1 — 5 rolnih početnih stranica** (`AdminHome`, `ModeratorHome`, `WriterHome`, `CommentatorHome`, `CommentatorLiveHero`, `HomeKpiGrid`) + KPI labele kroz `admin.kpi.*` (fallback na postojeći config). | ✅ implementirano |
| **P-FE04-12** | **Batch 2** — forme i tabele: `CompetitionsAdminPage`, `NewsEditorMeta`, `ClubBasicTab`, `PaymentProviderCard`, `HeroSectionForm`, `GenericSectionForm`. | ✅ implementirano |
| **P-FE04-14** | **Batch 2b** — `TicketingSettingsTab`, `MembershipDetailSheet`, `PlayersAdminFormSheet`, `ClubsAdminFormSheet`, `CalendarSeasonPage`. | ✅ implementirano |
| **P-FE04-13** | **Batch 3+** — preostali `pages/admin/**` (po abecedi/po domenu: cms, ticketing, membership, finance…), uz spuštanje baseline-a poslije svakog batcha. | ⏳ |

## 3. Implementirano (batch 1)

| Fajl | Šta je prevedeno |
|------|------------------|
| `components/admin/MediaPickerDialog.tsx` | naslov, pretraga, broj rezultata (interpolacija `{{count}}`), hint mape, loading, empty |
| `components/admin/MediaPicker.tsx`, `GalleryPhotoPicker.tsx`, `MediaFolderTree.tsx`, `MediaFolderPicker.tsx` | naslovi dijaloga, „Nova mapa", „Dodaj sve iz mape" + hint, `aria-label` za sklopive mape |
| `components/admin/RichTextEditor.tsx` | „Ubaci sliku", loading |
| `components/admin/SeasonClubPicker.tsx` | naslov, Svi/Očisti, „(naš klub)", empty, „Odabrano: {{count}}…" |
| `components/admin/EntitySelect.tsx` | loading + default placeholder (bio zakucan `'Odaberi...'`) |
| `components/admin/SlugField.tsx`, `formation/FormationPlayerPool.tsx` | „Slug", poruke pool-a |
| `components/admin/ConfirmDialog.tsx` | default `Potvrdi` / `Odustani` → `actions.confirm` / `actions.cancel` (koristi se u cijelom adminu) |
| `components/common/ErrorBoundary.tsx` | klasna komponenta → `i18n.t()` direktno (nema hooka) |
| `components/layout/LanguageSwitcher.tsx` | `aria-label` je bio na engleskom |
| `pages/admin/homes/*` (6 fajlova) | naslovi/hintovi po roli, KPI labele i hintovi, queue/empty stanja, prečice, KPI greška, „Otvori →" |

**Novi i18n ključevi** (bs + en): `admin.common.*`, `admin.mediaPicker.*`, `admin.season.*`,
`admin.slug.*`, `admin.formation.*`, `admin.home.*`, `admin.content.*`, `admin.commentator.*`,
`admin.match.*`, `admin.visitors.*`, `admin.kpi.*`, `admin.commsInbox`, `actions.confirm`,
`actions.language`.

> `admin.media` i `admin.analytics` su **već zauzeti kao stringovi** (nav labele), zato su
> nove grupe `admin.mediaPicker.*` i `admin.visitors.*` — bez toga JSON dobija konflikt.

### Batch 2 (68 nalaza → −68)

`CompetitionsAdminPage` (tabela sezona + katalog: kolone, empty stanja, `Da`/`Ne`, `Liga`/`Ostalo`,
potvrda brisanja sezone — **bez** reformatiranja fajla da ostane pod 200 linija),
`NewsEditorMeta` (11 labela meta panela), `ClubBasicTab`, `PaymentProviderCard`
(sva 3 provajdera; `t()` u svakoj pod-komponenti), `HeroSectionForm`, `GenericSectionForm`.

### Batch 2b (39 nalaza → −39)

`TicketingSettingsTab` (kapacitet, popust, limiti, sezonska karta, kategorije, `Spremanje…`),
`MembershipDetailSheet` (7 labela), `PlayersAdminFormSheet`, `ClubsAdminFormSheet`,
`CalendarSeasonPage` (kolone + `Nazad`/`Uredi`/`Obriši` iz `actions.*`).

**Nove grupe ključeva:** `admin.payments.*`, `admin.cmsWidget.*`, `admin.club.*`,
`admin.clubForm.*`, `admin.newsForm.*`, `admin.competitionsAdmin.*`, `admin.ticketingForm.*`,
`admin.membershipForm.*`, `admin.playerForm.*`, `admin.calendar.*`, `admin.common.*`.

## 4. Verifikacija

| Provjera | Rezultat |
|----------|----------|
| `npx vitest run` | ✅ **69 testa / 18 fajlova** (+2 ratchet) |
| `i18n-keys` test | ✅ svaki `t('…')` postoji u bs **i** en |
| `npx tsc -b` | ✅ čisto |
| `npm run build -w frontend` | ✅ 2.63s |
| `npm run lint -w frontend` | ✅ 0 grešaka |
| `npm run check:all` | ✅ 9/9 |
| `file-size` | ✅ OK |

## 5. Otvoreno

- **Batch 2/3**: 454 nalaza u 113 fajlova (stvarno više — heuristika ne broji literale u objektima).
- Prilikom migracije paziti na **kolizije ključeva**: `admin.cms`, `admin.media`, `admin.news`,
  `admin.gallery`, `admin.analytics`… su stringovi (nav), pa pod-namespace mora biti drugačiji.

## Status segmenta: U TOKU (batch 2b završen; baseline 496 → 347; ratchet guard aktivan)
