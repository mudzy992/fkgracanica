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
| `POST /newsletter/campaigns` | `newsletter.manage` | Draft (`subject`, `textBody`, opciono CTA) |
| `POST /newsletter/campaigns/preview` | `newsletter.manage` | HTML iz klupskog templatea |
| `POST /newsletter/campaigns/:id/send` | `newsletter.manage` | Enqueue po aktivnom pretplatniku |

Editor je tekst + Switch CTA, ne HTML. Server renderira `newsletter-email.template.ts` (grb, ime, paragrafi, odjava).

Send nije sync HTTP loop. Queue `email` limiter 10/min. `newsletter.blastEnabled` default false.

Socket: room `newsletter` (`newsletter:join`), event `newsletter:campaign` `{ id, status, sentCount, failCount, targetCount }`.

## RBAC

- `newsletter.read` — lista pretplatnika + historija kampanja
- `newsletter.manage` — draft + send

## Changelog

Vidi `CHANGELOG.md`.
