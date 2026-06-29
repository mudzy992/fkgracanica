import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TicketingConfigService } from './ticketing-config.service';

@ApiTags('ticketing')
@Controller('ticketing')
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
export class PublicMatchController {
  constructor(private readonly config: TicketingConfigService) {}

  @Get('next-home-match')
  nextHomeMatch() {
    return this.config.findNextHomeMatch();
  }
}
