# MySQL backup (arhiva prije prelaska na PostgreSQL)

Ovaj folder sadrži originalne MySQL fajlove projekta, sačuvane u trenutku
prelaska na PostgreSQL (25.08.2026). Aplikacija ih **ne koristi u
runtime-u** — služe isključivo kao:

1. istorijski zapis kako je šema izgledala/rasla kroz MySQL migracije,
2. materijal za rollback ako se ikad odluči vratiti na MySQL.

## Šta je unutra

- `schema.prisma` — originalna Prisma šema sa `provider = "mysql"`
  (prije zamjene MySQL-specifičnih tipova poput `@db.LongText`).
- `migrations/` — svih 29 originalnih MySQL migracija
  (`20260624104219_init` ... `20260820120000_visitor_visit_geo`) uz
  `migration_lock.toml` (provider = mysql).
- `prisma-client.mysql.ts` — originalni `prisma/seed/prisma-client.ts`
  koji je koristio `@prisma/adapter-mariadb` (`PrismaMariaDb`).
- `prisma.service.mysql.ts` — originalni
  `src/prisma/prisma.service.ts` (MariaDB adapter, port 3306).
- `package.json.mysql` — originalni `backend/package.json` sa MySQL
  zavisnostima (`@prisma/adapter-mariadb`, `mariadb`).

## Kako vratiti nazad na MySQL (rollback)

1. `cp prisma-mysql-backup/schema.prisma prisma/schema.prisma`
2. `rm -rf prisma/migrations && cp -r prisma-mysql-backup/migrations prisma/migrations`
3. `cp prisma-mysql-backup/prisma-client.mysql.ts prisma/seed/prisma-client.ts`
4. `cp prisma-mysql-backup/prisma.service.mysql.ts src/prisma/prisma.service.ts`
5. U `package.json` vratiti `@prisma/adapter-mariadb` + `mariadb`
   (vidi `package.json.mysql`), ukloniti `@prisma/adapter-pg` + `pg`.
6. `DATABASE_URL` u `.env` vratiti na `mysql://...` format
   (originalni: `mysql://USER:PASSWORD@sql.ba101.top:3306/fkgracanica`).
7. `npm install && npx prisma generate`

Napomena: ovo vraća **šemu i konekciju**, ne i podatke — ako je Postgres
baza u međuvremenu bila primarna, podatke treba posebno vratiti iz
MySQL backupa (dump-a).

Detalji o samoj migraciji: `docs/mysql-to-postgres-migration.md`.
