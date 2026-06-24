import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
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
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('contact.read')
  @ApiBearerAuth()
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }
}
