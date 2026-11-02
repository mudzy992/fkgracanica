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
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AppReleasesService } from './app-releases.service';
import { CreateAppReleaseDto } from './dto/create-app-release.dto';
import { UpdateAppReleaseDto } from './dto/update-app-release.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

const MAX_APK_SIZE = 200 * 1024 * 1024;

@ApiTags('app-releases')
@Controller('app-releases')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('app-releases.manage')
@ApiBearerAuth()
export class AppReleasesController {
  constructor(private readonly appReleases: AppReleasesService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
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
