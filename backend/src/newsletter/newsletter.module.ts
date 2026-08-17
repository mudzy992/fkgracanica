import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { NewsletterCampaignService } from './newsletter-campaign.service';
import { NewsletterCampaignsController } from './newsletter-campaigns.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [JobsModule],
  controllers: [NewsletterController, NewsletterCampaignsController],
  providers: [NewsletterService, NewsletterCampaignService],
})
export class NewsletterModule {}
