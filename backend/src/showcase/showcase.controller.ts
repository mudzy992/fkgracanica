import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShowcaseService } from './showcase.service';

@ApiTags('showcase')
@Controller('public/showcase')
export class ShowcaseController {
  constructor(private readonly service: ShowcaseService) {}

  @Get()
  getPublic() {
    return this.service.getPublic();
  }
}
