import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMatchHighlightDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(512)
  youtubeUrl!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  startSeconds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMatchHighlightDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  youtubeUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  startSeconds?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
