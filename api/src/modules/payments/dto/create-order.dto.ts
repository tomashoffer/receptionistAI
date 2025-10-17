import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, IsEnum } from 'class-validator';
// ActionType, VehicleInformTypes eliminados - proyecto anterior

export class CreateOrderDto {
  @ApiProperty({
    description: 'Title of the product or service',
    example: 'Audi A4 2020',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Quantity of items',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Unit price of the item',
    example: 25000,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Description of the product or service',
    example: 'Compra de vehículo Audi A4 2020',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type of action this payment is for',
    example: 'appointment',
    required: false,
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

