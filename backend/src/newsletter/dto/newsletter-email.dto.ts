import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewsletterEmailDto {
  @ApiProperty({ example: 'navijac@example.com' })
  @IsEmail()
  email!: string;
}
