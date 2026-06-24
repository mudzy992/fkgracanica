# HANDOFF — FK Gračanica

> Ažurirano: **2026-06-24** (production roadmap P1–P8, prva iteracija)

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Branch** | `main` |
| **Zadnji commit** | `f5c4b15` — production roadmap P1–P8 |
| **Aktivna faza** | Post-roadmap — hardening & QA |
| **Plan folder** | `.cursor/plans/fk-gracanica/` (`13_`…`20_phase-*.md`) |

---

## 2. Status u jednoj rečenici

Implementiran **production roadmap P1–P8** (paginacija, notifikacije, admin CRUD, CMS/content/competition, ticketing kapacitet, SEO sitemap, mobile QR); ostaju dublji checklist itemi iz plana (media folderi, news workflow, formation editor, search facete, PWA, push).

---

## 3. Produkcija / deploy

| Resurs | URL |
|--------|-----|
| Web | https://fkgracanica.ba101.top |
| API | https://fkgracanica.ba101.top/backend/api/v1 |
| Swagger | https://fkgracanica.ba101.top/backend/api/docs |
| Health | https://fkgracanica.ba101.top/backend/api/v1/health |
| Socket | `wss://fkgracanica.ba101.top/realtime` |

```bash
./scripts/setup-upload-dir.sh   # uid 999 za backend kontejner
./scripts/sync-docker-locks.sh  # ako je dodan npm paket
./scripts/docker-prod-build.sh && docker compose up -d
```

---

## 4. Env

- Root `.env` (ignoriran u gitu)
- Kritično: `DATABASE_URL`, `JWT_*`, `REDIS_URL`, `UPLOAD_PATH`, `VITE_API_URL`, `ADMIN_*`
- `SOCKET_IO_PATH=/socket.io` u kontejneru (compose override)

---

## 5. Pokretanje

```bash
npm run dev:backend    # :3000
npm run dev:frontend   # :5173
npm run dev:mobile
npm run db:seed
cd backend && npm test && npm run test:e2e
cd frontend && npm run build
```

---

## 6. Šta radi / šta ne radi

### Radi (ova sesija)
- **P1:** `PaginatedQueryDto`, users/audit/notifications paginated; `GET /news/slug/:slug`; `notification:new` socket; web NotificationBell + `/admin/notifications`
- **P2:** Users/Roles CRUD, permission matrix, audit filteri, dashboard retry
- **P3:** CMS JSON editor; private settings confirm
- **P4:** Gallery/Sponsors/Trophies admin create; trophy `name` fix
- **P5:** Players/Matches admin create; public competitions GET; `GET /statistics/standings`
- **P7:** Ticketing capacity, refund request, admin orders; membership renew; mobile QR (`react-native-qrcode-svg`)
- **P8:** `SeoModule` (sitemap.xml, robots.txt); theme system preference
- **Ops:** `setup-upload-dir.sh` → uid 999, `thumbs/` folder

### Još nije / dublji rad
- Media folder tree + replace asset; CMS Zod sheme po ključu
- News Writer→Pending→Published workflow UI; komentari; contact/newsletter admin
- Formation editor, LeaguePage → standings API, Clubs admin CRUD
- Live svi event tipovi + moderator approval UI na webu
- Ticketing admin UI (confirm/refund), member discount
- Search facete + paginacija; HoF/Museum/Timeline admin CRUD
- Mobile dark theme; push (`expo-notifications`)
- **Defer:** online payment gateway

---

## 7. Sljedeći koraci

1. Pokreni `npm run test:e2e` na serveru (DB mora biti dostupan)
2. Deploy: `sync-docker-locks.sh` + rebuild (mobile `react-native-svg` u root lock)
3. P4 dubina: news approval workflow + contact inbox admin
4. P5: `LeaguePage` + `LeagueTable` sekcija na `/statistics/standings`
5. P7: `TicketingAdminPage` — confirm payment + refund lista
6. Update matrice: `rbac`, `ticketing`, `membership` CHANGELOG

---

## 8. Ključni novi fajlovi

**Backend:** `common/dto/paginated-query.dto.ts`, `common/utils/pagination.util.ts`, `seo/`, `statistics/standings.util.ts`, `audit/dto/`, `rbac/dto/`, `test/notifications.e2e-spec.ts`, `test/admin-users-rbac.e2e-spec.ts`

**Frontend:** `AdminFormSheet`, `NotificationBell`, `use-paginated-query`, `use-notifications`, `use-users-admin`, `use-content-admin`, `UserAdminFormSheet`

**Mobile:** `RemoteImage`, `QrCodeView`, `use-unread-notifications`

---

## 9. API ugovori

**Paginacija:** `GET …?page=1&limit=20&search=` → `{ data, meta: { total, page, limit, totalPages } }`

**Notifikacije:** `notification:new` (user room); trigger na settings update

---

## 10. Reference

- [13_phase-platform.md](./13_phase-platform.md) … [20_phase-premium.md](./20_phase-premium.md)
- [aplikacijski-plan.md](../../../aplikacijski-plan.md)
- Matrice: `.cursor/docs/matrices/{rbac,ticketing,membership,live_center}/`
