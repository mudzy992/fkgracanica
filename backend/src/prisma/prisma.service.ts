import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // BE-01/P2 (odobreno): konfiguracija preko ConfigService, ne process.env.
  // (Parametar se koristi PRIJE super() — lokalna varijabla, bez `this`.)
  constructor(config: ConfigService) {
    const databaseUrl = config.get<string>('databaseUrl');
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL nije postavljen — provjeri .env (vidi .env.example) ' +
          'ili validaciju u config/env.validate.ts',
      );
    }
    // PrismaPg (node-postgres) adapter — zamjena za @prisma/adapter-mariadb.
    // connectionString parsira host/port/user/password/database sam iz URL-a,
    // pa nam ručni parseDatabaseUrl() helper (kao za MariaDB) više nije potreban.
    const adapter = new PrismaPg({
      connectionString: databaseUrl,
      max: 10,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
