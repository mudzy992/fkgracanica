---
name: unique-visitor-stats
overview: Dodati minimalan first-party tracking za unique public posjetioce na webu i mobilnoj aplikaciji, te prikazati total i 30-dnevni trend u admin/moderator pregledima kroz postojeću dashboard/analytics arhitekturu.
todos:
  - id: schema-visit-model
    content: Definisati Prisma model i migraciju za dnevni unique visitor tracking sa indeksima i unique pravilom.
    status: completed
  - id: public-track-endpoint
    content: Dodati backend endpoint i servis za idempotentan upis public web/mobile posjete po danu.
    status: completed
  - id: client-identity-hooks
    content: Dodati web local storage i mobile SecureStore identitet te okidanje tracking poziva iz public layout/root layout ulaza.
    status: completed
  - id: dashboard-kpis
    content: Proširiti dashboard KPI payload i label mape za web admin i mobile admin prikaz.
    status: completed
  - id: moderator-analytics-view
    content: Dodati moderator pregled visitor KPI sažetka i analytics trend read endpoint za detaljniji uvid.
    status: completed
isProject: false
---

# Unique Visitor Statistika

## Cilj
Implementirati dnevno brojanje unikatnih public posjetilaca za `web` i `mobile`, sa anonimnim per-device/per-browser ID pristupom, i prikazati rezultate unutar admin/moderator pregleda bez uvođenja eksternog analytics servisa.

## Tačne tačke izmjene
- Backend schema: [`/home/administrator/Documents/GitHub/fkgracanica/backend/prisma/schema.prisma`](backend/prisma/schema.prisma)
  - Dodati novi model za agregirani dnevni tracking, npr. `VisitorStat` ili `VisitorVisit`, umjesto da se piggyback-a na postojeće modele oko `Setting`/`PushDevice`.
  - Postojeća zona za audit/uređaje je oko `Setting` i `PushDevice` modela, što je prirodno mjesto za novi tracking model.
- Backend dashboard KPI servis: [`/home/administrator/Documents/GitHub/fkgracanica/backend/src/dashboard/dashboard.service.ts`](backend/src/dashboard/dashboard.service.ts)
  - Proširiti `getKpis()` da vrati dodatne brojeve za unique visitors.
- Backend dashboard controller: [`/home/administrator/Documents/GitHub/fkgracanica/backend/src/dashboard/dashboard.controller.ts`](backend/src/dashboard/dashboard.controller.ts)
  - Ostaviti postojeći endpoint `GET /dashboard/kpis` kao glavni izvor za admin/mobile dashboard.
- Backend analytics modul: [`/home/administrator/Documents/GitHub/fkgracanica/backend/src/analytics/analytics.controller.ts`](backend/src/analytics/analytics.controller.ts), [`/home/administrator/Documents/GitHub/fkgracanica/backend/src/analytics/analytics.service.ts`](backend/src/analytics/analytics.service.ts)
  - Dodati read endpoint za 30-dnevni trend posjeta, umjesto da se trend ugura u KPI payload.
- Web public ulazna tačka: [`/home/administrator/Documents/GitHub/fkgracanica/frontend/src/components/layout/PublicLayout.tsx`](frontend/src/components/layout/PublicLayout.tsx)
  - Na layout nivou okinuti tracking jednom po sesiji/browser identitetu za public web.
- Mobile public ulazna tačka: [`/home/administrator/Documents/GitHub/fkgracanica/mobile/app/_layout.tsx`](mobile/app/_layout.tsx)
  - Na root layout nivou okinuti tracking za mobile app open/session.
- Mobile/web identity storage:
  - Web: lokalni browser storage helper u frontend app-u.
  - Mobile: [`/home/administrator/Documents/GitHub/fkgracanica/mobile/src/lib/api.ts`](mobile/src/lib/api.ts) ili novi mali helper pored postojećeg `SecureStore` obrasca.
- Admin/moderator prikaz:
  - Web admin dashboard: [`/home/administrator/Documents/GitHub/fkgracanica/frontend/src/pages/admin/homes/AdminHome.tsx`](frontend/src/pages/admin/homes/AdminHome.tsx), [`/home/administrator/Documents/GitHub/fkgracanica/frontend/src/pages/admin/dashboard-kpi-config.ts`](frontend/src/pages/admin/dashboard-kpi-config.ts), [`/home/administrator/Documents/GitHub/fkgracanica/frontend/src/types/index.ts`](frontend/src/types/index.ts)
  - Moderator home: [`/home/administrator/Documents/GitHub/fkgracanica/frontend/src/pages/admin/homes/ModeratorHome.tsx`](frontend/src/pages/admin/homes/ModeratorHome.tsx)
  - Mobile admin dashboard: [`/home/administrator/Documents/GitHub/fkgracanica/mobile/app/staff/admin/dashboard.tsx`](mobile/app/staff/admin/dashboard.tsx), [`/home/administrator/Documents/GitHub/fkgracanica/mobile/src/lib/dashboard-kpi-labels.ts`](mobile/src/lib/dashboard-kpi-labels.ts)

## Predložena minimalna implementacija
1. Dodati DB model za dnevnu agregaciju posjeta sa poljima poput:
   - `date`
   - `platform` (`web` | `mobile`)
   - `visitorKeyHash`
   - opcionalno `path` samo ako kasnije bude trebao breakdown
   - timestamp polja i indeksi nad `date`, `platform`, te unique kombinacijom `date + platform + visitorKeyHash`
2. Uvesti public tracking endpoint tipa `POST /public-analytics/visit` koji prima:
   - `platform`
   - anonimni `visitorId`
   - opcionalno `path`/`screen`
   - Backend hash-a identitet prije upisa i radi idempotentan upsert po danu.
3. Web klijent:
   - Generisati stabilan anonimni browser ID i čuvati ga lokalno.
   - Iz `PublicLayout` poslati tracking na prvi render public layout-a, uz session guard da se isti browser ne spamuje u istoj sesiji.
4. Mobile klijent:
   - Generisati stabilan app-install ID preko `SecureStore`.
   - Iz `mobile/app/_layout.tsx` poslati app-open tracking jednom po launch/session ciklusu.
5. Dashboard/analytics read model:
   - U `dashboard.service.ts` dodati KPI-je poput `uniqueVisitorsWeb`, `uniqueVisitorsMobile`, `uniqueVisitorsTotal30d`.
   - U analytics modulu dodati trend endpoint za niz zadnjih 30 dana po platformi i ukupno.
6. UI:
   - Admin dashboard: dodati KPI kartice za web/mobile unique visitors.
   - Moderator home: dodati barem 1 sažetu KPI karticu ili mini grid sa istim brojevima.
   - Mobile admin dashboard: automatski prikaz kroz postojeći `Object.entries(kpis)` nakon proširenja label mapa.

## Zašto ovako
- Ne diramo postojeći auth model i ne oslanjamo se na login.
- Dobijamo jedinstven broj po danu i po platformi, što je dovoljno za upravljački pregled.
- Oslanjamo se na postojeće dashboard KPI endpointove koje već koriste i web admin i mobile admin.
- Izbjegavamo pretežak event log; agregirani/idempotentni model je jeftiniji i jednostavniji za održavanje.

## Napomene i granice
- Ovo broji `public` korištenje, ne staff/admin sesije.
- Anonimni browser/app ID daje praktičan “unique visitor” signal, ali nije savršen cross-device identity.
- Ako kasnije bude trebao detaljniji funnel ili page-level analytics, tada bi trebalo izdvojiti poseban event log model i dodatne dashboard vizuale.
