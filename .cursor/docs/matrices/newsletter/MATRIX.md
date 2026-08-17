# Newsletter Matrix

## Javno

- CMS widget `newsletter` na landing stranicama
- `POST /newsletter/subscribe` — email upsert, `isActive: true`, `unsubscribeToken`
- `POST /newsletter/unsubscribe` — deaktivacija po emailu
- `GET /newsletter/unsubscribe?token=` — odjava iz maila; FE `/newsletter/unsubscribe`

## Admin (`/admin/comms?tab=newsletter`)

- Tab pretplatnici: lista, CSV, odjava
- Tab kampanje: draft, preview, send, historija, brojke

## Kampanje

| Endpoint | Auth | Opis |
|----------|------|------|
| `GET /newsletter/campaigns` | `newsletter.read` | Historija |
| `POST /newsletter/campaigns` | `newsletter.manage` | Draft |
| `POST /newsletter/campaigns/:id/send` | `newsletter.manage` | Enqueue po aktivnom pretplatniku |

Send nije sync HTTP loop. Queue `email` limiter 10/min. `newsletter.blastEnabled` default false.

## RBAC

- `newsletter.read` — lista pretplatnika + historija kampanja
- `newsletter.manage` — draft + send

## Changelog

Vidi `CHANGELOG.md`.
