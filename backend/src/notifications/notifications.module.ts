import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { RealtimeModule } from '../realtime/realtime.module';
import { JobsModule } from '../jobs/jobs.module';
import { NotificationDeliveryService } from './notification-delivery.service';

@Module({
  imports: [RealtimeModule, JobsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationDeliveryService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
