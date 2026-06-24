# Ticketing Matrix

## Ticket status flow

```
RESERVED → PAID_AT_BOX_OFFICE → USED
        ↘ CANCELLED
        ↘ REFUND_REQUESTED
```

## Capacity

- Per match: `capacity` from settings or match metadata
- Auto-close when sold >= capacity

## QR validation

- `POST /ticketing/validate` with qrCode
- Admin/mobile scanner marks USED

## Payment

- Order created with `Payment.status: PENDING_BOX_OFFICE`
- Admin confirms → `CONFIRMED`, tickets → `PAID_AT_BOX_OFFICE`
- Validate at gate → ticket → `USED` (rejects `RESERVED`, `USED`, `CANCELLED`)

## Changelog

- 2026-06-24: Reservation + box office model
