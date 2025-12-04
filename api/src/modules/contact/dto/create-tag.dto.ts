import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsUUID()
  business_id: string;

  @IsString()
  @MaxLength(50)
  label: string;

  @IsString()
  @MaxLength(20)
  color: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @IsUUID()
  @IsOptional()
  created_by?: string;
}

