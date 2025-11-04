import { Controller, Get, Query, Post, Param, Body, UseGuards, Logger, Res, BadRequestException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { Response, Request } from 'express';

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
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Verificar si Google devolvió un error
    if (error) {
      this.logger.error(`Google OAuth error: ${error}`);
      res.redirect(`${frontendUrl}/dashboard?tab=businesses&google_calendar=error&reason=${encodeURIComponent(error)}`);
      return;
    }

    // Validar que el código esté presente
    if (!code) {
      this.logger.error('Callback recibido sin código de autorización');
      res.redirect(`${frontendUrl}/dashboard?tab=businesses&google_calendar=error&reason=no_code`);
      return;
    }

    // Validar que el state (businessId) esté presente
    if (!state) {
      this.logger.error('Callback recibido sin state (businessId)');
      res.redirect(`${frontendUrl}/dashboard?tab=businesses&google_calendar=error&reason=no_business_id`);
      return;
    }

    try {
      const businessId = state;
      this.logger.log(`Procesando callback de Google Calendar para business: ${businessId}`);
      await this.googleCalendarService.handleCallback(businessId, code);
      
      // Redirigir al dashboard con mensaje de éxito
      res.redirect(`${frontendUrl}/dashboard?tab=appointments&google_calendar=connected`);
    } catch (error) {
      this.logger.error('Error en callback de Google Calendar:', error);
      const errorMessage = error instanceof Error ? error.message : 'unknown_error';
      res.redirect(`${frontendUrl}/dashboard?tab=appointments&google_calendar=error&reason=${encodeURIComponent(errorMessage)}`);
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

  @Get('events/:businessId')
  @ApiOperation({ summary: 'Obtener eventos de Google Calendar para un business' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async getEvents(
    @Param('businessId') businessId: string,
    @Query('timeMin') timeMin?: string,
    @Query('timeMax') timeMax?: string,
  ) {
    return this.googleCalendarService.getEvents(businessId, timeMin, timeMax);
  }

  // Endpoint público para ElevenLabs (no requiere AuthGuard)
  @Get('availability/:businessId')
  @ApiOperation({ summary: 'Verificar disponibilidad de un horario en Google Calendar' })
  async checkAvailability(
    @Param('businessId') businessId: string,
    @Query('date') date: string,
    @Query('time') time: string,
    @Query() allQueryParams: any, // Capturar todos los query params para debugging
    @Req() req: Request, // Request completo para debugging
  ) {
    this.logger.log(`🔍 Verificando disponibilidad - BusinessId: ${businessId}`);
    this.logger.log(`  📅 Date recibido: ${date} (tipo: ${typeof date})`);
    this.logger.log(`  ⏰ Time recibido: ${time} (tipo: ${typeof time})`);
    this.logger.log(`  📋 Todos los query params: ${JSON.stringify(allQueryParams)}`);
    this.logger.log(`  🔗 URL completa: ${req.url}`);
    this.logger.log(`  📡 Método: ${req.method}`);
    this.logger.log(`  🌐 Headers: ${JSON.stringify(req.headers)}`);
    this.logger.log(`  📦 Query string: ${req.url.split('?')[1] || 'NINGUNO'}`);
    
    if (!date || date === 'undefined' || date === 'null') {
      this.logger.error(`❌ Parámetro date faltante o inválido: ${date}`);
      this.logger.error(`  Query params recibidos: ${JSON.stringify(allQueryParams)}`);
      this.logger.error(`  URL completa recibida: ${req.url}`);
      throw new BadRequestException(
        'El parámetro "date" es requerido en formato YYYY-MM-DD (ej: "2025-11-03"). ' +
        'Asegúrate de haber usado "resolve_date" primero para obtener la fecha correcta. ' +
        `Parámetros recibidos: ${JSON.stringify(allQueryParams)}. ` +
        `URL recibida: ${req.url}`
      );
    }
    
    if (!time || time === 'undefined' || time === 'null') {
      this.logger.error(`❌ Parámetro time faltante o inválido: ${time}`);
      this.logger.error(`  Query params recibidos: ${JSON.stringify(allQueryParams)}`);
      this.logger.error(`  URL completa recibida: ${req.url}`);
      throw new BadRequestException(
        'El parámetro "time" es requerido en formato HH:MM (ej: "09:30" o "14:00"). ' +
        'Asegúrate de haber obtenido la hora del cliente antes de verificar disponibilidad. ' +
        `Parámetros recibidos: ${JSON.stringify(allQueryParams)}. ` +
        `URL recibida: ${req.url}`
      );
    }
    
    return this.googleCalendarService.checkAvailability(businessId, date, time);
  }
}

