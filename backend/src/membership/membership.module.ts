import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PaymentsModule } from '../payments/payments.module';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { MembershipPublicController } from './membership-public.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [AuthModule, forwardRef(() => PaymentsModule), JobsModule],
  controllers: [MembershipController, MembershipPublicController],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
