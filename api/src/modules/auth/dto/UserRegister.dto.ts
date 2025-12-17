import { ApiProperty, OmitType } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from "class-validator";


import { Trim } from "../../../decorators/transform.decorators";
import { AuthProviders } from "../../../constants/auth.enums";

export class UserRegisterDto {
    @ApiProperty({
        description: 'ID único del usuario (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsString()
    @IsNotEmpty()
    @Trim()
    readonly id: string;

    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Juan'
    })
    @IsString()
    @IsNotEmpty()
    @Trim()
    readonly first_name: string;

    @ApiProperty({
        description: 'Apellido del usuario',
        example: 'Pérez'
    })
    @IsString()
    @IsNotEmpty()
    @Trim()
    readonly last_name: string;

    @ApiProperty({
        description: 'Email del usuario (debe ser único)',
        example: 'juan.perez@example.com'
    })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @Trim()
    email: string;

    @ApiProperty({ 
        description: 'Contraseña del usuario',
        example: 'MiPassword123!',
        minLength: 6
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'Contraseña temporal (opcional)',
        example: 'TempPass123!',
        required: false
    })
    @IsString()
    @IsOptional()
    readonly temporaryPassword?: string;

    @ApiProperty({
        description: 'Teléfono del usuario',
        example: '+5491123456789',
        required: false
    })
    @IsString()
    @IsOptional()
    readonly phone?: string;

    // Campos del negocio
    @ApiProperty({
        description: 'Nombre del negocio (opcional, se crea si se proporciona)',
        example: 'Salón de Belleza María',
        required: false
    })
    @IsString()
    @IsOptional()
    @Trim()
    readonly business_name?: string;

    @ApiProperty({
        description: 'Teléfono del negocio',
        example: '+5491123456789',
        required: false
    })
    @IsString()
    @IsOptional()
    @Trim()
    readonly business_phone?: string;

    @ApiProperty({
        description: 'Industria o rubro del negocio',
        example: 'Belleza y Estética',
        required: false
    })
    @IsString()
    @IsOptional()
    @Trim()
    readonly industry?: string;

    authProvider?: AuthProviders;
    
    passwordChangedAt?: Date;
}

export class OauthDto extends OmitType(UserRegisterDto, ["phone"] as const) {}
