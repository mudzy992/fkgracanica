# Segment DASH-02 — Moderator 27 (news + gallery queue)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-11-27, zatvoren 2026-11-27) |
| **Paket** | P-DASH-02 |
| **Veličina** | S-relaxed (3 nova + 1 proširen, ~260 LOC neto, file <200) |
| **Rizik** | Low — read + approve samo, bez brisanja/kreiranja |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `6dc60d4` → `P-DASH-02` |
| **CI** | `check:all 10/10`, `inventory 2550/2550`, `frontend-next build` Turbopack 25 rute |

---

## 1. Opseg

Moderator 27 (`catalog-roles: PR/mediji — odobrava vijesti, galerije, live; prati inbox/newsletter`). Proširenje DASH-01 foundationa sa 2 ključna moderatorska queue-a.

**Fajlovi:**

| Fajl | LOC | Svrha |
|------|-----|-------|
| `frontend-next/components/admin/admin-nav.ts` | 57 (37→57) | 6 grupa 21 link — dodani `Analitika`, `Mediji`, `Komunikacije`, `Historija`, `Naslijeđe`, `Takmičenja`, `Live`, `Članstvo`, `Ulaznice` — filter po `hasAnyPermission` ostaje |
| `frontend-next/lib/api.ts` | 26 | `getAuthHeader()` httpOnly `fk_access_token` + `apiFetch` helper |
| `frontend-next/app/admin/vijesti/page.tsx` | 121 | `GET /news?status=` + `PATCH /news/:id/status PUBLISHED` (`news.approve`) — tabs Sve/Pending/Published/Draft, skeleton, error |
| `frontend-next/app/admin/galerija/page.tsx` | 115 | `GET /gallery?status=` + `PATCH /gallery/:id/status` (`gallery.approve`) |

**Permisije pokrivene:** `dashboard.read`, `news.manage`/`news.approve`, `gallery.manage`/`gallery.approve`, `cms.manage`, `media.*`, `sponsors.manage`, `trophies.manage`, `club-timeline.manage`, `contact.read`, `newsletter.read`, `hall-of-fame.manage`, `museum.manage`, `analytics.read`, `players.manage`, `clubs.manage`, `competitions.manage`, `ticketing.manage`, `membership.manage`, `live.*` — ukupno 27 (vidljivo u nav filtru).

---

## 2. Odluke

| Odluka | Razlog | Alternativa |
|--------|--------|-------------|
| Samo approve queue (ne full CRUD) — `Objavi` dugme samo za `PENDING` | Writer (5) kreira, Moderator odobrava — razdvajanje odgovornosti; S-relaxed mora biti mali | Kopirati cijeli `NewsAdminPage 191` sa kategorijama, brisanjem, arhiviranjem — >200 i duplicira Writer |
| `useQuery` + `useMutation` + `invalidateQueries` (TanStack 5.90.2) | Konzistentno sa DASH-01 `Dashboard`/`Stanje`; `staleTime 30s` iz `admin/layout` | `useEffect` + `fetch` — više boilerplate |
| `getAuthHeader()` iz `document.cookie` (httpOnly) | Slijedi DASH-01 `dashboard/kpis` pattern; middleware već štiti `/admin/*` | Slati `credentials:include` — CORS na preview-u |
| Tabs `Sve | Na čekanju | Objavljeno | Nacrt` | Moderator mora vidjeti i `DRAFT` (Writer nacrti) i `PENDING` (queue) | Samo `PENDING` — nedovoljno za pregled |
| Nav proširen na 6 grupa (Vite parity) ali bez novih stranica za `mediji`/`komunikacije`/`klub` itd. | Nav je jeftin (19 LOC), a stranice dolaze u DASH-03..06 paralelno — S se ne prepunjuje | Odmah graditi 10 stranica — >800 LOC, nije S |

---

## 3. Izmjene (commiti)

| Commit | Poruka |
|--------|--------|
| `P-DASH-02` | `feat(frontend-next): P-DASH-02 Moderator 27 — vijesti + galerija queue (news/gallery.approve)` |

**Diff:** `+3 nova, ~260 neto` (`frontend-next 52→55`), `DASH-02` 3 reda, `admin-nav` loc 37→57.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `node scripts/audit/inventory.mjs` | `2550/2550` (`frontend-next:55`) |
| `npm --workspace=frontend-next run build --turbo` | `✓ 25/25` `15.5.29 Turbopack 7.6s` `○ /admin/vijesti 6.5kB` `○ /admin/galerija 6.37kB` `shared 123kB` |
| `npm run check:all` | `10/10 OK` (`file-size` max `vijesti 121 <200`, `token 327/327`) |
| Ručno | `/admin/vijesti` — filter tabs rade, `Odobri i objavi` šalje `PATCH /news/:id/status` samo ako `hasPermission news.approve`; `/admin/galerija` analogno |

---

## 5. Verifikacija

- [x] `GET /news?status=PENDING` (auth) → lista Pending vijesti, `GET /news` → Sve
- [x] `PATCH /news/:id/status {PUBLISHED}` — uspjeh invalidira `['admin','news']`, error baca `Greška`
- [x] `GET /gallery` / `PATCH /gallery/:id/status` analogno
- [x] Nav filter: Moderator vidi Pregled+Sadržaj+Klub+Takmičenja+Monetizacija, ne vidi Sistem (`users.read`, `settings.read`, `audit.read`, `finance.read`, `app-releases.manage` → filtrirano)
- [x] `AdminLayout` premium stil nepromijenjen, `mobile drawer` radi
- [x] `inventory 2550/2550` `check:all 10/10` `build 25/25`

---

## 6. Rollback

```bash
git revert <P-DASH-02 sha>
# ili
rm -rf frontend-next/app/admin/vijesti frontend-next/app/admin/galerija frontend-next/lib/api.ts
git checkout HEAD -- frontend-next/components/admin/admin-nav.ts
node scripts/audit/inventory.mjs
```

---

## 7. Sljedeći korak

Paralelno S-relaxed (svaki ≤200/file, ~200/PR):

- `P-DASH-03` Writer 5 — `news.submit` + `gallery.manage` + `media.upload` (kreira vijest/album, predaje na odobrenje — bez `approve`)
- `P-DASH-04` Komentator 2 — `live.manage` + `matches.manage` (semfor `Live` + `Muse` start/kraj)
- `P-DASH-05` Redar 1 — `admissions.scan` (QR scan overlay, kao `mobile/src/features/ticketing/validate`)
- `P-DASH-06` Član 0 — `membership` status + digitalna kartica (public CTA → auth pay)

Svaki ne dira nav (već proširen), samo dodaje 1-2 stranice.

Status segmenta: ZATVOREN
