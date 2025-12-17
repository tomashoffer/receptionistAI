import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignTagsDto {
  @ApiProperty({
    description: 'Array de IDs de tags a asignar al contacto',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
    isArray: true
  })
  @IsArray()
  @IsUUID('4', { each: true })
  tag_ids: string[];

  @ApiPropertyOptional({
    description: 'ID del usuario que asigna los tags',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  @IsUUID()
  assigned_by?: string;
}



