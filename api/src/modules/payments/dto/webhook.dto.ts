import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class WebhookDto {
  @ApiProperty({
    description: 'Action type of the webhook',
    example: 'payment.created',
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: 'API version',
    example: 'v1',
  })
  @IsString()
  @IsNotEmpty()
  api_version: string;

  @ApiProperty({
    description: 'Data from the webhook',
  })
  @IsNotEmpty()
  data: {
    id: string;
  };

  @ApiProperty({
    description: 'Date when the webhook was created',
  })
  @IsString()
  @IsNotEmpty()
  date_created: string;

  @ApiProperty({
    description: 'ID of the webhook',
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'Live mode flag',
  })
  @IsNotEmpty()
  live_mode: boolean;

  @ApiProperty({
    description: 'Type of notification',
    example: 'payment',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'User ID',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;
}

