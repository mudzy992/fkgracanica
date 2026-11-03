import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';
import { UploadService } from './upload.service';

/** BE-04/P-B04-2 (odobreno): gornja veličina uploada — multer → 413. */
const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;

@ApiTags('upload')
@Controller('upload')
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  // BE-09/P-B09-3 (odobreno): stroži limit od globalnog (100/min) — prije je
  // jedan nalog mogao napuniti disk; dnevna kvota je u `UploadService`.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser | undefined,
  ) {
    return this.uploadService.saveFile(file, user?.id);
  }
}
