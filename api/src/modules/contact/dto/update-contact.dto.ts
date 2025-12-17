import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateContactDto } from './create-contact.dto';
import { IsOptional, IsInt, IsString, IsDateString } from 'class-validator';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @ApiPropertyOptional({
    description: 'Número total de interacciones con el contacto',
    example: 5,
    minimum: 0
  })
  @IsInt()
  @IsOptional()
  total_interactions?: number;

  @ApiPropertyOptional({
    description: 'Fecha de la última interacción (ISO 8601)',
    example: '2025-12-11T10:00:00.000Z',
    type: Date
  })
  @IsDateString()
  @IsOptional()
  last_interaction?: Date;

  @ApiPropertyOptional({
    description: 'Resumen de la última conversación',
    example: 'Cliente interesado en agendar cita para corte de cabello. Prefiere horarios matutinos.',
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  last_conversation_summary?: string;

  @ApiPropertyOptional({
    description: 'ID de la conversación asociada',
    example: 'conv_abc123xyz'
  })
  @IsString()
  @IsOptional()
  conversation_id?: string;
}



