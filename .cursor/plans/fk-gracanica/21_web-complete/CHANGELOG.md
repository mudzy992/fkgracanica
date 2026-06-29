# Changelog — Web Complete

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
