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
  htmlBody!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textBody?: string;
}
