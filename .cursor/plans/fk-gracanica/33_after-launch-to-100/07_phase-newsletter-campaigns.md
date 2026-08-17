# Faza 7 — Newsletter kampanje 10 → 100%

Danas: subscribe, admin lista, CSV. Nema blast (`newsletter.service.ts`).
Email queue postoji (`JobsService.enqueueEmail` + SMTP settings).

## Šema

```
model NewsletterCampaign {
  id, subject, htmlBody, textBody, status, sentAt, sentCount, failCount
  createdAt, updatedAt, createdById
}
```

Status: `DRAFT` | `SENDING` | `SENT` | `FAILED`.
Na `NewsletterSubscriber` dodati `unsubscribeToken` (cuid, unique) — migracija backfill.

## Posao

1. `POST /newsletter/campaigns` draft; `POST .../:id/send` enqueue po aktivnom pretplatniku (batch, ne jedan sync loop u HTTP).
2. Worker već šalje mail; rate: BullMQ `limiter` (npr. 10/min) da SMTP ne umre.
3. HTML: unsubscribe link `/newsletter/unsubscribe?token=`.
4. Admin tab pored liste: subject, textarea/HTML, preview, send, historija, brojke.
5. RBAC: `newsletter.manage` (ako nema, dodaj; `newsletter.read` ostaje lista).
6. Settings: `newsletter.blastEnabled` boolean default false — feature flag.
7. Test: send na 1 pretplatnika mock SMTP; unsubscribe token.

Ne uvoditi Mailchimp. Ako SMTP nije za bulk, flag ostaje off u produkciji; kod je 100%.

## Fajlovi

- `backend/src/newsletter/` split campaign service
- `frontend/src/pages/admin/NewsletterAdminPage.tsx` — tab kampanje (file length: izdvoji `NewsletterCampaignPanel.tsx`)
- `.cursor/docs/matrices/newsletter/`

## 100%

Draft → send → historija → unsubscribe. Katalog `newsletter-campaigns` 100 ready. `newsletter` pretplata ostaje 90/in_progress ako blast nije isti modul (ne dirati taj red osim summary rečenice).
