import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('rbac')
@Controller('rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @RequirePermissions('rbac.read')
  findRoles() {
    return this.rbacService.findRoles();
  }

  @Get('permissions')
  @RequirePermissions('rbac.read')
  findPermissions() {
    return this.rbacService.findPermissions();
  }
}
