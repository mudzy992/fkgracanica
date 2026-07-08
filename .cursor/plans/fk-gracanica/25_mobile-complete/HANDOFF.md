# HANDOFF — Mobile Complete

> **Datum:** 2026-07-08  
> **Status:** Faza 1 foundation **DONE**  
> **Sljedeći fokus:** **Faza 2** — content + live polish  
> **Git:** mobile + plan docs; commit na zahtjev

---

## Product

| Ekran | Auth |
|-------|------|
| Home, News, Live | Guest OK |
| Membership, Tickets, Notifications | Login obavezan |

## Faza 1 — urađeno

- `.env.example` + `EXPO_PUBLIC_API_URL`
- Theme light/dark/system (`ThemeProvider`)
- Guest tabs; protected screens → login / `RequireAuth`
- Index → `/(tabs)/home` (bez forciranog logina)
- Login: `returnTo` + „Nastavi bez prijave”

## Sljedeće

```
Faza 2 — content + live polish
Faza 3 — membership/tickets/notif polish + module flags
Faza 4 — icons, empty states, preview smoke
```

## Starter

Vidi [STARTER_PROMPT.md](./STARTER_PROMPT.md)

## Smoke Faza 1

- [ ] Guest: home bez logina
- [ ] Tab Članstvo → login; nakon logina membership
- [ ] „Nastavi bez prijave” → home
- [ ] System dark mode (uređaj)
