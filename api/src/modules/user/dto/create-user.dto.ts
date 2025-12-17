import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleType } from '../../../constants/role-type';

export class CreateUserDto {
  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan'
  })
  @IsString()
  @IsOptional()
  first_name: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  @IsString()
  @IsOptional()
  last_name: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    example: 'user',
    enum: RoleType,
    enumName: 'RoleType'
  })
  @IsEnum(RoleType)
  role: RoleType;

  @ApiProperty({
    description: 'Email del usuario (debe ser único)',
    example: 'juan.perez@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'MiPassword123!',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Contraseña temporal (opcional)',
    example: 'TempPass123!'
  })
  @IsString()
  @IsOptional()
  temporaryPassword?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+5491123456789'
  })
  @IsString()
  @IsOptional()
  phone?: string;
} 