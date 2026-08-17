# Faza 8 — Sezonske ulaznice 20 → 100%

Najveći komad. VIP je kategorija **po utakmici**, nije sezona.

## Odluka (zaključana)

Jedan `SeasonPass` po korisniku × kalendarska sezona. Jedan QR. Ulaz po utakmici = `SeasonPassAdmission` (unique pass+match). Ne generisati N ticket redova unaprijed.

Kapacitet: `activePassCount` sezone se oduzima od `stadiumCapacity` na svakoj domaćoj utakmici (pored prodatih match ticketa).

Cijena: setting `ticketing.seasonPassPrice` (number, KM). Jedna kategorija v1 (`tribina` / label iz settinga `ticketing.seasonPassLabel`). Nema VIP-sezona u v1.

Prodaja: online (isti checkout provider) + blagajna (admin izda).

Validacija: postojeći `POST /ticketing/validate` prima QR; ako je pass, upiše admission za `matchId` u bodyju (skener mora znati utakmicu — već ima kontekst).

## Šema

```
model SeasonPass {
  id, userId, seasonId, label, price, qrCode @unique
  status  ACTIVE | CANCELLED | REFUNDED
  paymentProvider, externalId
  createdAt, updatedAt
  @@unique([userId, seasonId])
}
model SeasonPassAdmission {
  id, passId, matchId, scannedAt
  @@unique([passId, matchId])
}
```

## Posao

1. Migracija + settings + RBAC `ticketing.manage`.
2. `POST /ticketing/season-pass/checkout` (online) i admin issue (blagajna).
3. Availability: public config `seasonPassAvailable` (aktivna sezona, nije kupio).
4. Public UI `/ulaznice` sekcija sezona (pored match karte).
5. Digitalna karta: isti vizualni jezik kao ticket, natpis sezona.
6. Validate: dual path ticket vs pass.
7. Mobile: buy + prikaz QR + staff scan.
8. Stripe (pa paypal/monri ako faze 2/3 gotove) metadata `type: season_pass`.

Fajlovi sitni: `season-pass.service.ts`, `season-pass-capacity.util.ts`, `season-pass-validate.util.ts`.

## 100%

Kupovina, QR, scan jednom po utakmici, kapacitet, admin lista. Katalog `seasonal-tickets` 100 ready.
