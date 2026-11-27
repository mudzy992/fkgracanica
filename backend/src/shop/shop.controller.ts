import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly service: ShopService) {}

  @Get('products')
  @Public()
  findAll() {
    return this.service.findAll();
  }

  @Post('checkout')
  async checkout(
    @CurrentUser() user: AuthUser,
    @Body() body: { productIds: string[]; provider?: string },
  ) {
    const ids = Array.isArray(body.productIds) ? body.productIds : [];
    const res = await this.service.checkout(ids, body.provider, user.id);
    return { userId: user.id, ...res };
  }

  @Get('cart')
  async cart(@Query('ids') ids?: string) {
    const list = ids ? ids.split(',').filter(Boolean) : [];
    return this.service.checkout(list);
  }
}
