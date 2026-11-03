# FE-03b — i18n migracija javnog portala

> Podsegment iz FE-03 (predlog **P-FE03-6**, odobren 2026-11-03: „Odobravam sve
> preporuke u blokatorima"). Sesija: 2026-11-03.
> Opseg: `frontend/src/pages/public/**` (25 stranica) + `frontend/src/pages/home/**`
> (12 sekcija), `frontend/src/locales/{bs,en}/common.json`, `frontend/src/i18n/**`.

## 1. Nalaz (iz FE-03)

**B-FE03-03** — i18n pokrivenost javnog portala: samo **4/25** stranica koristilo je
`useTranslation`; naslovi, podnaslovi, prazna stanja, dugmad i SEO tekstovi bili su
hardkodirani na BS iako `en` locale postoji. EN korisnik je i dalje vidio BS.

## 2. Predlog (odobren)

**P-FE03-6** — svi korisniku vidljivi stringovi u `pages/public/**` i `pages/home/**`
idu kroz `t()`; novi `pages.*` namespace u locale fajlovima (bs + en); guard test koji
onemogućava regresiju.

## 3. Implementacija

| Šta | Detalj |
|-----|--------|
| Locale namespace | Novi `pages.*` sa **17 sekcija** (`gallery`, `club`, `news`, `search`, `sponsors`, `trophies`, `museum`, `hallOfFame`, `league`, `newsletter`, `player`, `tickets`, `membership`, `matchCenter`, `live`, `monri`, …) — **~140 novih ključeva po jeziku**, usklađeno bs ↔ en. |
| Stranice (25) | `GalleryList`, `GalleryDetail`, `NewsList`, `NewsDetail`, `Search`, `League`, `LiveMatch`, `MatchCenter`, `Membership`, `Tickets`, `PlayerDetail`, `team/PlayerMatchHistory`, `Sponsors`, `Trophies`, `Museum`, `HallOfFame`, `ClubPublic`, `ClubTimeline`, `FirstTeam`, `NewsletterUnsubscribe`, `MonriBridge`, `Seo` naslovi/opisi — svi stringovi kroz `t()`. |
| Home sekcije | `LeagueTable` (zaglavlja tabele), `Newsletter` (uspjeh/greška), `NextMatch` (domaćin/gost) + `home.season` za sezonsku statistiku igrača. |
| Interpolacije | `pages.league.tableToRound` (`{{round}}`), `pages.tickets.signedInAs` (`{{email}}`), `pages.player.goalsCount` (`{{count}}`), `home.season` (`{{name}}`). |
| SEO | `<Seo title>` / `description` na svim stranicama sada iz locale fajlova (EN korisnik dobija EN meta opis). |
| Guard | Novi test **`src/i18n/no-hardcoded-text.test.ts`** — skenira `pages/public/**` i `pages/home/**`, pada ako nađe JSX tekst ili tekstualni prop (`title=`, `placeholder=`, `label=`…) sa literalnim stringom van allowliste (brendovi/formati). Probe-om potvrđeno da hvata namjernu regresiju. |
| Postojeći test | `src/i18n/i18n-keys.test.ts` (bs↔en parity + svaki literalni `t('…')` ključ postoji) sada pokriva i nove ključeve. |

## 4. Verifikacija

| Provjera | Rezultat |
|----------|----------|
| `npm run test -w frontend` | ✅ **48 testa / 13 fajlova** (novi guard test + 1 postojeći proširen pokrivanjem) |
| Guard self-test | privremeni fajl `pages/public/__probe.tsx` sa `<p>Proba hardkodirano</p>` → test **pao** sa tačnom lokacijom; uklonjen |
| Skeniranje preostalih literala | `pages/public/**` + `pages/home/**` → **0** hardkodiranih UI stringova |
| `npm run build -w frontend` | ✅ (`tsc -b` uključuje testove) |
| `npm run lint -w frontend` | ✅ 0 grešaka |
| `npm run check:all` | ✅ 7/7 |
| Vidljivo ponašanje | EN korisnik sada vidi engleski tekst (do sada BS); BS korisnik vidi **identičan** tekst kao prije (vrijednosti prenesene 1:1) |

## 5. Ostaje (izvan opsega, prijavljeno)

- **~261 hardkodiran string u `components/**` i `cms/**`** (97 fajlova) — najviše
  `club/ClubStatsPanels` (15), `match/MatchStatisticsSection` (13),
  `public/league/LeagueResultsRound` (12), `team/TeamSeasonStats` (10). To su
  komponente koje dijele javni portal i admin; migracija ide uz **FE-04** (admin) i
  završnu reviziju javnog portala — guard test za njih se uključuje kad se migracija završi.
- Admin (`pages/admin/**`, 147 fajlova) — **FE-04**.

## Status segmenta: ZATVOREN
