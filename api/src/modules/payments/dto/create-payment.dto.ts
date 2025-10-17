import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, IsEnum } from 'class-validator';
// ActionPaymentStatus eliminado - proyecto anterior

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Amount of the payment',
    example: 100.50,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Currency of the payment',
    example: 'ARS',
    default: 'ARS',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Description of the payment',
    example: 'Payment for mechanical inspection',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID of the related action',
    example: 'action-123',
  })
  @IsString()
  @IsOptional()
  actionId?: string;

  @ApiProperty({
    description: 'ID of the user making the payment',
    example: 'user-123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class UpdatePaymentStatusDto {
  @ApiProperty({
    description: 'New payment status',
    example: 'paid',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'MercadoPago payment ID',
    example: '128237033018',
  })
  @IsString()
  @IsOptional()
  mercadopagoPaymentId?: string;

  @ApiProperty({
    description: 'Payment method used',
    example: 'credit_card',
  })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({
    description: 'Complete MercadoPago data',
    example: { id: '128237033018', status: 'approved' },
  })
  @IsOptional()
  mercadopagoData?: any;
}