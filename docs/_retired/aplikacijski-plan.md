⚠️ PENZIONISANO (retired) – NIJE RELEVANTNO za implementaciju. Služi samo kao historijska referenca. Datum penzionisanja: 2026-11-02.

# FK Gračanica – Master Plan za razvoj produkcijske platforme

## Misija projekta

Razviti vrhunsku, produkcijski spremnu digitalnu platformu za FK Gračanica koja objedinjuje javni portal, napredni CMS, administrativni sistem, statistički centar, live centar za utakmice, sistem članstva, online prodaju ulaznica i kompletnu infrastrukturu spremnu za buduću React Native (Expo) mobilnu aplikaciju.

Cilj nije napraviti običnu web stranicu, već centralni informacioni sistem kluba koji će biti dugoročno održiv, modularan i spreman za daljnje nadogradnje.

---

# Osnovni tehnološki stack

## Backend

- NestJS
- TypeScript
- Prisma ORM 7
- MySQL
- [Socket.IO](http://Socket.IO)
- JWT Authentication + Refresh Token
- Swagger/OpenAPI
- Docker

## Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- React Router

## Mobilna aplikacija (Expo)

Kompletan backend mora biti dizajniran kao API-first sistem. **Mobile scaffold (`mobile/`) od Faze 1**; feature moduli se dodaju paralelno sa web fazama.

---

# Vizuelni identitet

- Primarne boje: plava i bijela
- Premium moderan dizajn
- Potpuno responzivan (mobile-first)
- Pristupačnost (WCAG)
- Glatke animacije
- Skeleton loading
- Lazy loading
- Code splitting
- SEO optimizacija
- Dark mode spreman za budućnost

---

# Arhitekturni principi

- Modularni NestJS moduli
- Strogo razdvajanje Controller / Service / Repository slojeva
- Prisma kao jedini pristup bazi
- DTO validacija
- Centralizovani Exception Filter
- Audit Log
- Soft Delete gdje je primjenjivo
- UUID identifikatori gdje odgovara
- Verzionisani API (`/api/v1`)
- Centralni RBAC sistem
- Permission-based autorizacija
- Pagination, filtering i sorting na svim listama
- Reusable komponente
- Bez hardkodiranih vrijednosti
- Potpuna TypeScript tipizacija

---

# Registry (Core Configuration)

Implementirati centralni Registry sistem podijeljen na:

## Public Registry

- naziv kluba
- kontakt informacije
- adrese
- društvene mreže
- SEO postavke
- naslovna stranica
- hero banneri
- YouTube Live URL
- prikaz modula
- partneri
- sponzori
- javne informacije

## Private Registry

- sistemske postavke
- API konfiguracije
- feature flagovi
- SMTP
- email postavke
- plaćanja
- storage konfiguracija
- sigurnosne opcije

Administrator jedini ima pristup Core Registry konfiguraciji.

---

# Role sistem

## Administrator

Potpuna kontrola nad sistemom.

Može upravljati:

- korisnicima
- rolama
- dozvolama
- Registry sistemom
- svim modulima
- audit logovima
- statistikama
- utakmicama
- sadržajem

---

## Moderator

Može upravljati svim sadržajem osim Registry/Core postavki.

Odobrava:

- vijesti
- galerije
- statistiku utakmica
- live izvještaje

---

## Writer

Može:

- kreirati vijesti
- kreirati galerije

Sve ide u status Pending.

---

## Komentator

Ima poseban dashboard za vođenje utakmice uživo.

Može:

- unositi događaje
- komentarisati utakmicu
- upravljati live tokom
- upravljati semaforom
- evidentirati statistiku

Sve nakon završetka čeka odobrenje moderatora ili administratora.

---

## Član

Može:

- uređivati profil
- komentarisati vijesti
- kupiti članstvo
- obnoviti članstvo
- kupiti ulaznice
- pregledati digitalnu člansku kartu
- pregledati historiju kupovina

---

# Administratorski Dashboard

Dashboard mora omogućiti kompletnu administraciju svih modula.

Sadrži:

- KPI kartice
- statistike
- broj korisnika
- broj članova
- broj aktivnih članarina
- broj objavljenih vijesti
- broj utakmica
- broj golova
- broj online ulaznica
- finansijske pokazatelje (ako se koriste plaćanja)
- grafove
- posljednje aktivnosti
- audit log
- sistemska upozorenja

---

# Naslovna stranica

Premium landing stranica.

Sekcije:

- Hero
- Sljedeća utakmica
- Posljednji rezultat
- Najnovije vijesti
- Istaknuti igrači
- Ligaška tabela
- Galerija
- Sponzori
- CTA za članstvo
- CTA za kupovinu ulaznica
- Historijski trofeji
- Newsletter

---

# O klubu

Posebno dizajnirana timeline stranica.

Podržava:

- beskonačno skrolovanje
- animirane prijelaze
- vremensku liniju
- fotografije
- video
- važne događaje
- ključne godine
- istorijske dokumente
- posebne sekcije za legende kluba

Administrator upravlja svim segmentima.

---

# Prvi tim

Interaktivni prikaz terena.

Desktop:

- horizontalni teren

Mobilni:

- vertikalni teren

Administrator definiše:

- formaciju
- raspored
- pozicije
- igrače
- klupu

Automatsko mapiranje na ilustraciju.

Profil igrača:

- fotografija
- broj
- pozicija
- datum rođenja
- državljanstvo
- visina
- težina
- jača noga
- biografija
- statistika
- nastupi
- golovi
- asistencije
- kartoni
- minute

Statistika se automatski računa iz utakmica.

---

# Klubovi

Portfolio svih klubova u ligi.

Sadrži:

- grb
- stadion
- grad
- opis
- roster
- historiju
- rezultate
- međusobne duele
- statistiku
- formu ekipe

Administrator održava osnovne podatke.

Statistike se računaju automatski.

---

# Trofeji

Premium prikaz osvojenih trofeja.

Svaki trofej ima:

- fotografiju
- naziv
- godinu
- opis
- galeriju
- takmičenje
- povezane utakmice

Podržati timeline prikaz.

---

# Vijesti

Workflow:

Draft → Pending → Published → Archived

Svaka vijest podržava:

- naslov
- slug
- SEO
- cover
- galeriju
- sadržaj
- tagove
- kategorije
- autora
- povezane utakmice
- povezane igrače

Komentari dozvoljeni registrovanim članovima.

---

# Galerija

Podržati:

- albume
- kategorije
- originalnu rezoluciju
- lightbox
- lazy loading
- EXIF prikaz gdje postoji
- pending workflow

---

# Liga

Automatski statistički centar.

Prikaz:

- tabela
- forma
- rezultati
- raspored
- prethodna kola
- buduća kola
- top strijelci
- top asistenti
- najviše kartona
- najviše minuta
- najbolji golmani
- historija sezona

Svaka utakmica ima detaljan izvještaj.

---

# Live Centar

Najvažniji modul sistema.

Ako postoji YouTube stream:

- prikaz embedded prenosa

Ako ne postoji:

- countdown do početka

[Socket.IO](http://Socket.IO) koristi se za:

- live komentare
- live događaje
- promjene rezultata
- notifikacije
- buduću mobilnu aplikaciju

Komentator ima instant akcije:

- početak
- kraj
- poluvrijeme
- produžetak
- gol
- autogol
- penal
- promašen penal
- korner
- ofsajd
- slobodan udarac
- faul
- žuti karton
- crveni karton
- druga opomena
- izmjena
- povreda
- VAR
- šut
- šut u okvir
- odbrana golmana

Moguće je dodati slobodan komentar.

Na javnoj stranici prikazivati:

- semafor
- minute
- rezultat
- live feed
- statistiku
- tok utakmice

Po završetku:

Moderator ili administrator odobrava izvještaj.

Tek tada se ažuriraju statistike klubova i igrača.

---

# Online prodaja ulaznica (Premium)

Implementirati kompletan Ticketing sistem.

Podržati:

- kupovinu online
- rezervaciju
- QR kod po ulaznici
- digitalnu kartu
- provjeru validnosti
- historiju kupovina
- refund zahtjeve
- različite kategorije ulaznica
- VIP ulaznice
- dječije ulaznice
- sezonske ulaznice
- ograničenje kapaciteta stadiona
- automatsko zatvaranje prodaje

Omogućiti skeniranje QR koda kroz buduću mobilnu aplikaciju.

---

# Članstvo

Implementirati:

- registraciju
- online članstvo
- obnovu
- digitalnu člansku kartu
- QR kod
- broj članske iskaznice
- historiju
- status
- pogodnosti
- popuste na ulaznice

---

# Sponzori

Premium prikaz.

Kategorije:

- Generalni
- Zlatni
- Srebrni
- Bronzani
- Partneri

Podržati logotipe, linkove i zahvalnice.

---

# Media Library

Centralna biblioteka.

Podržati:

- foldere
- tagove
- pretragu
- višestruku upotrebu slika
- optimizaciju
- zamjenu fajlova
- preview

---

# SEO sistem

Implementirati:

- Meta tagove
- Open Graph
- Twitter Card
- [Schema.org](http://Schema.org)
- robots.txt
- sitemap.xml
- canonical URL
- dinamičke SEO postavke

---

# CMS blokovi

Administrator može uređivati sadržaj bez izmjene koda.

Primjeri:

- Hero sekcije
- CTA blokovi
- Naslovna
- Footer
- Kontakt
- Statične stranice

---

# Globalna pretraga

Pretraživati:

- vijesti
- igrače
- klubove
- utakmice
- galerije
- trofeje

---

# Notifikacije

Implementirati centralni Notification servis.

Podržati:

- in-app
- [Socket.IO](http://Socket.IO)
- email
- pripremu za push notifikacije

---

# Audit Log

Bilježiti:

- prijave
- izmjene
- brisanja
- odobravanja
- promjene Registry postavki
- administrativne akcije

---

# Analitika i napredna statistika (Premium)

Automatski generisati:

## Timska analitika

- forma u posljednjih 5/10 utakmica
- niz pobjeda
- niz bez poraza
- gol razlika
- prosjek golova
- domaći/gostujući učinak

## Analitika igrača

- prosjek minuta
- golovi po utakmici
- asistencije po utakmici
- kartoni
- efikasnost
- učešće u golovima
- trend forme

## Head-to-head

Automatski prikaz:

- međusobni susreti
- pobjede
- remiji
- porazi
- gol razlika
- posljednji rezultati

## Historijska analitika

- poređenje sezona
- napredak kroz godine
- broj osvojenih bodova
- trend golova

---

# Finansijski modul (opcionalni Premium)

Ako se koristi online plaćanje:

- pregled uplata
- članarine
- ulaznice
- refundacije
- izvještaji
- export u Excel/PDF

---

# Kontakt

Podržati:

- kontakt formu
- mapu
- društvene mreže
- kontakt osobe
- email routing

---

# Newsletter

Posjetioci mogu ostaviti email.

Administrator može upravljati listom pretplatnika.

---

# Baza podataka

Projektovati zasebne modele za:

- Users
- Roles
- Permissions
- Registry
- Players
- Teams
- Competitions
- Seasons
- Matches
- MatchEvents
- PlayerStatistics
- TeamStatistics
- News
- Galleries
- Photos
- Sponsors
- Memberships
- MembershipCards
- Tickets
- TicketOrders
- Payments
- Notifications
- Comments
- MediaLibrary
- AuditLogs
- CMSBlocks
- ContactMessages

---

# API standard

REST API.

Dosljedni response modeli.

Swagger dokumentacija.

Kompletna validacija.

Rate limiting.

Permission middleware.

---

# Testiranje

Implementirati:

- Unit testove
- Integration testove
- E2E testove za kritične tokove

---

# Sigurnost

Implementirati:

- JWT + Refresh Token
- CSRF zaštitu gdje je potrebno
- Rate limiting
- Brute-force zaštitu prijave
- Sigurno čuvanje lozinki
- Sigurne HTTP zaglavlja
- Validaciju uploada
- Ograničenja veličine fajlova
- Reviziju privilegija

---

# Priprema za mobilnu aplikaciju

Backend mora od početka biti spreman za Expo aplikaciju.

Socket komunikacija, autentikacija, notifikacije i API moraju biti zajednički za web i mobilne klijente.

---

# Dodatne premium funkcionalnosti

## Hall of Fame

Posebna stranica za legendarne igrače, trenere i funkcionere sa biografijama, fotografijama i dostignućima.

## Match Center

Za svaku utakmicu prikazati sastave, formacije, tok susreta, statistiku, galeriju, video sažetke i povezane vijesti na jednoj objedinjnoj stranici.

## Digitalni muzej kluba

Interaktivna kolekcija historijskih fotografija, dokumenata, dresova i značajnih trenutaka sa mogućnošću filtriranja po godinama.

## PWA podrška

Web aplikaciju prilagoditi kao Progressive Web App radi instalacije na telefone i osnovnog rada čak i pri slabijoj mrežnoj vezi.

## Napredni sistem keširanja

Primijeniti odgovarajuće strategije keširanja za javni sadržaj, slike i API odgovore radi boljih performansi.

## Pozadinski poslovi (Background Jobs)

Koristiti redove zadataka za slanje e-pošte, obradu slika, generisanje izvještaja i druge dugotrajne operacije kako bi korisničko iskustvo ostalo brzo i pouzdano.

---

---

# Globalna usklađenost (dopuna)

## Repo struktura

```
ROOT/
  backend/    — NestJS + Prisma 7 + MySQL
  frontend/   — React (Vite) + admin + javni portal
  mobile/     — Expo (React Native) od Faze 1
```

## i18n

- Default UI jezik: **bosanski (BS)**
- EN infrastruktura: i18n key sistem (`i18next`) po modulima; EN prevodi se dodaju kasnije
- Isti key sistem na webu (public + admin) i mobilnoj aplikaciji

## Settings Registry (bivši Registry)

Centralni konfiguracioni sistem usklađen sa Settings contractom:

- **Public scope** — vidljivo javno (naziv kluba, kontakt, SEO, hero, moduli…)
- **Private scope** — samo administrator (SMTP, feature flagovi, storage, sigurnost…)
- UI pravila: `boolean` → switch, `number` → number input, `string` → text input
- Svaki key ima opis za šta služi

## Prisma 7

- `prisma.config.ts`, migracije obavezno
- MySQL/MariaDB
- `createdAt` / `updatedAt` na entitetima
- Relacije definisane obostrano

## Upload servis

- Backend upload servis; u bazi samo putanje
- Image renditions: `thumb`, `medium`, `original`
- Primjena: Media Library, vijesti, igrači, sponzori

## Design tokens (plavo/bijelo)

| Token | HEX | Upotreba |
|-------|-----|----------|
| primary | #1E3A8A | CTA, linkovi |
| primaryLight | #3B82F6 | hover |
| background | #FFFFFF | stranice |
| surface | #F8FAFC | sekcije |
| text | #0F172A | body |
| textMuted | #64748B | meta |
| accent | #2563EB | hero, badge |
| success | #16A34A | uspjeh |
| danger | #DC2626 | greške |

Dark mode: CSS varijable od F1, UI toggle u F7.

## Feature matrice

Za složene module obavezno: `.cursor/docs/matrices/<module>/MATRIX.md` + `CHANGELOG.md`

- Live centar
- Ticketing
- Membership
- RBAC

---

# Fazni razvoj

## Faza 1

Postavljanje infrastrukture, Docker okruženja, autentikacije, RBAC sistema, Settings Registry modula, Prisma 7 modela, osnovnih API-ja i **Expo mobile scaffolda** (`mobile/` od starta).

## Faza 2

Administratorski panel, upravljanje korisnicima, dozvolama i osnovnim CMS funkcionalnostima.

## Faza 3

Javni portal, naslovnica, stranica „O klubu”, vijesti, galerije, sponzori, trofeji i Media Library.

## Faza 4

Moduli za prvi tim, igrače, klubove, sezonu, ligu, raspored, rezultate i automatsku statistiku.

## Faza 5

Live Centar, [Socket.IO](http://Socket.IO) infrastruktura, komentatorski panel, Match Center i odobravanje službenih izvještaja.

## Faza 6

Članstvo, rezervacija ulaznica, QR validacija i digitalne članske karte. **Online payment gateway nije u prvoj verziji** — plaćanje na blagajni uz admin potvrdu; `Payment` model kao stub.

## Faza 7

SEO, analitika, Hall of Fame, digitalni muzej, PWA, optimizacija performansi, sigurnosna revizija i **mobile feature parity** (scaffold je u F1).

---

# Završni zahtjev

Svaki modul mora biti implementiran kao potpuno funkcionalna, produkcijski spremna cjelina sa čistim i proširivim kodom, jasnim razdvajanjem odgovornosti, kvalitetnom dokumentacijom i mogućnošću budućeg razvoja bez značajnih arhitekturnih izmjena.