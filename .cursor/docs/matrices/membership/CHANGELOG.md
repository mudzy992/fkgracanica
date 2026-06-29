# Changelog — Membership

## 2026-06-29 (d)

- `MembershipPendingStatus`: PENDING = uplata zaprimljena, bez „Plati online” dugmeta (retry samo na `?cancelled=1`)
- Header: `PublicUserMenu` — inicijali, dropdown Moj račun / Dashboard (staff) / Odjava

## 2026-06-29 (c)

- `POST /membership/public/join` — gost registracija + PENDING + JWT
- Stripe checkout + webhook + `confirm-session` na povratku → auto ACTIVE + kartica
- `/clanstvo` Moj račun: `MembershipPendingStatus` za PENDING (online vs blagajna copy)
- `MembershipPurchasePanel` — ACTIVE kartica, cancelled payment retry, obnova

## 2026-06-29 (b)

- Admin ručno dodavanje člana po emailu (`POST /membership/admin`, opcija aktivacije odmah)

## 2026-06-29

- Gate #13 APPROVED: admin lista (filteri, renew, detail sheet), javna `/clanstvo` (status + QR kartica)
- v1 bez admin manual-add člana (opcionalni backlog) i bez hard delete — **Otkaži** (`CANCELLED`) je standard za audit trag
- Backend: duplicate register guard, `?status` filter, lazy `EXPIRED` resolve
- E2E: duplicate register → 400

## 2026-06-24 (b)

- QR format: `member-{membershipId}_{hex}`; E2E assertion ažuriran

## 2026-06-24

- Box office payment model; no Stripe/Monri in v1
