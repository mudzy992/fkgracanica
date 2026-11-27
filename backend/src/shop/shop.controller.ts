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
import { ApiTags } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly service: ShopService) {}

  @Get('products')
  @Public()
  async findAll() {
    return this.service.findAll();
  }

  @Post('checkout')
  async checkout(
    @CurrentUser() user: AuthUser,
    @Body() body: { productIds: string[]; provider?: string },
  ) {
    const ids = Array.isArray(body.productIds) ? body.productIds : [];
    return this.service.checkout(ids, body.provider, user.id);
  }

  @Get('cart')
  cart(@Query('ids') ids?: string) {
    const list = ids ? ids.split(',').filter(Boolean) : [];
    return this.service.checkout(list);
  }

  @Post('admin/products')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('shop.manage')
  adminCreate(@Body() body: { name: string; price: number; tag?: string }) {
    return this.service.adminCreate(body);
  }

  @Patch('admin/products/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('shop.manage')
  adminUpdate(
    @Param('id') id: string,
    @Body()
    body: { name?: string; price?: number; tag?: string; isActive?: boolean },
  ) {
    return this.service.adminUpdate(id, body);
  }

  @Delete('admin/products/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('shop.manage')
  adminDelete(@Param('id') id: string) {
    return this.service.adminDelete(id);
  }
}
