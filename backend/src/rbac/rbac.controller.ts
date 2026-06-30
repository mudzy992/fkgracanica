import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

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

  @Post('roles')
  @RequirePermissions('rbac.update')
  createRole(
    @CurrentUser() actor: AuthUser,
    @Body() body: { name: string; description?: string },
  ) {
    return this.rbacService.createRole(actor.id, body);
  }

  @Delete('roles/:id')
  @RequirePermissions('rbac.update')
  deleteRole(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.rbacService.deleteRole(actor.id, id);
  }

  @Patch('roles/:id/permissions')
  @RequirePermissions('rbac.update')
  updateRolePermissions(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.rbacService.updateRolePermissions(actor.id, id, dto.permissionKeys);
  }
}
