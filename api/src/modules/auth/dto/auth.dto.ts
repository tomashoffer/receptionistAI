import { IsEmail, IsString, MinLength, IsUUID, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class SelectBusinessDto {
  @IsUUID()
  business_id: string;
}

export class RefreshTokenDto {
  @IsString()
  refresh_token: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  business_name: string;

  @IsString()
  business_phone: string;

  @IsString()
  industry: string;
}

export class CreateBusinessDto {
  @IsString()
  name: string;

  @IsString()
  phone_number: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsString()
  industry: string;

  @IsString()
  ai_prompt: string;
}
