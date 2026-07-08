# Changelog — Web Complete

## 2026-07-08 (h) — Web Complete CLOSED → Mobile track

- Gates #1–#21 APPROVED; HANDOFF CLOSED
- Sljedeći: `25_mobile-complete`

## 2026-07-08 (g) — Gates #14 + #21 + SeasonClub + Muzej/HOF APPROVED

- Korisnik: Muzej/HOF, #14 Ulaznice, #21 Dashboard, SeasonClub → **APPROVED**
- GATE_LOG: #1–#21 sve APPROVED; Web Complete gates closed
- Commit: korisnik ručno

## 2026-07-08 (f) — Muzej + HOF cinematic public (plan Remaining)

- `/muzej`, `/hall-of-fame`: cinematic hero + glass kartice (javni UI only)
- HANDOFF: kontakt/match/live APPROVED; #14/#21 i dalje READY_FOR_REVIEW

## 2026-07-08 (e) — Live pitch scale: teren veći, tokeni manji

- Live: `enlarged` samo teren (container + vertical max-w-lg); `compact` avatar `h-7/8` + manje ime
- Crest fallback bez fotke zadržan; club/team pitch netaknut
- `/kontakt`, `/utakmice/:id`, `/live` — korisnik APPROVED

## 2026-07-08 (d) — Live prematch pitch = club premium + crest fallback

- `/live` prematch: `ResponsiveFormationPitch premium` u `border-gradient-club glass-premium` (kao Club/Team)
- Token bez fotke na live skici: `crestFallback` → grb kluba (samo kad se prop proslijedi)

## 2026-07-08 (c) — CMS meni UX: modul-off warning

- Uzrok: Kontakt u CMS meniju `enabled`, ali `modules.contact=false` → javni nav filter ga sklanja
- Admin CMS meni: `menu-module-warnings.ts`; amber banner u preview; per-row „Modul off” + link na Postavke
- Hint u editoru da javna navigacija skriva stavke čiji je modul isključen

## 2026-07-08 (b) — /kontakt + match center + live maximal polish

- `/kontakt`: `ContactCinematicHero`, `ContactInfoAside` (glass mailto/tel), `ContactFormPanel`; page bez `PageHeroHeader`/`FormShell`
- `/utakmice/:id`: cinematic `MatchScoreHero`; `MatchCenterToolbar` (BS status); glass postave/statistika/događaji/vijesti; `match-status-label.ts`; badge `warning`
- `/live`: polish `LiveCenterShell`, `LivePreMatchShell`, finished card na `LiveMatchPage`
- Gate status **nepromijenjen** (#14/#21 READY_FOR_REVIEW)
- **Uncommitted** — čeka commit na zahtjev

## 2026-07-08 — sponzori/trofeji, mediji/galerije, SEO OG server, crest+SeasonClub fix

- `/sponzori`, `/trofeji`: cinematic hero, glass, NewsSectionTitle; usklađeno s CMS widgetima
- SeasonClub: checkbox picker fix (stable deps); standings `crestPath` (bez Club.logoPath)
- Mediji: upload samo u mapu; debounce search; Galerija multi-select + Dodaj mapu
- Datumi: `DD.MM.YYYY`; dashboard KPI linkovi + `adminLinkClass`
- SEO: `og-server.mjs` crawler injekcija; `GET /seo/share`; naslovna title = `club.name` (ne CMS „Početna“)
- Git: committed/pushed (`fbd337a`, `60d1e5e`); HANDOFF ažuriran

## 2026-06-29 (c) — payments polish, Moj račun ulaznice, multi-provider

- Gate #14 Ulaznice → **APPROVED**; #15 Kontakt → READY_FOR_REVIEW (prefill, mailto, matrix)
- Sales modes ulaznica: online + blagajna / samo jedno; `paymentIntent` na reserve
- Auto-aktivacija: `tickets/confirm-session`, `TicketPassCard`, success banneri
- Fix: infinite confirm-session loop (`usePaymentSessionReturn`, sessionStorage dedup)
- `MyTicketsPanel` na `/clanstvo` — filteri kupljene/rezervisane/otkazane
- `PublicUserMenu` (inicijali dropdown); PENDING članstvo bez pay dugmeta
- `OnlinePaymentChoice`: 1 provajder = dugme+logo; 2+ = samo logotipi
- Backend: `getReadyProviders()`, checkout `provider` param
- **Sve uncommitted**

## 2026-06-29 (b) — #14 proširenje + članstvo online + auth

- Unified auth: `/prijava`, staff vs član routing, `PublicAuthButton`
- Članstvo online: public join, Stripe aktivacija (webhook + confirm-session), Moj račun pending UX
- Ticketing: postavke/plaćanja u admin ticketing (ne global settings), domaće utakmice, CTA, PaymentsModule
- Fix: `managedIn` strip pri Prisma upsert (login crash)
- HANDOFF + membership/payments matrice ažurirane; **sve uncommitted**

## 2026-06-29 (Gate #14 Ulaznice)

- Admin: QR validacija, filteri, admin cancel, detail sheet s QR
- Javna `/ulaznice`: kategorije, dostupnost, moje narudžbe + QR
- Backend: availability API, admin cancel endpoint, settings kapacitet/popust
- GATE_LOG: Ulaznice → READY_FOR_REVIEW

## 2026-06-29 (Gate #13 Članstvo APPROVED)

- Korisnik potvrdio gate; bez admin manual-add / hard delete (v1: self-register + Otkaži)
- Sljedeći segment: #14 Ulaznice

## 2026-06-29 (Gate #13 Članstvo implementacija)

- Admin: filteri po statusu, aktiviraj/obnovi/suspenduj/otkaži, detail sheet + QR
- Javna `/clanstvo`: status flow, digitalna kartica (`MembershipCardPanel`)
- Backend: duplicate register guard, `?status` filter, lazy EXPIRED
- GATE_LOG: Članstvo → READY_FOR_REVIEW

## 2026-06-26 (Gate #1–#12 APPROVED + Live TV polish)

- GATE_LOG: Takmičenja hub, Kola, Utakmice, Live → APPROVED
- Live: TV semafor, premium stat popup, OWN_GOAL, shortName, halftime audio, YouTube safe player
- Komentator: vidljivo dugme Završi
- HANDOFF ažuriran; sljedeći segment #13 Članstvo

## 2026-06-25 (CMS APPROVED)
- Brisanje stranice samo u statusu DRAFT (backend + admin lista)
- GATE_LOG: CMS → APPROVED; HANDOFF → Galerija #4

## 2026-06-25 (CMS gate)
- CMS: CRUD (create/delete), dirty guard, `cms.manage` RBAC
- Javni prikaz: `footer.about` u footeru, hero `backgroundImage`
- GATE_LOG: CMS → READY_FOR_REVIEW

## 2026-06-25
- Inicijalni plan folder
- Početak implementacije Track 1–3
