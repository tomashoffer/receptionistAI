import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Req,
    Res,
    UnauthorizedException,
    NotFoundException,
    ForbiddenException
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request, Response } from 'express';
import { RoleType } from "../../constants/role-type";
import { AuthUser } from "../../decorators/auth-user.decorator";
import { Auth } from "../../decorators/http.decorators";
import { UserDto } from "../user/dto/user.dto";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { BusinessService } from "../business/services/business.service";
import { AuthActions } from "./auth.types";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { EmailExistsDto } from "./dto/EmailExistsDto";
import { LoginPayloadDto } from "./dto/LoginPayload.dto";
import { TokenPayloadDto } from "./dto/TokenPayloadDto";
import { UserLoginDto } from "./dto/UserLogin.dto";
import { UserRegisterDto } from "./dto/UserRegister.dto";
import {
    ResetPasswordDto,
    ResetPasswordEmailDto,
} from "./dto/reset-password.dto";
import { plainToInstance } from 'class-transformer';
import { GuestLoginPayloadDto } from "./dto/GuestLoginPayload.dto";
import { ApiConfigService } from "../../shared/services/api-config.service";

const isCookieSecure = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === 'true'
  : process.env.NODE_ENV === 'production';

@Controller("auth")
@ApiTags("auth")
export class AuthController {
    constructor(
        private userService: UserService,
        private authService: AuthService,
        private businessService: BusinessService,
        private apiConfigService: ApiConfigService,
    ) {}

    @Post("login")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginPayloadDto,
        description: "User info with access token",
    })
    async userLogin(
        @Body() userLoginDto: UserLoginDto,
        @Headers() headers,
        @Res({ passthrough: true }) res: Response
    ): Promise<LoginPayloadDto> {
        try {
            const { user: userEntity, isPasswordExpired } = await this.authService.validateUser(userLoginDto, headers.host);

            const token: TokenPayloadDto = await this.authService.createAccessToken(
                {
                    userId: userEntity.id,
                    role: userEntity.role,
                }
            );

            // Configurar cookies HTTP-only para el token
            res.cookie('access_token', token.accessToken, {
                httpOnly: true,
                secure: isCookieSecure,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
            });

            res.cookie('refresh_token', token.refreshToken, {
                httpOnly: true,
                secure: isCookieSecure,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
            });

            return new LoginPayloadDto(
                userEntity.toDto(),
                token,
                AuthActions.LOGIN,
                isPasswordExpired
            );
        } catch (error) {
            // Re-lanzar el error para que NestJS lo maneje correctamente
            if (error instanceof NotFoundException) {
                throw new HttpException(
                    { message: 'Usuario no encontrado. Verifica tu email y contraseña.' },
                    HttpStatus.NOT_FOUND
                );
            }
            if (error instanceof ForbiddenException) {
                throw new HttpException(
                    { message: 'Credenciales inválidas. Verifica tu email y contraseña.' },
                    HttpStatus.FORBIDDEN
                );
            }
            throw error;
        }
    }

    @Post("guest-login")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginPayloadDto,
        description: "Guest user info with access token",
    })
    async guestLogin(): Promise<GuestLoginPayloadDto> {
        const guestUser = this.authService.generateGuestUser();
        const token: TokenPayloadDto = await this.authService.createAccessToken({
            userId: guestUser.id,
            role: guestUser.role,
        });

        return new GuestLoginPayloadDto(
            guestUser,
            token,
            AuthActions.LOGIN,
            false
        );
    }

    @Post("register")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: UserDto, description: "Successfully Registered" })
    async userRegister(
        @Body() userRegisterDto: UserRegisterDto,
        @Req() req: Request, 
        @Res({ passthrough: true }) res: Response
    ): Promise<{ email: string }> 
    {
        const guestId = req.cookies['guest_id'];
        const registerData = { ...userRegisterDto };

        if (guestId) {
          registerData.id = guestId;
          res.clearCookie('guest_id');
        }
    

        const existingUser = await this.userService.findByEmail(registerData.email);
        if (existingUser) {
            throw new HttpException('User already exists', HttpStatus.CONFLICT);
        }

        // Crear usuario
        const user = await this.userService.createUser(registerData);
        
        // Crear negocio asociado (solo si se proporcionan los datos del negocio)
        if (registerData.business_name && registerData.business_phone && registerData.industry) {
            try {
                const businessData = {
                    owner_id: user.id,
                    name: registerData.business_name,
                    phone_number: registerData.business_phone,
                    industry: registerData.industry,
                    ai_prompt: `Eres María, la recepcionista virtual de ${registerData.business_name}. Tu trabajo es atender llamadas telefónicas de manera profesional y amable, ayudar a los clientes con información sobre servicios, agendar citas y resolver consultas generales.`,
                    status: 'trial' as any,
                };
                
                await this.businessService.create(businessData, user.id);
            } catch (error) {
                // Si falla la creación del business, eliminar el usuario creado
                await this.userService.deleteUser({ id: user.id });
                throw error; // Re-lanzar el error para que se propague
            }
        }
        
        return { email: user.email };
    }

    @Post("logout")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ description: "Successfully logged out" })
    async logout(): Promise<{ message: string }> {
        // El frontend se encarga de limpiar localStorage
        return { message: 'Successfully logged out' };
    }

    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginPayloadDto,
        description: "User info with access token",
    })
    async refreshAccessToken(@Req() req: Request): Promise<LoginPayloadDto> {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Refresh token required');
        }
        
        const refreshToken = authHeader.substring(7);
        
        try {
            // Verificar el refresh token (debería ser un JWT válido)
            const decoded = await this.authService.verifyRefreshToken(refreshToken);
            
            // Generar nuevo access token
            const user = await this.userService.findOne({ id: decoded.userId });
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            
            const token = await this.authService.createToken(user);
            
            const tokenPayload = new TokenPayloadDto({
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                expiresIn: this.apiConfigService.authConfig.jwtExpirationTime,
            });
            
            return new LoginPayloadDto(
                user.toDto(),
                tokenPayload,
                AuthActions.LOGIN,
                false
            );
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    
    @Get("login-from-token")
    @HttpCode(HttpStatus.OK)
    @Auth([RoleType.USER, RoleType.ADMIN])
    @ApiOkResponse({ type: LoginPayloadDto, description: "User info with access token" })
    async getUserLoginData(@AuthUser() user: UserEntity): Promise<LoginPayloadDto | null> {
        const entity = plainToInstance(UserEntity, user);
        const userData = await this.userService.findOne({
            id: entity.id
        });
    
        if (userData) {
            const token: TokenPayloadDto = await this.authService.createAccessToken({
                userId: userData.id,
                role: userData.role,
            });
    
            return new LoginPayloadDto(
                userData.toDto(),
                token,
                AuthActions.LOGIN,
                false
            );
        }
        return null;
    }

    @Get("token")
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ description: "Get access token from cookies" })
    async getToken(@Req() req: Request): Promise<{ accessToken?: string }> {
        const accessToken = req.cookies?.access_token;
        return { accessToken };
    }

    @Get("me")
    @HttpCode(HttpStatus.OK)
    @Auth([RoleType.USER, RoleType.ADMIN])
    @ApiOkResponse({ type: UserDto, description: "current user info" })
    async getCurrentUser(@AuthUser() user: UserEntity, @Req() req: Request, @Res() res: Response) {
      const entity = plainToInstance(UserEntity, user);
      const userData = await this.userService.findOne({
        id: entity.id
      });
      
      
      return res.json(userData);
    }

    @Get("send-verification-email")
    async sendVerificationEmail(@Body("email") email: string) {
        await this.userService.sendVerificationEmail(email.toLocaleLowerCase());
        return {
            message:
                "Verification sent, please check your email for further instructions",
        };
    }

    @Post("change-password")
    @Auth([RoleType.USER, RoleType.ADMIN])
    @HttpCode(HttpStatus.OK)
    changePassword(@Body() body: ChangePasswordDto, @AuthUser() user: UserDto) {
        return this.authService.changePassword(user.id, body);
    }

    @Post("change-password/:id")
    @Auth([RoleType.USER, RoleType.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Change password by user id",
        description: "Change password by user id",
    })
    changePasswordByUserID(
        @Body() body: ChangePasswordDto,
        @Param("id") userId: string
    ) {
        return this.authService.changePassword(userId, body);
    }

    @Post("forgot")
    async forgotPassword(@Body() body: ResetPasswordEmailDto) {
        return this.authService.createResetPasswordToken(
            body.email.toLocaleLowerCase()
        );
    }

    @Get("verify-password-token/:token")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Verify Reset password unique token",
        description:
            "This process will verify the token after password is changed",
    })
    async verifyToken(@Param("token") token: string) {
        return this.authService.verifyPasswordToken(token);
    }

    @Post("reset-password/:token")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Reset password (token required)",
        description:
            "Reset password (token required), because token can expire in that moment",
    })
    resetPassword(
        @Param("token") token: string,
        @Body() resetPasswordDto: ResetPasswordDto
    ) {
        return this.authService.resetPassword(token, resetPasswordDto);
    }

    @Post("email_exists")
    @HttpCode(HttpStatus.OK)
    emailExists(@Body() body: EmailExistsDto) {
        return this.authService.emailExists(body);
    }
}
