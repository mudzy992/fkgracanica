# Konvencije

> Status: inicijalna verzija · Ažurirano: 2026-11-02
> Izvor: `.cursorrules`, `.cursor/rules/`, postojeća praksa u repu. Ovaj dokument ih objedinjuje.

## Datoteke i modularnost (HARD LIMIT iz `.cursorrules`)

- Maksimalno **200 linija po fajlu** (config/routing/schema do **400**).
- Ako zadatak gura fajl preko limita → stani i podijeli na helper/module.
- Preferirati čiste, predvidive helper funkcije nad monolitnim klasama.

## Radni tok (iz `.cursorrules` + protokola)

- Faza planiranja → potvrda → egzekucija (minimalni diff, bez prepisivanja netaknutih linija).
- **Nikad PR** — rad direktno na aktivnoj grani; svaki push mora imati zelen CI (dok CI postoji).
- Commiti: Conventional Commits, `type(scope): opis [SEGMENT-ID]`, mali i atomični.
- Svaka izmjena se vodi u `AUDIT/STATE.md` i `AUDIT/COVERAGE_MATRIX.md`.

## Kod

- TypeScript svugdje; puna tipizacija; bez `any` gdje se može izbjeći.
- Backend: slojevi Controller → Service → Prisma; DTO validacija na granici sistema;
  env konfiguracija čitana centralno; bez tajni u kodu (F-001 rješavati kroz Q-04).
- Frontend/Mobile: bez hardkodiranih boja/razmacima van tokena (guardrail skripta u planu);
  i18n: **BS default**, EN key-ovi po modulima; isti key sistem na webu i mobilnom.
- Zabranjeno: `console.log`/debug ostatci u produkcijkom kodu (guardrail u planu).

## Moduli i dokumentacija

- Složeni moduli moraju imati `.cursor/docs/matrices/<module>/MATRIX.md` + `CHANGELOG.md`
  (live centar, ticketing, membership, rbac, … — popis u `.cursor/docs/matrices/`).
- Dokumentacija: **`docs/` + `AUDIT/` su jedini izvor istine**; penzionisani dokumenti u
  `docs/_retired/` (baner + INDEX) — nikad se ne oslanjati na njih za odluke.
- Odluke koje je korisnik odobrio → `docs/DECISIONS.md`.

## Posebna pravila (iz HANDOFF-ova — poštovati)

- **Ne dirati** showcase intercept u `mobile/app/_layout.tsx` i `(tabs)/_layout.tsx`.
- **Ne editovati** Cursor plan fajlove (`.cursor/plans/**`) bez odobrenja.

## Skripte (postojeće)

| Skripta | Namjena |
|---------|---------|
| `scripts/menu.sh` | interaktivni meni (rebuild / lock sync / migrate / commit / EAS) |
| `scripts/docker-prod-build.sh` | Docker build + prune |
| `scripts/sync-docker-locks.sh` | regeneracija standalone lockova (Docker `npm ci`) |
| `scripts/rotate-secrets.sh` | rotacija JWT + ADMIN_PASSWORD u `.env` |
| `scripts/setup-upload-dir.sh` | priprema upload direktorija |
| `scripts/qa-live-commentator.mjs`, `qa-live-reset.sh` | QA pomoci za live centar |
