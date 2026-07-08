# Faza 1 — Foundation

## Cilj

Stabilan API/env, brand theme, guest vs auth routing, theme preference stub.

## Taskovi

1. `.env.example` + dokumentovan `EXPO_PUBLIC_API_URL`
2. Theme tokeni usklađeni s web (`#1e3a8a` primary)
3. Tabs: Home/News/Live guest; Membership/Tickets/Notifications → login redirect
4. Index → `/(tabs)/home` (ne forsira login)
5. light / dark / system preference (Appearance + context)

## Exit

- Guest vidi home bez logina
- Protected tab → `/login`, nakon logina nazad
- Theme preference radi
