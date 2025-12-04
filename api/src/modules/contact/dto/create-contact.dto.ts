import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactDto {
  @IsUUID()
  business_id: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(['call', 'whatsapp', 'instagram', 'facebook', 'web', 'manual'])
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

