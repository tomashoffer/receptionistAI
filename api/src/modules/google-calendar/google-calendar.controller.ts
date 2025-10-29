import { Controller, Get, Query, Post, Param, Body, UseGuards, Logger, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { Response } from 'express';

@ApiTags('google-calendar')
@Controller('google-calendar')
export class GoogleCalendarController {
  private readonly logger = new Logger(GoogleCalendarController.name);

  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('auth/start/:businessId')
  @ApiOperation({ summary: 'Iniciar flujo OAuth de Google Calendar para un business' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async startAuth(@Param('businessId') businessId: string, @Res() res: Response) {
    try {
      const authUrl = await this.googleCalendarService.getAuthUrl(businessId);
      res.redirect(authUrl);
    } catch (error) {
      this.logger.error('Error iniciando OAuth de Google Calendar:', error);
      throw error;
    }
  }

  @Get('auth/callback')
  @ApiOperation({ summary: 'Callback OAuth de Google Calendar' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string, // businessId
    @Res() res: Response,
  ) {
    try {
      const businessId = state;
      await this.googleCalendarService.handleCallback(businessId, code);
      
      // Redirigir al dashboard con mensaje de éxito
      const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard?tab=businesses&google_calendar=connected`);
    } catch (error) {
      this.logger.error('Error en callback de Google Calendar:', error);
      const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard?tab=businesses&google_calendar=error`);
    }
  }

  @Get('status/:businessId')
  @ApiOperation({ summary: 'Obtener estado de conexión de Google Calendar' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async getStatus(@Param('businessId') businessId: string) {
    return this.googleCalendarService.getConnectionStatus(businessId);
  }

  @Post('disconnect/:businessId')
  @ApiOperation({ summary: 'Desconectar Google Calendar de un business' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async disconnect(@Param('businessId') businessId: string) {
    return this.googleCalendarService.disconnect(businessId);
  }

  @Post('event')
  @ApiOperation({ summary: 'Crear evento en Google Calendar' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async createEvent(@Body() eventData: any, @AuthUser() user: any) {
    return this.googleCalendarService.createEvent(eventData.businessId, eventData);
  }
}

