import { IsString, IsOptional, IsUrl, IsIn, IsEnum, IsArray, IsObject, IsBoolean } from 'class-validator';
import { VoiceProvider, ModelProvider, AssistantStatus } from '../entities/assistant.entity';

export class CreateAssistantDto {
  @IsString()
  business_id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  first_message?: string;

  @IsOptional()
  @IsString()
  vapi_assistant_id?: string;

  @IsOptional()
  @IsString()
  vapi_public_key?: string;

  @IsOptional()
  @IsString()
  voice_id?: string;

  @IsOptional()
  @IsEnum(VoiceProvider)
  voice_provider?: VoiceProvider;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(ModelProvider)
  model_provider?: ModelProvider;

  @IsOptional()
  @IsString()
  model_name?: string;

  @IsOptional()
  @IsArray()
  tools?: Array<{
    id?: string; // ID de la tool en ElevenLabs
    name: string;
    description: string;
    parameters: any;
    webhook_url?: string;
    webhook_secret?: string;
    enabled?: boolean;
  }>;

  @IsOptional()
  @IsObject()
  required_fields?: {
    [toolName: string]: string[];
  };

  @IsOptional()
  @IsUrl()
  server_url?: string;

  @IsOptional()
  @IsString()
  server_url_secret?: string;

  @IsOptional()
  @IsEnum(AssistantStatus)
  status?: AssistantStatus;
}

export class UpdateAssistantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  first_message?: string;

  @IsOptional()
  @IsString()
  vapi_assistant_id?: string;

  @IsOptional()
  @IsString()
  vapi_public_key?: string;

  @IsOptional()
  @IsString()
  voice_id?: string;

  @IsOptional()
  @IsEnum(VoiceProvider)
  voice_provider?: VoiceProvider;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(ModelProvider)
  model_provider?: ModelProvider;

  @IsOptional()
  @IsString()
  model_name?: string;

  @IsOptional()
  @IsArray()
  tools?: Array<{
    id?: string; // ID de la tool en ElevenLabs
    name: string;
    description: string;
    parameters: any;
    webhook_url?: string;
    webhook_secret?: string;
    enabled?: boolean;
  }>;

  @IsOptional()
  @IsObject()
  required_fields?: {
    [toolName: string]: string[];
  };

  @IsOptional()
  @IsUrl()
  server_url?: string;

  @IsOptional()
  @IsString()
  server_url_secret?: string;

  @IsOptional()
  @IsEnum(AssistantStatus)
  status?: AssistantStatus;
}
