import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AppointmentRequestDto {
  @IsString()
  @IsOptional()
  preferred_date?: string;

  @IsString()
  @IsOptional()
  service?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateContactFromConversationDto {
  @IsUUID()
  business_id: string;

  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(['call', 'whatsapp', 'instagram', 'facebook', 'web'])
  source: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum([
    'agendar_turno',
    'consulta',
    'cancelacion',
    'informacion',
    'reserva',
  ])
  @IsOptional()
  intent?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AppointmentRequestDto)
  @IsOptional()
  appointment_request?: AppointmentRequestDto;

  @IsString()
  @IsOptional()
  conversation_id?: string;
}



