import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewsletterCampaignDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  subject!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  textBody!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaUrl?: string;
}
