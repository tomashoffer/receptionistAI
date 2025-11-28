import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from '../../../guards/auth-strategy.guard';
import { AuthService } from '../auth.service';
import { Response } from 'express'; 
import { UserService } from "../../user/user.service";
import { RoleType } from '../../../constants/role-type';
import { ApiConfigService } from '../../../shared/services/api-config.service';

const isCookieSecure = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === 'true'
  : process.env.NODE_ENV === 'production';

@ApiTags('Google Auth')
@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
    private readonly apiConfigService: ApiConfigService,
  ) {}

  @Get('')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(): Promise<void> {

  }

  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res: Response) {
    // This is the secure callback handler.
    const guestId = req.cookies['guest_id'];
    let userId = req.user.id;
    if(guestId){
      userId = guestId;
      res.clearCookie('guest_id');
    }
    // Generate the tokens using the correct service method from the AuthService.
    // We assume req.user contains the authenticated user's details.
    const tokenPayload = await this.authService.createAccessToken({
      userId,
      role: RoleType.USER,
    });

    // We assume the tokenPayload object contains the accessToken and refreshToken.
    const { accessToken, refreshToken } = tokenPayload;
    if (!accessToken) {
      throw new Error('No se pudo generar el accessToken.');
    }
    // The 'domain' attribute is set to the parent domain.
    // This tells the browser that the cookie is valid for all subdomains.
    const cookieDomain = process.env.COOKIE_DOMAIN;
    if (!cookieDomain) {
      throw new Error('COOKIE_DOMAIN variable de ambiente no definida.');
    }

    // Set the access token cookie with the correct domain and SameSite attributes.
    // IMPORTANTE: usar 'access_token' (no 'accessToken') porque el JwtStrategy lo busca así
    // El domain debe ser .pedidosatr.com (con punto inicial) para que funcione en todos los subdominios
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isCookieSecure,
      sameSite: 'lax', 
      maxAge: 7 * 24 * 3600 * 1000,
      path: '/',
      domain: cookieDomain, // Permite que la cookie funcione en todos los subdominios
    });
    

    // Check if a refreshToken was provided before setting the cookie.
    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isCookieSecure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 3600 * 1000,
        path: '/',
        domain: cookieDomain, // Permite que la cookie funcione en todos los subdominios
      });
    }

    // Redirect the user directly to the dashboard after successful login.
    const frontendUrl = this.apiConfigService.frontendUrl;
    console.log(`[GoogleAuth] Redirigiendo a: ${frontendUrl}/dashboard`);
    res.redirect(`${frontendUrl}/dashboard`);
  }
}
