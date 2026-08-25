# prisma/migrations (PostgreSQL)

Ovaj folder je namjerno prazan (osim `migration_lock.toml`).

Razlog: originalne migracije (29 komada) su pisane u MySQL SQL dijalektu
(`AUTO_INCREMENT`, MySQL tipovi, itd.) i **ne mogu se primijeniti na
PostgreSQL**. Te migracije su sačuvane kao arhiva/backup u
`backend/prisma-mysql-backup/migrations/` — ne brisati, služe kao
istorijski zapis i za eventualni rollback na MySQL.

## Šta treba uraditi (jednom, kada je Postgres baza dostupna)

Sa ispravnim `DATABASE_URL` (postgresql://...) u `.env`:

```bash
cd backend
npx prisma migrate dev --name init_postgres
```

Ovo će, na osnovu trenutnog `prisma/schema.prisma` (provider = postgresql),
generisati **jednu** baseline migraciju koja kreira kompletnu šemu
(tabele, enume, indekse, FK) u Postgres bazi, i tu migraciju snimiti u
ovaj folder. Od tog trenutka nadalje, svaka nova izmjena šeme se radi
kao standardna nova Prisma migracija.

Detaljno uputstvo: `docs/mysql-to-postgres-migration.md` u root-u repoa.
