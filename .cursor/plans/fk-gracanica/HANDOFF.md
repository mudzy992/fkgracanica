# HANDOFF — FK Gračanica

> Ažurirano: **2026-08-16**

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Datum** | 2026-08-16 |
| **Branch** | `main` |
| **Aktivni track** | [32_web-to-100](./32_web-to-100/HANDOFF.md) — web/admin done; **mobile kasnije** |
| **Prethodno** | Showcase cinematic + audit katalog |
| **Matrica** | `.cursor/docs/matrices/showcase-audit/` |

---

## 2. Status u jednoj rečenici

Web/admin 100% (19 ready + 3 web_only). i18n-en ~60. Mobile polish zadnji.

---

## 3. Produkcija

| Resurs | Vrijednost |
|--------|------------|
| Web | https://fkgracanica.ba101.top |
| Preview | https://fkgracanica.ba101.top/platforma |
| API | https://fkgracanica.ba101.top/backend/api/v1 |
| Swagger | https://fkgracanica.ba101.top/backend/api/docs |
| Health | https://fkgracanica.ba101.top/backend/api/v1/health |

Flag `feature.showcaseMode` default OFF.

---

## 4. Sljedeći koraci

1. **Backend 100%:** analytics H2H/agregacija, email HTML/fail log, SEO share crawler, newsletter lista.
2. **Frontend 100%:** i18n-en, analytics UI, OG, media-tree.
3. **Mobile polish** iz GAPS P0–P2 — tek nakon 1–2.
4. After_launch: [33](./33_after-launch-to-100/HANDOFF.md) — faza 2 PayPal done. Sljedeće: faza 3 Monri.

---

## 5. Pokretanje

```bash
./scripts/menu.sh   # 1 = rebuild docker
# ili
./scripts/docker-prod-build.sh && docker compose up -d
```

---

## 6. Pravila

- Fajlovi ≤200 linija (config do 400)
- Logika → MATRIX + CHANGELOG
- `npm ci` u Dockeru = `frontend/package-lock.json`
- Ne dirati mobile showcase intercept u `_layout.tsx`
