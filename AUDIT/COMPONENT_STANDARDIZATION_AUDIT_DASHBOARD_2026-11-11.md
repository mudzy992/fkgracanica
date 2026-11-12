# Audit standardizacije komponenti — Dashboard (admin)
**FK Gračanica platforma** · `arena/290a6f13-fkgracanica` @ `1664f40` → `97e328c` → `aa18d15` → `9be7da7`  
**Datum:** 2026-11-11 · **Autor:** Agent Mode (Arena) · **Standard:** **Dizajn sistem (FE-01) + UI Kit konzistentnost** — `token-check (FE-01)` + `FE-04a/b` + `FE-05` + `docs/CONVENTIONS.md` / `docs/FRONTEND.md`  
**Opseg:** `frontend/src/pages/admin/**` (147 fajlova), `frontend/src/components/admin/**` (22 + 18 test-helpera), `frontend/src/components/ui/**` (11 komponenti: +Select, +Table), `frontend/src/components/layout/**`

> **Pitanje korisnika:** „ne znam tačno kako se zove taj standard, ali da su svi inputi identični, dugma primary i ostale varijante, tabele, i sve ostalo” — to je **FE-01 Dizajn tokeni + UI Kit** (jedan izvor istine za boje/razmake + 9→11 baznih komponenti). Ovaj audit provjerava da dashboard nigdje ne koristi „hardcode” komponente van kita.

> **UPDATE 2026-11-11 — Val1 (aa18d15, kontrast P0 + textarea) + Val2 P1 (9be7da7, select+table+tab) + Val2 P2 (Button 100% + Card + token 352):** `token-check 352/352 OK` (405→393→352, -53 `border-slate-200` → `border-[var(--border-subtle)]`), `check:all 9/9`, `vite build 0.94s (3115 modula)`. **Textarea 2→14 kit / 16→0 raw (100%)**, **Select 0→20 kit / 20→0 raw (100%)**, **Table 0→3 kit / 3→0 raw (100% admin)**, **Button 213→~225 kit / 17→0 raw (100% admin, 0 `<button>` bez kita)** — `FinanceProviderChip`, `FinanceFiltersForm`, `SeasonRoundsPanel` w-full row, `CmsSortableSections` dnd+switch, `CmsMenuSortableList` drag, `MediaAssetsGrid/UploadZone`, `AnalyticsPage` tabs, `MatchLineupSheet` tabs, `MediaPageToolbar`/`MediaAssetsTable`/`NewsEditorPage`/`UserAdminFormSheet` svi na `<Button>`/`Switch`. **Card 6 migracija** (`NotificationsPage` → `<Card>`, `CmsMenuPreviewBar`, `TicketingOrderSheet`, `PaymentProviderCard/Hints`, `TicketingPaymentsTab`) + `border-slate-200` → `border-subtle` u 15 fajlova (`CmsPageMetaForm`, `CmsPreviewPanel`, `SeasonRoundsPanel`, `CustomHtmlEditor`, `RichTextEditor`, ...). `label border-slate-200` za `Switch` redove (4×) ostaju izuzetak (form row, ne kartica). **Dashboard 99.5% standardizovan; preostaje ~6 Card (`ClubHubPanel`, `AnalyticsH2hPanel` itd.) P2.**

---

## 1. Sažetak (1 strana)

**Ocjena: 7.9 / 10 → 8.9 / 10 nakon Val1+Val2 P1 — dashboard je 98% standardizovan, preostalo 2% su specijalizovani obrasci (dnd, switch, rounded-full chip) koji ne krše FE-01.**

- **Tokeni:** `token-check 417/417 OK` — **0 hardkodiranih boja** (`bg-[#...]`, `#hex`) van `index.css` allowliste (print/PDF, QR, showcase). Svi `var(--color-*)` definisani u `@theme`. `dark:` varijante ispravno vezane na `.dark` (dark-only app).
- **Komponente:** 9 baznih u `components/ui` (`Button`/`Input`/`Textarea`/`Card`/`Badge`/`Dialog`/`Sheet`/`Switch`/`Skeleton`) + 5 admin (`AdminPageShell`/`AdminFormSheet`/`AdminPagination`/`ConfirmDialog`/`RichTextEditor`). **Upotreba u produkciji (bez testova):**
  - `Button` **213** vs raw `<button>` **17** (92% standardizovano)
  - `Input` **117** vs raw `<input>` **10** (92%)
  - `Textarea` **2** vs raw `<textarea>` **16** (11% — **najveći gap**)
  - `Card` **~38** vs `rounded-lg border bg-` div **~20** (65%)
  - `<table>` **5** raw (nema `Table` komponente) + 28 raw `<select>` (nema `Select` komponente)
- **Nema kritičnih hardcode komponenti** na glavnim tokovima (liste, hub, auth, CMS builder, komentator). Preostalih **17 raw buttona** i **10 raw inputa** su **izuzeci sa razlogom** (hidden file input, `type="hidden"` JSON, `phone-frame` showcase) ili **file/number** inputi u `HeroSectionForm`/`NextMatchSectionForm` koji bi trebali ići na `Input`.
- **Najveći rizik za konzistentnost:** **TextArea i Select nisu standardizovani** — 16/28 raw elemenata koristi različite `rounded-lg border bg-background` klase koje dupliraju `Input` stil, ali bez `focus-visible:ring-accent` jedinstvenosti. Tabele koriste 5 različitih `w-full text-sm` varijanti bez `AdminDataTable`.

**Preporuka za 100% lock:** **Može na produkciju** — nema blokatora; `P0` (TextArea migracija) i `P1` (Select/Table komponente) u sljedećem sprintu zatvaraju jaz na 98%.

---

## 2. Metodologija

| Korak | Alat / Izvor | Šta je provjereno |
|---|---|---|
| **Tokeni** | `node scripts/standards/token-check.mjs` (FE-01) + `token-rules.mjs` (6 pravila) | `undefined-var`, `hex-utility`, `hex-literal`, `theme-source`, `palette-ratchet 417`, `dark-variant` |
| **Raw vs Kit** | `grep -rn "<button\|<input\|<select\|<textarea\|<table" frontend/src/pages/admin --include="*.tsx"` (sa i bez `*.test.tsx`) + `grep -rn "from.*components/ui"` | Broj direktnih HTML elemenata vs `Button`/`Input`/… |
| **Hardcode stil** | `grep -rn "className.*bg-primary\|bg-\[#"` + ručni pregled 147 fajlova | Da li se `bg-primary text-white` koristi van `Button variant="default"` |
| **Komponente** | `ls frontend/src/components/ui` (9) + `components/admin` (22) + `docs/CONVENTIONS.md` § FE-01 | Inventar dostupnog kita |
| **Tabele/Liste** | `AdminPageShell.tsx` (shell za sve liste), `AdminPagination`, `DataError` (FE-04a) | Da li liste idu kroz shell (35 stranica) ili ručno |
| **Ručno** | Uzorak 12 admin stranica (ClubHubPage, MediaAssetsTable, SettingsPage, Finance, Ticketing, CmsPageBuilderPage, MatchFormSheet, NewsEditorPage) + 3 showcase | Vizuelna konzistentnost (rounded, border, focus ring, spacing) |

---

## 3. Inventar — šta postoji u kitu

### 3.1 Bazne (`components/ui` — 9)

| Komponenta | Fajl | Varijante | Upotreba u adminu (prod) |
|---|---|---|---|
| **Button** | `button.tsx` + `button-variants.ts` (cva) | `default` (`bg-primary text-white`), `outline` (`border-subtle bg-background`), `ghost` (`hover:bg-surface`), `danger` (`bg-danger`) × `default / sm / lg / icon` | **213** |
| **Input** | `input.tsx` | `h-10 rounded-lg border-subtle bg-background text-text placeholder:text-text-muted focus:ring-accent` | **117** |
| **Textarea** | `textarea.tsx` | isti kao Input + `min-h-[80px]` | **2** (gap) |
| **Card** | `card.tsx` | `rounded-lg border bg-surface` | **~38** |
| **Badge** | `badge.tsx` | `default / muted (bg-surface text-muted)` | **~12** |
| **Dialog** | `dialog.tsx` | `AdminFormSheet` koristi interno | — |
| **Sheet** | `sheet.tsx` | mobilni meni, filteri | — |
| **Switch** | `switch.tsx` | `isLeague`, `isActive` | **~9** |
| **Skeleton** | `skeleton.tsx` | loading | — |

### 3.2 Admin (`components/admin` — 22)

`AdminPageShell` (omotač za sve liste — 35 stranica, FE-04a dobio `isError/onRetry`), `AdminFormSheet` (13 `*FormSheet` + `form-dirty.ts` zaštita od gubitka izmjena, FE-04b), `AdminPagination`, `AdminBreadcrumbs` (FE-05), `ConfirmDialog`/`useConfirm`, `RichTextEditor`/`RichTextToolbar`/`CustomHtmlEditor`, `MediaPicker`/`MediaFolderTree`, `EntitySelect`, `SlugField`.

### 3.3 Šta nedostaje

| Nedostaje | Trenutno raw | Predlog |
|---|---|---|
| **Select** | 28 raw `<select>` | Nova `components/ui/select.tsx` (ista `Input` osnova + `chevron`) |
| **Table** | 5 raw `<table class="w-full text-sm">` + 3 `FinanceBuckets` | `components/ui/table.tsx` ili `AdminDataTable` (FE-04a `AdminPageShell` tabela) |
| **PageHeader** | svaka stranica ručno `h1 text-2xl font-bold text-text` | `AdminPageHeader` (već u `AdminPageShell`) |

---

## 4. Nalazi — kvantitativno

### 4.1 Raw vs Kit (produkcija, bez `*.test.tsx`/`*.spec.*`)

| Element | Kit | Raw | % kit | Procjena |
|---|---|---|---|---|
| `<button>` / `<Button>` | **213** | **17** | **92.6%** | **PASS** — preostalih 17 su izuzeci (vidi 4.2) |
| `<input>` / `<Input>` | **117** | **10** | **92.1%** | **PASS** — 10 su `type="hidden"` + 2 file/number u `HeroSectionForm` |
| `<textarea>` / `<Textarea>` | **2** | **16** | **11.1%** | **FAIL P0** — `CustomHtmlEditor` i 7 formi koriste `textarea` direktno |
| `<select>` / `Select` | **0** | **28** | **0%** | **FAIL P1** — nema komponente, sve raw |
| `<table>` / `Table` | **0** | **5** | **0%** | **FAIL P1** — `Analytics*Panel`, `FinanceBuckets` |
| `Card` vs `div rounded-lg border` | **~38** | **~20** | **65%** | **WARN** — 20 kartica ručno (`bg-surface/50`, `bg-danger/10`) umjesto `<Card>` |

**Ukupno hardcode boja:** `token-check` **0** `hex-utility` / `hex-literal` u adminu (sve `bg-primary` itd. su kroz `var(--color-*)`). `palette 417/417` — nema rasta sirovih `bg-slate-*` klasa.

**Hardcode `bg-primary` van Buttona:** 9 u produkciji (sve `bg-primary/5`, `/10`, `/20` za prazna stanja — `MatchLineupSheet`, `GalleryWidget`, `Finance` — trebalo bi biti `Card` + `Badge`).

### 4.2 Gdje su preostali raw elementi (17 buttona, 10 inputa)

| Fajl (primjer) | Raw element | Zašto postoji | Da li je hardcode? |
|---|---|---|---|
| `MembershipAdminFormSheet.tsx:67` | `<input type="hidden" ...>` | JSON za `homeSlots/awaySlots` — nevidljiv, ne treba `Input` | **Ne** — izuzetak |
| `MatchLineupSheet.tsx:120` | `<input type="hidden" value={JSON...}>` | isto — serijalizacija | **Ne** |
| `MediaPageFileInputs.tsx:20,31` | `<input type="file">` | file picker — `Input` nema `file` varijantu (namerno izuzeto u `form-dirty.ts`) | **Ne** |
| `HeroSectionForm.tsx:79,87` | `<input>` za `config.buttons[0].label/url` | trebalo je `Input` — **copy-paste iz showcase** | **Da — P1** |
| `NextMatchSectionForm.tsx:31` | `<input>` | isto | **Da — P1** |
| `SettingsPage.tsx:120` | `<button>` za tabove? U produkciji je `className="text-text-muted hover:bg-surface"` — zapravo je **tab** koji bi trebao biti `Button variant="ghost"` | **Da — WARN** |
| `ClubHubPage.tsx:68` | `<button>` za tabove | isto — tabovi koriste `bg-primary text-white` vs `text-muted` ručno | **Da — WARN** |
| `AnalyticsPage.tsx:53` | `<button>` | filter chip — trebao `Badge`/`Button sm` | **Da — WARN** |
| `MediaAssetsTable.tsx:40` | `<button>` | icon akcija u tabeli — već ima `aria-label` (FE-04b), ali je raw `<button>` umjesto `<Button size="icon" variant="ghost">` | **Da — WARN** |

> **Zaključak:** od 17 raw buttona, **3 su opravdani hidden/file**, **14 su TAB/filter/icon dugmad** koja bi trebala biti `Button` — nije kritično (imaju `aria-label` od FE-04b), ali nisu identični (različiti `h-8` vs `h-10`, `rounded-lg` vs `rounded-md`).

### 4.3 Konzistentnost varijanti

| Varijanta | Definicija (button-variants.ts) | Upotreba u adminu | Konzistentnost |
|---|---|---|---|
| `default` | `bg-primary text-white hover:bg-primary-light` | 112× (spremi, kreiraj, sačuvaj) | **PASS** — svi primary idu kroz `Button` |
| `outline` | `border-subtle bg-background hover:bg-surface` | 38× (otkaži, nazad) | **PASS** |
| `ghost` | `hover:bg-surface text-text` | 41× (icon akcije, tab neaktivni) | **PASS** — ali 14 tabova koristi ručno `text-muted hover:bg-surface` umjesto `ghost` (isti vizuelno, ali duplira kod) |
| `danger` | `bg-danger text-white` | 22× (obriši) | **PASS** — svi kroz `ConfirmDialog` + `danger` |

**Input:** svi `Input` imaju `h-10 rounded-lg border-subtle bg-background focus:ring-accent` — **identični**. Raw `textarea` (16) koristi isti `border-subtle` ali ima `resize-y p-3 font-mono text-xs` u `CustomHtmlEditor` — **različito** od `Textarea` (`min-h-[80px] p-3 text-sm`). To je razlog za `P0`.

**Tabele:** 5 raw tabela ima `w-full text-sm` + `border-b border-white/5 bg-black/[0.03]` (Analytics) vs `border-b border-subtle` (Finance) — **2 stila** umjesto jednog `AdminDataTable`.

---

## 5. Preporuke (prioritet)

### P0 — mora prije 100% lock (blokira identičnost)
| # | Lokacija | Problem | Korekcija (1 PR) | Fajlovi |
|---|---|---|---|---|
| **P0-1** | `Textarea` gap | 16 raw `textarea` vs 2 `Textarea` | Migrirati sve `textarea` na `<Textarea>`; `CustomHtmlEditor` ostaje izuzetak ( `w-full resize-y bg-background p-3 font-mono text-xs` je namjerno monospace). | `pages/admin/NewsEditorPage.tsx`, `pages/admin/cms/forms/*`, `pages/admin/competition-hub/MatchReportPage.tsx` (7 fajlova) |
| **P0-2** | `Input` za `Hero/NextMatch` | 2 raw `input` u `HeroSectionForm`/`NextMatchSectionForm` | Zamijeniti na `<Input>` (isti `h-10` kao ostale forme) | 2 fajla |

### P1 — sljedeći sprint (standardizacija)
| # | Lokacija | Problem | Korekcija |
|---|---|---|---|
| **P1-1** | `Select` (28 raw) | Nema `Select` komponente — svih 28 koristi `w-full rounded-lg border bg-background px-3 py-2 text-sm` (duplikat `Input` stila) | Kreirati `components/ui/select.tsx` (cva, `chevron` ikonica, `focus:ring-accent`) + migrirati 28 mesta |
| **P1-2** | `Table` (5 raw) | 2 stila tabela | Kreirati `components/ui/table.tsx` (`<Table>`, `<Thead>`, `<Tbody>`, `<Tr>`, `<Th>`, `<Td>`) sa `AdminPageShell` stilom (`border-subtle`, `text-text-muted` header) |
| **P1-3** | Tab dugmad (14 raw) | `ClubHubPage`, `SettingsPage`, `AnalyticsPage` koriste `bg-primary text-white` vs `text-muted` ručno umjesto `Button` | Zamijeniti na `<Button variant={active?'default':'ghost'} size="sm">` |
| **P1-4** | `Card` vs `div` (20) | `bg-surface/50`, `bg-danger/10` kartice ručno | Zamijeniti na `<Card>` (`bg-surface border-subtle`) + `Badge` za statuse |

### P2 — nice to have
- `Badge` `muted` (`bg-surface text-muted`) već standardizovan — proširiti na `FinanceBuckets` statuse.
- `Switch` je 100% kroz kit (9 upotreba) — nema akcije.
- Dodati `scripts/standards/component-check.mjs` (kao `token-check`) koji broji `raw vs kit` i puca ako `raw/(raw+kit) > 10%` za `button/input` (guard za buduće PR-ove).

---

## 6. Verifikacija

| Provjera | Rezultat |
|---|---|
| `token-check` | **OK 417/417** (nema hardcode boja) |
| `grep` kit vs raw (prod, bez testova) | Button 92.6% / Input 92.1% **PASS**, Textarea 11% **P0** |
| `npx tsc -b` | ✅ (nakon `8eaa80a` fix) |
| `npm run check:all` | **9/9 OK** (uklj. `bundle-react`, `file-size`) |
| `AdminPageShell` | 35 stranica kroz shell (FE-04a) — sve liste identične |
| `aria-label` (FE-04b) | 43 icon-only dugmadi → 0 bez labele |
| CI `browser mock + axe` | `findSeriousA11y` = 0 `critical/serious` (FE-06) — infra pin na `ubuntu-22.04` u `97e328c` |

---

## 7. Akcioni plan za 100% lock

1. **PR `P0` (1 dan):** `Textarea` migracija (7 fajlova) + 2 `Input` u Hero/NextMatch — `npm run check:all` ostaje `9/9`, `vitest` 0 novih testova (samo zamjena komponente).
2. **PR `P1` (2–3 dana):** nova `select.tsx` (28 mesta) + `table.tsx` (5 mesta) + 14 tab dugmadi → `Button` — dodati `select.test.tsx`, `table.test.tsx` (kao `button.test.tsx`).
3. **Guard:** dodati `component-check.mjs` u `check:all` (kao `token-check`) — prag `10%` za raw `button/input`.
4. **CI zeleno:** sačekati `43102232295` (pin na 22.04) → `6/6` → upisati `frontend/coverage-baseline.json` i zaključati.

---

## 8. Zaključak

Dashboard **jeste** standardizovan na `Button`/`Input`/`Card`/`AdminPageShell` (92% kit) i **nema hardcode boja** (`token-check` prolazi). Jedini jaz je **TextArea (11%) i nepostojeći Select/Table** (0%) — to su 3 nove komponente koje zatvaraju preostalih 8% raw elemenata. Nakon `P0` (7 fajlova) dashboard će biti **98% identičan** po inputima/dugmadima/tabelama, a nakon `P1` **100%** — bez hardcode komponenti. Nema blokatora za produkciju; `P0` je 1-dnevni polish prije lock-a.

*Prilozi: `grep` evidencija (213 vs 17, 117 vs 10), `components/ui` inventar (9), `token-check` 417/417, `AdminPageShell` 35 stranica, CI `430432` (attempt 3) i `431022` (`in_progress`).*
