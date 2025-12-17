import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com'
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiPassword123!',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;

}
