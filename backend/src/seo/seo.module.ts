import { Module } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { ShareResolvers } from './share-resolvers';

@Module({
  controllers: [SeoController],
  providers: [SeoService, ShareResolvers],
})
export class SeoModule {}
