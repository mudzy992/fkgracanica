import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { PaymentsModule } from '../payments/payments.module';
import { JobsModule } from '../jobs/jobs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TicketingService } from './ticketing.service';
import { TicketingConfigService } from './ticketing-config.service';
import { TicketingOrdersService } from './ticketing-orders.service';
import { TicketingController } from './ticketing.controller';
import { SeasonPassController } from './season-pass.controller';
import { SeasonPassService } from './season-pass.service';
import { PublicMatchController, TicketingPublicController } from './ticketing-public.controller';

@Module({
  imports: [SettingsModule, PaymentsModule, JobsModule, NotificationsModule],
  controllers: [
    TicketingController,
    SeasonPassController,
    TicketingPublicController,
    PublicMatchController,
  ],
  providers: [TicketingService, TicketingConfigService, TicketingOrdersService, SeasonPassService],
  exports: [TicketingService, TicketingConfigService, SeasonPassService],
})
export class TicketingModule {}
