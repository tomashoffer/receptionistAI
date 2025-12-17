import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, IsEnum } from 'class-validator';
// ActionType, VehicleInformTypes eliminados - proyecto anterior

export class CreateOrderDto {
  @ApiProperty({
    description: 'Título del producto o servicio',
    example: 'Cita - Corte de cabello',
    minLength: 3,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Cantidad de items',
    example: 1,
    default: 1,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del item (en la moneda especificada)',
    example: 5000,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Descripción detallada del producto o servicio',
    example: 'Pago por cita de corte de cabello programada para el 20 de diciembre',
    required: false,
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Tipo de acción para la cual es este pago',
    example: 'appointment',
    required: false,
    enum: ['appointment', 'subscription', 'service', 'other'],
    enumName: 'ActionType'
  })
  @IsString()
  @IsOptional()
  actionType?: string;

  @ApiProperty({
    description: 'Vehicle history type (only used when actionType is VEHICLE_HISTORY)',
    example: 'premium',
    required: false,
  })
  @IsString()
  @IsOptional()
  vehicleInformType?: string;

  @ApiProperty({
    description: 'Car ID for the vehicle history action',
    example: '020cf90f-c0b3-4872-a2f5-691285396a78',
    required: false,
  })
  @IsString()
  @IsOptional()
  carId?: string;
}

