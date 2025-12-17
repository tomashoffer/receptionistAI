import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    description: 'ID del negocio al que pertenece el contacto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  business_id: string;

  @ApiProperty({
    description: 'Nombre completo del contacto',
    example: 'María González',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Número de teléfono del contacto (formato internacional recomendado)',
    example: '+5491123456789',
    minLength: 8,
    maxLength: 50
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  phone: string;

  @ApiPropertyOptional({
    description: 'Email del contacto',
    example: 'maria.gonzalez@example.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Origen del contacto (cómo se obtuvo)',
    example: 'call',
    enum: ['call', 'whatsapp', 'instagram', 'facebook', 'web', 'manual'],
    enumName: 'ContactSource'
  })
  @IsEnum(['call', 'whatsapp', 'instagram', 'facebook', 'web', 'manual'])
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el contacto',
    example: 'Cliente frecuente, prefiere horarios matutinos. Interesado en servicios de coloración.',
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  notes?: string;
}



