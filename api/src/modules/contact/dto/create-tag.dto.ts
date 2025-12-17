import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({
    description: 'ID del negocio al que pertenece el tag',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  business_id: string;

  @ApiProperty({
    description: 'Etiqueta o nombre del tag',
    example: 'Cliente VIP',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  label: string;

  @ApiProperty({
    description: 'Color del tag en formato hexadecimal',
    example: '#FF5733',
    maxLength: 20,
    pattern: '^#[0-9A-Fa-f]{6}$'
  })
  @IsString()
  @MaxLength(20)
  color: string;

  @ApiPropertyOptional({
    description: 'Icono del tag (opcional)',
    example: 'star',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que crea el tag',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  @IsOptional()
  created_by?: string;
}



