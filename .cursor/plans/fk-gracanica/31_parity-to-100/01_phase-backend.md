# Faza 1 — Backend na 100%

Prioritet sljedeće sesije. Ne dirati after_launch.

## 1. Analytics (42% → cilj ~90)

- `GET /analytics/team` vraća sirovi `matches` dump — agregirati (W/D/L, forma zadnjih 5, golovi za/protiv).
- Nema H2H: `GET /analytics/h2h?homeClubId&awayClubId` (međusobni, zadnji N).
- Player analytics: sažetak po sezoni, ne samo raw events.
- Testovi na service. Fajlovi ≤200.

Evidence: `backend/src/analytics/`.

## 2. Email (68% → ~90)

- HTML body (ne samo `text`).
- Log neuspjeha (ne samo `logger.warn` kad SMTP fali).
- Potvrditi enqueue na membership/tickets/contact (gdje treba).
- Evidence: `backend/src/jobs/jobs.module.ts`.

## 3. SEO share (74% web, BE već ima rutu)

- `GET /seo/share?path=` postoji (`seo.controller.ts`).
- Provjeriti nginx/crawler da botovi dobiju meta, ne prazan SPA.
- Dopuniti `resolveShareMeta` za vijest/utakmica/igrač ako fali.

## 4. Newsletter lista (78%, ne blast)

- Admin list + export CSV (nije blast).
- Subscribe već radi.

## 5. Ostali BE stubovi

- Grep `501`, `not implemented`, prazan service.
- Ticketing/membership plaćanja: Stripe + blagajna ostaju; PayPal/Monri ne dirati.
