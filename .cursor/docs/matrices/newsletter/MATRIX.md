# Newsletter Matrix

## Javno

- CMS widget `newsletter` na landing stranicama
- `POST /newsletter/subscribe` — email upsert, `isActive: true`
- `POST /newsletter/unsubscribe` — deaktivacija

## Admin (`/admin/newsletter`)

- Paginirana lista pretplatnika + pretraga po emailu
- Status badge: Aktivan / Neaktivan
- Akcija: Odjavi (admin unsubscribe)

## RBAC

- `newsletter.read` — pregled liste
- `PermissionRoute` na `/admin/newsletter` + API guard

## Napomene

- Nema slanja kampanja (email blast) — samo pretplate i admin pregled
- Duplikat email → reaktivacija putem subscribe
- `NewsletterEmailDto` — `@IsEmail()` na subscribe/unsubscribe

## Changelog

- 2026-06-30: Polish — email validacija, widget error state, `PermissionRoute`
- 2026-06-29: Gate #16 READY_FOR_REVIEW — widget + admin lista
