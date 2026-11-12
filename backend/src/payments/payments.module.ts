import { Module, forwardRef } from '@nestjs/common';
import { PaymentsReadinessService } from './payments-readiness.service';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MembershipModule } from '../membership/membership.module';
import { JobsModule } from '../jobs/jobs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StripeProvider } from './providers/stripe.provider';
import { PaypalProvider } from './providers/paypal.provider';
import { MonriProvider } from './providers/monri.provider';
import { PaypalOps } from './paypal-ops';
import { MonriOps } from './monri-ops';

@Module({
  imports: [
    forwardRef(() => MembershipModule),
    JobsModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsReadinessService,
    PaymentsService,
    StripeProvider,
    PaypalProvider,
    PaypalOps,
    MonriProvider,
    MonriOps,
  ],
  exports: [PaymentsReadinessService, PaymentsService],
})
export class PaymentsModule {}
