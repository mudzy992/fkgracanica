import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AppReleasesService } from './app-releases.service';
import { CreateAppReleaseDto } from './dto/create-app-release.dto';
import { UpdateAppReleaseDto } from './dto/update-app-release.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';
import { apkTmpDir, apkTmpFilename, MAX_APK_SIZE } from './apk-storage.util';

@ApiTags('app-releases')
@Controller('app-releases')
@UseGuards(PermissionsGuard)
@RequirePermissions('app-releases.manage')
@ApiBearerAuth()
export class AppReleasesController {
  constructor(private readonly appReleases: AppReleasesService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    // BE-08/P-B08-3: na disk (temp), ne u RAM — vidi apk-storage.util.ts.
    FileInterceptor('file', {
      storage: diskStorage({
        destination: apkTmpDir(),
        filename: (_req, file, cb) =>
          cb(null, apkTmpFilename(file.originalname)),
      }),
      limits: { fileSize: MAX_APK_SIZE },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nijedna datoteka nije poslata.');
    return this.appReleases.saveApk(file);
  }

  @Post()
  create(@Body() dto: CreateAppReleaseDto, @CurrentUser() user: AuthUser) {
    return this.appReleases.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.appReleases.findAllAdmin();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppReleaseDto) {
    return this.appReleases.update(id, dto);
  }
}
