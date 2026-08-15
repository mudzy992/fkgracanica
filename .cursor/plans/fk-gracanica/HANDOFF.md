# HANDOFF — FK Gračanica

> Ažurirano: **2026-08-15**

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Datum** | 2026-08-15 |
| **Branch** | `main` (origin usklađen) |
| **Zadnji commit** | `477af7b` — frontend Docker npm ci (React lock) |
| **Prije toga** | `b44b7e0` — Showcase Mode |
| **Aktivni track** | Showcase **DONE** na serveru; mobile polish **lokalno, nije pushan** |
| **Session** | [30_showcase-mode/HANDOFF.md](./30_showcase-mode/HANDOFF.md) |
| **Matrica** | `.cursor/docs/matrices/showcase/` |

---

## 2. Status u jednoj rečenici

Showcase Mode je na `main` i u Docker produkciji; lokalni PC ima nesačuvan mobile polish (faza 29) već spojen sa showcaseom (stash/pull/pop bez konflikta).

---

## 3. Produkcija

| Resurs | Vrijednost |
|--------|------------|
| Web | https://fkgracanica.ba101.top |
| API | https://fkgracanica.ba101.top/backend/api/v1 |
| Swagger | https://fkgracanica.ba101.top/backend/api/docs |
| Health | https://fkgracanica.ba101.top/backend/api/v1/health |
| Docker | rebuild 2026-08-15 OK (`fkgracanica-backend` + `frontend` started) |

Showcase flag default **OFF**. Preview: `/platforma` ili `?showcase=1`.

---

## 4. Dvije mašine (važno)

**Server (ova sesija):** showcase + Docker lock fix, pushano.

**Lokalni Windows PC:** uncommitted polish. Nakon `stash` → `pull` → `stash pop` auto-merge na:

- `mobile/app/_layout.tsx` (mora imati `Stack.Screen name="showcase"`)
- `mobile/app/(tabs)/_layout.tsx` (mora imati showcase intercept + `isStaffUser`)

**Ne committati polish dok nije spreman.** Showcase je već na remoteu.

---

## 5. Sljedeći koraci

1. Lokalno: nastaviti mobile screen polish (faza 29 / liga-klubovi), pa commit + push.
2. Uključiti `feature.showcaseMode` kad klub treba javnu prezentaciju.
3. Ne implementirati u ovoj traci: PayPal, Monri, PWA, Excel, newsletter blast (`after_launch`).

---

## 6. Pokretanje

```bash
./scripts/menu.sh   # 1 = rebuild docker
# ili
./scripts/docker-prod-build.sh && docker compose up -d
```

---

## 7. Pravila

- Fajlovi ≤200 linija (config do 400)
- Logika → `MATRIX.md` + `CHANGELOG.md`
- `npm ci` u Dockeru koristi **per-package** lock (`frontend/package-lock.json`), ne root workspace lock
