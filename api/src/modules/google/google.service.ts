import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { AppointmentEntity } from '../appointments/appointment.entity';

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);
  private calendar: any;
  private sheets: any;

  constructor(private configService: ConfigService) {
    this.initializeGoogleAPIs();
  }

  private async initializeGoogleAPIs() {
    try {
      // Configurar autenticación con Google
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: this.configService.get('GOOGLE_CLIENT_EMAIL'),
          private_key: this.configService.get('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        },
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/spreadsheets',
        ],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      this.sheets = google.sheets({ version: 'v4', auth });

      this.logger.log('Google APIs inicializadas correctamente');
    } catch (error) {
      this.logger.error('Error inicializando Google APIs:', error);
    }
  }

  async createCalendarEvent(appointment: AppointmentEntity): Promise<any> {
    try {
      const event = {
        summary: `📅 ${appointment.serviceType} - ${appointment.clientName}`,
        description: `🤖 Cita creada por Recepcionista AI

👤 Cliente: ${appointment.clientName}
📞 Teléfono: ${appointment.clientPhone}
📧 Email: ${appointment.clientEmail}
🏥 Servicio: ${appointment.serviceType}
📝 Notas: ${appointment.notes || 'Sin notas adicionales'}

🆔 ID de Cita: ${appointment.id}
⏰ Creada: ${appointment.createdAt.toLocaleString('es-AR')}`,
        start: {
          dateTime: `${appointment.appointmentDate}T${appointment.appointmentTime}:00`,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: `${appointment.appointmentDate}T${this.addHourToTime(appointment.appointmentTime)}:00`,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        // attendees: [], // Comentado para Service Account
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 día antes
            { method: 'popup', minutes: 60 }, // 1 hora antes
            { method: 'popup', minutes: 15 }, // 15 minutos antes
          ],
        },
        colorId: this.getColorIdByService(appointment.serviceType),
        visibility: 'public',
      };

      const response = await this.calendar.events.insert({
        calendarId: this.configService.get('GOOGLE_CALENDAR_ID') || 'primary',
        resource: event,
      });

      this.logger.log(`Evento creado en Google Calendar: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error creando evento en Google Calendar:', error);
      throw error;
    }
  }

  async updateCalendarEvent(appointment: AppointmentEntity): Promise<any> {
    try {
      if (!appointment.googleCalendarEventId) {
        throw new Error('No hay ID de evento de Google Calendar para actualizar');
      }

      const event = {
        summary: `${appointment.serviceType} - ${appointment.clientName}`,
        description: `Cliente: ${appointment.clientName}\nTeléfono: ${appointment.clientPhone}\nEmail: ${appointment.clientEmail}\nNotas: ${appointment.notes || 'Sin notas'}`,
        start: {
          dateTime: `${appointment.appointmentDate}T${appointment.appointmentTime}:00`,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: `${appointment.appointmentDate}T${this.addHourToTime(appointment.appointmentTime)}:00`,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        // attendees: [], // Comentado para Service Account
      };

      const response = await this.calendar.events.update({
        calendarId: this.configService.get('GOOGLE_CALENDAR_ID') || 'primary',
        eventId: appointment.googleCalendarEventId,
        resource: event,
      });

      this.logger.log(`Evento actualizado en Google Calendar: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error actualizando evento en Google Calendar:', error);
      throw error;
    }
  }

  async deleteCalendarEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: this.configService.get('GOOGLE_CALENDAR_ID') || 'primary',
        eventId: eventId,
      });

      this.logger.log(`Evento eliminado de Google Calendar: ${eventId}`);
    } catch (error) {
      this.logger.error('Error eliminando evento de Google Calendar:', error);
      throw error;
    }
  }

  async addToGoogleSheets(appointment: AppointmentEntity): Promise<string> {
    try {
      const values = [
        [
          appointment.id,
          appointment.clientName,
          appointment.clientPhone,
          appointment.clientEmail,
          appointment.serviceType,
          appointment.appointmentDate,
          appointment.appointmentTime,
          appointment.status,
          appointment.notes || '',
          appointment.createdAt.toISOString(),
        ],
      ];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.configService.get('GOOGLE_SHEETS_ID'),
        range: this.configService.get('GOOGLE_SHEETS_RANGE') || 'A:J',
        valueInputOption: 'RAW',
        resource: {
          values: values,
        },
      });

      // Obtener el número de fila donde se insertó
      const rowNumber = response.data.updates?.updatedRange?.match(/(\d+)$/)?.[1];
      
      this.logger.log(`Cita agregada a Google Sheets en fila: ${rowNumber}`);
      return rowNumber || 'unknown';
    } catch (error) {
      this.logger.error('Error agregando a Google Sheets:', error);
      throw error;
    }
  }

  async updateGoogleSheetsRow(appointment: AppointmentEntity): Promise<void> {
    try {
      if (!appointment.googleSheetsRowId) {
        throw new Error('No hay ID de fila de Google Sheets para actualizar');
      }

      const values = [
        [
          appointment.id,
          appointment.clientName,
          appointment.clientPhone,
          appointment.clientEmail,
          appointment.serviceType,
          appointment.appointmentDate,
          appointment.appointmentTime,
          appointment.status,
          appointment.notes || '',
          appointment.updatedAt.toISOString(),
        ],
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.configService.get('GOOGLE_SHEETS_ID'),
        range: `${appointment.googleSheetsRowId}:${appointment.googleSheetsRowId}`,
        valueInputOption: 'RAW',
        resource: {
          values: values,
        },
      });

      this.logger.log(`Fila actualizada en Google Sheets: ${appointment.googleSheetsRowId}`);
    } catch (error) {
      this.logger.error('Error actualizando fila en Google Sheets:', error);
      throw error;
    }
  }

  async getCalendarEvents(startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      const timeMin = startDate ? startDate.toISOString() : new Date().toISOString();
      const timeMax = endDate ? endDate.toISOString() : undefined;

      const response = await this.calendar.events.list({
        calendarId: this.configService.get('GOOGLE_CALENDAR_ID') || 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      this.logger.error('Error obteniendo eventos de Google Calendar:', error);
      throw error;
    }
  }

  private addHourToTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = hours + 1;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private getColorIdByService(serviceType: string): string {
    const serviceColors: { [key: string]: string } = {
      'Consulta médica': '1', // Azul
      'Consulta general': '1', // Azul
      'Emergencia': '11', // Rojo
      'Seguimiento': '5', // Amarillo
      'Especialista': '6', // Naranja
      'Revisión': '2', // Verde
      'default': '1', // Azul por defecto
    };

    return serviceColors[serviceType] || serviceColors['default'];
  }

  async getAvailableSlots(date: string, durationMinutes: number = 60): Promise<string[]> {
    try {
      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);

      const events = await this.calendar.events.list({
        calendarId: this.configService.get('GOOGLE_CALENDAR_ID') || 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const busySlots = events.data.items?.map(event => ({
        start: new Date(event.start?.dateTime || event.start?.date || ''),
        end: new Date(event.end?.dateTime || event.end?.date || ''),
      })) || [];

      // Generar slots disponibles (cada hora de 9:00 a 18:00)
      const availableSlots: string[] = [];
      const workingHours = { start: 9, end: 18 };

      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`);
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

        // Verificar si el slot está libre
        const isAvailable = !busySlots.some(busySlot => 
          (slotStart >= busySlot.start && slotStart < busySlot.end) ||
          (slotEnd > busySlot.start && slotEnd <= busySlot.end) ||
          (slotStart <= busySlot.start && slotEnd >= busySlot.end)
        );

        if (isAvailable) {
          availableSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
      }

      return availableSlots;
    } catch (error) {
      this.logger.error('Error obteniendo slots disponibles:', error);
      throw error;
    }
  }

  async checkAvailability(date: string, time: string, durationMinutes: number = 60): Promise<boolean> {
    try {
      const slotStart = new Date(`${date}T${time}:00`);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

      const events = await this.calendar.events.list({
        calendarId: this.configService.get('GOOGLE_CALENDAR_ID') || 'primary',
        timeMin: slotStart.toISOString(),
        timeMax: slotEnd.toISOString(),
        singleEvents: true,
      });

      return !events.data.items || events.data.items.length === 0;
    } catch (error) {
      this.logger.error('Error verificando disponibilidad:', error);
      return false;
    }
  }
}

