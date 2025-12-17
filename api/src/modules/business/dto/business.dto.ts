import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'Nombre del negocio',
    example: 'Salón de Belleza María',
    minLength: 2,
    maxLength: 255
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Número de teléfono del negocio (formato internacional)',
    example: '+5491123456789',
    pattern: '^\\+[1-9]\\d{1,14}$'
  })
  @IsString()
  phone_number: string;

  @ApiPropertyOptional({
    description: 'Descripción del negocio',
    example: 'Salón de belleza especializado en cortes modernos y coloración',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto del negocio',
    example: 'contacto@salonmaria.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Dirección física del negocio',
    example: 'Av. Corrientes 1234, Buenos Aires, Argentina'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Sitio web del negocio',
    example: 'https://www.salonmaria.com'
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    description: 'Industria o rubro del negocio',
    example: 'Belleza y Estética',
    enum: ['Belleza y Estética', 'Salud y Bienestar', 'Restaurante', 'Retail', 'Servicios Profesionales', 'Otro']
  })
  @IsString()
  industry: string;

  @ApiPropertyOptional({
    description: 'Prompt personalizado para el asistente de IA',
    example: 'Eres un asistente virtual de un salón de belleza. Sé amable, profesional y ayuda a los clientes a agendar citas para cortes, peinados y coloración.'
  })
  @IsOptional()
  @IsString()
  ai_prompt?: string;
}

export class UpdateBusinessDto {
  @ApiPropertyOptional({
    description: 'Nombre del negocio',
    example: 'Salón de Belleza María - Sucursal Centro'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del negocio',
    example: '+5491123456789'
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiPropertyOptional({
    description: 'Descripción del negocio',
    example: 'Salón de belleza especializado en cortes modernos y coloración'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto del negocio',
    example: 'contacto@salonmaria.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Dirección física del negocio',
    example: 'Av. Corrientes 1234, Buenos Aires, Argentina'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Sitio web del negocio',
    example: 'https://www.salonmaria.com'
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    description: 'Industria o rubro del negocio',
    example: 'Belleza y Estética'
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Prompt personalizado para el asistente de IA',
    example: 'Eres un asistente virtual de un salón de belleza. Sé amable, profesional y ayuda a los clientes a agendar citas.'
  })
  @IsOptional()
  @IsString()
  ai_prompt?: string;

  @ApiPropertyOptional({
    description: 'ID de voz de IA (ElevenLabs)',
    example: '21m00Tcm4TlvDq8ikWAM'
  })
  @IsOptional()
  @IsString()
  ai_voice_id?: string;

  @ApiPropertyOptional({
    description: 'Idioma del asistente de IA',
    example: 'es',
    enum: ['es', 'en', 'pt']
  })
  @IsOptional()
  @IsString()
  ai_language?: string;

  @ApiPropertyOptional({
    description: 'ID del asistente en Vapi',
    example: 'asst_abc123xyz'
  })
  @IsOptional()
  @IsString()
  assistant_id?: string;

  @ApiPropertyOptional({
    description: 'Estado del negocio',
    example: 'active',
    enum: ['active', 'inactive', 'suspended']
  })
  @IsOptional()
  @IsString()
  status?: string;
}

