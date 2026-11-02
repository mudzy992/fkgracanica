# INDEX — penzionisani dokumenti

> Svi dokumenti u ovom folderu su **pensionisani 2026-11-02**. Nose baner na vrhu.
> Nisu relevantni za implementaciju — služe isključivo kao historijska referenca.
> Originalne putanje sačuvane su u podfolderima (`docs/…`, `backend/…`, `frontend/…`).
> Nova dokumentacija (izvor istine): `docs/*.md` + `AUDIT/`.

| Dokument (originalna putanja) | Sadržaj u jednoj rečenici |
|-------------------------------|---------------------------|
| `aplikacijski-plan.md` → `docs/_retired/aplikacijski-plan.md` | Master plan razvoja (misija, moduli, faze 1–7) — sadrži zastarjele tvrdnje (MySQL, "plaćanje nije u v1"); zamijenjen `docs/ARCHITECTURE.md` + `AUDIT/02_MASTER_AUDIT_PLAN.md` (kada nastane). |
| `BUILDIN_PROBLEMS.md` → `docs/_retired/BUILDIN_PROBLEMS.md` | Nije dokumentacija — paste Expo DOM runtime error loga iz jedne sesije. |
| `docs/mysql-to-postgres-migration.md` → `docs/_retired/docs/mysql-to-postgres-migration.md` | Operativni zapis migracije MySQL → PostgreSQL (koraci, rollback) — dijelovi su zastarjeli (lockfile, compose opis); migracija je završena. |
| `docs/club-launch/README.md` → `docs/_retired/docs/club-launch/README.md` | Checklista lansiranja sa klubom (kadar, blokade prije produkcije). |
| `docs/club-launch/01_uloge.md` → `docs/_retired/docs/club-launch/01_uloge.md` | Opis uloga u aplikaciji (koga klub imenuje) za lansiranje. |
| `docs/club-launch/02_sadrzaj-identitet.md` → `docs/_retired/docs/club-launch/02_sadrzaj-identitet.md` | Sadržajni unos: identitet kluba, kadar, nasljeđe, sponzori. |
| `docs/club-launch/03_sadrzaj-liga.md` → `docs/_retired/docs/club-launch/03_sadrzaj-liga.md` | Sadržajni unos: liga, klubovi, kola, utakmice. |
| `docs/club-launch/04_sadrzaj-operativa.md` → `docs/_retired/docs/club-launch/04_sadrzaj-operativa.md` | Sadržajni unos: vijesti, galerija, CMS, članarine, ulaznice. |
| `backend/README.md` → `docs/_retired/backend/README.md` | Netaknuti NestJS template README — bez informacije o projektu. |
| `frontend/README.md` → `docs/_retired/frontend/README.md` | Netaknuti Vite/React template README — bez informacije o projektu. |

## Još NIJE penzionisano (čeka odluku na KAPIJI 1)

- Root `README.md` — zadržan kao ulazna tačka (linkovi ažurirani na `docs/`); vidi Q-01.
- `.cursor/plans/**` (~190 historijskih planova) — vidi Q-02 (preporuka: penzionisati).
- `.cursor/docs/matrices/**` — žive feature matrice (ostaju); `.cursorrules`, `.cursor/rules/**`,
  `mobile/AGENTS.md`, `mobile/CLAUDE.md` — konfiguracija alata (ostaju).
- `mobile/PREVIEW_SMOKE.md`, `mobile/PRODUCTION_SMOKE.md` — žive operativne checkliste; vidi Q-03.
