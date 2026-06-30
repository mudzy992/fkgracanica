import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { NewsletterEmailDto } from './dto/newsletter-email.dto';
import { NewsletterListQueryDto } from './dto/newsletter-list-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body() dto: NewsletterEmailDto) {
    return this.service.subscribe(dto.email);
  }

  @Post('unsubscribe')
  unsubscribe(@Body() dto: NewsletterEmailDto) {
    return this.service.unsubscribe(dto.email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('newsletter.read')
  @ApiBearerAuth()
  findAll(@Query() query: NewsletterListQueryDto) {
    return this.service.findAll(query);
  }
}
