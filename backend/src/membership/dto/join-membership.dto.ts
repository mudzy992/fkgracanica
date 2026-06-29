import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class JoinMembershipDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
