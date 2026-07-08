import { Controller, Get, Header, Query } from '@nestjs/common';
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

  /** Meta za OG / WhatsApp / Viber — koristi frontend OG server i crawleri */
  @Get('seo/share')
  shareMeta(@Query('path') path = '/') {
    return this.seo.resolveShareMeta(path);
  }
}
