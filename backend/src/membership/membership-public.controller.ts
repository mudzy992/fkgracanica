import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { JoinMembershipDto } from './dto/join-membership.dto';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('membership')
@Controller('membership/public')
@Public()
export class MembershipPublicController {
  constructor(private readonly service: MembershipService) {}

  @Post('join')
  join(@Body() dto: JoinMembershipDto) {
    return this.service.joinOnline(dto);
  }
}
