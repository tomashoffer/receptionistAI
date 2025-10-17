// financing-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class GuestDataDto {
    @IsString()
    @IsOptional()
    @ApiProperty()
    documentNumber?: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    firstName?: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    lastName?: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    cuilCuit?: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    areaCode?: string;

    @IsEmail()
    @IsOptional()
    @ApiProperty()
    email?: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    gender?: string;

    @IsDate()
    @IsOptional()
    @ApiProperty()
    birthDate?: Date;

    @IsString()
    @IsOptional()
    @ApiProperty()
    phone?: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    income?: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty()
    isDependent?: boolean;

    @IsBoolean()
    @IsOptional()
    @ApiProperty()
    hasCoHolder?: boolean;
}