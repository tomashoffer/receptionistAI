import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from '../../../constants/appointment-types';

export class CreateAppointmentDto {
  @ApiProperty({ 
    description: 'Nombre completo del cliente',
    example: 'María González',
    minLength: 2,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({ 
    description: 'Teléfono del cliente (formato internacional)',
    example: '+5491123456789',
    pattern: '^\\+[1-9]\\d{1,14}$'
  })
  @IsString()
  @IsNotEmpty()
  clientPhone: string;

  @ApiProperty({ 
    description: 'Email del cliente',
    example: 'maria.gonzalez@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  clientEmail: string;

  @ApiProperty({ 
    description: 'Tipo de servicio a realizar',
    example: 'Corte de cabello',
    examples: ['Corte de cabello', 'Coloración', 'Peinado', 'Tratamiento capilar', 'Manicure', 'Pedicure']
  })
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @ApiProperty({ 
    description: 'Fecha de la cita en formato YYYY-MM-DD',
    example: '2025-12-20',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$'
  })
  @IsDateString()
  @IsNotEmpty()
  appointmentDate: string;

  @ApiProperty({ 
    description: 'Hora de la cita en formato HH:MM (24 horas)',
    example: '14:30',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString()
  @IsNotEmpty()
  appointmentTime: string;

  @ApiProperty({ 
    description: 'Notas adicionales sobre la cita',
    example: 'Cliente prefiere estilista Juan. Alergia a productos con amoníaco.',
    required: false,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    description: 'ID de la interacción de voz que generó esta cita (opcional)',
    example: 'call_abc123xyz',
    required: false
  })
  @IsOptional()
  @IsString()
  voiceInteractionId?: string;
}

export class UpdateAppointmentDto {
  @ApiProperty({ description: 'Nombre del cliente', required: false })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({ description: 'Teléfono del cliente', required: false })
  @IsOptional()
  @IsString()
  clientPhone?: string;

  @ApiProperty({ description: 'Email del cliente', required: false })
  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @ApiProperty({ description: 'Tipo de servicio', required: false })
  @IsOptional()
  @IsString()
  serviceType?: string;

  @ApiProperty({ description: 'Fecha de la cita (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiProperty({ description: 'Hora de la cita (HH:MM)', required: false })
  @IsOptional()
  @IsString()
  appointmentTime?: string;

  @ApiProperty({ 
    description: 'Estado de la cita',
    enum: AppointmentStatus,
    required: false 
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'ID único de la cita (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'María González'
  })
  clientName: string;

  @ApiProperty({
    description: 'Teléfono del cliente',
    example: '+5491123456789'
  })
  clientPhone: string;

  @ApiProperty({
    description: 'Email del cliente',
    example: 'maria.gonzalez@example.com'
  })
  clientEmail: string;

  @ApiProperty({
    description: 'Tipo de servicio',
    example: 'Corte de cabello'
  })
  serviceType: string;

  @ApiProperty({
    description: 'Fecha de la cita',
    example: '2025-12-20T00:00:00.000Z',
    type: Date
  })
  appointmentDate: Date;

  @ApiProperty({
    description: 'Hora de la cita',
    example: '14:30'
  })
  appointmentTime: string;

  @ApiProperty({ 
    enum: AppointmentStatus,
    description: 'Estado de la cita',
    example: 'scheduled',
    enumName: 'AppointmentStatus'
  })
  status: AppointmentStatus;

  @ApiProperty({ 
    required: false,
    description: 'Notas adicionales',
    example: 'Cliente prefiere estilista Juan'
  })
  notes?: string;

  @ApiProperty({ 
    required: false,
    description: 'ID del evento en Google Calendar',
    example: 'abc123xyz456'
  })
  googleCalendarEventId?: string;

  @ApiProperty({ 
    required: false,
    description: 'ID de la fila en Google Sheets',
    example: 'row_123'
  })
  googleSheetsRowId?: string;

  @ApiProperty({ 
    required: false,
    description: 'ID de la interacción de voz que generó esta cita',
    example: 'call_abc123xyz'
  })
  voiceInteractionId?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-12-11T10:00:00.000Z',
    type: Date
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-12-11T10:00:00.000Z',
    type: Date
  })
  updatedAt: Date;
}

export class CreateAppointmentWithContactDto extends CreateAppointmentDto {
  @ApiProperty({ description: 'ID del negocio (business_id)', required: true })
  @IsString()
  @IsNotEmpty()
  business_id: string;

  @ApiProperty({ description: 'ID del evento de Google Calendar (si ya fue creado por n8n)', required: false })
  @IsOptional()
  @IsString()
  googleCalendarEventId?: string;
}

