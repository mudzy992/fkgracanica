import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';

/** BE-04/P-B04-2 (odobreno): gornja veličina uploada — multer → 413. */
const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;

@ApiTags('upload')
@Controller('upload')
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFile(file);
  }
}
