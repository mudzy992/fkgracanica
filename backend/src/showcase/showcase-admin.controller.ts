import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ShowcaseService } from './showcase.service';

@ApiTags('platform-status')
@Controller('platform-status')
@UseGuards(PermissionsGuard)
@RequirePermissions('dashboard.read')
@ApiBearerAuth()
export class ShowcaseAdminController {
  constructor(private readonly service: ShowcaseService) {}

  @Get()
  getStatus() {
    return this.service.getStatus();
  }
}
