# Phase 01 — Featured players (Home)

## Target files

| File | Action |
|------|--------|
| `mobile/src/components/home/HomeFeaturedPlayers.tsx` | Redesign: aspect 3/4 cards, gradient overlay, number, header kao ostali widgeti |
| `mobile/src/components/home/load-home-extras.ts` | **Data source switch**: `GET /players?clubId=<own>&activeOnly=true` (kao web) umjesto squad slice; polja: number, firstName/lastName, position, photoPath; slice 4 |
| `mobile/src/i18n/home.ts` | `homePlayersSubtitle` BS/EN |
| Optional split | `home-player-card.tsx` ako FeaturedPlayers preraste 200 |

> Napomena (audit): web `FeaturedPlayersWidget` koristi `usePlayers({ clubId: ownClub.id, activeOnly: true })`, limit default 4, prikazuje broj + split ime + poziciju.

## Visual (web parity)

- Horizontal scroll (mobile-friendly) ili 2-col grid — prefer **horizontal snap** s većim karticama aspect 3/4
- Photo `medium` + `object-top` feel via contentFit cover
- Bottom gradient + first/last name uppercase + position
- Shirt number overlay (ako postoji u API)
- Header: title 22 + subtitle + „Sve” → `/team`
- Empty: ne renderuj sekciju (kao sada) ILI empty copy — zadržati hide-if-empty

## Out of scope this phase

- League/club pages
- Tabela row navigation

## Done when

- Vizuelno potvrđeno na uređaju
- `tsc --noEmit` PASS
- Fajlovi ≤200
