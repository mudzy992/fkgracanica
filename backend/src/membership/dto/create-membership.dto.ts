import { IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class CreateMembershipDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsBoolean()
  activate?: boolean;
}
