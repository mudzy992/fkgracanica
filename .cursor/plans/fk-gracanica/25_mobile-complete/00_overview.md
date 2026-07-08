# 25 — Mobile Complete

## Cilj

Expo mobilna app (FK Gračanica) na stabilnom `/api/v1` + Socket.IO — guest browse + member features (kartica, ulaznice, notif).

## Product

| Područje | Auth |
|----------|------|
| Home, Vijesti, Live | **Guest** |
| Članstvo, Ulaznice, Notifikacije | **Login obavezan** |

## Stack

- `mobile/` — Expo ~56, expo-router, SecureStore, i18n BS(+EN), Socket.IO
- API: `EXPO_PUBLIC_API_URL` → isti backend kao web
- Fajlovi ≤200 linija; BS default

## Faze

| Faza | Fajl |
|------|------|
| 1 Foundation | [01_phase-foundation.md](01_phase-foundation.md) |
| 2 Content + Live | [02_phase-content-live.md](02_phase-content-live.md) |
| 3 Member + Tickets | [03_phase-member-tickets.md](03_phase-member-tickets.md) |
| 4 Polish + ship | [04_phase-polish-ship.md](04_phase-polish-ship.md) |

Web: [21_web-complete CLOSED](../21_web-complete/HANDOFF.md)

## Van scopea v1

- Push notifikacije (kasnije)
- EAS store submit
- BE schema promjene bez eksplicitnog jaza
- Full cinematic parity sa webom
