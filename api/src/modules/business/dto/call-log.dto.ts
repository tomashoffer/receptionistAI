import { IsString, IsEnum, IsOptional, IsUUID, IsNumber, IsDateString, IsObject } from 'class-validator';
import { CallStatus, CallDirection } from '../entities/call-log.entity';

export class CreateCallLogDto {
  @IsUUID()
  business_id: string;

  @IsString()
  call_sid: string;

  @IsString()
  caller_number: string;

  @IsString()
  called_number: string;

  @IsEnum(CallDirection)
  direction: CallDirection;

  @IsEnum(CallStatus)
  status: CallStatus;

  @IsNumber()
  duration_seconds: number;

  @IsDateString()
  started_at: Date;

  @IsOptional()
  @IsDateString()
  ended_at?: Date;

  @IsOptional()
  @IsString()
  transcription?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsObject()
  ai_responses?: Array<{
    timestamp: Date;
    message: string;
    confidence: number;
  }>;

  @IsOptional()
  @IsString()
  sentiment?: string;

  @IsOptional()
  @IsNumber()
  sentiment_score?: number;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsObject()
  extracted_data?: {
    name?: string;
    email?: string;
    phone?: string;
    service?: string;
    date?: string;
    time?: string;
    [key: string]: any;
  };

  @IsOptional()
  @IsNumber()
  cost_usd?: number;

  @IsOptional()
  @IsNumber()
  ai_tokens_used?: number;

  @IsOptional()
  @IsUUID()
  contact_id?: string;
}

export class UpdateCallLogDto {
  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;

  @IsOptional()
  @IsNumber()
  duration_seconds?: number;

  @IsOptional()
  @IsDateString()
  ended_at?: Date;

  @IsOptional()
  @IsString()
  transcription?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsObject()
  ai_responses?: Array<{
    timestamp: Date;
    message: string;
    confidence: number;
  }>;

  @IsOptional()
  @IsString()
  sentiment?: string;

  @IsOptional()
  @IsNumber()
  sentiment_score?: number;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsObject()
  extracted_data?: {
    name?: string;
    email?: string;
    phone?: string;
    service?: string;
    date?: string;
    time?: string;
    [key: string]: any;
  };

  @IsOptional()
  @IsNumber()
  cost_usd?: number;

  @IsOptional()
  @IsNumber()
  ai_tokens_used?: number;

  @IsOptional()
  @IsUUID()
  contact_id?: string;
}

export class CallLogQueryDto {
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;

  @IsOptional()
  @IsEnum(CallDirection)
  direction?: CallDirection;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
