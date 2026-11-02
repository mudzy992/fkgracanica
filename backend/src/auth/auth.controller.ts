import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updatePreferences(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.authService.updatePreferences(user.id, dto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto.avatarPath);
  }

  @Delete('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteProfileAvatar(@CurrentUser() user: AuthUser) {
    return this.authService.deleteProfileAvatar(user.id);
  }

  @Post('login')
  // BE-01/Q-11(a) (odobreno): stroži limit na credential rutama (10 pokušaja/60s)
  // — globalnih 100/60s vrijedi i ovdje kao gornja granica.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto.email, dto.password, req.ip);
  }

  @Post('refresh')
  // BE-01/Q-11(a): isti razlog kao login — brute-force zaštita tokena.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  logout(@Body() dto: RefreshDto, @CurrentUser() user: AuthUser) {
    return this.authService.logout(dto.refreshToken, user.id);
  }
}
