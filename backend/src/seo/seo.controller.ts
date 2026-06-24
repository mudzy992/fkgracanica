import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeoService } from './seo.service';

@ApiTags('seo')
@Controller()
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  sitemap() {
    return this.seo.buildSitemap();
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  robots() {
    return this.seo.buildRobots();
  }
}
