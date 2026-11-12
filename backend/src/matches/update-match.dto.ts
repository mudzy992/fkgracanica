import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MatchStatus } from '@prisma/client';

export class UpdateMatchDto {
  @IsOptional()
  @IsString()
  seasonId?: string;

  @IsOptional()
  @IsString()
  homeClubId?: string;

  @IsOptional()
  @IsString()
  awayClubId?: string;

  @IsOptional()
  @IsString()
  venue?: string | null;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  homeScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  awayScore?: number;

  @IsOptional()
  @IsString()
  roundId?: string | null;
}

export function assertManualMatchStatus(status?: MatchStatus) {
  if (status === MatchStatus.LIVE || status === MatchStatus.HALFTIME) {
    throw new BadRequestException(
      'Status LIVE i HALFTIME postavljaju se isključivo preko Live komentatora.',
    );
  }
}
