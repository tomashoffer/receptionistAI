import { IsString, IsEnum, IsOptional, IsUUID, IsBoolean, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/business-user.entity';

export class CreateBusinessUserDto {
  @ApiProperty({
    description: 'ID del negocio (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  business_id: string;

  @ApiProperty({
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Rol del usuario en el negocio',
    example: 'admin',
    enum: UserRole,
    enumName: 'UserRole'
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan'
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@example.com'
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+5491123456789'
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateBusinessUserDto {
  @ApiPropertyOptional({
    description: 'Rol del usuario en el negocio',
    example: 'manager',
    enum: UserRole
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan'
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'Email del usuario',
    example: 'juan.perez@example.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+5491123456789'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Indica si el usuario está activo',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class InviteUserDto {
  @ApiProperty({
    description: 'Email del usuario a invitar',
    example: 'nuevo.usuario@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Rol que se asignará al usuario',
    example: 'staff',
    enum: UserRole
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'María'
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'González'
  })
  @IsString()
  last_name: string;
}
