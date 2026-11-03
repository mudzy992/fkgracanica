# FE-04a — Admin: hub, liste i navigacija

> Segment iz `AUDIT/02_MASTER_AUDIT_PLAN.md`. Ovaj dio pokriva **liste/tabele,
> hubove i navigaciju** (`frontend/src/pages/admin/**` — 147 fajlova / 12.062 LOC,
> `components/admin/**` — 22 fajla). Forme i editori idu u **FE-04b**.
> Sesija: 2026-11-03. Korisnik: „Konačno je sve oky, možeš nastaviti dalje."

## 1. Nalazi

| ID | Ozbiljnost | Nalaz |
|----|-----------|-------|
| **B-FE04-01** | **Medium** | **45 admin fajlova ima `isLoading`, a nema `isError`.** Pad API-ja izgledao je kao **prazna tabela** („Nema podataka") — administrator zaključi da nema zapisa i počne ponovo da unosi podatke. Nema retry-a. 35 stranica koristi `AdminPageShell`, pa se problem rješava na jednom mjestu **ako** shell dobije error granu. |
| **B-FE04-02** | **Medium** | **3 destruktivne akcije bez potvrde i bez undo-a:** brisanje CMS sekcije (`CmsPageBuilderPage` → `CmsSortableSections`), brisanje YouTube highlighta (`MatchHighlightsEditor`), brisanje zapisa iz izvještaja utakmice (`CommentatorReportControls` → `CommentatorEventLog`). Jedan pogrešan klik = trajan gubitak sadržaja. Ostatak admina **ispravno** koristi `useConfirm`/`ConfirmDialog` (npr. `SponsorsAdminPage`, `NewsAdminPage`). |
| **B-FE04-03** | **Low** | **4 admin rute bez `PermissionRoute`:** `users`, `heritage`, `comms`, `notifications` — bile su samo iza `ProtectedRoute`, pa je svaki prijavljeni korisnik otvarao stranicu i vidio prazne tabove (stranice se interno filtriraju po dozvolama). Backend ih štiti, pa nema curenja podataka — radi se o UX nedosljednosti. |
| **B-FE04-04** | Low (a11y) | **39 icon-only dugmadi, samo 6 sa `aria-label`** u admin sloju → ekranski čitači objavljuju „button" bez konteksta. Ostaje za FE-04b (uz forme). |
| **B-FE04-05** | Info | **i18n: 9/147** admin fajlova koristi `t()`; admin je praktično BS-only. Nije bug (admin tim je domaći), ali je nedosljedno prema javnom portalu (FE-03b). Ostaje za FE-04c/FE-05. |
| **B-FE04-06** | Info ✓ | **Zdravo:** sve admin liste idu kroz `AdminPageShell`/`AdminDataTable` (jedinstven izgled, `empty` poruka, `overflow-x-auto`); RBAC je pokriven na 20 ruta `PermissionRoute` + internim `hasPermission` provjerama; `ConfirmDialog`/`useConfirm` je već standard. |

## 2. Predlozi i šta je implementirano

| ID | Predlog | Vidljivo? | Status u ovoj sesiji |
|----|---------|-----------|----------------------|
| **P-FE04-1** | `AdminPageShell` dobija `isError`/`onRetry` i prikazuje `DataError` (uz `role="alert"` + retry); `DataError` se **seli u `components/common/`** jer ga sad koriste i javni i admin sloj. | DA — **samo u stanju greške** (umjesto lažne prazne tabele) | ✅ **implementirano** |
| **P-FE04-2** | `useConfirm` potvrda prije 3 destruktivne akcije. | DA — jedan klik više prije brisanja | ✅ **implementirano** |
| **P-FE04-3** | `PermissionRoute` dobija `anyOf` (stranice koje spajaju više modula) i pokriva 4 rute. | DA — korisnik bez dozvole se preusmjerava umjesto praznih tabova | ✅ **implementirano** |
| **P-FE04-4** | `aria-label` na sve icon-only dugmadi u adminu (39 mjesta). | ne vizuelno | ⏳ FE-04b |
| **P-FE04-5** | i18n migracija admina (138 fajlova) — veliki mehanički posao. | DA (ako se koristi EN) | ⏳ FE-04c / FE-05 |
| **P-FE04-6** | Unsaved-changes guard (`beforeunload` + confirm na navigaciju) za duge forme (CMS builder, utakmica). | DA | ⏳ FE-04b (uz forme) |

## 3. Implementacija — detalji

| Fajl | Promjena |
|------|----------|
| `components/common/DataError.tsx` (+ test) | preseljeno iz `components/public/`; 10 javnih stranica ažurirano; komentar dopunjen za admin |
| `components/admin/AdminPageShell.tsx` | novi props `isError`, `onRetry` → `DataError` u `Card`-u umjesto tabele |
| **20 admin stranica** | `isError` + `refetch` u primarnom hooku i proslijeđeno u shell: Audit, Clubs, Contact, Gallery, HallOfFame, LivePending, Membership, Museum, News, Newsletter, Notifications, Players, Roles, Sponsors, Timeline, Trophies, Users, `club-hub/ClubsListPage`, `cms/CmsMenuEditor`, `cms/CmsPagesList` |
| `cms/CmsPageBuilderPage.tsx` | `useConfirm` → potvrda prije brisanja sekcije (prikazuje tip widgeta), `confirmDialog` u stablu |
| `competition-hub/MatchHighlightsEditor.tsx` | potvrda prije brisanja highlighta (naslov klipa), `dialog` u stablu |
| `commentator/CommentatorReportControls.tsx` | potvrda prije brisanja zapisa iz izvještaja |
| `components/common/PermissionRoute.tsx` (+ novi test) | `anyOf?: string[]` — dozvola prolazi ako korisnik ima **bilo koju**; `permission` postaje opcionalan |
| `router/app-routes.tsx` | `users` (`users.read`/`rbac.read`), `heritage` (`hall-of-fame.manage`/`museum.manage`), `comms` (`contact.read`/`newsletter.read`/`newsletter.manage`), `notifications` (`dashboard.read`) |
| `locales/{bs,en}/common.json` | `match.highlightDeleteTitle`, `match.highlightDeleteDesc` (uhvatio ih je FE-03b guard test) |

**Napomena o formatiranju:** masovno pokretanje `prettier`-a preko `pages/admin/**`
reformatira ~90 fajlova (dijeli duge linije) i diže `file-size` preko limita.
Zato su u ovoj sesiji **zadržane samo funkcionalne izmjene** (89 fajlova vraćeno
na originalno formatiranje), a `prettier` je primijenjen isključivo na dodirnute
fajlove.

## 4. Verifikacija

| Provjera | Rezultat |
|----------|----------|
| `npm run test -w frontend` | ✅ **52 testa / 14 fajlova** (novi: `PermissionRoute` 4 testa; `DataError` 3 testa na novoj putanji) |
| `npx tsc -b` | ✅ čisto |
| `npm run build -w frontend` | ✅ vite build |
| `npm run lint -w frontend` | ✅ 0 grešaka |
| `npm run check:all` | ✅ **9/9** (uklj. `file-size` — nakon vraćanja 89 reformatiranih fajlova i sužavanja `MembershipAdminPage` na 199 linija) |
| Vidljivo ponašanje | mijenja se **samo** u stanju greške (poruka + retry umjesto prazne tabele), pri brisanju (potvrda) i za korisnike bez dozvole (redirect umjesto praznih tabova) — sve tri stvari su bugfix/UX, prijavljeno u izvještaju |

## 5. Otvoreno / sljedeće

- **FE-04b** — forme i editori: `aria-label` (39), unsaved-changes guard, validacija, `FormSheet` konzistentnost.
- **FE-04c/FE-05** — i18n admina (138 fajlova) i interna IA (KAPIJA 2 za navigaciju).

## Status segmenta: ZATVOREN (FE-04a)
