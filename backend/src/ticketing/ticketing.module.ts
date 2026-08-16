import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { PaymentsModule } from '../payments/payments.module';
import { JobsModule } from '../jobs/jobs.module';
import { TicketingService } from './ticketing.service';
import { TicketingConfigService } from './ticketing-config.service';
import { TicketingOrdersService } from './ticketing-orders.service';
import { TicketingController } from './ticketing.controller';
import { PublicMatchController, TicketingPublicController } from './ticketing-public.controller';

@Module({
  imports: [SettingsModule, PaymentsModule, JobsModule],
  controllers: [TicketingController, TicketingPublicController, PublicMatchController],
  providers: [TicketingService, TicketingConfigService, TicketingOrdersService],
  exports: [TicketingService, TicketingConfigService],
})
export class TicketingModule {}
