# Segment DASH-03 — Writer 5 (kreira + predaje)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-DASH-03 |
| **Veličina** | S (1 nova + 1 proširenje, ~107 LOC neto, file <200) |
| **Rizik** | Low — submit samo, bez approve |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `e236605` → `P-DASH-03` |
| **CI** | `inventory 2551/2551`, `build 26 rute`, `check:all 10/10` |

---

## 1. Opseg

Writer 5 (`news.manage` `news.submit` `gallery.manage` `media.read` `media.upload` — piše vijesti, slaže albume, predaje na odobrenje).

**Fajlovi:**

| Fajl | LOC | Svrha |
|------|-----|-------|
| `frontend-next/app/admin/mediji/page.tsx` | 81 | `GET /media/assets` `media.read` + upload placeholder `media.upload` |
| `frontend-next/app/admin/vijesti/page.tsx` | 148 (121→148) | Dodan `canSubmit` + `submit` mutation `PATCH /news/:id/submit` `news.submit` — Writer `DRAFT→PENDING`, Moderator i dalje `PENDING→PUBLISHED` |

Nema promjene nav-a (već ima `/admin/mediji`).

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| `mediji` kao zasebna premium stranica, a ne dio `vijesti` | Writer mora imati biblioteku slika za vijesti/galeriju; `media.upload` je ključna permisija |
| `vijesti` proširenje umjesto nova stranica | Ista queue stranica služi oba role-a (Writer vidi `Predaj na pregled`, Moderator `Odobri` — `hasPermission` grana); S ostaje mali |
| `PATCH /news/:id/submit` umjesto `status` | Backend ima zaseban endpoint `news.submit` (ne `news.approve`); poštuje RBAC |
| `media/assets` bez paginacije, `slice(0,8)` | S — dovoljno za preview; puni `MediaFolderTree` je DASH-01/02 scope, ovdje samo list |

---

## 3. Izmjene

| Commit | Poruka |
|--------|--------|
| `P-DASH-03` | `feat(frontend-next): P-DASH-03 Writer 5 — mediji + vijesti submit` |

Diff: `+1` nova, `vijesti` `+27` LOC, `DASH-03` 1 red + `DASH-02` update.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `inventory` | `2551/2551` (`frontend-next:56`) |
| `build` | `✓ 26/26` `○ /admin/mediji 5.36kB` `○ /admin/vijesti 6.65kB` |
| `check:all` | `10/10 OK` (`vijesti 147`, `mediji 80`) |

---

## 5. Verifikacija

- [x] Writer (5 perms) vidi `/admin/vijesti` `DRAFT` → `Predaj na pregled` (PATCH /news/:id/submit), ne vidi `Odobri`
- [x] Moderator i dalje vidi `Odobri i objavi` za `PENDING`
- [x] `/admin/mediji` — `GET /media/assets` s `media.read`, upload dugme disabled ako nema `media.upload`
- [x] Nav `/admin/mediji` vidljiv za oba (Writer + Moderator)

---

## 6. Rollback

```bash
git revert <sha>
rm frontend-next/app/admin/mediji/page.tsx
git checkout HEAD -- frontend-next/app/admin/vijesti/page.tsx
node scripts/audit/inventory.mjs
```

---

## 7. Sljedeći korak

- `P-DASH-04` Komentator 2 — `live.manage` + `matches.manage`
- `P-DASH-05` Redar 1 — `admissions.scan`
- `P-DASH-06` Član 0 — public CTA već na Next-u, admin placeholder

Status: ZATVOREN
