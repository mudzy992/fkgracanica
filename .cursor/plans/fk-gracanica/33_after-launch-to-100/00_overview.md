# 33 — After launch → 100%

Dovesti svih **8** showcase modula s badgeom `after_launch` na `ready` / 100%.

Katalog: `backend/src/showcase/catalog-modules.ts` L48–55.
Lansiranje (Stripe + blagajna) **ne čeka** ovaj track. Ovo je isporuka poslije.

## 100% znači

- Nema `501` / `NotImplementedException` na tom provideru/featureu
- Admin + javni tok rade (gdje je surface `web`/`admin`/`mobile`)
- Settings contract komplet (switch/number/string + opis)
- Testovi na confirm/export/validate pathu
- Matrica + CHANGELOG
- Katalog: `percent: 100`, `badge: 'ready'`

Ops nalozi (PayPal live, Monri merchant, Play review) su **gate**, ne izgovor da kod ostane stub. Kod ide na sandbox/test; live se uključi ključevima.

## Redoslijed

| Faza | Modul(i) | Sad | Blokada treće strane | Doc |
|------|----------|-----|----------------------|-----|
| 1 | paypal + monri (contract) | 5/5 | ne | [01](01_phase-payments-foundation.md) |
| 2 | paypal | 5 | sandbox besplatan | [02](02_phase-paypal.md) |
| 3 | monri | 5 | test merchant za živi charge | [03](03_phase-monri.md) |
| 4 | financial-export | 0 | ne | [04](04_phase-financial-export.md) |
| 5 | pwa | 22 | ne | [05](05_phase-pwa.md) |
| 6 | video-highlights | 10 | ne (YouTube URL) | [06](06_phase-video-highlights.md) |
| 7 | newsletter-campaigns | 10 | SMTP (postoji) | [07](07_phase-newsletter-campaigns.md) |
| 8 | seasonal-tickets | 100 | ne | [08](08_phase-seasonal-tickets.md) |
| 9 | play-store | 20 | Play Console + review | [09](09_phase-play-store.md) |

Ne paralelizovati 2 i 3 preko istih payment fajlova. 8 je najveći produkt. 9 zadnji (mobile polish nije preduslov za listing draft, jeste za submit).

## Van opsega

- iOS App Store
- PayPal/Monri refund UI (webhook refund kasnije ako treba)
- Upload vlastitog videa (samo YouTube clip)
- SendGrid/Mailgun (SMTP + BullMQ; ako blast padne na limitu, zabilježi u HANDOFF)
- Mobile vizuelni polish (`mobile-polish` ostaje 31/29)

## Matrice

Postojeće: `payments`, `ticketing`, `newsletter`, `membership`.
Nove: `pwa`, `video-highlights`, `seasonal-tickets`, `finance`, `play-store`.
Katalog: `showcase` + `showcase-audit/GAPS.md`.
