import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NewsletterCampaignService } from './newsletter-campaign.service';
import { CreateNewsletterCampaignDto } from './dto/create-newsletter-campaign.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('newsletter')
@Controller('newsletter/campaigns')
@UseGuards(PermissionsGuard)
@ApiBearerAuth()
export class NewsletterCampaignsController {
  constructor(private readonly service: NewsletterCampaignService) {}

  @Get()
  @RequirePermissions('newsletter.read')
  list() {
    return this.service.list();
  }

  @Post()
  @RequirePermissions('newsletter.manage')
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateNewsletterCampaignDto,
  ) {
    return this.service.create(dto, user.id);
  }

  @Post('preview')
  @RequirePermissions('newsletter.manage')
  preview(@Body() dto: CreateNewsletterCampaignDto) {
    return this.service.preview(dto);
  }

  @Post(':id/send')
  @RequirePermissions('newsletter.manage')
  send(@Param('id') id: string) {
    return this.service.send(id);
  }
}
