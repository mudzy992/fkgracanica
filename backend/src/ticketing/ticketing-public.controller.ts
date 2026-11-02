import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TicketingConfigService } from './ticketing-config.service';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('ticketing')
@Controller('ticketing')
@Public()
export class TicketingPublicController {
  constructor(private readonly config: TicketingConfigService) {}

  @Get('config')
  getConfig() {
    return this.config.getPublicConfig();
  }

  @Get('matches/ticketable')
  findTicketable() {
    return this.config.findTicketableMatches();
  }
}

@ApiTags('public')
@Controller('public')
@Public()
export class PublicMatchController {
  constructor(private readonly config: TicketingConfigService) {}

  @Get('next-home-match')
  nextHomeMatch() {
    return this.config.findNextHomeMatch();
  }
}
