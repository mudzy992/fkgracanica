import { Module } from '@nestjs/common';
import { EmailLogController } from './email-log.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmailLogController],
})
export class EmailLogModule {}
