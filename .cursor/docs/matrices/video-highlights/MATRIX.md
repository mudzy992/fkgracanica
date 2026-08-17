# Video highlights matrix

## Model

`MatchHighlight`: `id`, `matchId`, `title`, `youtubeUrl`, `startSeconds?`, `sortOrder`, timestamps.
`Match.youtubeUrl` ostaje full stream.

## API

| Endpoint | Auth | Opis |
|----------|------|------|
| `GET /matches/:id` | public | `highlights[]` sortirano |
| `POST /matches/:matchId/highlights` | `matches.manage` | YouTube URL obavezan |
| `PATCH /matches/:matchId/highlights/:id` | `matches.manage` | |
| `DELETE /matches/:matchId/highlights/:id` | `matches.manage` | |

Nema upload fajlova. `startSeconds` → YouTube `&start=`.

## UI

- Public match center: snimak + lista klipova
- Admin: sheet utakmice (i završene)
- Mobile live detail: lista → YouTube app (`Linking`)
