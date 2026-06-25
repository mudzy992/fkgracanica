import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactListQueryDto } from './dto/contact-list-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Post()
  create(@Body() body: { name: string; email: string; subject?: string; message: string }) {
    return this.service.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('contact.read')
  @ApiBearerAuth()
  findAll(@Query() query: ContactListQueryDto) {
    return this.service.findAll(query);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('contact.read')
  @ApiBearerAuth()
  markAllRead() {
    return this.service.markAllRead();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('contact.read')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('contact.read')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('contact.read')
  @ApiBearerAuth()
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }
}
