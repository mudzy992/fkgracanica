# Home polish checklist

## Faza 1 — gotovo

- [x] Guest welcome (`guestMode` / club name)
- [x] Auth welcome (firstName or email)
- [x] Club crest from `/settings/public`
- [x] Featured match: LIVE badge + score
- [x] CTA po statusu (followLive / matchDetails)
- [x] Last result sekcija
- [x] Module CTAs (membership, ticketing flags)
- [x] See all news + datumi na karticama
- [x] Empty match → `noMatches`
- [x] i18n BS/EN (home.ts)
- [x] a11y na karticama i section headers
- [x] Komponente split; home.tsx orchestrator
- [x] `tsc --noEmit`

## Widget polish (pojedinačno)

- [x] **Najnovije vijesti**
- [x] **Hero + CTA** (transparent original crest, CTA u fade zoni)
- [x] **Sljedeća utakmica**
- [x] **Galerija**
- [x] **Trofeji**
- [x] **Sponzori**
- [x] **Membership band**
- [x] Dark-only app + `colors.link` + `HomeSkeleton`
- [~] **Tabela** — Home snippet DONE za naslovnu; **puna liga + club pages = DEFERRED** → Track League/Clubs (ekrani #7–#8)
- [~] **Naši igrači** — widget postoji u `home.tsx` / `HomeFeaturedPlayers`; **vizuelni polish + parity = DEFERRED** uz Team ekran (#7)

## Faza 2 — preostalo (izvan Home zatvaranja)

- [ ] Newsletter CTA (opcionalno)
- [ ] Manual smoke: 375px, guest, član, offline retry
- [x] HANDOFF + SCREEN_QUEUE → Home **done** (sa deferred scope ispod)

## Deferred (namjerno van Home DONE)

Ovo **nije** blokada za zatvaranje Home; ide kao poseban track jer diraju više ekrana:

1. Full `/league` paritet s web `/liga` (standings, forma, round filter…)
2. Club pages: `/clubs/[slug]` + poseban own-team (`/team`) kao na frontendu
3. Tabela redovi na Home → tap na klub → club page
4. Polish „Naši igrači” na Home + deep link na Team/Player
