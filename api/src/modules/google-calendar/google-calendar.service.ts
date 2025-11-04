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

  /**
   * Obtiene el redirect URI para Google Calendar OAuth
   * Prioridad:
   * 1. GOOGLE_CALENDAR_REDIRECT_URI si está configurado (específico para Calendar)
   * 2. Extraer base URL de GOOGLE_REDIRECT_URI si está configurado (compartido con login)
   * 3. Construir desde BACKEND_URL como fallback
   */
  private getRedirectUri(): string {
    // Opción 1: URI específico para Google Calendar
    const googleCalendarRedirectUri = this.configService.get('GOOGLE_CALENDAR_REDIRECT_URI');
    if (googleCalendarRedirectUri) {
      return googleCalendarRedirectUri;
    }

    // Opción 2: Usar GOOGLE_REDIRECT_URI compartido (extraer base URL)
    const googleRedirectUri = this.configService.get('GOOGLE_REDIRECT_URI');
    if (googleRedirectUri) {
      try {
        const url = new URL(googleRedirectUri);
        // Construir el path para Google Calendar usando la misma base
        return `${url.origin}/google-calendar/auth/callback`;
      } catch (error) {
        this.logger.warn(`GOOGLE_REDIRECT_URI tiene formato inválido: ${googleRedirectUri}`);
      }
    }

    // Opción 3: Fallback a BACKEND_URL
    return `${this.configService.get('BACKEND_URL')}/google-calendar/auth/callback`;
  }

  async getAuthUrl(businessId: string): Promise<string> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business no encontrado');
    }

    const redirectUri = this.getRedirectUri();
    
    this.logger.log(`Configuración de Redirect URI:`);
    this.logger.log(`  - BACKEND_URL: ${this.configService.get('BACKEND_URL')}`);
    this.logger.log(`  - GOOGLE_REDIRECT_URI: ${this.configService.get('GOOGLE_REDIRECT_URI') || 'no configurado'}`);
    this.logger.log(`  - GOOGLE_CALENDAR_REDIRECT_URI: ${this.configService.get('GOOGLE_CALENDAR_REDIRECT_URI') || 'no configurado'}`);
    this.logger.log(`  - ✅ Redirect URI que se usará: ${redirectUri}`);
    this.logger.log(`⚠️  IMPORTANTE: Este redirect URI debe estar configurado en Google Cloud Console`);
    this.logger.log(`📝 Configura este URI en: APIs y servicios > Credenciales > Tu OAuth 2.0 Client ID > URIs de redirección autorizados`);

    const oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      redirectUri,
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email', // Para obtener el email del usuario
    ];
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

    const redirectUri = this.getRedirectUri();
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

    // Validar que las credenciales estén configuradas
    if (!clientId || !clientSecret) {
      this.logger.error('GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están configurados');
      throw new BadRequestException('Configuración de Google OAuth incompleta');
    }

    this.logger.log(`Canjeando código de autorización por tokens`);
    this.logger.log(`  - Business ID: ${businessId}`);
    this.logger.log(`  - Redirect URI: ${redirectUri}`);
    this.logger.log(`  - Client ID: ${clientId.substring(0, 20)}...`);
    this.logger.log(`  - Código recibido: ${code ? 'Sí' : 'No'} (primeros 20 chars: ${code?.substring(0, 20)}...)`);
    
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    try {
      this.logger.log(`Llamando a oauth2Client.getToken(code)...`);
      const { tokens } = await oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No se recibió access_token en la respuesta de Google');
      }

      this.logger.log(`✅ Tokens obtenidos exitosamente`);
      this.logger.log(`  - Tiene access_token: ${!!tokens.access_token}`);
      this.logger.log(`  - Tiene refresh_token: ${!!tokens.refresh_token}`);
      this.logger.log(`  - Scopes: ${tokens.scope || 'no especificados'}`);
      
      // Establecer credenciales en el cliente
      oauth2Client.setCredentials(tokens);
      
      // Intentar obtener información del usuario de Google
      let email = '';
      try {
        this.logger.log(`Obteniendo información del usuario de Google...`);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        email = userInfo.data.email || '';
        this.logger.log(`✅ Email obtenido: ${email}`);
      } catch (userInfoError: any) {
        // Si falla obtener el email, no es crítico - lo intentaremos después
        this.logger.warn(`⚠️ No se pudo obtener el email del usuario: ${userInfoError.message}`);
        this.logger.warn(`Esto no es crítico - la conexión puede funcionar sin el email inicial`);
        // El email quedará vacío y se puede obtener más tarde cuando se use el calendario
      }
      
      const config = {
        connected: true,
        email: email,
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

      this.logger.log(`✅ Google Calendar conectado exitosamente para business: ${businessId} - Email: ${config.email}`);
    } catch (error: any) {
      this.logger.error('❌ Error obteniendo tokens de Google:', error);
      this.logger.error(`Detalles del error: ${error.message || 'Error desconocido'}`);
      if (error.response) {
        this.logger.error(`Respuesta de Google: ${JSON.stringify(error.response.data)}`);
      }
      if (error.code) {
        this.logger.error(`Código de error: ${error.code}`);
      }
      throw new BadRequestException(`Error al conectar Google Calendar: ${error.message || 'Error desconocido'}`);
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

      // Construir lista de attendees (invitados)
      const attendees: any[] = [];
      
      // Agregar el cliente como attendee
      if (appointmentData.clientEmail) {
        attendees.push({
          email: appointmentData.clientEmail,
          displayName: appointmentData.clientName || 'Cliente',
        });
      }
      
      // Agregar el email del business como attendee si existe
      const businessEmail = business.email;
      if (businessEmail) {
        attendees.push({
          email: businessEmail,
          displayName: business.name || 'Negocio',
        });
      }

      // Construir fecha/hora ISO 8601 con timezone (requerido por Google Calendar API)
      // Formato: YYYY-MM-DDTHH:MM:SS-03:00 (Argentina UTC-3)
      const startDateTime = `${appointmentData.date}T${appointmentData.time}:00-03:00`;
      const endDateTime = this.addHourToTime(startDateTime);

      this.logger.log(`📅 Creando evento: ${startDateTime} a ${endDateTime}`);
      this.logger.log(`👥 Invitados: ${attendees.map(a => a.email).join(', ')}`);

      const event = {
        summary: `📅 ${appointmentData.service || 'Cita'} - ${appointmentData.clientName}`,
        description: `🤖 Cita creada por Recepcionista AI\n\n👤 Cliente: ${appointmentData.clientName}\n📞 Teléfono: ${appointmentData.clientPhone}\n📧 Email: ${appointmentData.clientEmail}\n🏥 Servicio: ${appointmentData.service}\n📝 Notas: ${appointmentData.notes || 'Sin notas adicionales'}`,
        start: {
          dateTime: startDateTime,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        attendees: attendees.length > 0 ? attendees : undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
          ],
        },
      };

      this.logger.log(`📤 Enviando evento a Google Calendar...`);
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: attendees.length > 0 ? 'all' : 'none', // Enviar invitaciones automáticamente si hay attendees
      });

      this.logger.log(`✅ Evento creado en Google Calendar para business: ${businessId}`);
      this.logger.log(`  - Event ID: ${response.data.id}`);
      this.logger.log(`  - HTML Link: ${response.data.htmlLink}`);
      this.logger.log(`  - Invitaciones enviadas: ${attendees.length > 0 ? 'Sí (' + attendees.length + ' invitados)' : 'No'}`);
      
      return {
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        created: response.data.created,
      };
    } catch (error) {
      this.logger.error('❌ Error creando evento en Google Calendar:', error);
      if (error.response?.data) {
        this.logger.error(`Error de Google Calendar API: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      if (error.message) {
        this.logger.error(`Mensaje de error: ${error.message}`);
      }
      throw new BadRequestException(`Error al crear evento en Google Calendar: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Helper para obtener el cliente OAuth y el calendario autenticado
   */
  private async getAuthenticatedCalendar(businessId: string) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      this.logger.error(`❌ Business no encontrado: ${businessId}`);
      throw new NotFoundException('Business no encontrado');
    }

    const config = business.google_calendar_config as any;
    
    this.logger.log(`📋 Estado de Google Calendar para business ${businessId}:`);
    this.logger.log(`  - config existe: ${!!config}`);
    this.logger.log(`  - connected: ${config?.connected}`);
    this.logger.log(`  - access_token existe: ${!!config?.access_token}`);
    this.logger.log(`  - email: ${config?.email || 'N/A'}`);

    if (!config?.connected || !config?.access_token) {
      this.logger.error(`❌ Google Calendar no está conectado para business ${businessId}`);
      this.logger.error(`  - config completo: ${JSON.stringify(config, null, 2)}`);
      throw new BadRequestException('Google Calendar no está conectado para este business');
    }

    const redirectUri = this.getRedirectUri();
    const oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      redirectUri,
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
    return calendar;
  }

  /**
   * Verifica disponibilidad para un bloque de 60 minutos y sugiere alternativas
   */
  async checkAvailability(
    businessId: string,
    date: string,
    time: string,
  ): Promise<{ available: boolean; alternatives: string[] }> {
    try {
      // Validar formato de fecha (debe ser YYYY-MM-DD)
      const dateMatch = date.match(/^\d{4}-\d{2}-\d{2}$/);
      if (!dateMatch) {
        this.logger.error(`❌ Formato de fecha inválido: ${date}. Debe ser YYYY-MM-DD`);
        throw new BadRequestException(`Formato de fecha inválido: ${date}. Debe ser YYYY-MM-DD`);
      }

      // Validar formato de hora (debe ser HH:MM)
      const timeMatch = time.match(/^\d{2}:\d{2}$/);
      if (!timeMatch) {
        this.logger.error(`❌ Formato de hora inválido: ${time}. Debe ser HH:MM`);
        throw new BadRequestException(`Formato de hora inválido: ${time}. Debe ser HH:MM`);
      }

      const calendar = await this.getAuthenticatedCalendar(businessId);
      const config = (await this.businessRepository.findOne({ where: { id: businessId } }))?.google_calendar_config as any;
      const calendarId = config?.calendar_id || 'primary';

      // Construir ISO string con zona horaria (requerido por Google Calendar API)
      const startIso = `${date}T${time}:00-03:00`; // UTC-3 para Argentina
      const endIso = this.addHourToTime(startIso);

      this.logger.log(`📅 Consultando disponibilidad: ${startIso} a ${endIso}`);

      const res = await calendar.events.list({
        calendarId,
        singleEvents: true,
        orderBy: 'startTime',
        timeMin: startIso,
        timeMax: endIso,
        maxResults: 1,
      });

      const busy = (res.data.items || []).length > 0;

      // Sugerir hasta 3 alternativas en los próximos bloques de 30 minutos
      const alternatives: string[] = [];
      if (busy) {
        const base = new Date(startIso);
        for (let i = 1; i <= 10 && alternatives.length < 3; i++) {
          const altStart = new Date(base.getTime() + i * 30 * 60 * 1000);
          const altEnd = new Date(altStart.getTime() + 60 * 60 * 1000);

          const altRes = await calendar.events.list({
            calendarId,
            singleEvents: true,
            orderBy: 'startTime',
            timeMin: altStart.toISOString(),
            timeMax: altEnd.toISOString(),
            maxResults: 1,
          });

          if ((altRes.data.items || []).length === 0) {
            // devolver HH:MM en zona local
            const hh = altStart.getHours().toString().padStart(2, '0');
            const mm = altStart.getMinutes().toString().padStart(2, '0');
            alternatives.push(`${hh}:${mm}`);
          }
        }
      }

      return { available: !busy, alternatives };
    } catch (error) {
      this.logger.error('Error verificando disponibilidad en Google Calendar:', error);
      if (error.response?.data) {
        this.logger.error(`Error de Google Calendar API: ${JSON.stringify(error.response.data)}`);
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al verificar disponibilidad: ${error.message}`);
    }
  }

  /**
   * Obtiene eventos de Google Calendar para un business
   */
  async getEvents(
    businessId: string,
    timeMin?: string,
    timeMax?: string,
  ): Promise<any[]> {
    try {
      const calendar = await this.getAuthenticatedCalendar(businessId);
      const config = (await this.businessRepository.findOne({ where: { id: businessId } }))?.google_calendar_config as any;
      const calendarId = config?.calendar_id || 'primary';

      const params: any = {
        calendarId,
        singleEvents: true,
        orderBy: 'startTime',
      };

      if (timeMin) {
        params.timeMin = timeMin;
      }

      if (timeMax) {
        params.timeMax = timeMax;
      }

      this.logger.log(`Obteniendo eventos de Google Calendar para business: ${businessId} (${calendarId})`);
      const response = await calendar.events.list(params);

      const events = (response.data.items || []).map((event: any) => ({
        id: event.id,
        summary: event.summary || 'Sin título',
        description: event.description || '',
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        location: event.location || '',
        htmlLink: event.htmlLink,
        colorId: event.colorId,
      }));

      this.logger.log(`✅ Se obtuvieron ${events.length} eventos de Google Calendar`);
      return events;
    } catch (error) {
      this.logger.error('Error obteniendo eventos de Google Calendar:', error);
      throw new BadRequestException('Error al obtener eventos de Google Calendar');
    }
  }

  private addHourToTime(datetime: string): string {
    // Parsear datetime ISO con timezone (ej: "2025-11-03T09:30:00-03:00")
    // Extraer componentes y agregar 1 hora, preservando el timezone original
    const match = datetime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}:\d{2})$/);
    
    if (!match) {
      this.logger.error(`❌ Formato de fecha inválido en addHourToTime: ${datetime}`);
      throw new Error(`Formato de fecha inválido: ${datetime}. Se espera formato ISO 8601 con timezone.`);
    }
    
    const [, datePart, hoursStr, minutesStr, secondsStr, timezone] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);
    
    // Agregar 1 hora
    hours = (hours + 1) % 24;
    
    // Construir nuevo datetime con 1 hora más, preservando timezone
    return `${datePart}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}${timezone}`;
  }
}

