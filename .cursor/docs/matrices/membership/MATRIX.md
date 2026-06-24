# Membership Matrix

## Status flow

```
PENDING → ACTIVE → EXPIRED
              ↘ CANCELLED
```

## Card generation

- On activation: `MembershipCard` with unique `cardNumber` + `qrCode`
- QR encodes card ID for validation

## Payment (F6)

- No online gateway in v1
- Admin activates membership after box office payment

## Changelog

- 2026-06-24: Initial membership matrix, payment deferred
