# HANDOFF — Web Complete (nova sesija)

> **Datum:** 2026-06-25  
> **Završeno u prethodnoj sesiji:** Gate moduli 1–2 APPROVED  
> **Sljedeći fokus:** Modul **#3 CMS** → gate review + polish  
> **Mobile:** na pauzi — samo web + backend.

---

## 1. Prvo pročitaj (agent)

1. [GATE_LOG.md](./GATE_LOG.md) — izvor istine za gate status
2. [03_track-admin-modules.md](./03_track-admin-modules.md) — redoslijed 21 modula
3. [../HANDOFF.md](../HANDOFF.md) — deploy, env, API
4. Korisnikova prva poruka — `APPROVED` / `REVISE` po modulu

---

## 2. Gate status

| # | Modul | Status |
|---|-------|--------|
| 1 | **Vijesti** | **APPROVED** |
| 2 | **Media** | **APPROVED** |
| 3 | **CMS** | **Sljedeći** — gate review |
| 4+ | Galerija → Dashboard | nije gate-ovan |

---

## 3. Šta uraditi u novoj sesiji

### Korak 1 — CMS gate (`/admin/cms`)

Checklist iz [03_track-admin-modules.md](./03_track-admin-modules.md):

- [ ] CRUD blokova (hero, sekcije, copy)
- [ ] Rich text / JSON editor gdje treba (`CmsBlockEditor.tsx`)
- [ ] Javni prikaz usklađen (`useCmsBlock`, `Hero.tsx`, ostale sekcije)
- [ ] RBAC (`cms.manage` ili ekvivalent)
- [ ] Dijalog pattern + `dirty` zaštita (kao vijesti)
- [ ] Bez JS grešaka u konzoli

Ako korisnik potvrdi → GATE_LOG: `CMS | APPROVED`.

Ako `REVISE` → fix minimal diff, status `READY_FOR_REVIEW`, **ne idi na Galeriju**.

### Korak 2 — Nastavak redoslijeda

4. Galerija → 5. Sponzori → … → 21. Dashboard

Za svaki modul: gate u GATE_LOG prije prelaska na sljedeći.

---

## 4. Implementirano u sesijama (sažetak)

### Infrastruktura (cross-cutting)
- **Dijalozi** umjesto drawera: `dialog.tsx`, `AdminFormSheet` → centrirani dijalog, scroll, `dirty` blokira backdrop
- **`asArray`** — API `{ data, meta }` normalizacija (`frontend/src/lib/as-array.ts`)
- **`RichContent`** + `.rich-content` CSS — HTML render na javnim stranicama
- **`PhotoGridWithLightbox`** — original u lightboxu (vijesti galerija, `/galerija/:slug`)
- **TipTap** proširen: link, slika (mediji), YouTube, underline, H2/H3, liste, citat
- **Prisma P3015** fix: obrisan prazan folder `20260625065651_news_extended`; OpenSSL u Docker runner stage

### Vijesti (APPROVED)
- Admin CRUD, workflow draft/pending/publish, kategorije (`NewsCategoriesDialog`)
- `NewsAdminFormSheet` — dijalog, dirty guard, rich editor
- Javno: `/vijesti`, `/vijesti/:slug` — `RichContent`, stripHtml na listama

### Media (APPROVED)
- Folder tree, upload, paginacija, edit/replace/delete
- `MediaPicker` dijalog

---

## 5. Ključni fajlovi za CMS modul

| Područje | Fajlovi |
|----------|---------|
| Admin CMS | `frontend/src/pages/admin/CmsPage.tsx`, `CmsBlockEditor.tsx` |
| Hooks | `frontend/src/hooks/use-cms-admin.ts`, `useCmsBlock` u `hooks/index.ts` |
| Javni | `frontend/src/pages/home/sections/Hero.tsx`, ostale CMS-driven sekcije |
| Backend | `backend/src/cms/*` |
| Shared UI | `AdminFormSheet`, `RichTextEditor`, `RichContent` |

---

## 6. Deploy

```bash
./scripts/docker-prod-build.sh && docker compose up -d
cd backend && npx prisma migrate deploy
```

| Resurs | URL |
|--------|-----|
| Web | https://fkgracanica.ba101.top |
| API | https://fkgracanica.ba101.top/backend/api/v1 |
| Admin CMS | `/admin/cms` |

**Git:** lokalno mnogo uncommitted promjena; gate rad vjerovatno nije pushan.

---

## 7. Prompt za korisnika (copy-paste)

```
Nastavi Web Complete plan iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

Gate status:
- Vijesti: APPROVED
- Media: APPROVED
- CMS: [APPROVED / REVISE / nisam testirao]

[Napiši šta ne radi ako REVISE]

Nastavi po planu od modula koji nije APPROVED.
```

---

## 8. Pravila

- Max ~200 linija po fajlu; refaktor ako preraste
- Plan → execute za veće izmjene; minimal diff
- **Ne markiraj APPROVED** bez korisnikove potvrde
- Mobile ne dirati
