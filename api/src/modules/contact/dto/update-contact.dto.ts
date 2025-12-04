import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from './create-contact.dto';
import { IsOptional, IsInt, IsString, IsDateString } from 'class-validator';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @IsInt()
  @IsOptional()
  total_interactions?: number;

  @IsDateString()
  @IsOptional()
  last_interaction?: Date;

  @IsString()
  @IsOptional()
  last_conversation_summary?: string;

  @IsString()
  @IsOptional()
  conversation_id?: string;
}

