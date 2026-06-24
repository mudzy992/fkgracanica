import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ImageRenditionService } from './image-rendition.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, ImageRenditionService],
  exports: [UploadService],
})
export class UploadModule {}
