import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('loyalty')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  @Get('tiers')
  @Public()
  tiers() {
    return this.service.getTiers();
  }

  @Get('points')
  @ApiBearerAuth()
  points(@CurrentUser() user: AuthUser) {
    return this.service.getPoints(user.id);
  }

  @Post('earn')
  @ApiBearerAuth()
  earn(@CurrentUser() user: AuthUser, @Body() body: { amountKm: number }) {
    const amount = typeof body.amountKm === 'number' ? body.amountKm : 0;
    return this.service.earn(user.id, amount);
  }
}
