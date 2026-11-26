# Vodič za implementaciju — šta svaki paket MORA da sadrži

> Verzija: `2026-11-26` · Baseline: `9295dae` · `2495/2495` · `check:all 10/10`
> Pravilo: **nema merge-a bez zelene kućice na svih 6 CI jobova + ovog vodiča**.

---

## 1. Obavezna struktura svakog paketa (S veličina: 1 rola = 1 PR)

Svaki `P-*` paket je **jedan branch `arena/<id>` + jedan PR**. Veličina: `≈ 80-150 LOC` produkcije + `≈ 100-200 LOC` testova. Nema XL PR-ova.

### 1.1 Branch i commit konvencija

```bash
git checkout -b arena/P-DASH-02-writer-studio  # iz main
# rad
git commit -m "feat(admin): P-DASH-02 writer studio — autosave + version history (premium)"
# Conventional Commits: feat|fix|chore|docs|refactor(scope): opis
```

**Commit mora sadržavati:**
- `feat`/`fix` sa scope (`admin`, `public`, `mobile`, `ui`, `next`)
- `P-XXX` id u poruci
- `Co-authored-by` ako je pair

### 1.2 Fajlovi koje PR mora sadržavati

| Obavezno | Primjer | Zašto |
|----------|---------|-------|
| **Produkcijski kod** | `WriterHome.tsx` premium | — |
| **Testovi** | `fe06-writer-home.test.tsx` + `fe06-writer-home-variants.test.tsx` | `vitest` 5353 → 5360+, `axe` ako je UI |
| **Matrica** | `AUDIT/COVERAGE_MATRIX.csv` — novi red `pokriveno testom` | `check-coverage` R1 |
| **Segment doc** | `AUDIT/segments/P-DASH-02.md` (vidi §4) | `Status: ZATVOREN` marker |
| **Docs** | `docs/FRONTEND.md` ili `docs/MOBILE.md` dopuna | `docs-links` gate |
| **Preview** | PR opis sa `next-preview` linkom + screenshot diff | ručni QA |

**Zabranjeno u paketu:**
- Miješanje `backend` + `frontend` + `mobile` u istom PR-u (osim P-NEXT-01 setup)
- Hardkodirane boje/razmaci van `index.css` tokena (`token-check` puca)
- `console.log` u `src` (`console-ban` puca)
- Tajne u kodu (`secrets-ban` puca)
- Novi `package.json` dep bez obrazloženja u PR opisu (pravilo 7)

---

## 2. Checklista prije push-a (lokalno, mora biti zeleno)

Pokreni u rootu:

```bash
node scripts/audit/inventory.mjs          # mora reći 2495+X / 2495+X i 0 nepregledano
node scripts/audit/check-coverage.mjs     # mora reći OK
node scripts/standards/check-all.mjs      # mora reći 10/10 OK
npm run test -w frontend -- --run         # mora biti zelen (trenutno 5353)
npm run test -w mobile -- --run           # mora biti zelen (3375)
npm run build -w frontend                 # mora proći (vite)
npm run build -w frontend-next            # mora proći (next, od P-NEXT-01)
npx prisma validate                       # mora biti zelen (ako dira backend)
```

Ako bilo šta puca — **ne pushaj**.

### 2.1 Dodatno za public rute (P-NEXT-02*)

```bash
npm run test:e2e -w frontend              # playwright
npx playwright test --grep "home|vesti" --reporter=html
# screenshot diff
npx percy exec -- playwright test
# lighthouse
npx lighthouse http://localhost:4173 --only-categories=performance,accessibility --view
```

### 2.2 Dodatno za dashboard (P-DASH-*)

```bash
# axe na novom dashboardu
npm run test:axe -w frontend              # browser mock + axe
# RBAC
npm run test -- rbac                      # permission guard
```

---

## 3. CI — šta mora biti zeleno na PR-u

Na `arena/<id>` branchu, workflow `CI` pokreće 6 jobova:

| Job | Šta radi | Gate |
|-----|----------|------|
| `audit-gate (coverage matrix)` | `node scripts/audit/check-coverage.mjs` | mora biti `success` |
| `standards (check:all)` | `node scripts/standards/check-all.mjs` (10 provjera) | `success` |
| `build + test (backend, frontend)` | `prisma generate` + `nest build` + `tsc -b + vite build` + `vitest` | `success` |
| `browser smoke` | full-stack smoke (postgres+redis) | `success` |
| `browser mock + axe (web)` | `axe` 0 critical/serious | `success` |
| `e2e (postgres + redis)` | `playwright` | `success` |

**Ako je jedan crven:** `gh run rerun --failed` (flaky `aria-pressed` je poznat, do 2 reruna dozvoljeno). Ako je 3x crven — fix lokalno, ne force-aj.

**Preview linkovi:** `https://{port}-{sandbox}.e2b.app` za `frontend` + `next-preview` (nakon P-NEXT-01).

---

## 4. Segment dokument — šta mora sadržavati

Svaki paket kreira `AUDIT/segments/P-XXX.md` po šablonu FAZA 4:

```md
# Segment P-DASH-02 — Writer Studio (premium)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-12-01, zatvoren 2026-12-03) |
| **Paket** | P-DASH-02 |
| **Rola** | Writer |
| **Fajlovi** | WriterHome.tsx, NewsEditorPage.tsx, ... (6 mijenja, 4 dodaje) |
| **Rizik** | Medium |
| **CI** | 4590xxxx success 6/6 |

## 1. Opseg
...

## 2. Izmjene
- commit `abc123` — ...

## 3. Testovi
- `fe06-writer-home.test.tsx` 17→30 testova
- `playwright` writer flow

## 4. Verifikacija
- `check:all 10/10`, `axe 0`, `playwright` zelen
- screenshot diff 0%

## 5. Rollback
- flag `writerPremium=false` ili `git revert abc123`
```

Bez `Status segmenta: ZATVOREN` na kraju — `check-coverage` neće pustiti `main`.

---

## 5. Kako izvesti paket — korak po korak (copy-paste)

```bash
# 1. Novi branch iz main (ne iz starog arena branch-a!)
git fetch origin
git checkout -b arena/P-DASH-02-writer-studio origin/main

# 2. Rad — mijenjaš samo fajlove iz INVENTORY_PLAN.md za taj paket
#    npr. WriterHome.tsx, NewsEditorPage.tsx

# 3. Testovi — dodaješ/širiš test fajlove
#    npr. frontend/src/pages/admin/homes/fe06-writer-home.test.tsx

# 4. Inventar + matrica
node scripts/audit/inventory.mjs
# ručno uredi AUDIT/COVERAGE_MATRIX.csv: novi redovi → pokriveno testom / P-DASH-02 / 2026-12-03

# 5. Lokalna verifikacija (vidi §2)
node scripts/standards/check-all.mjs
npm run test -w frontend -- --run
npm run build -w frontend

# 6. Commit + push
git add .
git commit -m "feat(admin): P-DASH-02 writer studio — autosave + version history"
git push origin arena/P-DASH-02-writer-studio

# 7. PR — opis mora sadržavati:
#    - Šta se mijenja (lista fajlova)
#    - Zašto (link na TRANSITION_PLAN.md §)
#    - Kako testirati (koraci za QA)
#    - Screenshot prije/poslije
#    - Rizik i rollback

# 8. Poll CI
gh pr create --fill
gh pr checks --watch  # čekaj 6/6

# 9. Merge (samo kad je 6/6 zelen)
gh pr merge --merge --delete-branch
```

---

## 6. Šta ako nešto pođe po zlu

| Problem | Akcija |
|---------|--------|
| `check-coverage` puca (fajl nije u matrici) | `node scripts/audit/inventory.mjs` + popuni red |
| `token-check` puca (hardkodirana boja) | Zamijeni sa tokenom iz `index.css` |
| `CI` flaky `aria-pressed` | `gh run rerun --failed` (max 2x) |
| `next build` puca na Turbopack | `next build --no-turbo` fallback, prijavi bug u `docs/DECISIONS.md` |
| `playwright` screenshot diff >1% | Ručni QA, odobri ako je namjerno (novi dizajn), inače fix |
| Treba revert | `git revert <sha>` ili `flag=false` u `Settings` tabeli |

---

## 7. Definition of Done za paket

- [ ] Kod + testovi + matrica + segment doc + docs dopuna pushani
- [ ] `check:all 10/10` i `check-coverage OK` lokalno
- [ ] CI 6/6 zelen (link u PR-u)
- [ ] `playwright`/`axe`/`mobile` parity zelen (ako paket dira public/dashboard/mobile)
- [ ] PR odobren (1 reviewer)
- [ ] `Status segmenta: ZATVOREN` u `AUDIT/segments/P-XXX.md`
- [ ] Izvještaj popunjen po `REPORT_TEMPLATE.md` i dodat u `AUDIT/reports/P-XXX.md`
- [ ] `AUDIT/STATE.md` ažuriran (novi head, broj fajlova)

---

*Sljedeći dokument `REPORT_TEMPLATE.md` je copy-paste šablon za završni izvještaj svakog paketa.*
