import { IsString, IsEnum, IsOptional, IsUUID, IsBoolean, IsEmail } from 'class-validator';
import { UserRole } from '../entities/business-user.entity';

export class CreateBusinessUserDto {
  @IsUUID()
  business_id: string;

  @IsUUID()
  user_id: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateBusinessUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;
}
