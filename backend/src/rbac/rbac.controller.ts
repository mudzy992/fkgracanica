import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
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

  @Post('roles')
  @RequirePermissions('rbac.update')
  createRole(@Body() body: { name: string; description?: string }) {
    return this.rbacService.createRole(body);
  }

  @Delete('roles/:id')
  @RequirePermissions('rbac.update')
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  @Patch('roles/:id/permissions')
  @RequirePermissions('rbac.update')
  updateRolePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.rbacService.updateRolePermissions(id, dto.permissionKeys);
  }
}
