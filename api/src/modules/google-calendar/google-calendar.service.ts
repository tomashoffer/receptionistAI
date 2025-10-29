import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';
import { Business } from '../business/entities/business.entity';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private configService: ConfigService,
  ) {}

  async getAuthUrl(businessId: string): Promise<string> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business no encontrado');
    }

    const oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      `${this.configService.get('BACKEND_URL')}/google-calendar/auth/callback`,
    );

    const scopes = ['https://www.googleapis.com/auth/calendar'];
    const state = businessId; // Pasar businessId como state

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state,
      prompt: 'consent', // Forzar consent para obtener refresh_token
    });

    this.logger.log(`Generando URL de autenticación para business: ${businessId}`);
    return authUrl;
  }

  async handleCallback(businessId: string, code: string): Promise<void> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business no encontrado');
    }

    const oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      `${this.configService.get('BACKEND_URL')}/google-calendar/auth/callback`,
    );

    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      // Obtener información del usuario de Google
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      
      const config = {
        connected: true,
        email: userInfo.data.email || '',
        access_token: tokens.access_token || '',
        refresh_token: tokens.refresh_token || '',
        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : undefined,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope || '',
        calendar_id: 'primary',
      };

      await this.businessRepository.update(businessId, {
        google_calendar_config: config as any,
      });

      this.logger.log(`Google Calendar conectado para business: ${businessId} - Email: ${config.email}`);
    } catch (error) {
      this.logger.error('Error obteniendo tokens de Google:', error);
      throw new BadRequestException('Error al conectar Google Calendar');
    }
  }

  async getConnectionStatus(businessId: string): Promise<any> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business no encontrado');
    }

    const config = business.google_calendar_config as any;

    return {
      connected: config?.connected || false,
      email: config?.email || null,
      connected_at: config ? new Date() : null, // Falta guardar timestamp
    };
  }

  async disconnect(businessId: string): Promise<void> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business no encontrado');
    }

    await this.businessRepository.update(businessId, {
      google_calendar_config: null,
    });

    this.logger.log(`Google Calendar desconectado para business: ${businessId}`);
  }

  async createEvent(businessId: string, appointmentData: any): Promise<any> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business no encontrado');
    }

    const config = business.google_calendar_config as any;

    if (!config?.connected || !config?.access_token) {
      throw new BadRequestException('Google Calendar no está conectado para este business');
    }

    try {
      // Crear cliente OAuth con los tokens almacenados
      const oauth2Client = new google.auth.OAuth2(
        this.configService.get('GOOGLE_CLIENT_ID'),
        this.configService.get('GOOGLE_CLIENT_SECRET'),
        `${this.configService.get('BACKEND_URL')}/google-calendar/auth/callback`,
      );

      oauth2Client.setCredentials({
        access_token: config.access_token,
        refresh_token: config.refresh_token,
        expiry_date: config.expires_at ? new Date(config.expires_at).getTime() : undefined,
      });

      // Verificar si el token expiró y refrescarlo si es necesario
      const now = Date.now();
      if (config.expires_at && new Date(config.expires_at).getTime() < now) {
        this.logger.log('Token expirado, refrescando...');
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Actualizar tokens en BD
        await this.businessRepository.update(businessId, {
          google_calendar_config: {
            ...config,
            access_token: credentials.access_token,
            expires_at: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : config.expires_at,
          } as any,
        });
        
        oauth2Client.setCredentials(credentials);
      }

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary: `📅 ${appointmentData.service || 'Cita'} - ${appointmentData.clientName}`,
        description: `🤖 Cita creada por Recepcionista AI\n\n👤 Cliente: ${appointmentData.clientName}\n📞 Teléfono: ${appointmentData.clientPhone}\n📧 Email: ${appointmentData.clientEmail}\n🏥 Servicio: ${appointmentData.service}\n📝 Notas: ${appointmentData.notes || 'Sin notas adicionales'}`,
        start: {
          dateTime: `${appointmentData.date}T${appointmentData.time}:00`,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: this.addHourToTime(`${appointmentData.date}T${appointmentData.time}:00`),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      this.logger.log(`Evento creado en Google Calendar para business: ${businessId}`);
      return {
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        created: response.data.created,
      };
    } catch (error) {
      this.logger.error('Error creando evento en Google Calendar:', error);
      throw new BadRequestException('Error al crear evento en Google Calendar');
    }
  }

  private addHourToTime(datetime: string): string {
    const date = new Date(datetime);
    date.setHours(date.getHours() + 1);
    return date.toISOString();
  }
}

