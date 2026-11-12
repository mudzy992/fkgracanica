import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShowcaseService } from './showcase.service';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('showcase')
@Controller('public/showcase')
@Public()
export class ShowcaseController {
  constructor(private readonly service: ShowcaseService) {}

  @Get()
  getPublic() {
    return this.service.getPublic();
  }
}
