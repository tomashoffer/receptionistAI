import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from '../../../constants/appointment-types';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Nombre del cliente' })
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({ description: 'Teléfono del cliente' })
  @IsString()
  @IsNotEmpty()
  clientPhone: string;

  @ApiProperty({ description: 'Email del cliente' })
  @IsEmail()
  @IsNotEmpty()
  clientEmail: string;

  @ApiProperty({ description: 'Tipo de servicio' })
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @ApiProperty({ description: 'Fecha de la cita (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  appointmentDate: string;

  @ApiProperty({ description: 'Hora de la cita (HH:MM)' })
  @IsString()
  @IsNotEmpty()
  appointmentTime: string;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'ID de interacción de voz', required: false })
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
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  clientPhone: string;

  @ApiProperty()
  clientEmail: string;

  @ApiProperty()
  serviceType: string;

  @ApiProperty()
  appointmentDate: Date;

  @ApiProperty()
  appointmentTime: string;

  @ApiProperty({ enum: AppointmentStatus })
  status: AppointmentStatus;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  googleCalendarEventId?: string;

  @ApiProperty({ required: false })
  googleSheetsRowId?: string;

  @ApiProperty({ required: false })
  voiceInteractionId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

