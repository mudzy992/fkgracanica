# HANDOFF — predložak (kopiraj za novu sesiju)

> Ažuriraj `HANDOFF.md` kad kontekst dođe na ~80–90% ili na kraju sesije.
> Drži fajl ispod ~150 linija; detalje prebaci u phase fajlove ili matrice.

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Datum** | YYYY-MM-DD |
| **Branch** | `main` |
| **Zadnji commit** | `<hash>` — kratak opis |
| **Aktivna faza** | Faza N — naziv |
| **Agent / autor** | opciono |

## 2. Status u jednoj rečenici

Šta je **gotovo** u ovoj sesiji i šta **nije**.

## 3. Produkcija / deploy

| Resurs | Vrijednost |
|--------|------------|
| URL (web) | |
| URL (API) | |
| Swagger | |
| Health | |
| Docker | `docker compose ps` — svi healthy? |
| Upload host | `/mnt/shared-app-files/<app>/` |

## 4. Env (bez secreta u tekstu)

- Gdje je `.env` (root / backend)
- Koje varijable su kritične (`DATABASE_URL`, `JWT_*`, `REDIS_URL`, `VITE_API_URL`, …)
- Napomena: je li `.env` u gitu ili ignoriran

## 5. Pokretanje

```bash
# Produkcija
./scripts/docker-prod-build.sh && docker compose up -d

# Lokalni dev
npm run dev:backend
npm run dev:frontend
npm run dev:mobile
```

## 6. Šta radi / šta ne radi

### Radi
- …

### Poznati problemi / stubovi
- …

## 7. Sljedeći koraci (prioritet)

1. …
2. …
3. …

## 8. Fajlovi koje je zadnja sesija dirala

- `path/to/file` — zašto

## 9. Reference

- [aplikacijski-plan.md](../../../aplikacijski-plan.md)
- [CHECKLIST.md](./CHECKLIST.md)
- [00_overview.md](./00_overview.md)
- Matrice: `.cursor/docs/matrices/<module>/`

## 10. Pravila za nastavak

- Fajlovi ~100–150 linija → ekstrahuj helpers
- Promjena logike → update `MATRIX.md` + `CHANGELOG.md`
- Ne mijenjati `.cursor/plans/fk_gračanica_init_*.plan.md` (stari plan artefakt)
