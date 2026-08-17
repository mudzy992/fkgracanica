# Uloge — koga klub imenuje

Admin u aplikaciji dodaje korisnika (ime, email) i dodijeli **jednu ili više** uloga.  
Ista osoba može biti Administrator + Moderator. Komentator je obavezan **na dan utakmice**.

---

## 1. Administrator

**Ko:** sekretar, predsjednik uprave ili osoba kojoj klub vjeruje sistem (pristup korisnicima i novcu).

**Šta vidi:** cijeli admin, postavke, moduli, korisnici, CMS, blagajna, Stripe.

**Zadaci i obaveze**

- Otvara i gasi naloge; dodjeljuje uloge; nikad ne briše zadnjeg admina.
- Paljenje/gašenje modula (vijesti, live, ulaznice, članstvo).
- Unos SMTP-a (slanje mailova) i Stripe ključeva kad ide online plaćanje.
- Kapacitet stadiona, kategorije ulaznica, cijena članarine, popust za članove.
- Naslovna (CMS widgeti) i glavni meni.
- Režim „u izradi“ (`/platforma`) vs javni portal — kad klub kaže lansiraj, gasi se showcase.
- Pregled audit loga (ko je šta mijenjao).
- Odgovornost za tačnost cjenovnika i da se ulaznice prodaju samo za **domaće** utakmice.

**Ne mora:** pisati vijesti svaki dan (to je Writer), voditi semafor (Komentator).

**Checklist**

- [ ] Ime i email osobe
- [ ] Zamjena (druga osoba s admin ulogom) — preporuka

---

## 2. Moderator

**Ko:** PR / mediji. Može biti ista osoba kao Administrator.

**Šta vidi:** sadržaj i odobrenja. **Ne** vidi Settings Registry (SMTP, Stripe, tajne).

**Zadaci i obaveze**

- Odobrava ili vraća vijesti, galerije i **izvještaj utakmice** nakon meča.
- Tek nakon odobrenja izvještaja statistike igrača ulaze u javnost.
- Uređuje objavljeni sadržaj ako treba ispravka.
- Prati kontakt inbox (`/kontakt` poruke) i listu newsletter pretplatnika.
- Ne objavljuje lažne rezultate; ne dira korisnike i plaćanja.

**Checklist**

- [ ] Ime i email
- [ ] Dogovor: da li je ista osoba kao admin

---

## 3. Writer

**Ko:** novinar, volonter, student, PR asistent.

**Šta vidi:** svoje nacrte vijesti i albuma. **Ne može** samostalno objaviti.

**Zadaci i obaveze**

- Piše vijesti (naslov, tekst, naslovna fotografija, kategorija).
- Slaže galerije (album + fotografije + opisi).
- Status: Draft → predaje **Pending**. Moderator odobrava → Published.
- Ne izmišlja rezultate; ne objavljuje bez odobrenja.

**Checklist**

- [ ] Ime i email (može ih biti više)
- [ ] Dogovor ko odobrava (Moderator)

---

## 4. Komentator

**Ko:** speaker na stadionu ili volonter s telefonom/laptopom na klupi.

**Šta vidi:** live desk jedne utakmice. Ne dira CMS ni postavke.

**Zadaci i obaveze (samo na dan meča)**

- Start / poluvrijeme / kraj; minutaža i dodatno vrijeme.
- Unos: gol, autogol, penal, žuti/crveni, izmjena, ozljeda, komentar.
- Opciono: YouTube / stream URL da javnost gleda uz semafor.
- Po završetku predaje izvještaj na odobrenje (Moderator).
- Ne „zatvara“ utakmicu bez predaje izvještaja.

**Checklist**

- [ ] Ime i email
- [ ] Zamjena za gostujuće / ako prvi nije dostupan
- [ ] Ima telefon ili laptop na dan utakmice

---

## 5. Član (nije kadar kluba)

**Ko:** navijač s nalogom. Klub ga **ne dodaje** kao osoblje.

**Šta može:** profil, komentari na vijestima, prijava za članarinu, digitalna kartica + QR, kupovina/rezervacija ulaznice.

**Šta klub obezbjeđuje:** cjenovnik, pravila članarine, način uplate (blagajna i/ili Stripe).

---

## 6. Ulaz / blagajna (operativa, nije 5. uloga u sistemu)

U aplikaciji nema posebne uloge „blagajnik“. Klub napravi nalog (npr. `ulaz@…`) i Administrator mu da pravo **validacije QR** (`ticketing.manage`) — ili to radi sam admin.

**Zadaci na ulazu:** skeniranje QR ulaznice / članske kartice na telefonu; ne puštati neplaćene (`RESERVED`) ni već korištene (`USED`).

**Checklist**

- [ ] 1–2 osobe + telefoni (nacinjen nalog)
- [ ] Probni sken prije prvog kola
