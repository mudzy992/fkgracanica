# Web browser testovi

`mock-desktop` i `mock-mobile` koriste Playwright i axe nad produkcijskim web
buildom i **izolovanim, determinističkim API mockom**. Ovo nisu full-stack E2E
provjere i mobilni viewport je web, ne zasebna mobilna aplikacija.

```sh
npm ci
cd frontend
npx playwright install --with-deps chromium
npm run build:browser
npm run test:browser:mock
```

`build:browser` zadaje relativni `/api/v1`; testni server sluša lokalni port i
proxy dopušta samo `http://127.0.0.1` backend. Mock fixture blokira sve vanjske
HTTP i WebSocket zahtjeve, u pravilu blokira service worker, prijavljuje
neočekivan API poziv i `pageerror`. Jedan namjenski izolovani test ga uključuje
i provjerava oporavak starog 404 za chunk. Podaci/nalozi su isključivo lažni i test ne izvršava
plaćanja. Nije potrebna produkcijska konfiguracija, baza, tajne ili mreža.

Axe provjerava WCAG 2.0/2.1/2.2 A/AA tagove bez isključenih pravila; CI pada na
`critical` ili `serious` u testiranim DOM stanjima. Pozitivni test namjerno doda
sliku bez `alt` i potvrđuje da gate zaista nalazi problem. Ovaj ograničeni skup
nije WCAG certifikat niti pokriva sve stranice i podatke. Trace i screenshot se
čuvaju samo na padu u `test-results/`; CI ih čuva 7 dana kao testne artefakte.

## Modalne regresije

Desktop mock testovi provjeravaju stvarni browser top-layer i izolaciju pozadine
za samostalne notifikacije, ugniježđene dijaloge i komandnu paletu; Tab, Escape,
povrat fokusa i scroll, Ctrl/⌘K, pretragu i navigaciju. Provjeravaju i zaštitu
nespremljene forme te `preventClose` u kategorijama vijesti. Nema izvršenog
plaćanja ili izmjene stvarnih podataka. Ovo su reprezentativni tokovi, ne dokaz
svakog pojedinačnog dijaloga u aplikaciji.

## Nespremljene admin forme

Mock browser testovi obuhvataju odbijanje/prihvatanje odlaska kroz komandnu
paletu, browser Back/Forward i reload, te čistu formu i uspješan mock save.
Unit testovi dodatno pokrivaju više otvorenih formi i eksplicitni `dirty`.

## Postepeni lazy routeovi

Manifest i browser mock testovi provjeravaju osam odgođenih admin modula,
direktni URL i internu navigaciju, auth/module/permission guardove, status
učitavanja u desktop i uskom webu, grešku chunka i ručni reload. CMS i rich-text
urednik se otvaraju i testno mijenjaju; test potvrđuje da dirty forma blokira
učitavanje ciljane rute. Odobrene mutacije su samo izolovani mock pozivi.
Service worker se u zasebnom testu stvarno aktivira i dobija namjerno zastarjeli
404 iz lokalnog testnog cachea; nema pristupa produkcijskom cacheu.

## Stvarni full-stack browser smoke

CI job `browser-fullstack` podiže **vlastiti** prazni Postgres 16 i Redis 7,
migrira bazu `fk_browser_test`, učitava namjenski sintetički RBAC/admin/CMS
seed, pokreće stvarni backend i čeka da `/api/v1/health` vrati `status: ok`.
Redis se posebno provjerava s `PING`. Produkcijski web build komunicira preko
relativnog `/api/v1` i loopback testnog proxyja: nema mock API-ja u ovom testu.

Playwright provjerava javnu naslovnu iz baze, redirect gosta, neuspjelu i
uspjelu test prijavu, dovršen admin API, reload sesije i odjavu. Browser blokira vanjske
HTTP/WebSocket veze i sve API mutacije osim prijave/odjave/refresh i anonimne
testne posjete, kao i sve `/payments` pozive. Ovo je jedan smoke tok, ne dokaz
svih integracija, zasebne mobile aplikacije ili produkcijskog deploya.

Nalog `browser-smoke@example.test` i lozinka/JWT se generišu za svaki job,
maskiraju u CI logovima i važe samo u privremenoj bazi/procesu. Trace/screenshot
se spremaju samo na padu, najviše tri dana; mogu sadržavati te **isključivo
privremene testne** podatke i testne tokene. Backend nema produkcijske
pristupne podatke niti se plaćanja ili slanje pošte pokreću.

Za lokalnu probu koristiti samo izdvojene, prazne Postgres/Redis instance;
seed dodatno odbija sve osim `NODE_ENV=test`, baze
`postgresql://postgres@127.0.0.1:5432/fk_browser_test?schema=public` i naloga
`@example.test`. Postaviti privremene `ADMIN_PASSWORD`, `JWT_ACCESS_SECRET` i
`JWT_REFRESH_SECRET`, zatim generisati Prisma klijent, pokrenuti migracije i
`npx ts-node prisma/seed/browser-smoke.ts` iz `backend/`, build oba workspacea,
pokrenuti backend i `node frontend/e2e/support/wait-for-backend.mjs`, pa
`npm run test:browser:fullstack -w frontend`. Nikad ne koristiti produkcijsku
bazu ili stvarne kredencijale.
