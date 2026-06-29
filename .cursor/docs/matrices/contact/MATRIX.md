# Contact Matrix

## Javna stranica (`/kontakt`)

- Forma: ime, email, naslov (opcionalno), poruka (min 10 znakova)
- Kontakt podaci iz public settings: `contact.email`, `contact.phone`, `contact.address`
- Prijavljeni korisnik: auto-prefill imena i emaila
- Success state nakon slanja

## API

| Endpoint | Auth | Opis |
|----------|------|------|
| `POST /contact` | — | Kreira poruku |
| `GET /contact` | `contact.read` | Paginirana lista + search + unreadOnly |
| `GET /contact/:id` | `contact.read` | Detalj |
| `PATCH /contact/:id/read` | `contact.read` | Označi pročitano |
| `PATCH /contact/read-all` | `contact.read` | Sve pročitano |
| `DELETE /contact/:id` | `contact.read` | Brisanje |

## Admin UI (`/admin/contact`)

- Tabela poruka s filterima (pretraga, samo nepročitane)
- Sheet detalj s mailto linkom
- Označi pročitano / označi sve / obriši

## RBAC

- `contact.read` — pregled i upravljanje inboxom

## Changelog

Vidi [CHANGELOG.md](./CHANGELOG.md)
