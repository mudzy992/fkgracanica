# Faza 6 — Članstvo i ulaznice

## Cilj

Članstvo, rezervacija ulaznica, QR, digitalne kartice. **Bez online payment gatewaya.**

## Matrix

`.cursor/docs/matrices/membership/MATRIX.md`, `.cursor/docs/matrices/ticketing/MATRIX.md`

## Backend

MembershipModule, TicketingModule, Payment stub

## Prisma

Membership, MembershipCard, Ticket, TicketOrder, Payment (stub)

## Exit

Član i ulaznica rade; plaćanje na blagajni + admin potvrda.
