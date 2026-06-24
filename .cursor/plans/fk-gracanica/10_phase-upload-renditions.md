# Faza 10 — Upload renditions

## Cilj

Generisati `thumb` (200px) i `medium` (800px) WebP rendicije uz `original` za slike; ažurirati Media modul i frontend URL-e.

## Backend

- `sharp` dependency
- `ImageRenditionService` — resize + WebP u `thumbs/` i `medium/`
- `UploadService` — original u `originals/`, rendicije za image MIME
- `POST /media/upload` — upload + `MediaAsset` zapis
- `removeAsset` — briše sve tri putanje s diska
- Dockerfile: `openssl` u deps stageu

Struktura:
```
uploads/
  originals/{uuid}.jpg
  thumbs/{uuid}.webp
  medium/{uuid}.webp
```

## Frontend

- `mediaUrl(path, variant)` — ispravan put `/api/v1/uploads/files/...`
- `MediaPage` — upload + thumb preview + brisanje
- `LatestNews` / `SponsorsSection` — `medium` / `thumb` varijante

## Testovi

- `upload.util.spec.ts` — unit
- `upload-renditions.e2e-spec.ts` — upload + static serve + delete

## Exit

Admin može uploadovati sliku; rendicije se generišu i prikazuju u medija biblioteci.

## Sljedeće

HANDOFF §7 korak 4 — Live centar E2E.
