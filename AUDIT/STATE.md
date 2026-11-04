# AUDIT STATE — živi dnevnik

> Ažurira se u **svakom** commitu. Slijedi strukturu iz protokola.

## Meta

| Polje | Vrijednost |
|-------|------------|
| **Aktivna grana** | `arena/290a6f13-fkgracanica` |
| **Trenutna faza** | CI-01 ✔ INF-01 ✔ INF-02 ✔ BE-01…**BE-09 ✔** → FE-01 ✔ FE-02 ✔ FE-03 ✔ FE-03b ✔ → CI-04 ✔ → FE-04a ✔ FE-04b ✔ → FE-05 ✔ → **FE-04c ✅ ZAVRŠEN (baseline 496 → 0)** → **BE-09d ✅ ZAVRŠEN** → **FE-06 🔄 audit završen, P-FE06-1…9 odobreni, implementacija traje** ; mobile zamrznut dok se BE/FE ne zaokruže |
| **Trenutni segment** | **FE-06 — OTVOREN:** audit Playwright/axe/bundle/coverage završen; **P-FE06-1…9 odobreni**; P-FE06-1/3/4/5/6 potvrđeni u CI-ju; P-FE06-10/11 potvrđeni u CI-ju; P-FE06-12 potvrđen u CI-ju; P-FE06-2 i stabilizacija mock testa potvrđeni; P-FE06-7 i stabilizacija full-stack reloada potvrđeni u CI-ju; P-FE06-8 potvrđen u CI-ju; P-FE06-9 baseline/ratchet potvrđen u CI-ju; coverage ≥50% ostaje otvoren i nastavlja se povećavati testovima; P-FE06-13 i prvi coverage batch potvrđeni u CI-ju; ≥50% ostaje otvoren; **P-FE06-14/15 odobreni i lokalno testirani; CI čeka**. Prethodno BE-09d ✅, FE-04c ✅. Mobile odgođen do završetka BE/FE rada. |
| **Zadnji commit** | `0684f2b` — `test(frontend): proširi hook regresije [FE-06]` |
| **Zadnji CI run** | ✅ **`41838037458`** (`0f7aac6`, svih 6 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41838037458 ; ✅ **`41836863290`** (`8f8cec9`, svih 6 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41836863290 ; ✅ **`41834394696`** (`00988c2`, svih 6 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41834394696 ; ✅ **`41831371015`** (`80ea031`, svih 6 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41831371015 ; ✅ **`41827148252`** (`0a26716`, svih 6 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41827148252 ; ✅ **`41826599244`** (`a75a0fd`, svih 6 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41826599244 ; ✅ **`41825652861`** (`3b7304a`, svih 6 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41825652861 ; ✅ **`41825053494`** (`68f68a3`, svih 6 jobova; dijagnostika povremenog pada traje) https://github.com/mudzy992/fkgracanica/actions/runs/41825053494 ; ❌ **`41824442277`** (`b81a25b`, budget gate ✅, full-stack smoke timeout ❌) https://github.com/mudzy992/fkgracanica/actions/runs/41824442277 ; ✅ **`41823260648`** (`3bb0dab`, svih 6 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41823260648 ; ✅ **`41822464236`** (`7d33d3b`, svih 6 jobova uključujući stvarni full-stack) https://github.com/mudzy992/fkgracanica/actions/runs/41822464236 ; ❌ **`41821836827`** (`897f253`: full-stack job ✅, mock job ❌; ostali ✅; kasnije stabilizovano) https://github.com/mudzy992/fkgracanica/actions/runs/41821836827 ; ✅ **`41820317341`** (P-FE06-12, svih 5 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41820317341 ; ✅ **`41817896650`** (P-FE06-10/11, svih 5 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41817896650 ; ✅ **`41816371035`** (docs potvrda, svih 5 jobova) https://github.com/mudzy992/fkgracanica/actions/runs/41816371035 ; ✅ **`41815794845`** (P-FE06-1/3, svih 5 jobova uključujući browser mock+axe) https://github.com/mudzy992/fkgracanica/actions/runs/41815794845 ; ✅ **`41814125171`** (P-FE06-6, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41814125171 ; ✅ **`41813051627`** (P-FE06-5, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41813051627 ; ✅ **`41811296453`** (P-FE06-4, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41811296453 ; ✅ **`41809421999`** (FE-06 evidencija CI-ja, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41809421999 ; ✅ **`41809144900`** (FE-06 audit, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41809144900 ; ✅ **`41802269029`** (BE-09d run-ID dokumentacija; sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41802269029 ; ✅ **`41801892490`** (docs BE-09d zatvoren, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41801892490 ; ✅ **`41801427757`** (BE-09d implementacija + migracije, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41801427757 ; ✅ **`41798892782`** (BE-09d audit, sva 4 joba) ; ✅ **`41795506967`** (docs batch 7+8, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41795506967 ; ✅ **`41795171365`** (FE-04c batch 8, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41795171365 ; ✅ **`41794454711`** (batch 7) ; ✅ **`41792020666`** (docs run-ID) ; ✅ **`41791659204`** (FE-04c batch 5+6 + docs, sva 4 joba) https://github.com/mudzy992/fkgracanica/actions/runs/41791659204 ; ✅ **`41791137350`** (batch 5) ; ✅ **`41788831131`**, **`41788531790`**, **`41787973999`**, **`41780305565`**, **`41780020284`**, **`41779492872`**, **`41736615770`** (batch 1–4) |
| **check:all** | `npm run check:all` → **9/9**: check-coverage, file-size, console-ban, token-check, secrets-ban, layer-deps, docs-links, docker-context, bundle-react; u CI-ju audit-gate + standards. |

## Šta je urađeno (hronološki)

### Sesija FE-06 — 2026-11-04 (P-FE06-14/15 lokalno implementirani)

- P-FE06-14: aktivan odgovor jedini kreira v2 marker, stari se ignorišu;
  korisnik/vrsta/provider/sesija odvajaju scope. Istovremeni zahtjevi u istom
  JS kontekstu deduplicirani; pending/503 imaju neutralnu BS/EN obavijest i
  ručni retry, sezonac ne ostaje na skeletonu, gost zadržava query kroz prijavu.
  Backend/API/šema nisu mijenjani; PayPal confirm može capture već odobrene
  uplate. Markeri nisu autorizacija; stvarni provideri/naplata nisu testirani.
- P-FE06-15: dostupni naziv javnog korisničkog menija sadrži vidljive
  inicijale; izgled nepromijenjen. Browser axe 0 critical/serious u definisanom
  prijavljenom mock stanju. Ukupno **38/38** izolovanih browser testova.
- Četiri puna mjerenja **180/180** testova, 633 app izvora (63 izvršena): linije
  **9,75%**, statements **10,09%**, funkcije **8,74%**, grane **6,55%**.
  Ratchet **9,6 / 9,9 / 8,6 / 6,4%**, prethodni baseline `0f7aac6` provjeren.
  Cilj ≥50% ostaje otvoren; ovi rezultati nisu audit matrica.
- **Matrica:** 781/1454 (frontend 327/709, backend 422/422, mobile 1/292,
  infra 4/4, scripts 27/27). Build/budget, standards testovi 7/7 i lint
  0 errors/30 starih upozorenja lokalno ✅; **stvarni CI za ovaj batch čeka**.

### Sesija FE-06 — 2026-11-04 (ciljane hook regresije)

- Dodano **16 testova** za korisničke membership i ticketing query/mutacije te
  notification query/realtime handler i cleanup, s izoliranim API/socket
  mockovima i stvarnim QueryClient wrapperom. Uspjeh/greška i invalidacija su
  provjereni; ovo nije integracioni dokaz autorizacije ili providera.
- Vitest optimizer sada uključuje React Query kako monorepo ne bi učitao
  različitu React instancu u testnom okruženju. Lokalno ciljani testovi **16/16**.
  Odobreni P-FE06-14/15 u odvojenom radu; stvarni CI za ove promjene čeka.

### Sesija FE-06 — 2026-11-04 (naknadni nalaz povrata plaćanja)

- Izolovana browser i unit proba: **B-FE06-14 High** — nepotvrđeni
  `pending/unpaid` dobija marker; reload bez ponovne potvrde postavlja frontend
  `activated` i uklanja URL parametre. Nema dokaza promjene backend statusa,
  stvarne naplate niti vidljivog success bannera u ovoj probi.
- **B-FE06-15 Medium:** mock 503 ostavlja neuhvaćen browser error.
  **B-FE06-16 High:** sezonska potvrda s odgođenim mock `200 ACTIVE` ostaje
  na skeletonu; nestabilni ključ effecta reproduciran jediničnom probom.
- Korisnik je odobrio potpuni **P-FE06-14**: vjerodostojni marker, ignorisanje starih,
  stabilan lifecycle, neutralna obavijest i ručni ponovni pokušaj, bez novog
  checkouta ili automatskih retryja. Postojeći PayPal confirm može pokrenuti
  capture odobrene narudžbe. **Lokalno testirano, CI čeka**, bez API/šema promjena. Detalji FE-06 §15–17.
- **B-FE06-17 High / P-FE06-15:** puni axe prijavljenog javnog headera našao
  nesklad vidljivih inicijala i `aria-label` na korisničkom meniju; preporuka
  dodati inicijale dostupnom nazivu bez vizuelne izmjene; korisnik odobrio.

### Sesija FE-06 — 2026-11-04 (CI evidencija)

- Dokumentacijski commit `0f7aac6` nakon code CI-ja provjeren: CI ✅
  **`41838037458`**, svih 6 jobova, https://github.com/mudzy992/fkgracanica/actions/runs/41838037458;
  artefakt `frontend-coverage` **13325639422** zadržava se 7 dana.

### Sesija FE-06 — 2026-11-04 (coverage batch i P-FE06-13 potvrđeni)

- Korisnik odobrio P-FE06-13: kod nedostajućeg `isLeague` liga ima prednost
  nad kupom; nema izmjene API-ja/šeme. Jedinični i browser mock test ✅;
  produkcijski izostanak polja nije potvrđen; CI ✅ `41836863290`.
- Prvih osam novih Vitest fajlova: auth/refresh, statusi ulaznica/plaćanja,
  session storage, moduli, sezone, live period i SEO. **146/146** testova,
  **631** izvora, 48 s izvršenim statementom; linije **7,28%**, statements
  **7,64%**, funkcije **6,16%**, grane **5,79%**. Novi pragovi redom
  **7,1 / 7,5 / 6,0 / 5,6%**, svi iznad prethodnih, lokalna ratchet provjera ✅. Dva ista
  mjerenja; browser **32/32**, build/budget ✅, lint 0 errors/30 ranijih
  upozorenja. ≥50% ostaje otvoreno, nije audit kompletnog shared `lib/`.
- **Matrica:** 763/1443 auditiranih (backend 422/422, frontend 309/698,
  mobile 1/292, infra 4/4, scripts 27/27). Nije test coverage; CI ✅
  **`41836863290`** (`8f8cec9`, 6/6): https://github.com/mudzy992/fkgracanica/actions/runs/41836863290;
  `frontend-coverage` artefakt **13327736498**, 7 dana.

### Sesija FE-06 — 2026-11-04 (P-FE06-9 potvrđen; coverage cilj otvoren)

- Vitest/V8 provider pinovani na **5.1.0**, svi app `src` fajlovi uključeni,
  testovi/deklaracije/testna infrastruktura izuzeti. Scope gate provjerava sve
  izvore i odbija višak; početni pragovi su ispod mjerenja, ručni ratchet
  diže samo naviše, a CI odbija sniženje u odnosu na prethodni push. CI
  proizvodi sažetak i HTML/JSON artefakt (7 dana).
- Tri mjerenja **112/112** testova: **631 izvora** (38 sa izvršenim statementom),
  linije **4,74%**, statements **4,91%**, funkcije **4,10%**, grane **3,68%**;
  minimumi 4,6% / 4,8% / 4,0% / 3,6%. Negativna 100% proba je očekivano pala;
  CLI proba nižeg praga je pala; scope/ratchet testovi **4/4**. CI ✅
  **`41834394696`** (`00988c2`, 6/6) https://github.com/mudzy992/fkgracanica/actions/runs/41834394696;
  artefakt `frontend-coverage` **13324867259**, 7 dana; ≥50% nije dostignuto.
- Dopunjeni P8 direktni URL/reload testovi svih osam lazy modula, oba season
  URL-a i new/edit varijante; mock browser **31/31**. Ostale eager rute nisu
  pojedinačno E2E testirane.
- **Matrica:** 753/1434 auditiranih (backend 422/422, frontend 299/689,
  mobile 1/292, infra 4/4, scripts 27/27). Nije test coverage.

### Sesija FE-06 — 2026-11-04 (P-FE06-8 potvrđen)

- Osam težih admin modula sada je lazy uz prevedeni status, sačuvani layout,
  postojeće guardove i P12 blocker. Greška importa nudi ručni reload; service
  worker ignoriše/više ne kešira neuspjele statičke odgovore. Public i ostale
  admin rute ostaju eager (postepeni batch). Tiptap regresija iz prototipa
  otklonjena odgođenim kreiranjem i potvrđena urednik/CMS browser regresijama.
- Dva identična lokalna builda: početni JS **1.482.274 / 430.863 B**
  (raw/gzip, −27,28% / −26,27%), ukupni **2.053.023 / 608.767 B**
  (+4,17% gzip). Snižen samo početni baseline; ukupni limit +5% ostaje.
  Vitest **112/112**, mock browser **26/26**, budget **3/3**, lint 0 errors /
  30 ranijih upozorenja i `check:all` **9/9**. CI ✅ **`41831371015`**
  (`80ea031`, svih 6 jobova), https://github.com/mudzy992/fkgracanica/actions/runs/41831371015.
  Detalji i ograničenja u FE-06 §12.
- **Matrica:** 750/1431 auditiranih (backend 422/422, frontend 298/688,
  mobile 1/292, infra 4/4, scripts 25/25). Nije test coverage.

### Sesija FE-06 — 2026-11-04 (stabilizacija full-stack reloada)

- Run `41824442277` timeout: trace pokazuje reload dok su admin API zahtjevi
  još u toku; nakon reload-a JS zahtjev ostao je nedovršen i `/auth/me` nije
  poslan. Tačan dublji uzrok nije dokazan. Test sada čeka uspješan stvarni
  dashboard API i završetak preostalih API zahtjeva, pa provjerava token,
  reload i `/auth/me`. Privremeni pristup starom artefaktu je uklonjen.
- Lokalna proba s namjerno sporim **simuliranim** backendom **5/5** (nije
  full-stack dokaz), mock browser **15/15**, build i standards ✅. CI za
  stabilizaciju ✅ `41826599244` (6/6); prethodni run ✅ `41825652861` (6/6).

### Sesija FE-06 — 2026-11-04 (P-FE06-7, CI dijagnostika)

- Vite manifest i budget gate mjere početni statički tranzitivni graf te ukupne
  JS/CSS izlaze, raw i gzip level 6, svih 8 metrika. Verzijski baseline +5%;
  nedostajući build ili prekoračenje ruše CI. Testovi dokazuju tranzitivne
  importe, lazy izlaz, deduplikaciju i pozitivni/negativni gate.
- Dva čista lokalna produkcijska builda dala su isti baseline: JS **2.038.448 /
  584.391 B**, CSS **167.277 / 23.478 B** (raw/gzip), početni = ukupni prije
  lazy optimizacije. Gate test **3/3**, Vitest **106/106**, mock browser **15/15**,
  lint 0 errors (30 upozorenja). Run `41824442277`: budget gate ✅, ali
  full-stack smoke ❌ (timeout pri provjeri `/auth/me` poslije reload-a);
  naredni run ✅ `41825053494` (6/6), ali povremeni uzrok još se istražuje.
- **Matrica:** 741/1422 auditiranih (backend 422/422, frontend 289/679,
  mobile 1/292, infra 4/4, scripts 25/25). Nije test coverage.

### Sesija FE-06 — 2026-11-04 (stabilizacija mock browsera)

- Run `41821836827` pao je jer je P12 test očekivao `/admin/news`, a paleta
  navigirala na `/admin`: test je pritisnuo Enter bez čekanja ciljane selekcije.
  Test sada čeka fokus, upit i odabrani rezultat „Vijesti“ prije Entera; lokalni
  stres-test **10/10** i cijeli mock suite **15/15**. CI ✅ `41823260648` (6/6).
- Dijagnostički run ✅ `41822464236` potvrdio je svih 6 jobova, uključujući
  stvarni browser, Postgres i Redis; privremeni pristup artefaktima uklonjen.

### Sesija FE-06 — 2026-11-04 (P-FE06-2)

- Uveden CI browser smoke sa zasebnim Postgresom/Redisom, migracijama,
  minimalnim testnim RBAC/admin/CMS seedom, stvarnim backendom, health-waitom i
  loopback proxyjem. Test obuhvata naslovnu, neuspjelu/uspjelu prijavu, admin,
  reload i odjavu; blokira vanjsku browser mrežu, plaćanja i druge mutacije.
- Lokalna proba istog toka uz **simulirani backend** 1/1 (nije full-stack dokaz),
  negativni health host ✅, mock browser **15/15**, Vitest **106/106**, build ✅,
  lint 0 errors (30 upozorenja), `check:all` 9/9. Sandbox nema Docker/Postgres
  ni Prisma engine; stvarni full-stack naknadno potvrđen u CI-ju (v. noviju sesiju).
- **Matrica:** 738/1419 auditiranih (backend 422/422, frontend 289/679,
  mobile 1/292, infra 4/4, scripts 22/22). Nije test coverage.

### Sesija FE-06 — 2026-11-04 (P-FE06-12)

- Korisnik je eksplicitno odobrio opću zaštitu nespremljenih `AdminFormSheet`
  formi pri internoj navigaciji. Jedan data-router blocker provjerava više
  aktivnih formi, eksplicitni dirty i praćene kontrole; podržava paletu,
  Back/Forward, reload i potvrdu. Kontrole i ograničenja opisani su u FE-06 §9.
- Lokalno browser mock **15/15**, Vitest **106/106**, build ✅, lint 0 errors
  (30 ranijih upozorenja), `check:all` 9/9 ✅. CI ✅ `41820317341` (5/5).
- **Matrica:** 734/1415 auditiranih (backend 421/421, frontend 286/676,
  mobile 1/292, infra 4/4, scripts 22/22). Nije test coverage.

### Sesija FE-06 — 2026-11-04 (odluka P-FE06-10/11)

- Korisnik je eksplicitno odabrao **potpuni modalni popravak** za zajednički
  samostalni Dialog i admin komandnu paletu. Oba koriste nativni modal s
  izolacijom, fokusom, Escape i povratom fokusa; sačuvani `preventClose`,
  nespremljena forma, ugniježđeni dijalozi i Ctrl/⌘K/pretraga/navigacija.
- Lokalni Chromium/mock **11/11** uključuje ove reprezentativne tokove i axe;
  nije full-stack niti svaki dijalog zasebno. Build ✅, Vitest **97/97**, lint
  0 errors (30 upozorenja), `check:all` 9/9 ✅; CI ✅ `41817896650` (5/5).
- **B-FE06-11 (High):** izolovani Chromium dokazao gubitak nespremljenog naziva
  pri internoj navigaciji iz `AdminFormSheet` preko Ctrl+K, bez potvrde; reload
  zaštita ne pokriva SPA navigaciju. P-FE06-12: opća zaštita + regresije, ili
  djelimična zaštita samo palete / odlaganje; naknadno odobrena opća zaštita.
- **Matrica:** 728/1411 auditiranih (backend 421/421, frontend 280/672,
  mobile 1/292, infra 4/4, scripts 22/22); nije test coverage.

### Sesija FE-06 — 2026-11-04 (implementacija, P-FE06-1/3)

- Pinovani Playwright 1.64.1 i axe 4.14.0; **6/6** izolovanih mock browser
  testova lokalno (Chromium 153), desktop i uski web. Javni portal, login
  greška/uspjeh, admin i zaštita, navigacija, SEO, fokus Sheet-a, notifikacije,
  medijske mape; pageerror/neočekivan mock API ruše test. Bez vanjske mreže,
  realnih podataka i plaćanja. To **nije** full-stack E2E.
- Axe gate bez blanket isključenja: 0 critical/serious za definisana stanja;
  pozitivni test provjerava detekciju slike bez `alt`. Novi `browser-mock` CI job
  ✅ `41815794845`; trace/screenshot samo na padu, sintetički podaci.
- U grešci prijave je na hoveru nađen kontrast 2,54:1; već odobreni a11y popravak
  koristi tamni tekst na svijetlom hoveru i regresijski test. Testni relativni API
  proxy odbija udaljene hostove i ima HTTP/upgrade testove; P2 full-stack još otvoren.
- **Novi B-FE06-10 / P-FE06-11:** admin komandna paleta tvrdi `aria-modal`, ali
  browser potvrđuje da se pozadina može fokusirati i Escape tada ne zatvara paletu.
  Uz prethodni P-FE06-10 za samostalni `Dialog`, tada je čekao dodatno odobrenje
  (odobreno naknadno; v. noviju sesiju).
- **Matrica:** 725/1408 auditiranih (backend 421/421, frontend 277/669,
  mobile 1/292, infra 4/4, scripts 22/22); nije test coverage.
- Čisti `npm ci`, browser build/typecheck, Vitest **93/93**, lint 0 errors i
  `check:all` 9/9 ✅. CI ✅ `41815794845` (5/5, uključujući novi browser
  mock + axe job); prethodni P-FE06-6 CI ✅ `41814125171`.

### Sesija FE-06 — 2026-11-04 (implementacija, P-FE06-6)

- `og-server.mjs` vraća `X-Robots-Tag: noindex, nofollow` za `/prijava`,
  `/admin/login` i `/placanje/monri` prije izvršavanja JS-a, uključujući query,
  ekvivalentna velika slova/završni `/` i Mozilla/Googlebot. Druge rute ostaju
  bez dodatnog headera. OG metadata, statika, SW cache i API-fallback testirani.
- Osam izolovanih HTTP testova; stvarni server pokrenut s mock SEO API-jem je
  potvrdio sva tri headera i negativni `/vijesti`. Bez produkcije/plaćanja.
  Express 4.21.2 pinovan u root locku i frontend manifestu, usklađen s postojećim
  Docker runnerom; čisti `npm ci` ✅ (postojeća Node engine upozorenja).
- **Matrica:** 717/1400 auditiranih (backend 421/421, frontend 269/661,
  mobile 1/292, infra 4/4, scripts 22/22). Nije test coverage.
- Build ✅, Vitest **90/90** ✅, lint 0 errors, `check:all` 9/9 ✅.
  CI za P-FE06-5 ✅ `41813051627`; P-FE06-6 ✅ `41814125171` (4/4).

### Sesija FE-06 — 2026-11-04 (implementacija, P-FE06-5)

- **Sheet:** nativni `showModal` izoluje pozadinu; imenovan je preko naslova,
  početni fokus, Tab/Shift+Tab, Escape, backdrop, povrat fokusa i ref-counted
  scroll lock. Sačuvani javna/admin navigacija, notifikacije i izbor medijske
  mape, uključujući ugniježđenu potvrdu brisanja i `preventClose` granicu.
- Popravljeni kontrast potvrde/odabrane mape, naslijeđeni tekst u nativnom
  dijalogu i dostupna imena akcija, BS/EN nazivi zatvaranja/mapa. Chromium mock
  testovi potvrdili fokusnu izolaciju i korisničke tokove; axe u stanjima admin
  menija, notifikacija, medijskih mapa i potvrde: 0 critical/serious.
- **Novi B-FE06-09 / P-FE06-10:** samostalni stari `Dialog` izvan Sheeta i dalje
  tvrdi modalnost bez izolacije/fokusa/Escape; potvrđeno browser probom. Njegovu
  globalnu promjenu ne raditi bez posebnog odobrenja. Preporučen puni modalni fix,
  alternativno uklanjanje `aria-modal` bez rješavanja upravljanja fokusom.
- **Matrica:** 716/1399 auditiranih (backend 421/421, frontend 268/660,
  mobile 1/292, infra 4/4, scripts 22/22); nije test coverage.
- Frontend build ✅, Vitest **82/82** ✅, lint 0 errors, `check:all` 9/9 ✅.
  CI za P-FE06-4 ✅ `41811296453`; P-FE06-5 ✅ `41813051627` (4/4).

### Sesija FE-06 — 2026-11-04 (implementacija, P-FE06-4)

Korisnik je nakon predloga izričito rekao **„Odobravam, nastavi“**: odobreni su
P-FE06-1…9, uključujući vidljive a11y/fokus/SEO/lazy promjene. Mobile ostaje zamrznut.

- **P-FE06-4 implementiran:** svjetliji postojeći token za izmjereni tekst,
  povezana polja prijave/kontakta, login greška `role=alert`, ime promjene jezika,
  admin pretraga prema vidljivom imenu, login/search kao semantički linkovi bez
  ugniježđenih dugmadi. Četiri regresijska testa za labele, fokus i semantiku.
- **Lokalno:** frontend build ✅, Vitest **73/73** ✅, lint **0 errors** (30 upozorenja),
  Chromium/axe uz izolovane mockove ponovio sva prethodno navedena stanja:
  **0 critical / 0 serious** u navedenim stanjima; default axe na početnoj i dalje
  nalazi `heading-order` (moderate). Bez `pageerror`. To nije WCAG certifikat,
  full-stack dokaz ni CI gate. Sheet/fokus/Escape još nisu popravljeni (P-FE06-5).
- **Vitest dedupe:** prvi novi testovi otkrili su dvije React instance u monorepu;
  dedupe + optimizacija relevantnih test peer zavisnosti koristi jednu instancu
  kao produkcijski build. Bez promjene verzija ili mobilne aplikacije.
- **Matrica:** 710/1394 auditiranih (backend 421/421, frontend 262/655,
  mobile 1/292, infra 4/4, scripts 22/22); nije test coverage.
- **CI:** ✅ `41811296453` za `a21053b` (sva 4 joba); ✅ `41809421999`
  za `ea1d0c4`. Još nema browser/axe gatea u CI-ju.

### Sesija FE-06 — 2026-11-04 (audit browser testova, a11y i bundlea)

Korisnik: „ako je redeploy prošao kako treba … možemo krenuti sa FE-06“.

- **Audit završen (historijski, prije odobrenja):** `AUDIT/segments/FE-06.md`;
  P-FE06-1…9 uključuju izolovani Playwright/axe, pravi full-stack CI smoke,
  popravljanje ozbiljnih a11y nalaza, pristupačan Sheet, HTTP noindex, budget,
  postepeni lazy loading i V8 coverage baseline/ratchet.
- **Browser proba:** Chromium 153 + axe u privremenom harnessu, mock API i CMS;
  nema produkcijskog API-ja, podataka ni plaćanja. Prijava, admin, javne stranice
  i mobilni web viewport; u više stanja axe nalazi `serious` (1,91:1 kontrast,
  imena dugmadi i veličina cilja). Ručno: mobilni Sheet nema dialog/fokus/Escape;
  kontakt labele nisu povezane s poljima. Test ne potvrđuje cijeli sajt.
- **Test coverage:** 69/69 testova; privremeni V8 sa `src/**/*.{ts,tsx}`
  (bez test/spec, `src/test/**`, `.d.ts`) = **1,76% linija (138/7837)**,
  624 uključena fajla, 18 sa izvršenim statements. Nije isto što audit-matrica.
- **Build:** entry JS **2.032.548 B**, gzip level 6 **582.522 B**; CSS
  **166.708 B / 23.425 B** gzip. Bez dokaza da produkcijski proxy isporučuje gzip.
- **B-FE06-06:** FE-03 `noindex` radi nakon JS-a, ali sirovi HTTP odgovor
  `og-server.mjs` za `/prijava` i `/placanje/monri` nema noindex header/meta,
  provjereno za browser i Googlebot UA. Ne tvrditi da je server-side dio dovršen;
  `FE-03.md` dopunjen ovom razlikom.
- **Matrica:** 33 pregledana reda ažurirana (15 ranije nepregledanih);
  **705/1389** auditiranih fajlova: backend 421/421, frontend 257/650,
  mobile 1/292 (historijski dodir iz BE-09d; dalje zamrznut), infra 4/4,
  scripts 22/22. Ovo nisu procenti test coveragea.
- **Deploy korekcija:** entrypoint radi `prisma migrate deploy` prije aplikacije;
  nova uspješno pokrenuta verzija znači da su pending migracije prošle ili su
  prethodno primijenjene. Produkciju nismo direktno provjerili. Već primijenjeni
  DROP se ne ponavlja; `roundId` smije biti NULL, pa ranija preporuka o nuli nije
  tačna; i `BE-09d.md` je ispravljen. Za potvrdu pregledati
  `finished_at`/`rolled_back_at` u `_prisma_migrations`.

### Sesija BE-09d — 2026-11-04 (legacy `Match.round`, P-B09c-11)

Korisnik: „možemo detaljno obraditi P-B09c-11 … deploy migracije sve su apply i aplikacija je
live dakle redeploy. Mobile ne radimo dok maksimalno ne usavršimo backend i frontend."

- **Audit ✔** (`AUDIT/segments/BE-09d.md`): 14 dodirnih mjesta — `schema.prisma:706`,
  `matches/match-round.util.ts` (piše `round` uz `roundId`), `rounds.service.ts` (rename kola
  propagira `round`; `syncLegacyRounds` je lenj), `round.util.ts` fallback (statistika
  `upToRound`), seed demo utakmica, 5 fallback mjesta na webu/mobilnom, API JSON (svi skalari).
- **Nalazi:** B-09d-01 dva izvora istine (Medium), B-09d-02 lenj backfill → DROP bez backfilla
  gubi kolo (Medium), B-09d-03 `round` je u API-ju koji objavljena Android aplikacija koristi
  (Medium), B-09d-04 mrtvi fallbacki + spec (Low), B-09d-05 `DROP COLUMN` nepovratan i
  automatski pri prvom startu s pending migracijom (High; već primijenjeni DROP se ne ponavlja), B-09d-06 zdravo (unique kola, idempotentan sync).
- **Odobreno 2026-11-04** (P-B09d-1,2,3,5,6 + DROP uz backup koji je korisnik uradio) → **implementirano**
  u commitu `2b3a7d7`: dvije migracije (`20261104120000_be09d_backfill_match_round` sa guard-om,
  `20261104120100_be09d_drop_match_round` sa DROP-om), `schema.prisma` bez `Match.round`,
  `match-round.util.ts` vraća samo `roundId` (`roundRel: connect/disconnect`), `rounds.service`
  više ne propagira broj kola u utakmice i `syncLegacyRounds` je uklonjen, seed koristi `roundId`,
  `withSeasonAlias` dodaje **izvedeno** `round` (deprecated) i `live.listPendingApproval` uključuje
  `roundRel`, uklonjeni fallbacki na webu (4 fajla) i mobilnom (1 fajl), tipovi sa `@deprecated`.
  Novi test `match-edition.util.spec.ts` (3), prepravljen `round.util.spec.ts`. `docs/BACKEND.md` dokumentuje pravilo.
- **CI:** ✅ `41801427757` (migracije primijenjene u `e2e` jobu na `postgres:16`; build+test zelen).

### Sesija FE-04c — 2026-11-03 (i18n admina — batch 1)

Korisnik: „Možeš nastaviti dalje na FE-04c."

- **B-FE04-10:** admin je bio praktično BS-only (21/170 fajlova sa `useTranslation`),
  pa EN korisnik na javnom portalu vidi engleski, a u adminu bosanski.
- **P-FE04-9 ratchet guard:** `src/i18n/admin-no-hardcoded-text.test.ts` +
  `admin-i18n-baseline.json` (fajl → dozvoljeni broj nalaza). Pad ako fajl pređe
  baseline ili se pojavi nov fajl sa hardkodiranim tekstom; baseline se spušta
  komandom `UPDATE_I18N_BASELINE=1 npx vitest run src/i18n/admin-no-hardcoded-text.test.ts`.
- **Batch 1 (shared + role homes):** media picker dijalog/mape, `RichTextEditor`,
  `SeasonClubPicker`, `EntitySelect` (default placeholder je bio zakucan),
  `SlugField`, `FormationPlayerPool`, `ConfirmDialog` (default `Potvrdi`/`Odustani`
  — koristi se svuda), `ErrorBoundary` (klasa → `i18n.t()`), `LanguageSwitcher`,
  `AdminHome`/`ModeratorHome`/`WriterHome`/`CommentatorHome`/`CommentatorLiveHero`/
  `HomeKpiGrid` + `admin.kpi.*` labele.
- **Rezultat:** nalaza **496 → 454**, fajlova **130 → 113**; 0 kolizija ključeva
  (`admin.media`/`admin.analytics` su zauzeti kao nav-labele → `admin.mediaPicker.*`
  i `admin.visitors.*`).
- **Batch 2** (68 nalaza): `CompetitionsAdminPage` (tabele sezona/katalog, `Da`/`Ne`,
  `Liga`/`Ostalo`, potvrda brisanja — bez reformatiranja, ostao pod 200 linija),
  `NewsEditorMeta`, `ClubBasicTab`, `PaymentProviderCard` (3 provajdera),
  `HeroSectionForm`, `GenericSectionForm`.
- **Batch 2b** (39 nalaza): `TicketingSettingsTab`, `MembershipDetailSheet`,
  `PlayersAdminFormSheet`, `ClubsAdminFormSheet`, `CalendarSeasonPage`.
- **Batch 3** (63 nalaza): analytics posjetioci, trofeji, app-releases, stadion, forma utakmice,
  medij, sponzori, narudžba, vremenska linija, komentator board. `MatchFormSheet` je zbog
  dužih `t()` poziva prešao 200 linija → izdvojen `MatchLiveLockedNote.tsx` (196 linija).
- **Batch 4** (40 nalaza): forma takmičenja/sezone, lista vijesti (potvrda sa `{{title}}`),
  igrači, korisnici, klubovi, kola (`{{count}} utakm.`), finansije (tabele + KPI).
- **Batch 5** (74 nalaza): izvještaj utakmice, timski panel, CMS meni (sortabilna lista),
  `PaymentProviderHints` (dugački dev tekstovi u ključeve), audit, galerija, Hall of Fame,
  muzej, vremenska linija, trofeji, korisnici, članstva.
- **Batch 6** (39 nalaza): igrački panel, klub hub, kadar, CMS builder/meta, news-feed widget,
  season hub, editor galerije, grid medija, plaćanja u ticketing tabu.
- **Batch 7** (57 nalaza): analytics (tabovi + H2H), email log, live na odobrenju, članstvo,
  uloge, takmičenje u sezoni, sponzori, CMS stranice, komentari, kola (završena utakmica,
  kaskadno brisanje, tabela), finansijski filteri, editor vijesti, kategorije ulaznica.
  `MembershipAdminPage` prešao 200 linija → `membership-actions.ts`.
- **Batch 8** (74 nalaza → **0**): komercijalni moduli (comms, hall of fame, baština, mediji,
  postavke, ulaznice), klub hub tabovi, CMS meni/preview/widget picker/forme sekcija,
  komentator (sat, dnevnik, penali, retrospektiva, stream), ocjene rezultata, kolo,
  media toolbar/bulk/mape, pozadina ulaznice, narudžbe i sezonska karta.
  Guard test pojačan: preskače TS deklaracije i tehničke vrijednosti (`https://…`, `url-slug`).
- **Ukupno baseline: 496 → 0 nalaza, 130 → 0 fajlova** — segment zatvoren; ratchet ostaje
  aktivan (nov fajl sa hardkodiranim tekstom ruši test).

### Sesija FE-05 — 2026-11-03 (interna IA; KAPIJA 2)

Korisnik: „Može kreni sa sljedećim korakom."

- **B-FE05-02 (a11y):** 3 icon-only dugmeta u layoutima bez `aria-label`
  (admin + javni hamburger, dugme pretrage) → popravljeno, `3 → 0`;
  **mobilni meni se prije nije mogao pronaći ekranskim čitačem**.
- **B-FE05-01 (IA):** 147 admin stranica, 20 stavki menija, **bez pretrage i breadcrumbsa**.
  Predlozi P-FE05-3 (komandna paleta ⌘K), P-FE05-4 (breadcrumbs), P-FE05-5
  (8 → 6 grupa u sidebaru) — **vidljive promjene, čekaju odobrenje**.
- **B-FE05-05 (guard):** novi `router/admin-nav-ia.test.ts` — pada ako stavka menija
  pokazuje na nepostojeću rutu ili ako admin stranica nema ulaz (siroče). Dokazano
  pozitivnim testom. Trenutno: 0 mrtvih linkova, 0 siročića.
- Zdravo: nav filtriran po dozvolama **i** modulima; 5 rolnih početnih stranica;
  javni meni CMS-driven sa fallbackom; aktivna grupa se auto-otvara na mobilnom.

**Odobreno („odobravam P-FE05-3,4,5") i implementirano:**

- **P-FE05-3 komandna paleta ⌘K:** `admin-command-palette.ts` (normalize skida
  dijakritiku, filter po naslovu/grupi/ključnim riječima, AND preko riječi, prefiks
  rangira prvi) + `AdminCommandPalette.tsx` (dialog/combobox/listbox, ↑↓/Enter/Esc).
  20 stavki menija + 6 brzih akcija, sve filtrirano po dozvolama i modulima.
  Trigger u sidebaru i mobilnom headeru; **6 testova**.
- **P-FE05-4 breadcrumbs** (`AdminBreadcrumbs.tsx`, `aria-current="page"`) na
  ClubHub, SeasonHub, CmsPageBuilder, MatchReport.
- **P-FE05-5 sidebar 8 → 6 grupa** (Naslijeđe → Klub, Komunikacije → Sadržaj);
  20 stavki zadržano, guard test provjerava da nema gubitka ni duplikata.

### Sesija FE-04b — 2026-11-03 (admin: forme i editori)

Korisnik: „kreni FE-04b slobodno."

- **B-FE04-09 (a11y):** 43 icon-only dugmeta bez `aria-label` → **43 → 0**
  (`Uredi`, `Obriši`, `Pomjeri gore/dolje`, `Nazad`, `Dodaj`).
- **B-FE04-08 (Medium):** 21/23 forme nije prosljeđivalo `dirty` → zatvaranje
  dijaloga je gubilo otkucano. Nova `form-dirty.ts` (snapshot polja) + `AdminFormSheet`
  sam traži potvrdu (`admin.unsavedChanges`) i registruje `beforeunload`; bez izmjena
  u pojedinačnim formama.
- **B-FE04-07 (Medium):** 3 forme su tiho gutale grešku spremanja (MediaAsset,
  AppRelease create/upload, CMS meta) → `try/catch` + `role="alert"` +
  `getApiErrorMessage`.
- Testovi: **57 / 15 fajlova** (+5 za `form-dirty`); `check:all` 9/9; build/lint zeleni.
- Ostaje: i18n admina (138 fajlova) → FE-04c; interna IA → FE-05.

### Sesija FE-04a — 2026-11-03 (admin: hub, liste, navigacija)

Korisnik: „Konačno je sve oky, možeš nastaviti dalje."

- **B-FE04-01 (Medium):** 45 admin fajlova imalo `isLoading` bez `isError` → pad API-ja
  izgledao kao prazna tabela. `AdminPageShell` dobio `isError`/`onRetry` (`DataError`),
  povezano na **20 stranica**; `DataError` preseljen u `components/common/`.
- **B-FE04-02 (Medium):** 3 destruktivne akcije bez potvrde (CMS sekcija, match highlight,
  zapis iz izvještaja) → `useConfirm` svuda; ostale admin akcije su već bile ispravne.
- **B-FE04-03 (Low):** 4 rute bez `PermissionRoute` (`users`, `heritage`, `comms`,
  `notifications`) → dodan `anyOf` prop i pokrivene; backend ih je i prije štitio.
- Ostaje: `aria-label` (39) i i18n admina → FE-04b/FE-04c.

### HITNO — 2026-11-03 (Coolify build pao: `npm ci` EUSAGE)

Javljeno: Coolify deploy `frontend` image pada na `RUN npm ci` — „lock file and
package.json are not in sync", `Missing: vitest@5.1.0`, `dompurify@3.4.17` …

- **B-CI04-01 (High, deploy blokiran) RIJEŠEN:** `frontend/Dockerfile` je gradio iz
  `./frontend` sa **zasebnim** `frontend/package-lock.json`, koji `npm install -w`
  nikad ne ažurira (npm workspace piše samo u root lock) → lock zarašao još od
  FE-02/FE-03. Rješenje: **jedan lock** — `frontend.build.context: .` (root),
  Dockerfile radi `npm ci` iz root locka pa `npm run build -w frontend`;
  `frontend/package-lock.json` **obrisan**, dodan root `.dockerignore`,
  `sync-docker-locks.sh` sada samo `backend`.
- **Novi guard:** `scripts/standards/docker-context.mjs` (8. `check:all` provjera) —
  pada ako `COPY` putanja ne postoji u kontekstu ili ako workspace koji se gradi iz
  roota ima svoj lock. Dokazano pozitivnim testom.
- Verifikacija: simuliran builder stage (`npm ci` + `npm run build -w frontend` u
  root workspace tree-u) ✅; `npm ci --workspace frontend` dokazano **neispravan**
  (tsc pada) → Dockerfile koristi pun `npm ci`. Detalji: `AUDIT/segments/CI-04.md`.
- **B-CI04-02 (High, runtime) — `P1001 localhost:5432`:** Coolify upisane varijable
  stižu kroz `/artifacts/<uuid>/.env` → `docker compose` interpolacija u `environment:`
  blok; `${VAR}` bez vrijednosti postaje prazan string, a `environment:` je allowlista
  (varijabla koja nije u compose-u nikad ne dođe do kontejnera). Uvedeno:
  **`${VAR:?}` fail-fast** za `DATABASE_URL`, `API_PUBLIC_URL`, JWT sekrete i admin
  kredencijale + **`scripts/diag-deploy.sh`** (env u kontejneru maskirano, host/port iz
  `DATABASE_URL`, DNS unutar mreže, TCP provjera). `injected env (0)` iz `dotenv` je
  očekivano — u slici nema `.env`, Prisma radi samo sa procesnim env varijablama.
  **Dokazano eksperimentom:** prazna/missing `DATABASE_URL` daje
  `Cannot resolve environment variable: DATABASE_URL`, **ne** `localhost:5432` —
  dakle `localhost` u Prisma izlazu je **dummy build-arg** (`backend/Dockerfile`),
  tj. proces je radio bez Coolify env-a (build stage). Zato je dummy host preimenovan
  u `build-arg-dummy.invalid` da se to odmah vidi.
  **Nađen i HTML-entitet:** korisnikov `DATABASE_URL` sadrži `&amp;` umjesto `&` →
  `sslrootcert` se ne parsira (radi samo zahvaljujući `NODE_EXTRA_CERTS`).
- **B-CI04-02 KONAČNO RIJEŠENO:** `.invalid` dummy se pojavio u runtime grešci ⇒
  **Coolify izvozi `build.args` i u `up`**, pa je build-arg `DATABASE_URL` pregazio
  pravi URL iz `environment:`. Uklonjen `DATABASE_URL` build-arg iz
  `docker-compose.yml` i `backend/Dockerfile`; `prisma.config.ts` više ne koristi
  `env()` (placeholder za `generate`); novi `backend/docker-entrypoint.sh` radi
  preflight (fali URL / placeholder / maskiran ispis) prije `prisma migrate deploy`;
  `docker-context` guard zabranjuje tajne u `build.args`/`ARG`.
- **B-CI04-03 (High) — frontend crn ekran poslije popravke builda:**
  `TypeError: Cannot read properties of null (reading 'useEffect')`. Uzrok: monorepo
  ima dvije kopije Reacta (`mobile`/Expo pinuje 19.2.3 hoistano u root, frontend traži
  ^19.2.7 → 19.3.1) i otkad se frontend gradi iz root workspace-a obje uđu u bundle.
  Fix: `resolve.dedupe: ['react','react-dom']` + novi guard `bundle-react`
  (9. `check:all` provjera, i CI korak poslije frontend builda). Dokaz: bundle prije
  fixa sadržavao 19.2.3 i 19.3.1, poslije samo 19.3.1.
- **PAŽNJA:** Coolify gradi sa grane **`main`** — dok fix ne dođe na `main`, deploy
  će i dalje padati. `main` nije dobio ni FE-03/FE-03b izmjene.

### Sesija FE-03b — 2026-11-03 (i18n migracija javnog portala)

Korisnik: „Odobravam sve preporuke u blokatorima kako si rekao" (P-FE03-6 odobren).

- **25 javnih stranica + 12 home sekcija** migrirano na `t()`: novi `pages.*` namespace
  sa **17 sekcija** i **~140 ključeva po jeziku** (bs ↔ en usklađeno), interpolacije za
  kolo/email/broj golova/sezonu.
- **SEO meta** (title/description) sada iz locale fajlova — EN korisnik dobija EN opis.
- **Guard test** `src/i18n/no-hardcoded-text.test.ts`: pada na hardkodiran UI tekst u
  `pages/public/**` i `pages/home/**` (probe potvrdio da hvata regresiju).
- **Rezultat:** 0 hardkodiranih stringova u opsegu; 48 testa / 13 fajlova; BS tekst
  identičan kao prije (1:1 prenos), EN sada stvarno engleski.
- **Ostaje:** ~261 string u `components/**`/`cms/**` (dijele ih javni portal i admin) →
  uz **FE-04**.

### Sesija FE-03 follow-up — 2026-11-03 (odobreni blokeri)

Korisnik: „Odobravam sve preporuke u blokatorima kako si rekao."

- **P-FE03-1 (High, stored XSS) RIJEŠEN:** `dompurify@3.4.17` + `src/lib/sanitize-html.ts`
  (allowlista, zabrana script/style/form/embed, `javascript:`/`data:text/html` odbijeni,
  `iframe` samo YouTube/Vimeo, `rel="noopener noreferrer"`); `RichContent` sanitizuje
  prije `dangerouslySetInnerHTML` → pokrivene vijesti, CMS, muzej, trofeji, klupska historija.
  **7 novih XSS regresionih testova** (ukupno 47 testa / 12 fajlova).
- **P-FE03-7 klijentski implementiran:** `Seo` `noindex` prop → `/prijava` i Monri payment bridge. Naknadno FE-06/B-FE06-06: server-side noindex prije JS-a još nedostaje.
- **Ispravljen style churn:** dodan `.prettierrc.json` (`singleQuote`, `printWidth 100`)
  i vraćena 39 fajla koja je `prettier` bez konfiguracije preformatirao u FE-02/FE-03.
- **Napomena o okruženju:** tokom sesije se lokalni `.git` vratio na stariji commit
  (`b7f1d3d`) dok je radni direktorijum bio aktuelan — stanje oporavljeno sa
  `git reset --mixed origin/arena/290a6f13-fkgracanica` (`251db73`), bez gubitka rada;
  remote je bio ispravan.
- Otvoreno: **P-FE03-6** (i18n migracija 21 stranice → FE-03b).

### Sesija FE-03 — 2026-11-03 (javni portal)

- **B-FE03-01 (High, sigurnost):** `RichContent` renderuje nesanitizovan HTML iz
  `news.body`/CMS → **stored XSS**; u frontendu nema sanitizera. Predlog **P-FE03-1**
  (`dompurify` + allowlista) **čeka odobrenje** (novi dep + moguć vidljiv efekat).
- **B-FE03-02:** 17/25 javnih stranica nije imalo error stanje → nova `DataError`
  komponenta (`role="alert"` + retry) i error grane na **10 stranica**.
- **B-FE03-03/04:** i18n — 6 `home.*Subtitle` + `actions.retry` + `common.loadError`
  dodani u bs/en; novi test čuva **bs/en parity** i provjerava da svaki literalni
  `t('…')` ključ postoji (40 testa / 11 fajlova ukupno).
- **B-FE03-05:** `loading="lazy" decoding="async"` na 31 sadržajnu sliku (hero ostaje eager).
- **B-FE03-06:** `SearchPage` — `q` se sinhronizuje sa URL-om, validacija `page`, `Seo url`.
- Otvoreno: **P-FE03-1** (XSS), **P-FE03-6** (i18n migracija 21 stranice → FE-03b),
  **P-FE03-7** (`noindex` je naknadno klijentski implementiran; HTTP dopuna → FE-06/B-FE06-06).

### Sesija FE-02 — 2026-11-03 (frontend test infra)

Korisnik: „Možeš nastaviti dalje na FE-02 — frontend test infra" + „Što se blokera tiče,
po tvojoj preporuci odobravam" (→ i **P-FE01-7**).

- **P-FE01-7 implementiran:** `@custom-variant dark (&:where(.dark, .dark *));` —
  `dark:` sada prati `<html class="dark">` (app tema), ne OS; `token-check/dark-variant`
  od upozorenja postao **greška**. FE-01 ZATVOREN.
- **FE-02:** novi devDeps (`vitest 5`, `jsdom 30`, `@testing-library/react 16`,
  `jest-dom 7`, `user-event 14`), `frontend/vitest.config.ts`, `src/test/setup.ts`
  (jest-dom + `matchMedia` shim + `cleanup`), `tsconfig.test.json` (testovi se
  **typecheckuju** u `tsc -b`, izuzeti iz app projekta).
- **34 testa u 9 fajlova:** `lib/{utils,as-array,html-content,match-status-label}`,
  `ui/{button,badge,card,input}` + migriran `commentator-desk.spec.ts` (bio `node:test`,
  ručno pokretanje → F-003/F-011 zatvoreni).
- **CI:** korak `frontend test (vitest)` u `build-test` jobu — frontend testovi se od
  sada izvršavaju na svaki push. Coverage prag + bundle budget → CI-03.

### Sesija FE-01 — 2026-11-03 (design tokeni + token-check)

Korisnik: „Kreni FE-01 blokatori po preporuci riješi".

- **Jedan izvor istine:** `@theme` u `frontend/src/index.css` sada drži sve boje/fontove/
  veličine teksta; dupli `:root` blok boja uklonjen; `--color-primary-rgb` (nije bio
  definisan!) i `--color-brand-rgb` dodani → live-goal glow više ne visi na hardkodiranom
  fallbacku.
- **15 novih tokena:** `--color-brand #0066ff`, `--color-surface-deep/-night/-story/-mock/-chrome`,
  `--color-wood-dark`, `--color-frame-light`, vendor `stripe/paypal/monri` (+ hover).
- **23 proizvoljne hex klase → tokeni sa identičnim vrijednostima** (bez vizuelne promjene);
  `premium-landing.css` bez hardkodirane brend boje.
- **Nova provjera `token-check`** (6 pravila + ratchet baseline 417) u `check:all` → **7/7**;
  self-test: 3 namjerne greške uhvaćene.
- **Nije primijenjeno (vidljivo, čeka dozvolu):** P-FE01-7 `@custom-variant dark`
  (`dark:` po app temi, ne po OS-u); P-FE01-8 migracija 417 palette klasa (FE-03/FE-04).
- Verifikacija: `build -w frontend` ✅, `lint -w frontend` 0 grešaka, izlazni CSS ima
  identične vrijednosti boja; `check:all` 7/7.

### Sesija BE-09c zatvaranje — 2026-11-03 (CI e2e + drift specova)

- Novi CI job `e2e` pokrenut prvi put → 2 od 18 testa pala (specovi su odstupali od
  API ugovora: `GOAL` bez `playerId`, `round` van DTO-a, `reserve` bez zakazane
  domaće utakmice i sa hardkodiranom labelom kategorije).
- Job dobio `--json --outputFile` + `::error` anotaciju (`failureMessages`) jer su
  GitHub logovi iz sandboxa nedostupni — dijagnostika ide kroz check-run anotacije.
- `DATABASE_URL` u CI-ju bez ugrađene lozinke (`POSTGRES_HOST_AUTH_METHOD: trust`) —
  secrets-ban čist; prvi pokušaj (`postgres:postgres@…`) je oborio `standards` job.
- **Rezultat:** run `41662277103` — sva 4 joba zelena, e2e **18/18**.
- **BE-09 (a/b/c) ZATVOREN.** Backlog: **P-B09c-11** (uklanjanje legacy `Match.round`),
  B-09c-13 (Docker digest + `migrate deploy` van `CMD`).

### Sesija BE-09c implementacija — 2026-11-03 (odobreni predlozi)

Korisnik: „Možeš nastaviti sljedeći korak! … P-B08-6, P-B09-3/4/6 takođe po tvojoj
preporuci slažem se" → odobreni **P-B09c-1…10 + P-B09c-12**, uz P-B08-6, P-B09-3, P-B09-4, P-B09-6.

- **Seed sigurnost (P-B09c-1, 8):** `ADMIN_PASSWORD` obavezan (min 8; `change-me`
  odbijen u produkciji), hash samo pri kreiranju admina, reset samo uz
  `ADMIN_RESET_PASSWORD=1`; demo sadržaj samo uz `SEED_DEMO=1`.
- **Docker (P-B09c-2, 3):** `DATABASE_URL` više ne ostaje u slojevima slike
  (`RUN DATABASE_URL=… prisma generate`), compose šalje dummy build arg,
  `npm prune --omit=dev` u runner stage-u.
- **CI (P-B09c-4):** novi job `e2e` — `postgres:16` + `redis:7`, health-wait,
  `prisma migrate deploy`, seed, `test:e2e`; na pad `::error` anotacija.
  `DATABASE_URL` bez lozinke (`POSTGRES_HOST_AUTH_METHOD: trust`) — secrets-ban čist.
- **RBAC seed (P-B09c-5):** definicija rola/dozvola preseljena u
  `src/rbac/rbac-seed.constants.ts`, seed u `$transaction`, fail-fast na nepoznat ključ.
- **Skripte (P-B09c-6, 10, 12):** QA skripte bez produkcijskog defaulta, traže
  `--yes`; `git.sh` bez „commit-all" (`':!.env*' ':!uploads'`), potvrda za push;
  `setup-upload-dir.sh` pada ako `chown` ne uspije.
- **Indeksi (P-B09c-7, odobrena schema izmjena):** 14 `@@index` na FK kolone +
  migracija `20261103140000_be09c_fk_indexes`.
- **Uz to:** P-B08-6 (insensitive pretraga + `q` ≤ 100), P-B09-3 (upload throttle
  10/60 s + kvota 20/dan → 429), P-B09-4 (transliteracija `đ/ß/æ/ø/ł`),
  P-B09-6 (users `sort` allowlist, nepoznato → 400).
- **Testovi:** 25 novih testova u 5 novih specova; `npx jest src/upload` 16/16.
- **Verifikacija:** `check:all` 6/6; matrica +30 redova. Lokalno **nije** bilo
  moguće: `prisma validate` (sandbox nema mrežu do Prisma binarija) i 19 jest
  suite koje traže generisan `@prisma/client` → gate je CI.

### Sesija TLS (prethodno, commiti `09a292e`, `b0376a5` — pushani)
- F-SSL-1: audit korištenja Redis-a (BullMQ email red + keš; opciono preko `REDIS_URL`).
- F-SSL-2: TLS envs + mountovi u `docker-compose.yml`, `.env.example` (D-001).
- F-SSL-3: ispravka `self-signed certificate in certificate chain` — eksplicitni
  `REDIS_TLS_CA` → `tls.ca` (helper `common/utils/redis-tls.util.ts`), hardcode
  `NODE_EXTRA_CERTS`/`REDIS_TLS_CA` u compose; commit `b0376a5`.
- Napomena: workspace je bio re-clone-an (lokal pao na `b7f1d3d`) → poravnan sa remote
  (`git reset FETCH_HEAD`), sadržaj identičan.

### Sesija AUDIT (FAZA 0 + FAZA 1) — 2026-11-02
- F-000: Potvrđena aktivna grana `arena/290a6f13-fkgracanica` @ `b0376a5`.
- FAZA 0: pročitana sva dostupna dokumentacija (README, plan, docs/, .cursor aggregates,
  mobile smoke, scripts), mapiran stack po slojevima → `AUDIT/00_PROJECT_UNDERSTANDING.md`
  (Q-01…Q-08).
- FAZA 1: brzi docs-vs-reality audit → `AUDIT/01_DOCS_VS_REALITY.md` (21 tvrdnja + nalazi
  **F-001…F-016**; kritično: **F-001 tajne u repu**).
- FAZA 1 penzionisanje: 10 fajlova → `docs/_retired/` (+ baneri + `INDEX.md`) — D-003.
  Odgođeno uz pitanja: root README (Q-01), `.cursor/plans` (Q-02), smoke checkliste (Q-03).
- Nova dokumentacija (izvor istine): `docs/{ARCHITECTURE,INFRASTRUCTURE,BACKEND,FRONTEND,MOBILE,TESTING,CI,CONVENTIONS,DECISIONS}.md`; linkovi u root `README.md` ažurirani.
- Napomena: `.env.example` i dalje sadrži F-001 lozinku — **ne diram** dok ne stigne Q-04.
- Commit `583214a` pushan; `gh run list` → prazno (nema CI-ja). Lokalne provjere:
  eslint čist na TS izmjenama iz prethodne sesije; YAML compose validiran; `check:all`
  ne postoji (FAZA 3).

### Sesija AUDIT (FAZA 2 + FAZA 3) — 2026-11-02
- **KAPIJA 1 odobrena** od korisnika ("Imaš moje odobrenje KAPIJE 1") — Q-01…Q-08 i dalje
  otvoreni (blokiraju INF-01/02/03, CI-01 start po Q-06).
- **FAZA 2**: `AUDIT/02_MASTER_AUDIT_PLAN.md` — 26 segmenata po slojevima (CI, INF, BE, FE,
  MOB, E2E), redoslijed s obrazloženjem, tačni kriterijumi završetka (npr. CI-01 = 15
  koraka; pragovi pokrivenosti baseline-first), rizici R-1…R-10, pitanja Q-09 (alati) +
  Q-10 (pristup produkciji), preporuka alata s alternativama.
- **FAZA 3**:
  - `scripts/audit/inventory.mjs` — inventar izvornih fajlova (eksplicitni izuzeci s
    razlogom), regenerira `AUDIT/COVERAGE_MATRIX.csv` čuvajući statuse;
  - `AUDIT/COVERAGE_MATRIX.csv` — **1277 fajlova** (backend 349, frontend 623, mobile 292,
    scripts 11, infra 2); svi `nepregledano`;
  - `scripts/audit/check-coverage.mjs` — gate: R1 fajl van matrice, R2 zastario red,
    R3 `ZATVOREN` segment s nepregledanim fajlom, R4 loš status/dupli red; poruke u formatu
    KOJE/GDJE/ZAŠTO/KAKO + exit 1;
  - **verifikacija**: test R1 (novi fajl van matrice) → exit 1 ✓; test R3 (zatvoren
    segment s `nepregledano`) → exit 1 ✓; čisto stanje → exit 0 ✓;
  - workflow matrice + segmenata dodan u `docs/CONVENTIONS.md`.
- Push bez CI-ja (Q-06); `gh run list` i dalje prazan (F-002).

### SEGMENT CI-01 — 2026-11-02 (ZATVOREN ✅)
- KAPIJA 2 odobrena ("Odobravam") → Q-06 ✔, Q-09 ✔ (alati §4), Q-10 ✔ (u principu).
- F-015: `npm ci` exit 0 (lock regenerisan + usklađen).
- F-016/dual-core: `@tiptap/*@3.28.0` overrides + exact pin (frontend/mobile) — `npm ls` 0 invalid.
- **F-017 (novi):** frontend build je bio pokvaren (`tsc -b` padao na ChainedCommands tipovima
  zbog dual @tiptap/core) — riješeno istim fixom; `npm run build -w frontend` = 0.
- **F-018 (novi):** oxlint 6 errors (uslovni hookovi u 3 admin stranice, EntitySelect,
  use-live-admin `phaseMutation`) — fixano; 0 errors.
- CI-01 artefakti: `.github/workflows/ci.yml` (audit-gate, standards, build-test;
  push na arena granu + workflow_dispatch; BEZ pull_request okidača), `scripts/standards/`
  (check:all 6/6), `.githooks/pre-push` + hooksPath, `docs/CI.md` ažuriran + badge.
- Lokalno zeleno: npm ci, check:all 6/6, frontend build, frontend lint.
- ⚠️ backend build/test/eslint + prisma generate **nije moguće lokalno** (binaries.prisma.sh
  blokran) → verifikacija preko CI-a.
- **KRAJ: 9 runova ❌ → popravljeno → run `41463437281` ✅ ZELEN** (sva 3 joba).
  Nalazi riješeni: F-015 ✓, F-016 dual-core ✓, **F-017** (FE build pokvaren — dual tiptap
  tipovi) ✓, **F-018** (6 oxlint rules-of-hooks) ✓, + eslint debt (prettier 212 fajlova,
  17 type-aware grešaka, zastarijeli newsInclude asert, unused importi).
  Segment dokument: `AUDIT/segments/CI-01.md` (Status segmenta: ZATVOREN).

### SEGMENT INF-01 — 2026-11-02 (ZATVOREN ✅)

- Q-04 ✔ (D-004: `Mojalozinka!1` nije stvarna lozinka → bez rotacije/rewrite) i Q-05 ✔
  (D-005: samo Coolify, Traefik ne postoji) → segment odblokiran.
- I-01-01: `docker-compose1.yaml` penzionisan u `docs/_retired/` (banner + INDEX +
  INFRASTRUCTURE + inventory referenca).
- Odobrenje korisnika **„Može, odobravam sve"** (2026-11-02) → primijenjeno:
  - I-01-08: `frontend/Dockerfile` → `RUN npm ci` bez `--package-lock-only` (`7c4fb5f`);
  - I-01-02: frontend runner `USER node` — provjeren og-server: read-only, port 3000 (`7c4fb5f`);
  - I-01-03: `logging: json-file 10m×3` na backend + frontend (`2a93534`);
  - I-01-04: `security_opt: no-new-privileges:true` na oba servisa (`2a93534`);
  - I-01-05 (`condition: service_healthy`): odgođeno — preporuka DEFER prihvaćena
    (HEALTHCHECK alat u backend slici nije garantovan → rizik blokade starta frontenda).
- Prvi push segmenta ❌ `41483038067` (secrets-ban na D-004 dokazu u DECISIONS.md) →
  allowlist poprava `9a7fbc2` → ✅ `41483596127` → hardening → ✅ `41485825537`.
- Lokalno: `check:all` 6/6, compose YAML validan, matrica 1284 fajla (INF-01: 3 reda).
- Segment dokument: `AUDIT/segments/INF-01.md` (Status segmenta: ZATVOREN).

### INCIDENT nakon zatvaranja — F-019 (Coolify build pao, 2026-11-02 17:12)

- **Lanac**: CI-01 tačni pinovi u `frontend/package.json` (@types/react 19.2.18,
  @types/react-dom 19.2.7, tiptap 3.28.0) → root lock sinhron (GitHub CI zelen),
  ALI standalone `frontend/package-lock.json` (njega koristi Docker build)
  **nikad regenerisan** (`scripts/sync-docker-locks.sh` postojao — nepokrenut) →
  I-01-08 (odobren) uklonio `--package-lock-only` masku → Coolify `npm ci`
  (npm 10.9.9) pao: `lock file's @types/react@19.2.17 does not satisfy 19.2.18`.
- **Fix `2f4ce40` (F-019)**: hirurška sinhronizacija **15+/15−** — 2 @types bloka
  (version/resolved/integrity) + 9 root-mirror stavki; `package.json` netaknut;
  svih 22 `libc` polja sačuvano (alpine/musl build).
- **Odbijen puni regen `sync-docker-locks.sh`**: regeneriše lock OD NULE →
  react 19.2.7→19.3.1, vite 8.1.5→8.3.5 (1629 reda) = nedozvoljena promjena
  ponašanja → revertiran; preporuka za hardening alata čeka odobrenje.
- **Verifikacija**: standalone `npm ci` exit 0 na npm 10.9.8 i **npm 10.9.9
  (tačno Coolify)**; GitHub CI ✅ `41501622108`.
- **Otvoreno (pitanje korisniku)**: Coolify log pokazuje `Dockerfile:37`
  (COPY na liniji 35) — naš `frontend/Dockerfile` ima COPY na 10 i nijedna
  historijska verzija ne odgovara → provjeriti Coolify git izvor/branch/Dockerfile.

### SEGMENT INF-02 — 2026-11-02 (ZATVOREN ✅)

- Q-04 ✔/D-004 → čišćenje **sprovedeno**: `.env.example` 2× F-001 → `change-me`
  (+ D-004 komentar), REDIS primjer `<CHANGE_ME_URL_ENCODED>` (J-02-04).
- `secrets-ban`: uklonjena zastarjela `.env*` allowlist stavka → `.env.example`
  sada skeniran; **negativni test** (F-001 vraćen u fajl) → exit 1 ✓.
- Novi `.githooks/pre-commit` (brzi tajni skaner; pun `check:all` ide na
  pre-push + CI); `core.hooksPath` **vraćen** nakon re-kloanja — hook upalio
  uživo na commitima `6cd18d9`/`f5ec734`.
- `rotate-secrets.sh` audit ✓ (zdrav: `openssl rand`, radi na nepostojećem
  `.env`-u; D-004 → rotacija nije potrebna; hint `db:seed` postoji).
- F-001 dokaz ostaje **samo** u allowlist dokumentima (`AUDIT/` ×3,
  `docs/DECISIONS.md`, `docs/_retired/` ×1); `.env` nije trackan;
  git historija **bez rewritea** (D-004).
- CI ✅ `41504684855`; `check:all` 6/6; matrica 1285 fajlova (INF-02: 3 reda).
- Segment dokument: `AUDIT/segments/INF-02.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-01 — 2026-11-02 (ZATVOREN ✅)

- KAPIJA: audit + predlozi (P1–P8, Q-11…Q-13) → korisnik **„Odobravam
  preporuke"** → **D-006** zapisan u `docs/DECISIONS.md`.
- **Implementirano** (`675d5ce` + `f062097`):
  - P1: `config/env.validate.ts` — fail-fast env validacija (zero-dep);
  - P2: `config/configuration.ts` + migracija main/prisma/common(+cache/jobs
    pozivaoci) na ConfigService — common/ više ne čita `process.env`;
  - Q-11(a): throttler globalno **100/60s**, auth **10/60s**, `trust proxy=1`;
  - P5: error ugovor zadržan + additivno `path`;
  - Q-13: Prisma **P2002→409 / P2025→404 / P2006→400** + **7 unit testova**;
  - Q-12(a): audit javnih ruta — **192 zaštićene / 71 javna** (aneks u
    segments/BE-01.md) → globalni guard ide u **BE-02**; sumnja: `clubs/own`.
- Verifikacija: lokalno jest 7/7 + eslint čist (moji fajlovi) + check:all 6/6;
  **CI ✅ `41512922531`** (nest build + cijeli jest + eslint s generisanom Prisma).
- Segment dokument: `AUDIT/segments/BE-01.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-02 — 2026-11-02 (ZATVOREN ✅)

- Audit auth/rbac/users: **sloj zdrav** (bcrypt10, jednokratna refresh rotacija,
  per-request permissions, RBAC vezan — 0 violacija). Nalazi: B-02-01 (timing
  enumeration), B-02-02 (logout ownership), B-02-03 (JWT_EXPIRES format) =
  **trivijalni predlozi otvoreni**; B-02-04 `clubs/own` = site-level javan
  (false alarm iz BE-01 aneksa — riješen `@Public`).
- **Q-12(a) implementiran** (`245f066`+`a087b66`): globalni JwtAuthGuard
  (default-deny, **http-only** — WS preskače jer gateway ima vlastitu auth +
  public live klijente) + `@Public` na **71** javnoj ruti + strip JwtAuthGuard
  iz41 kontrolera. **Korekcija BE-01**: throttler `skipIf` → samo HTTP (B-02-05).
- **Testovi** (`f357813`): `route-access.spec` — invariant preko STVARNIH Nest
  metapodataka (71==71), `jwt-auth.guard.spec` — public/ws skip; lokalno 13/13.
- **Incident**: treći re-klon workspacea (`.git`→`b7f1d3d`, node_modules obrisan)
  → `fetch --unshallow` + mixed reset; sav rad na GitHubu, ništa izgubljeno.
- CI ✅ **`41525406239`**; `check:all` 6/6; matrica: 54 reda → BE-02 (ukupno1291).
- Segment dokument: `AUDIT/segments/BE-02.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-03 — 2026-11-02 (ZATVOREN ✅)

- Audit settings/audit/notifikacije/email-log (25 fajlova): **sloj zdrav** —
  registry = jedini izvor settings redova (cross-scope = tihi no-op), audit
  **bez tajni** (password nikad u metadata), notifikacije **user-scoped**,
  zavisnosti modula rade. Nalazi: B-03-06 (datum validacija → predlog
  P-B03-1 otvoren), B-03-07 info.
- Izmjene: **3 nova unit speca** (scope enforcement, audit filteri, ownership)
  — 32→**38** specova; testovi lokalno **14/14**; matrica 25 redova → BE-03.
- `docs/TESTING.md` + `docs/BACKEND.md` brojevi ažurirani.
- Segment dokument: `AUDIT/segments/BE-03.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-04 — 2026-11-02 (ZATVOREN ✅)

- Audit 29 fajlova → **6 kritičnih nalaza** (B-04-01…06): draft leak kroz
  `GET /news`, `news/:id`, `gallery`, CMS `?admin=1` + upload XSS/OOM.
- Odobrenje korisnika **„odobravam P-B04-1 i 2"** → implementirano:
  - **P-B04-1** (`9159db1`): **tiha autorizacija** u JwtAuthGuard (@Public +
    Bearer → `req.user`, anon → i dalje javan) + filtri: anon→PUBLISHED
    (news/gallery liste), news/:id + komentari → 404 za draft, `gallery/:id`
    bez @Public (invariant **71→70**), CMS admin flag samo uz `req.user`.
    **0 FE/MOB izmjena** (admin paneli/mobile staff rade bez promjena).
  - **P-B04-2** (`34145b5`): upload mime+ext allowlist + **16MB** (413/400).
- Testovi (`e386d48`):5 novih/uređenih speca — leak regresija, silent auth,
  upload validacija; CI zelen nakon4 krpa (tsc tip → komitano → castovi):
  **`41533952042` ✅ (build + 157 testova + eslint)**.
- `hooksPath` ponovo vraćen (izgubljen re-klonom #3); matrica: 15 redova → BE-04.

### SEGMENT BE-05 — 2026-11-02 (ZATVOREN ✅)

- Audit 75 fajlova (~4.900 LOC): **sloj zdrav** — write rute sve
  perm-guardane (0 rupa), 0 admin-flag obrazaca, `season-stats-rebuild`
  interni util, PII ok (sha256, bez raw IP), standings tie-breaker već
  specovan (b7f1d3d), 11 postojećih speca.
- **2 invisible fixa** (`6930be8`): B-05-01 sweep `visit-rate-limit` Mape
  (memory leak), B-05-02 `getClientIp` → `req.ip` (anti-spoof geo, usklađen
  s BE-01 trust proxy). **2 nova speca** (`d7de4c8`): 8 testova.
- CI ✅ **`41535738687`** (iz prve); `check:all` 6/6; matrica 75 redova → BE-05.
- Segment dokument: `AUDIT/segments/BE-05.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-06 — 2026-11-02 (ZATVOREN ✅)

- Audit 39 fajlova: **zdrav** — queue limiter 10/60s, newsletter:join
  authentikovan, unsubscribe token, live-report class-guarded, utili specovani.
- **Invisible** (`90b6021`): **6 `process.env` → ConfigService/configuration**
  (BE-01 P2, **0 preostalo** u segmentu) + **`match:join` cap 32** (WS bez
  throttlera → memory zaštita) + idempotentan rejoin.
- **Spec** (`991759c`): gateway handleri —7 testova; lokalno **76/76** (16 suiteova).
- **2 predloga otvorena**: P-B06-1 (contact DTO validacija → 400),
  P-B06-2 (matchId postojanje → ok:false).
- CI ✅ **`41538504328`** (iz prve); matrica 39 redova → BE-06.
- Segment dokument: `AUDIT/segments/BE-06.md` (Status segmenta: ZATVOREN).

### SEGMENT BE-07 — 2026-11-03 (drugi krug: P-B07-2 A, Q-15, P-B07-6)

- **Odobrenje „odobravam P-B07-2 (A) i Q-15 = da i P-B07-6"** → **D-007**.
- `fa97684` **šema + migracija**: `PaymentEvent(provider, externalId @unique,
  kind, refId)` + `Payment.membershipId` (`orderId` postaje opcionalan),
  migracija `20261103120000_be07_payment_event_membership_payment`.
- `0fb3d4b` **P-B07-2 (A)**: `payment-event.util.ts` (claim/release +
  `runPaymentEventOnce`), `webhook-confirm.util.ts` (zajednička potvrda iz
  webhooka), wiring u Stripe/PayPal/Monri (webhook **i** confirm-session) —
  retry ne može dvaput produžiti članstvo. **7 testova**.
- `a2d16b0` **Q-15**: checkout otvara `Payment` red za članstvo
  (`PENDING_ONLINE`), potvrda ga zaključava; `finance/` čita prihod iz
  Payment redova (`finance-loaders.ts`, servis 203→103 linije), API polje
  `estimated` ostaje ali je `false` za plaćena članstva; izvoz članstva dobija
  `Provider` kolonu.
- `9072e3c` **P-B07-6** (vidljivo, odobreno): otkazivanje samo `pending`
  (payment → `CANCELLED`), povrat samo `paid` + bez `USED` ulaznica
  (ulaznice → `REFUND_REQUESTED`), admin ne otkazuje plaćeno, `confirmRefund`
  gasi ulaznice atomski. **7 testova** (`ticketing-orders.service.spec.ts`).
- Ukupno u segmentu: **24 nova testa** u 5 novih spec fajlova.

### SEGMENT BE-07 — 2026-11-03 (U TOKU — audit ✅ + 5 fixeva)

- **Odobrenje „nastavi dalje"** → implementirano 5 invisible predloga:
  - `4a721c7` **P-B07-1** (klijent je mogao platiti 0,01 KM za članstvo —
    sada cijena iz `membership.annualPrice`, `membership-price.util.ts`) +
    **P-B07-4** (`checkout-validate.util.ts`: provider allowlist, obavezni
    id-evi, http(s) URL → **400** mj. 500; paginacija 1…100);
  - `f5896ee` **P-B07-5** (`payment-origin.util.ts`: allowlist origin-a za
    Monri formu = `CORS_ORIGINS` + `API_PUBLIC_URL`; `process.env` → `ConfigService`);
  - `209336c` **P-B07-3** (**IDOR**: narudžbu sa QR kodovima vidio svaki
    prijavljeni korisnik → sada vlasnik ili `ticketing.manage`, inače 404) +
    **P-B07-7** (atomski claim ulaznice `updateMany` + `count===1`).
  - **17 novih testova** (3 nova speca + IDOR/race u `ticketing.service.spec`).
- **Čeka odluku**: P-B07-2 (idempotencija plaćanja — A `PaymentEvent`
  tabela / B no-op na ACTIVE; Q-14), P-B07-6 (cancel/refund po statusima,
  vidljivo), Q-15 (`Payment` red za članstvo).
- `docs/BACKEND.md` dopunjen sekcijom „Plaćanja / ulaznice (BE-07)".

### SEGMENT BE-07 — audit (2026-11-03)

- Opseg: `membership/` 9 + `ticketing/` 21 + `payments/` 25 + `finance/` 10
  = **65 fajlova, 5.454 LOC, 10 speca, 35 testova**; sva 4 javna webhook-a
  + `mobile-return` provjereni protiv aneksa od 70 javnih ruta ✓.
- **Nalazi: 3 High + 6 Medium + 4 Low/Info + 8 eksplicitnih ✅ provjera**:
  - **B-07-01 (High)** klijent šalje `amount` za članstvo → Stripe/PayPal
    naplate proizvoljan iznos (Monri već koristi `membership.annualPrice`);
  - **B-07-02 (High)** članstvo **nije idempotentno** — `confirm-session` +
    webhook na `ACTIVE` članstvu dodaju +365 dana svaki put (nema
    `Payment` reda za članstvo; ulaznice i sezonske su ispravne);
  - **B-07-03 (High)** **IDOR**: `GET /ticketing/orders/:orderId` ignoriše
    korisnika → curenje tuđih QR kodova (ulaz bez plaćanja);
  - Medium: bez DTO (500 mj. 400), `process.env.API_PUBLIC_URL` u
    `monri.provider`, `monri/form?origin=` bez allowlista, cancel/refund bez
    provjere statusa, članstvo nema `Payment` red (finansije = procjena),
    race na skeniranju ulaznice;
  - ✅ zdravo: Stripe potpis (raw body), PayPal verify API, Monri
    `sha512`+`timingSafeEqual`, `mobile-return` allowlist, QR
    `randomBytes(16)`, serverska cijena ulaznice, limit blagajne/kapacitet.
- **Predlozi P-B07-1…7** + pitanja **Q-14** (online obnova aktivnog
  članstva?) i **Q-15** (`Payment` red za članstvo = šema) — **čekaju
  izričitu riječ korisnika** (segment je novac/QR → bez izmjena koda do
  odobrenja).
- Matrica: 65 redova → BE-07 (`pregledano`/`pokriveno testom`).
- Segment dokument: `AUDIT/segments/BE-07.md`.

### SEGMENT BE-08 — 2026-11-03 (ZATVOREN ✅)

- Opseg: `showcase` 10 + `seo` 9 + `search` 5 + `dashboard` 3 +
  `app-releases` 8 + `health` 2 + `museum` 3 + `hall-of-fame` 3 +
  `club-timeline` 3 + `trophies` 3 + `sponsors` 3 = **52 fajla, 2.744 LOC,
  samo 2 speca (3 testa)**; svih 13 javnih ruta provjereno protiv aneksa (70/70).
- **Nalazi: 3 Medium + 4 Low + 5 Info + 1 ✅ blok**:
  - **B-08-01 (Medium)** mass assignment u 5 CRUD modula (sirovi body →
    `prisma.create/update`, `data as never`; `ids` bez validacije → 500);
  - **B-08-02 (Medium)** APK upload do **200 MB u RAM** (`memoryStorage`);
  - **B-08-03 (Medium)** `GET /seo/share?path=` prihvata apsolutni URL →
    OG meta sa tuđim domenom;
  - Low: `process.env` u `seo/` (3×) + sirovi `UPLOAD_PATH` u app-releases
    (P2 konvencija), sitemap bez XML escape-a, pretraga case-sensitive bez
    `MaxLength`, pokrivenost 2 speca;
  - ✅ zdravo: sve write rute iza `*.manage`/`dashboard.read`, APK traversal
    guard + streaming, sitemap/robots bez tajni, share resolveri samo PUBLISHED.
- **Korisnik odobrio P-B08-1,2,3,4,5,7; P-B08-6 (case-insensitive pretraga +
  `q MaxLength`) NIJE odobren → nije implementiran** (ostaje u backlogu).
- Implementacija (`6a6ca14`, `f4757fa`, `cae229e`, `34d31e4`):
  - **P-B08-2**: novi `common/utils/entity-payload.util.ts`
    (`parseEntityPayload`, `parseIdList`) + allowliste u `sponsors`, `trophies`,
    `museum`, `hall-of-fame`, `club-timeline` → nepoznato/sistemsko polje = 400,
    `ids` validiran (ne-array/duplikati/predugo → 400), `clearFeatured(exceptId)`,
    `sortOrder` se računa iz `aggregate _max` (ne iz bodyja).
  - **P-B08-1**: `seo-url.util` bez `process.env` (API base iz `ConfigService`);
    sirovi `UPLOAD_PATH` ključ → `uploadPath` u seo/app-releases/auth/media/upload/
    newsletter.
  - **P-B08-4**: `/seo/share?path=` prima samo site-relativnu putanju
    (`normalizeSharePath`), apsolutni/protokol-relativni URL → `/`.
  - **P-B08-5**: sitemap XML-escape (`escapeXml`) + `changefreq` po tipu
    (vijesti/galerije `weekly`, statične/arhivske `monthly`); gradnja izdvojena u
    `seo-sitemap.util.ts` + `seo-sitemap-sources.ts` → `seo.service.ts` 225 → 180
    linija i **uklonjen iz file-size baseline-a**.
  - **P-B08-3**: APK upload `memoryStorage` → `diskStorage` (temp) + strim sha256
    + move u `uploads/app-releases/<g>/<m>/`; logika u `apk-storage.util.ts`
    (`app-releases.service.ts` 205 → 175).
  - **P-B08-7**: 4 nova speca, **39 testova** lokalno zeleno (entity-payload 13,
    seo-url 13, seo-sitemap 5, apk-storage 5 + postojeći apk-download 3).
- Matrica: 52 → **64 reda** → BE-08, statusi `popravljeno`/`pokriveno testom`/
  `pregledano` (0 neobrađenih); `check:all` **6/6** lokalno.
- **CI ✅ `41638624709`** (`86b3179`, implementacija) i **✅ `41639125072`**
  (`cc6959b`, docs) — sva 3 joba.
- Segment dokument: `AUDIT/segments/BE-08.md` (**Status segmenta: ZATVOREN**).
- Backlog nakon zatvaranja: **P-B08-6** (pretraga, vidljivo — nije odobreno),
  Info nalazi B-08-08…B-08-11 (prihvaćeni kao stanje).

### SEGMENT BE-09 — 2026-11-03 (U TOKU — BE-09a ✅ ZATVOREN, BE-09b audit ✔ / čeka odobrenje)

- **Zašto**: nakon BE-08 matrica je pokazivala **59 backend fajlova bez segmenta**
  (48 u `backend/src`, 1.948 LOC) — moduli BE-02/BE-04 pregledani su tada samo
  djelimično. BE-09 ih zatvara u dva podsegmenta.
- **BE-09a opseg (29 fajlova)**: `common/` (12), `rbac/` (4), `users/` (4),
  `auth/` (8), `prisma/prisma.module.ts`.
- **BE-09b (sljedeća sesija, 20 fajlova)**: `cms/` (5), `news/` (5),
  `gallery/` (2), `media/` (3), `upload/` (4), `prisma` util.
- **Nalazi BE-09a: 2 Medium + 5 Low + 4 Info + 1 ✅ blok**:
  - **B-09-01 (Medium)** RBAC `updateRolePermissions`/`deleteRole` bez
    transakcije → uloga može ostati **bez ijedne dozvole**;
  - **B-09-02 (Medium)** `UsersService.update` nije atomska, duplikat emaila →
    **500** (treba 409), `roleIds` bez validacije → 500;
  - Low: `POST /upload` (avatar) bez dozvole/kvote (16 MB × 100/min),
    `slugify` mrvi `đ/Đ`, `parseExpiresToMs` tihi default bez gornje granice,
    `sort` u `PaginatedQueryDto` je mrtav API, `PermissionsGuard` fail-open na
    praznu listu + nema audita 403;
  - Info: nema refresh-token reuse detection/cleanup, brisanje avatar fajlova
    prije DB update-a, `syncPermissions` bez batch transakcije, dupli upit za
    dozvole (`getUserPermissions` vs `JwtStrategy`);
  - ✅ zdravo: **0 drifta dozvola** (kod ↔ `PERMISSIONS`), `@Throttle(10/60s)`
    na login/refresh, DB provjera `isActive/deletedAt` na svakom zahtjevu,
    login ne odaje email, Administrator/sistemske role zaštićene, traversal
    guard za avatar, `limit` clamp 100.
- **Korisnik odobrio P-B09-1,2,5,7,8; P-B09-3/4/6 (upload kvota, slugify đ,
  sort) NISU odobreni** → nisu implementirani, ostaju u backlogu.
- Implementacija (`2cd99c4`, `b26a919`, `74bc781`, `bd391c3`, `8cf7aa9`):
  - **P-B09-5**: `parseExpiresToMs` baca grešku na neispravan format/nulu/>90d;
    `JWT_REFRESH_EXPIRES` se validira i na bootu (`env.validate`).
  - **P-B09-7**: `PermissionsGuard` fail-closed na praznu listu dozvola + svaki
    403 upisuje `authz.denied` (actorId, metoda+put, IP, tražene dozvole).
  - **P-B09-1**: `updateRolePermissions`/`deleteRole` u `$transaction`;
    `createRole` 409 na duplikat imena + trim.
  - **P-B09-2**: `users.update` transakcija (role + update), 409 zauzet email,
    400 nepoznata uloga; `users.service` 209 → 198 linija.
  - **P-B09-8**: **54 testa** u 5 novih spec fajlova (+ `users-service.mock.ts`),
    uključujući regresiju drifta dozvola (kod ↔ `PERMISSIONS`).
  - Follow-up (`b9d3bdf`, `fd41c42`, `d1d261d`): `AuditService` u guard-u je
    `@Optional()` (controller specovi bez AuditModule-a), tipizirani mock-ovi
    (eslint unsafe-*), precizan soft-delete matcher — CI zelen.
- Matrica: **29 redova → BE-09** (status `pregledano`); ostalo bez segmenta:
  **20 fajlova** (BE-09b).
- **BE-09a zatvoren** (`2ab4675`, CI ✅ `41651332872`): P-B09-1/2/5/7/8
  implementirano, P-B09-3/4/6 u backlogu, Info B-09-08…11 evidentirani.
- **BE-09b audit ZAVRŠEN** (20 fajlova, 961 LOC) — **12 nalaza
  (5 Medium + 7 Low) + 4 Info**:
  - **Medium:** `gallery.update` mass assignment → zaobilazi `gallery.approve`
    (B-09b-01); `cms-menus.saveItems` bez transakcije + `parentId` bez provjere
    ciklusa/vlasništva (B-09b-02); `cms-pages.reorderSections` mijenja sekcije
    **tuđe** stranice (B-09b-03); `NewsPublishScheduler.tick()` bez try/catch,
    bez overlap guarda, update bez uslovnog statusa (B-09b-04); tagovi/relacije
    vijesti van transakcije (B-09b-05);
  - **Low:** 403 umjesto 400 za widget validaciju + tiho `{}` (B-09b-06),
    kategorije vijesti `P2002` → 500 (B-09b-07), komentari bez DTO validacije
    (B-09b-08), galerija 500 umjesto 404 + fotka bez provjere vlasništva
    (B-09b-09), orphan original kod rendicija (B-09b-10), `isImageMime`
    substring heuristika + mrtva grana (B-09b-11), `deleteStoredFiles` guta
    greške + bez traversal guarda (B-09b-12);
  - Info: `custom-html`/`rich-text` bez sanitizacije → **stored XSS**
    (B-09b-13, predmet FE segmenta), `removeSection` bez `refreshAutoSeoDesc`
    (B-09b-14), `uniqueSlug` race (B-09b-15), ✅ zdravo (B-09b-16).
  - **Predlozi P-B09b-1…13** — preporuka: odobriti 1,2,3,4,5,10,11,12,13
    (bez vidljive promjene) + 6,7,8,9 (samo statusni kodovi 500→400/404/409).
- Matrica: **20 redova → BE-09** (BE-09b), status `pregledano`; 0 neobrađenih
  u `backend/src`; bez segmenta ostaje **49 fajlova** (`prisma/seed`,
  migracije, `backend/test/**` e2e, `Dockerfile`, `prisma.config.ts`) —
  predlog **BE-09c**.
### BE-09c — audit (2026-11-03)

- **Opseg:** 37 fajlova / 3.338 LOC — `prisma/` (schema je u BE-07, init migracija
  1.370 linija, `seed.ts` + `seed/rbac.ts` + `seed/settings-admin.ts` + 11
  `seed/demo/**`), `backend/Dockerfile`, `prisma.config.ts`, 8 e2e specova +
  `setup-e2e-env.ts`, 8 infra skripti (`scripts/`).
- **12 nalaza (6 Medium + 6 Low) + 2 Info bloka:**
  - Medium: seed postavlja admin lozinku na `change-me` i **resetuje je na svakom
    pokretanju** (B-09c-01); `DATABASE_URL` ide kao **build arg** i ostaje u
    slojevima Docker slike (B-09c-02); runner slika nosi **devDependencies**
    (B-09c-03); **e2e testovi se ne izvršavaju u CI** + neusklađene default
    lozinke (B-09c-04); `seed/rbac.ts` bez transakcije i tiho odbacuje nepoznate
    dozvole (B-09c-05); QA skripte defaultno gađaju **produkciju** i mijenjaju
    live utakmicu (B-09c-06);
  - Low: **14 FK kolona bez indeksa** (B-09c-07, traži schema izmjenu), seed
    uvijek puni demo sadržaj (B-09c-08), demo seed sitnice (B-09c-09),
    `git.sh` = `git add .` + push (B-09c-10), `Match.round` vs `roundId` (B-09c-11),
    tihi `|| true` u `setup-upload-dir.sh` (B-09c-12);
  - ✅ zdravo: seedovi idempotentni, CMS seed konfiguracije prolaze novu
    validaciju, schema ↔ migracija **bez drifta**, sve e2e rute postoje,
    `.dockerignore` korektan, kontejner non-root + `HEALTHCHECK`.
- **Matrica:** 37 redova → `BE-09`, status `pregledano`; **0 fajlova bez
  segmenta izvan `frontend/` i `mobile/`**.

### BE-09b — implementacija i zatvaranje (2026-11-03)

- **Korisnik odobrio SVE P-B09b-1…13** („Po preporuci možeš postupiti i po
  pitanju ovih blokatora, i nastaviti dalje").
- Implementirano: gallery allowlist + 404/400 (P-B09b-1/9), menus
  `$transaction` + validacija `parentId` (2), reorder scoping (3), scheduler
  overlap/try-catch/uslovni update (4), news transakcija sa tagovima i
  relacijama (5), widget 400 + pravila po tipu (6), kategorije 409 (7),
  `CommentCreateDto` (8), rendition čišćenje + 400 (10), MIME allowlist (11),
  `deleteStoredFiles` traversal + log (12), **78 novih testova** (13).
- Refaktor: `cms-pages.service.ts` 211 → **188 linija** (auto-SEO u
  `cms/cms-auto-seo.util.ts`).
- Matrica: **30 redova ažurirano** (`popravljeno`/`pokriveno testom`),
  **14 novih fajlova** dodano.
- **Vidljive promjene (odobrene):** 403→400 za neispravnu widget konfiguraciju,
  500→409 za duplikat sluga kategorije, 500→400/404 za galeriju i komentare,
  `PATCH /gallery/:id` ignoriše `status`/`slug`.
- **CI ✅ `41654943345`** (`212ec80`) — 3/3 joba; prvi run `41654422296` pao na
  3 eslint greške (popravljeno istog dana).
- **BE-09b ✅ ZATVOREN** — 12/12 nalaza popravljeno, 0 preostalih predloga.
- Segment dokument: `AUDIT/segments/BE-09.md`.

## Šta je sljedeće (tačan sljedeći korak)

1. **Pushati i provjeriti stvarni CI za odobrene, lokalno testirane P-FE06-14/15**, zatim nastaviti stvarno povećanje coveragea.
   Potpuni modalni popravci **P-FE06-10/11** potvrđeni su u CI-ju.
   **P-FE06-12 / B-FE06-11** je odobren, implementiran i potvrđen u CI-ju.
   P7 budget, stabilizacija full-stack smoke reloada i P8 route-level lazy
   potvrđeni u CI-ju; P9 baseline/ratchet potvrđen u CI-ju. Test coverage ≥50%
   ostaje nedostignut i B-FE06-02 ostaje otvoren; nastaviti dodavati stvarne
   testove i podizati pragove bez smanjenja obuhvata. Manji logični commitovi; nakon svakog pusha
   sačekati stvarni CI i evidentirati ID. FE-06 ostaje otvoren do provjere svih
   kriterija i High nalaza.
2. Zatim nastaviti backend/frontend backlog **P-B08-6**, P-B06-1/2, P-B02-1/2/3,
   P-B03-1, B-07-10…13, **P-CI04-1** te shared `lib/`/`hooks/`; coverage
   povećavati prema ≥50% i dodatno proširiti browser tokove. Ne predstavljati
   FE-06 početni browser suite kao cijeli E2E-01.
3. **Mobile (MOB-01…04) odgođen** dok backend i frontend nisu maksimalno dorađeni.
   Završni cross-klijentski E2E-01 tek nakon odobrenog mobile rada.

## Otvorena pitanja za korisnika (BLOKATORI)

- **Q-FE06-14** ✔ Korisnik odobrio preporučeni potpuni popravak povrata plaćanja.
- **Q-FE06-15** ✔ Korisnik odobrio uključivanje inicijala u dostupno ime javnog korisničkog menija.

- **Q-01** root README: zadržati (ažuriran) ili penzionisati?
- **Q-02** `.cursor/plans/**` penzionisati? (preporuka: DA; matrice/`rules` ostaju)
- **Q-03** mobile smoke checkliste: žive? (odgođeno zajedno s mobile radom)
- **Q-04** ✔ ODGOVORENO (D-004): **nije stvarna lozinka** → bez rotacije/rewrite; čišćenje `.env.example` **Sprovedeno u INF-02** ✔
- **Q-05** ✔ ODGOVORENO (D-005): **Coolify; Traefik ne postoji** → `docker-compose1.yaml` penzionisan (INF-01)
- **Q-06** ✔ ODGOVORENO (KAPIJA 2): CI-01 prvi; raniji pushovi bez CI-a evidentirani.
- **Q-07** korisnik je potvrdio da su dotadašnje migracije primijenjene prije BE-09d; novi BE-09d redeploy/migracije nismo nezavisno provjerili na produkciji.
- **Q-08** tačan runtime host u `DATABASE_URL` za verify-full (interno ime vs javni)?
- **Q-09** ✔ ODGOVORENO (KAPIJA 2): alati iz §4 odobreni (instalacija ide u FE/MOB segmente).
- **Q-10** ✔ ODGOVORENO u principu (KAPIJA 2); detalji (pristup/backup) potvrđuju se kad segment zatreba (INF/BE).
- **Q-11** ✔ ODGOVORENO (D-006/„Odobravam preporuke"): **(a)** — throttler 100/60s + auth 10/60s + trust proxy
- **Q-12** ✔ ODGOVORENO (D-006): **(a)** — audit javnih ruta u BE-01 (71), globalni APP_GUARD u **BE-02** s testovima
- **Q-13** ✔ ODGOVORENO (D-006): **DA** — P2002→409, P2025→404, P2006→400 (implementirano + testovi)
- **Q-14** ✔ riješeno odabirom P-B07-2 (A): online obnova ostaje; vidi BE-07.
- **Q-15** ✔ korisnik odobrio i implementirano: `Payment` red za članstvo; vidi D-007 / BE-07.
