import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
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
