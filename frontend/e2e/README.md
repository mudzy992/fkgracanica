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
HTTP i WebSocket zahtjeve, blokira service worker, prijavljuje neočekivan API
poziv i `pageerror`. Podaci/nalozi su isključivo lažni i test ne izvršava
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
