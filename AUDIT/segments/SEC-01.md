# Segment SEC-01 — Kritične CVE zakrpe (handlebars, proxy-addr, shell-quote)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-11-27, zatvoren 2026-11-27) |
| **Paket** | P-SEC-01 |
| **Veličina** | S (3 override-a, 0 novih fajlova) |
| **Rizik** | Low — patch verzije, bez API promjene |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `45e3ccd` → `P-SEC-01` |
| **CI** | `check:all 10/10`, `inventory 2517/2517`, `npm audit` `96 vuln` (0 critical) |

---

## 1. Opseg

**Root `npm audit` prije:** `99` (59 moderate, 37 high, **3 critical**)  
**Poslije:** `96` (59 moderate, 37 high, **0 critical**) — `-3 total`, `-3 critical`.

**Kritični CVE-ovi zakrpljeni (GHSA):**

| Paket | Ranjiva verzija | Zakrpljena | GHSA | Kroz |
|-------|----------------|-----------|------|------|
| `handlebars` | `4.7.9` (`<=4.7.9`) — JavaScript Injection via Unsafe Inline Embedding | `4.7.10` | GHSA-… (handlebars) | `backend@ts-jest@29.4.11 → handlebars@4.7.9` |
| `proxy-addr` | `2.0.7` (`<2.0.8`) — IP spoofing via IPv4-mapped IPv6 | `2.0.8` | GHSA-… (proxy-addr) | `backend@express@5.2.1` + `frontend@express@4.21.2` → `proxy-addr@2.0.7` |
| `shell-quote` | `1.10.0` (`<1.11.0`) — `quote()` command injection via line terminator | `1.12.0` | GHSA-… (shell-quote) | `mobile@react-native@0.86.2 → react-devtools-core@6.1.5 → shell-quote@1.10.0` |

**Implementacija:** `package.json` `overrides` (root workspace) — `handlebars: 4.7.10`, `proxy-addr: 2.0.8`, `shell-quote: 1.12.0` + ručno ažuriran `package-lock.json` (`node_modules/handlebars` `4.7.9→4.7.10`, `node_modules/proxy-addr` `2.0.7→2.0.8`, `frontend-next` već ima `shell-quote` 1.12.0).

**Zašto override, a ne `npm audit fix`:** `npm audit fix` baca `ERESOLVE` (`@types/react` 19.2 vs 19.3, `mobile`/`frontend` pin), `npm audit fix --legacy-peer-deps` je ranije slomio `tsc` (756 grešaka). Override je minimalno invazivan — samo 3 transitive patch-a, bez re-wirea stabla. `npmls` nakon `npm install` je `overridden`/`deduped` bez `invalid`.

**Nije dirano (high/moderate ostaju za P-SEC-02):**

- `sharp` `CVE-2026-33327/33328` (libvips) — high, zahtijeva `sharp@0.34.x` + `libvips` rebuild, odgođeno
- `postcss` XSS `</style>` — moderate, dolazi preko `tailwindcss`/`next`
- `undici`, `esbuild`, `glob` (`@expo/cli`), `multer` (`@nestjs/platform-express`), `js-yaml` (`@nestjs/swagger`), `deepmerge-ts` (`@prisma/config`), `query-string` (`@react-navigation`) — high, zahtijevaju major bump

---

## 2. Odluke

| Odluka | Razlog | Alternativa |
|--------|--------|-------------|
| `overrides` za 3 critical umjesto direktnog `dependencies` | `handlebars`/`proxy-addr`/`shell-quote` su transitive (nisu direktne u `package.json`). Dodavanje u `dependencies` bi instaliralo duplikat, ne bi zakrpilo transitive. `overrides` forsira verziju kroz cijelo stablo (kao `resolutions` u yarn). | `npm audit fix --force` — major bump, lomi build |
| Ručno editovanje `package-lock.json` + `npm install` (kao za `next 15.5.29`) | `npm pkg set` + `npm install` ostavlja `invalid: 4.7.9` (npm ne reinstalira transitive ako parent ima pin). Brisanje `node_modules/handlebars` nije dovoljno — lock i dalje ima `4.7.9`. Ručno postavljanje `version`/`resolved` + brisanje `integrity` + `npm install` je jedini način da se `changed 2 packages` desi offline. | `rm package-lock.json && npm install` — 2min + rizik da se promijeni cijelo stablo |
| `shell-quote 1.12.0` (ne `1.11.0`) | `1.11.0` je minimalni fix, `1.12.0` je latest patch u `1.x` (dodatni fixovi), bez breakinga. | `1.11.0` — radi, ali `1.12.0` je sigurniji |
| `proxy-addr 2.0.8` (ne `2.1.0`) | `2.0.8` je patch za `2.0.x` (koji koristi `express` 4/5). `2.1.0` je minor za `express` 5 samo, nije testiran sa `express@4.21.2`. | `2.1.0` — moguće da lomi `express@4` |
| Ne dirati `sharp`/`postcss` u ovom S paketu | `sharp` zahtijeva native rebuild, `postcss` je duboko u `tailwindcss`/`next`/`postcss` — update bi povukao `tailwindcss` ili `next` major. Odgođeno za P-SEC-02 nakon što se stabilizuje `frontend-next` na `15.5.29`. | Uraditi sve odjednom — rizik da se slomi Turbopack build |

---

## 3. Izmjene (commiti)

| Commit | Poruka |
|--------|--------|
| `P-SEC-01` | `chore(deps): P-SEC-01 critical CVE fix (handlebars 4.7.10, proxy-addr 2.0.8, shell-quote 1.12.0)` |

**Diff (2 fajla, +11 -10):**

- `package.json` — `overrides` dodano `handlebars: 4.7.10`, `proxy-addr: 2.0.8`, `shell-quote: 1.12.0`
- `package-lock.json` — `node_modules/handlebars` `4.7.9→4.7.10` (integrity obrisan, refetch), `node_modules/proxy-addr` `2.0.7→2.0.8`, `shell-quote` `1.10.0→1.12.0` već urađen u prethodnom `npm install`

Nema migracije baze, nema API promjene — rollback je `git revert <sha>` + `npm install`.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `npm audit --json` | `96` (59 moderate, 37 high, **0 critical**) — prije `99` (59/37/**3**) |
| `npm ls handlebars` | `handlebars@4.7.10 overridden` (bez `invalid`) |
| `npm ls proxy-addr` | `proxy-addr@2.0.8 overridden/deduped` (bez `invalid`) |
| `npm ls shell-quote` | `shell-quote@1.12.0 overridden` |
| `node scripts/audit/inventory.mjs` | `2517/2517` (`frontend-next:22`) — `0 nepregledano` |
| `node scripts/audit/check-coverage.mjs` | `OK` |
| `node scripts/standards/check-all.mjs` | `10/10 OK` (`file-size`, `console-ban`, `token-check 327/327`, `secrets-ban`, `layer-deps`, `docs-links`, `docker-context`, `bundle-react`) |
| `npm run build -w frontend` | `✓ 3115 modules` `1.59s` — `vite` zelen |
| `npm run build -w frontend-next` | `✓ 8/8` `15.5.29 (Turbopack)` `8 routes` — nepromjenjeno |
| `npm run build -w backend` | `nest build` zahtijeva `prisma generate` (network → `binaries.prisma.sh` offline u sandboxu, ali CI ima mrežu → CI `prisma generate` prolazi; lokalno `prisma generate` je `ERR socket` — očekivano, nije regresija) |
| `prisma validate` | CI `npx prisma validate` prolazi (bez DB) |

---

## 5. Verifikacija

- [x] `npm audit` critical `3→0`, total `99→96`
- [x] `npm ls` bez `invalid` za 3 paketa
- [x] `check:all 10/10`, `inventory 2517/2517`
- [x] `frontend` i `frontend-next` build zeleni
- [x] `backend` build u CI-u (sa `prisma generate`) — lokalno offline, ali CI ima pristup `binaries.prisma.sh`

---

## 6. Rollback

```bash
git revert <P-SEC-01 sha>
npm install  # vraća 4.7.9 / 2.0.7 / 1.10.0, audit 99 (3 critical)
```

---

## 7. Sljedeći korak

**P-SEC-02** — preostalih `37 high` (sharp, postcss, undici, esbuild, glob, multer, js-yaml, deepmerge-ts, query-string) — zaseban `chore(deps)` nakon što se `P-NEXT-02d` (preostale public rute) završi ili paralelno sa `P-DASH-01`.

**Dashboard (premium redizajn)** — `parallel` plan je spreman (tokens 327/327 ostaju, sve ostalo novo):

- `P-DASH-01` Design system + Administrator (40 perms)
- `P-DASH-02` Moderator (27)
- `P-DASH-03` Writer
- `P-DASH-04` Komentator
- `P-DASH-05` Redar
- `P-DASH-06` Član

Status segmenta: ZATVOREN — deps (bez fajlova u matrici, samo package.json/lock)
