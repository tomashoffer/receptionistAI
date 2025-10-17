import { ApiProperty } from '@nestjs/swagger';
// ActionPaymentStatus eliminado - proyecto anterior

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'payment-123',
  })
  id: string;

  @ApiProperty({
    description: 'MercadoPago payment ID',
    example: '128237033018',
  })
  mercadopagoPaymentId: string;

  @ApiProperty({
    description: 'MercadoPago preference ID',
    example: '2718444489-abc123',
  })
  mercadopagoPreferenceId: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Payment method used',
    example: 'credit_card',
  })
  paymentMethod: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 100.50,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment currency',
    example: 'ARS',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment description',
    example: 'Payment for mechanical inspection',
  })
  description: string;

  @ApiProperty({
    description: 'Related action ID',
    example: 'action-123',
  })
  actionId: string;

  @ApiProperty({
    description: 'User ID who made the payment',
    example: 'user-123',
  })
  userId: string;

  @ApiProperty({
    description: 'Payment creation date',
    example: '2025-01-10T16:49:16Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Payment last update date',
    example: '2025-01-10T16:49:16Z',
  })
  updatedAt: Date;
}

export class CreatePaymentResponseDto {
  @ApiProperty({
    description: 'Payment information',
    type: PaymentResponseDto,
  })
  payment: PaymentResponseDto;

  @ApiProperty({
    description: 'MercadoPago checkout URL',
    example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=2718444489-abc123',
  })
  checkoutUrl: string;

  @ApiProperty({
    description: 'MercadoPago sandbox checkout URL',
    example: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=2718444489-abc123',
  })
  sandboxCheckoutUrl: string;
}
