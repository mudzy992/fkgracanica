import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('search')
@Controller('search')
@Public()
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  search(@Query() query: SearchQueryDto) {
    return this.service.globalSearch(query);
  }
}
