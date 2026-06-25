# HANDOFF — Web Complete (nova sesija)

> **Datum:** 2026-06-25  
> **Završeno:** Gate moduli 1–3 APPROVED (Vijesti, Media, CMS)  
> **Sljedeći fokus:** Modul **#4 Galerija**  
> **Mobile:** na pauzi — samo web + backend.

---

## 1. Prvo pročitaj (agent)

1. [GATE_LOG.md](./GATE_LOG.md)
2. [03_track-admin-modules.md](./03_track-admin-modules.md)
3. [../HANDOFF.md](../HANDOFF.md) — deploy, env
4. Korisnikova poruka — gate status po modulu

---

## 2. Gate status

| # | Modul | Status |
|---|-------|--------|
| 1 | Vijesti | **APPROVED** |
| 2 | Media | **APPROVED** |
| 3 | CMS | **APPROVED** |
| 4 | **Galerija** | **Sljedeći** — gate review |
| 5+ | Sponzori → Dashboard | nije gate-ovan |

---

## 3. CMS — šta je isporučeno (APPROVED)

- **Page builder** — widgeti, drag reorder, live preview, dijalog za uređivanje sekcije
- **15+ widgeta** — hero (CTA label+url), vijesti, galerija, custom HTML, moduli…
- **Stranice** — `/p/:slug`, meta, objava; **brisanje samo DRAFT** (ne sistemska)
- **Meni** — vizuelni editor, sistemske stavke zaključane (toggle + reorder), prilagođene CRUD
- **Legacy `CmsBlock`** — uklonjen
- Plan: [22_cms-page-builder/](../22_cms-page-builder/)

### Ključni fajlovi

| Područje | Putanja |
|----------|---------|
| Admin hub | `frontend/src/pages/admin/cms/CmsHubPage.tsx` |
| Page builder | `CmsPageBuilderPage.tsx`, `CmsSectionEditDialog.tsx` |
| Meni | `CmsMenuEditor.tsx`, `CmsMenuSortableList.tsx` |
| Javno | `frontend/src/cms/PageRenderer.tsx`, `widgets/*` |
| API | `backend/src/cms/cms-pages.*`, `cms-menus.*` |

---

## 4. Sljedeća sesija — Galerija (#4)

Checklist (gate):

- [ ] Admin CRUD albuma + fotografija
- [ ] Media picker / upload
- [ ] Javno `/galerija`, `/galerija/:slug` — lightbox, renditions
- [ ] RBAC, paginacija ako ima
- [ ] Usklađenost s CMS `gallery` widgetom

Admin: `/admin/gallery`  
Javno: `/galerija`

---

## 5. Deploy

```bash
./scripts/docker-prod-build.sh && docker compose up -d
cd backend && npx prisma migrate deploy
```

Migracije uključuju: `cms_page_builder`, `drop_cms_block`, `menu_system_enabled`.

| Resurs | URL |
|--------|-----|
| Admin CMS | `/admin/cms` |
| Admin Galerija | `/admin/gallery` |

---

## 6. Prompt za korisnika (copy-paste)

```
Nastavi Web Complete plan iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

Gate status:
- Vijesti: APPROVED
- Media: APPROVED
- CMS: APPROVED
- Galerija: [APPROVED / REVISE / nisam testirao]

Nastavi po planu od modula koji nije APPROVED.
```

---

## 7. Pravila

- Max ~200 linija po fajlu
- Gate APPROVED samo uz korisnikovu potvrdu
- Mobile ne dirati
