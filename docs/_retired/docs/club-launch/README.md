⚠️ PENZIONISANO (retired) – NIJE RELEVANTNO za implementaciju. Služi samo kao historijska referenca. Datum penzionisanja: 2026-11-02.

# FK Gračanica — checklista za klub (lansiranje)

Dokument za dogovor s klubom **prije produkcije**. Nije tehnički priručnik za developere.

| Dio | Fajl |
|-----|------|
| Uloge (koga dodati u aplikaciju) | [01_uloge.md](01_uloge.md) |
| Identitet, kadar, nasljeđe, sponzori | [02_sadrzaj-identitet.md](02_sadrzaj-identitet.md) |
| Liga, klubovi, kola, utakmice | [03_sadrzaj-liga.md](03_sadrzaj-liga.md) |
| Vijesti, galerija, CMS, članarine, ulaznice | [04_sadrzaj-operativa.md](04_sadrzaj-operativa.md) |

## Minimalni kadar (klub veličine FK Gračanica)

| Ko | Uloga u aplikaciji | Napomena |
|----|--------------------|----------|
| 1 osoba (sekretar) | **Administrator** | Obavezno. Može biti i moderator. |
| 1 osoba (mediji / PR) | **Writer** + **Moderator** | Može biti ista kao admin. |
| 1 osoba na dan utakmice | **Komentator** | Speaker / volonter. |
| 1–2 osobe na ulazu | nalog s pravom skeniranja QR | Nije posebna uloga; vidi 01_uloge.md. |

**Član** se ne dodaje ručno kao kadar — navijač se registruje sam.

## Šta blokira lansiranje (mora biti ✓)

- [ ] Administrator imenovan i može ući u `/admin`
- [ ] Grb PNG, naziv, slogan, kontakt
- [ ] Prvi tim (ime, broj, pozicija, fotografija gdje ima)
- [ ] Tekuća sezona + klubovi u ligi + izvučeno kolo / raspored
- [ ] Cjenovnik članarine i ulaznica (kategorije)
- [ ] SMTP (email) i Stripe ključevi **ili** samo blagajna
- [ ] Bar 3–5 vijesti i 1 galerija (portal ne izgleda prazno)
- [ ] Pravni tekstovi (privatnost / uvjeti) kao CMS stranice

Plaćanje: lansiranje ide sa **Stripe + blagajna**. PayPal i Monri nisu uslov.
