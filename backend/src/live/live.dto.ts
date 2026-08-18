import { MatchEventType } from '@prisma/client';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AddEventDto {
  @IsString()
  type!: MatchEventType;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(130)
  minute?: number;

  @IsOptional()
  @IsString()
  playerId?: string;

  @IsOptional()
  @IsString()
  relatedPlayerId?: string;

  @IsOptional()
  @IsString()
  teamSide?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ReportEventDto {
  @IsString()
  type!: MatchEventType;

  @IsInt()
  @Min(0)
  @Max(130)
  minute!: number;

  @IsOptional()
  @IsString()
  playerId?: string;

  @IsOptional()
  @IsString()
  relatedPlayerId?: string;

  @IsOptional()
  @IsString()
  teamSide?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SetStoppageDto {
  @IsIn([1, 2, 3, 4])
  half!: 1 | 2 | 3 | 4;

  @IsInt()
  @Min(1)
  @Max(15)
  minutes!: number;
}

export class SetLiveStreamDto {
  @IsOptional()
  @IsString()
  url?: string | null;
}
