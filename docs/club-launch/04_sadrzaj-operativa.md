# Sadržaj — vijesti, CMS, članarine, ulaznice

---

## Vijesti

- [ ] Kategorije (npr. Klub, Utakmica, Mladost, Najava)
- [ ] **(obavezno)** 3–5 objavljenih vijesti na dan lansiranja (naslov, tekst, naslovna foto)
- [ ] Ko piše (Writer) i ko odobrava (Moderator) — vidi uloge
- [ ] Ton i zabranjene teme (politika, uvredljiv sadržaj)

---

## Galerija

- [ ] **(obavezno)** Bar 1 album (npr. zadnja utakmica ili stadion) — 8–20 fotografija

---

## CMS (naslovna i stranice)

- [x] Šta ide na naslovnu: hero, vijesti, tabela, sponzori, CTA članstvo
- [x] Stavke menija (redoslijed: Početna, Vijesti, Tim, Liga, …)
- [ ] Statične stranice: npr. Pravila člana, Privatnost, Impresum
- [ ] **(obavezno)** Tekst privatnosti i uvjeta korištenja (za članarinu/ulaznice)

---

## Članarina (opciono kada bude live)

- [ ] **(obavezno)** Godišnja cijena (KM)
- [ ] Šta član dobija (ulaz, popust na karte, glas…)
- [ ] Trajanje (1 godina od aktivacije)
- [ ] Da li se plaća **online (Stripe)** i/ili **blagajna**
- [ ] Ko u klubu odobrava uplatu (admin aktivira nalog → kartica + QR)
- [ ] Ime na kartici = ime i prezime iz prijave

---

## Ulaznice (opciono kada bude live)

Samo **domaće** utakmice.

- [ ] **(obavezno)** Kategorije: npr. Tribina, Terasa, VIP — naziv + cijena + aktivno da/ne
- [ ] Popust za članove (%)
- [ ] Kapacitet (isti broj kao stadion, ili manji ako se prodaje dio)
- [ ] Max karata po osobi na blagajni
- [ ] Pozadina digitalne karte (opciono PNG)
- [ ] Online (Stripe) i/ili rezervacija pa platiti na blagajni
- [ ] VIP = kategorija, ne sezonska karta (sezona je kasnije)

---

## Plaćanje i email (admin, nije „sadržaj“ ali klub donosi)  (opciono kada bude live)

- [ ] Stripe nalog kluba: publishable + secret + webhook (ako online)
- [ ] Odluka: do Stripea samo blagajna
- [ ] SMTP (npr. club Gmail ili hosting): host, port, korisnik, lozinka, from adresa
- [ ] PayPal / Monri — **ne za ovo lansiranje**

---

## Newsletter i kontakt

- [ ] Ko čita inbox (`/admin` kontakt) — Moderator ili admin
- [ ] Da li se nudi prijava na newsletter na `/platforma` i sajtu

---

## Mediji (folderi)

Klub predaje u jednom drive/ZIP-u, jasno imenovano:

- [ ] `grb.png`
- [ ] `igraci/` (prezime-broj.jpg)
- [ ] `klubovi-liga/` (grbovi)
- [ ] `historija/`
- [ ] `sponzori/`
- [ ] `galerija-lansiranje/`
