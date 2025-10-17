import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from 'class-validator';

import { UserDto } from "../../user/dto/user.dto";
import { AuthActions } from "../auth.types";
import { TokenPayloadDto } from "./TokenPayloadDto";

export class GuestLoginPayloadDto {
    @ApiProperty({ type: UserDto })
    guestUser: UserDto;

    @ApiProperty({ type: TokenPayloadDto })
    token: TokenPayloadDto;

    @ApiProperty({ type: Boolean })
    isPasswordExpired: boolean;

    @ApiProperty({ type: Boolean })
    action: AuthActions;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    constructor(
        user: UserDto,
        token: TokenPayloadDto,
        action: AuthActions,
        isPasswordExpired: boolean = false
    ) {
        this.guestUser = user;
        this.token = token;
        this.isPasswordExpired = isPasswordExpired;
        this.action = action;
    }
}
