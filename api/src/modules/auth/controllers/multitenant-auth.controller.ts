import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { MultitenantAuthService } from '../services/multitenant-auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../../../guards/auth-strategy.guard';

const isCookieSecure = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === 'true'
  : process.env.NODE_ENV === 'production';

@Controller('auth')
export class MultitenantAuthController {
  constructor(
    private multitenantAuthService: MultitenantAuthService,
  ) {
    console.log('🎯 MultitenantAuthController cargado correctamente');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.multitenantAuthService.login(loginDto.email, loginDto.password);
    
    // Configurar cookies HTTP-only para el token
    if (result.access_token && result.refresh_token) {
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: isCookieSecure,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: isCookieSecure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });
    }
    
    return result;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    try {
      console.log('🎯 CONTROLADOR: Iniciando registro para:', registerDto.email);
      const result = await this.multitenantAuthService.register(registerDto);
      
      // Configurar cookies HTTP-only para el token
      if (result.access_token && result.refresh_token) {
        res.cookie('access_token', result.access_token, {
          httpOnly: true,
          secure: isCookieSecure,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 horas
        });

        res.cookie('refresh_token', result.refresh_token, {
          httpOnly: true,
          secure: isCookieSecure,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        });
      }
      
      console.log('✅ CONTROLADOR: Registro exitoso para:', registerDto.email);
      return result;
    } catch (error) {
      console.error('❌ CONTROLADOR: Error en registro:', error);
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    
    const result = await this.multitenantAuthService.refreshToken(refreshToken);
    
    // Actualizar la cookie del access token
    if (result.access_token) {
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: isCookieSecure,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });
    }
    
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    return this.multitenantAuthService.getUserBusinesses(req.user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    // Limpiar cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return {
      message: 'Logout exitoso',
    };
  }
}
