import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';

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

  @IsOptional()
  @IsString()
  rubro?: string;

  @IsOptional()
  @IsString()
  ai_prompt?: string;
}

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ai_prompt?: string;

  @IsOptional()
  @IsString()
  rubro?: string;

  @IsOptional()
  @IsString()
  ai_voice_id?: string;

  @IsOptional()
  @IsString()
  ai_language?: string;

  @IsOptional()
  @IsString()
  assistant_id?: string;
}

