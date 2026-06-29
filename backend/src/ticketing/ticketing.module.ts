import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { PaymentsModule } from '../payments/payments.module';
import { TicketingService } from './ticketing.service';
import { TicketingConfigService } from './ticketing-config.service';
import { TicketingController } from './ticketing.controller';
import { PublicMatchController, TicketingPublicController } from './ticketing-public.controller';

@Module({
  imports: [SettingsModule, PaymentsModule],
  controllers: [TicketingController, TicketingPublicController, PublicMatchController],
  providers: [TicketingService, TicketingConfigService],
  exports: [TicketingService, TicketingConfigService],
})
export class TicketingModule {}
