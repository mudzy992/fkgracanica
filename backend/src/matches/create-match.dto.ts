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

export class CreateMatchDto {
  @IsString()
  seasonId!: string;

  @IsString()
  homeClubId!: string;

  @IsString()
  awayClubId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  venue?: string | null;

  @IsOptional()
  @IsString()
  roundId?: string | null;

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
}
