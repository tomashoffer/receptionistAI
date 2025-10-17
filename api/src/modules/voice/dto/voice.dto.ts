import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { VoiceIntentType } from '../../../constants/voice-types';

export class ProcessVoiceDto {
  @ApiProperty({ description: 'Texto del comando de voz para procesar' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ description: 'ID de sesión', required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class VoiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  transcription: string;

  @ApiProperty()
  intent: any; // JSON parsed

  @ApiProperty()
  response: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty({ enum: VoiceIntentType })
  intentType: VoiceIntentType;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  appointmentId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class VoiceStatusDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  availableServices?: string[];
}

