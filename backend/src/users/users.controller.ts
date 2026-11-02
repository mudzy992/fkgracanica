import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';
import { PaginatedQueryDto } from '../common/dto/paginated-query.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  findAll(@Query() query: PaginatedQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('role-options')
  @RequirePermissions('users.read')
  findRoleOptions() {
    return this.usersService.findRoleOptions();
  }

  @Get(':id')
  @RequirePermissions('users.read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions('users.create')
  create(@CurrentUser() actor: AuthUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(actor.id, dto);
  }

  @Patch(':id')
  @RequirePermissions('users.update')
  update(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(actor.id, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  remove(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.usersService.remove(actor.id, id);
  }
}
