# Faza 6 — Video sažeci 10 → 100%

Danas: jedan `Match.youtubeUrl` (cijeli stream) u match centeru.
Cilj: lista klipova po utakmici (YouTube). Bez upload fajlova.

## Šema

```
model MatchHighlight {
  id, matchId, title, youtubeUrl, startSeconds Int?, sortOrder Int @default(0)
  createdAt, updatedAt
  @@index([matchId])
}
```

`youtubeUrl` na Match ostaje za full stream.

## Posao

1. Prisma migracija + CRUD `admin` `matches.manage`.
2. Public: `GET /matches/:id` uključi `highlights[]`.
3. Match center: sekcija ispod streama, `VideoEmbed` (već parsira YouTube id). `startSeconds` → `&start=`.
4. Admin: lista + dodaj/obriši na match edit (sheet na mobilnom breakpointu).
5. Mobile: ista lista na match detail ako postoji ekran; inače web_only napomena — surface u katalogu je `WM`, uradi oba.
6. i18n BS + EN ključevi.

## Fajlovi

- `backend/prisma/schema.prisma` + migracija
- `backend/src/matches/` (split ako >200)
- `frontend/src/pages/public/MatchCenterPage.tsx` + mali `MatchHighlights.tsx`
- admin match forma
- `mobile/app/...` match detail
- `.cursor/docs/matrices/video-highlights/`

## 100%

CRUD + public/mobile prikaz. Katalog `video-highlights` 100 ready.
