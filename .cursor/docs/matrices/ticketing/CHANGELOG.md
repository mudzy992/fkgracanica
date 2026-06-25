# Changelog — Ticketing

## 2026-06-24 (c)

- Admin UI: `GET /ticketing/admin/orders`, confirm payment, refund lista + `POST …/confirm-refund`
- E2E harness: `setup-e2e-env.ts`, Redis na `127.0.0.1:6379`

## 2026-06-24 (b)

- `validateTicket` marks `PAID_AT_BOX_OFFICE` → `USED`; rejects unpaid `RESERVED`
- E2E: `ticketing-qr.e2e-spec.ts`, unit: `ticketing.service.spec.ts`

## 2026-06-24

- QR validation and box office payment flow defined
