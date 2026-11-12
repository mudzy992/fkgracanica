⚠️ PENZIONISANO (retired) – NIJE RELEVANTNO za implementaciju. Služi samo kao historijska referenca. Datum penzionisanja: 2026-11-02.

# Migracija: MySQL → PostgreSQL

Status: **kod je pripremljen i prebačen na Postgres kao primarnu bazu.**
MySQL konfiguracija je sačuvana kao backup (vidi `backend/prisma-mysql-backup/`).
Migracija samih podataka (dump/restore) radi se ručno (van ovog dokumenta) —
ovdje su koraci za sve ostalo: kod, deploy, verifikaciju i rollback.

---

## 0. Šta je već urađeno u kodu (ne treba ponavljati)

- `backend/prisma/schema.prisma` — `datasource.provider` promijenjen sa
  `mysql` na `postgresql`. Jedina stvarna nekompatibilnost bila su dva
  `@db.LongText` polja (`News.content`, `HallOfFameEntry.bio`) — Postgres
  nema taj tip, zamijenjena sa `@db.Text` (ekvivalentan neograničen tekst
  tip u Postgresu). Svi ostali `@db.*` tipovi u šemi (`Text`, `VarChar(n)`,
  `Decimal(p,s)`, `Date`) su validni na oba providera bez izmjena.
- `backend/src/prisma/prisma.service.ts` i
  `backend/prisma/seed/prisma-client.ts` — projekat koristi Prisma 7
  **driver adapters** (ne samo `provider` string u schema.prisma), pa je
  bilo neophodno zamijeniti `@prisma/adapter-mariadb` (`PrismaMariaDb`)
  sa `@prisma/adapter-pg` (`PrismaPg`) direktno u kodu. Da je ovo
  preskočeno, aplikacija bi i dalje pokušavala da se spoji MariaDB
  protokolom na Postgres port i pucala bi odmah na startu.
- `backend/package.json` — uklonjeni `mariadb` i `@prisma/adapter-mariadb`
  iz aktivnih zavisnosti, dodani `pg`, `@prisma/adapter-pg`, `@types/pg`.
- `backend/prisma/migrations/` — ispražnjen (stare MySQL migracije nisu
  validan SQL za Postgres). Sadrži samo `migration_lock.toml` (provider =
  postgresql) i `README.md` sa uputstvom za korak 3 ispod.
- `backend/prisma-mysql-backup/` — kompletna originalna MySQL postavka
  (schema, 29 migracija, adapter kod, `package.json`) sačuvana za
  referencu/rollback. Vidi `README.md` unutra.
- `docker-compose.yml` — `backend` servis eksplicitno prepisuje
  `DATABASE_URL` na `postgresql://...@postgres:5432/...` (host = naziv
  servisa `postgres` na Docker mreži `web`), nezavisno od vrijednosti u
  `.env` (koja ostaje sa javnim `sql.ba101.top` hostom, za CLI/migracije
  van kontejnera).
- `backend/Dockerfile` — `ARG DATABASE_URL` default promijenjen na
  Postgres format (koristi se samo za `prisma generate` u build fazi, ne
  treba stvarnu konekciju).
- `.env.example` i `README.md` — ažurirani.

Pregled koda (grep kroz `backend/src`) nije pronašao nikakav MySQL-
specifičan raw SQL (`MATCH...AGAINST`, `GROUP_CONCAT`, `ON DUPLICATE KEY`,
`AUTO_INCREMENT`, itd.) niti `$queryRawUnsafe`/`$executeRawUnsafe` pozive.
Jedino mjesto sa raw SQL-om je `health.controller.ts` (`SELECT 1`), što
radi identično na oba sistema. Znači: **nema skrivenih konflikata u
poslovnoj logici** — cijela promjena je na nivou konfiguracije/adaptera.

---

## 1. Regeneriši lockfile (OBAVEZNO prije build-a)

`package-lock.json` (root i `backend/`) i dalje sadrže stari zavisnosni
stablo sa `mariadb`/`@prisma/adapter-mariadb`, jer lockfile nije
regenerisan u ovom okruženju (nema mrežnog pristupa u sandboxu gdje je
priprema rađena). Bez ovog koraka, `npm ci` u Dockerfile-u će pući ili
instalirati pogrešne pakete.

```bash
./scripts/sync-backend-lock.sh
# ili ručno:
cd backend && npm install   # ažurira package-lock.json na osnovu novog package.json
```

Provjeri da `backend/package-lock.json` sada sadrži `pg` i
`@prisma/adapter-pg`, a ne više `mariadb`/`@prisma/adapter-mariadb`.

## 2. Podesi `.env`

```bash
cp .env.example .env
```

Provjeri/popuni:

```
DATABASE_URL=postgresql://fkgracanica:Mojalozinka!1@sql.ba101.top:5432/fkgracanica
POSTGRES_USER=fkgracanica
POSTGRES_PASSWORD=Mojalozinka!1
POSTGRES_DB=fkgracanica
DB_PROVIDER=postgres
```

`DATABASE_URL` ovdje je za pristup **van** Dockera (CLI, migracije sa
host mašine, `pg_dump`/`pg_restore`, build-arg za `prisma generate`).
Za kontejnere u produkciji, `docker-compose.yml` sam prepisuje host na
`postgres` (vidi korak 6).

> **Napomena o `DB_PROVIDER`:** ovo je isključivo informativni/
> dokumentacioni flag. Prisma Client se generiše iz `schema.prisma` gdje
> je provider fiksno `postgresql` — ne postoji način da se sam Prisma
> Client dinamički prebacuje između MySQL/Postgres dijalekta preko env
> varijable u runtime-u (SQL koji Prisma generiše je specifičan za
> provider naveden u schema.prisma u trenutku `prisma generate`). Zato
> "MySQL kao backup" znači: fajlovi su sačuvani i spremni za ručni
> rollback (korak 8), ne da se prebacuje "u letu".

## 3. Generiši Postgres bazni (init) migraciju

Sa ispravnim `DATABASE_URL` koji pokazuje na praznu Postgres bazu:

```bash
cd backend
npm install                      # ako već nije urađeno u koraku 1
npx prisma generate
npx prisma migrate dev --name init_postgres
```

Ovo kreira jednu migraciju u `prisma/migrations/` koja pravi kompletnu
šemu (tabele, enume, indekse, foreign key-eve) u Postgres bazi, na
osnovu trenutnog `schema.prisma`. Provjeri da baza `fkgracanica` na
`sql.ba101.top` postoji i da je prazna (ili barem da nema tabela koje bi
se sudarile) prije nego što ovo pokreneš.

Alternativa za brzi lokalni test bez migration history-ja:
`npx prisma db push` (ne preporučuje se za produkciju).

## 4. (Ručno, van ovog dokumenta) Migracija podataka

Ovaj korak radiš ti ručno — nije pokriven ovdje po dogovoru. Za
referencu, uobičajene opcije:

- **pgloader** — najbrži put za MySQL → Postgres (`pgloader mysql://... postgresql://...`),
  automatski mapira tipove.
- Ručni `mysqldump` → transformacija → `psql` import.
- Custom skripta (Node/Prisma) koja čita iz MySQL adaptera i piše preko
  Postgres adaptera, korisno ako treba transformacija podataka usput.

Stvari na koje obratiti pažnju kod prebacivanja podataka (bez obzira na
alat):

- **Enumi** — Prisma enumi (`ContentStatus`, `MatchStatus`, itd.) u
  MySQL-u su bili `ENUM(...)` kolone (string vrijednosti), u Postgresu
  Prisma pravi prave native `CREATE TYPE ... AS ENUM`. Vrijednosti
  (stringovi) su identične, pgloader/import treba samo da upiše iste
  string vrijednosti — mapiranje je automatsko dok se ne mijenjaju nazivi
  enum vrijednosti u schema.prisma.
- **Json kolone** (`Setting.config`, `News.metadata`,
  `HallOfFameEntry.achievements`, `Membership.benefits`, `Photo.exifData`,
  `AuditLog.metadata`) — MySQL `JSON` i Postgres `JSONB`/`JSON` su
  kompatibilni na nivou sadržaja, samo provjeri da alat ne upisuje JSON
  kao plain string.
- **`cuid()` ID-jevi** — generisani su u aplikaciji (Prisma), ne u bazi,
  pa se prenose kao obični stringovi bez problema.
- **`Decimal(10,2)`** polja (cijene, iznosi) — MySQL i Postgres decimal
  tipovi su kompatibilni, pripazi samo da alat za migraciju ne zaokružuje
  ili pretvara u float usput.
- Redoslijed uvoza mora poštovati foreign key zavisnosti (ili privremeno
  isključi FK provjere/uvezi sve pa provjeri na kraju) — `prisma migrate
  dev` je već kreirao FK constraint-e u koraku 3.

## 5. Seed (ako baza treba početne podatke umjesto import-a)

```bash
cd backend
npm run prisma:seed        # ili npm run prisma:seed:rbac za samo role/permisije
```

## 6. Docker build i deploy

```bash
./scripts/docker-prod-build.sh
docker compose up -d
```

`docker-compose.yml` je podešen tako da `backend` kontejner u produkciji
koristi `DATABASE_URL=postgresql://...@postgres:5432/...` — pod
pretpostavkom da već postoji Postgres servis/kontejner sa nazivom
`postgres` na deljenoj Docker mreži `web` (Traefik mreža), dostupan na
portu 5432. Ako ta baza (still) nije na `web` mreži nego samo eksterna
(`sql.ba101.top`), backend će i dalje raditi jer je i `web` i
`fkgracanica-network` prisutan — ali provjeri da hostname `postgres`
zaista resolve-uje unutar mreže `web` prije prvog `up -d` (npr. `docker
exec fkgracanica-backend getent hosts postgres`). Ako taj servis ne
postoji na mreži `web`, privremeno vrati `DATABASE_URL` env override u
`docker-compose.yml` na javni host (`sql.ba101.top`) dok se ne podigne
deljeni Postgres kontejner.

`CMD` u `backend/Dockerfile` pokreće `npx prisma migrate deploy` prije
starta aplikacije — ovo primjenjuje migracije iz koraka 3 automatski pri
svakom deploy-u.

## 7. Verifikacija

- `GET https://fkgracanica.ba101.top/backend/api/v1/health` → `{"status":"ok"}`
- Provjeri par ključnih endpoint-a koji čitaju/pišu (login, vijesti,
  utakmice) da bude sigurno da su podaci ispravno preneseni.
- `docker logs fkgracanica-backend` — provjeri da nema grešaka o konekciji
  na bazu pri startu.

## 8. Rollback na MySQL (ako zatreba)

Detaljno uputstvo je u `backend/prisma-mysql-backup/README.md`. Ukratko:
vraćanje `schema.prisma`, `prisma/migrations/`, adapter fajlova i
`package.json` zavisnosti iz `prisma-mysql-backup/`, promjena
`DATABASE_URL` nazad na `mysql://...@sql.ba101.top:3306/fkgracanica`,
`npm install && npx prisma generate`. Napomena: ovo vraća samo šemu/kod,
ne i podatke unesene nakon prelaska na Postgres — te bi trebalo posebno
sinhronizovati iz Postgres backupa.
