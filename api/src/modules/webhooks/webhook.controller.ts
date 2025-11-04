import { 
  Controller, 
  Post, 
  Body, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Inject,
  forwardRef,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookGuard } from '../business/guards/webhook.guard';
import { CallLogService } from '../business/services/call-log.service';
import { BusinessService } from '../business/services/business.service';
import { Business } from '../business/entities/business.entity';
import { CallDirection, CallStatus } from '../business/entities/call-log.entity';
import { AppointmentsService } from '../appointments/appointments.service';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';
import { MailingService } from '../mailing/mailing.service';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private callLogService: CallLogService,
    private businessService: BusinessService,
    @Inject(forwardRef(() => AppointmentsService))
    private appointmentsService: AppointmentsService,
    private googleCalendarService: GoogleCalendarService,
    private mailingService: MailingService,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  @Post('twilio/call')
  @UseGuards(WebhookGuard)
  @HttpCode(HttpStatus.OK)
  async handleTwilioCall(@Body() webhookData: any) {
    this.logger.log('Webhook Twilio recibido:', JSON.stringify(webhookData, null, 2));

    try {
      // Crear log de llamada
      const callLog = await this.callLogService.create({
        business_id: webhookData.business_id,
        call_sid: webhookData.CallSid,
        caller_number: webhookData.From,
        called_number: webhookData.To,
        direction: CallDirection.INBOUND,
        status: this.mapTwilioStatus(webhookData.CallStatus),
        duration_seconds: parseInt(webhookData.CallDuration || '0'),
        started_at: new Date(webhookData.Timestamp),
        cost_usd: parseFloat(webhookData.cost || '0'),
      });

      this.logger.log(`Call log creado: ${callLog.id}`);

      return {
        success: true,
        call_log_id: callLog.id,
        message: 'Webhook procesado exitosamente',
      };
    } catch (error) {
      this.logger.error('Error procesando webhook Twilio:', error);
      throw error;
    }
  }

  @Post('vapi/call')
  @UseGuards(WebhookGuard)
  @HttpCode(HttpStatus.OK)
  async handleVapiCall(@Body() webhookData: any) {
    this.logger.log('Webhook VAPI recibido:', JSON.stringify(webhookData, null, 2));

    try {
      // Crear log de llamada
      const callLog = await this.callLogService.create({
        business_id: webhookData.business_id,
        call_sid: webhookData.call_sid,
        caller_number: webhookData.caller_number,
        called_number: webhookData.called_number,
        direction: CallDirection.INBOUND,
        status: this.mapVapiStatus(webhookData.status),
        duration_seconds: webhookData.duration_seconds || 0,
        started_at: new Date(webhookData.started_at),
        ended_at: webhookData.ended_at ? new Date(webhookData.ended_at) : null,
        transcription: webhookData.transcription,
        ai_responses: webhookData.ai_responses,
        sentiment: webhookData.sentiment,
        sentiment_score: webhookData.sentiment_score,
        outcome: webhookData.outcome,
        extracted_data: webhookData.extracted_data,
        cost_usd: webhookData.cost_usd || 0,
        ai_tokens_used: webhookData.ai_tokens_used || 0,
      });

      this.logger.log(`Call log creado: ${callLog.id}`);

      return {
        success: true,
        call_log_id: callLog.id,
        message: 'Webhook procesado exitosamente',
      };
    } catch (error) {
      this.logger.error('Error procesando webhook VAPI:', error);
      throw error;
    }
  }

  @Post('call-update')
  @UseGuards(WebhookGuard)
  @HttpCode(HttpStatus.OK)
  async handleCallUpdate(@Body() updateData: any) {
    this.logger.log('Actualización de llamada recibida:', JSON.stringify(updateData, null, 2));

    try {
      // Actualizar log existente
      const updatedCallLog = await this.callLogService.updateByCallSid(
        updateData.call_sid,
        {
          status: updateData.status,
          duration_seconds: updateData.duration_seconds,
          ended_at: updateData.ended_at ? new Date(updateData.ended_at) : null,
          transcription: updateData.transcription,
          ai_responses: updateData.ai_responses,
          sentiment: updateData.sentiment,
          sentiment_score: updateData.sentiment_score,
          outcome: updateData.outcome,
          extracted_data: updateData.extracted_data,
          cost_usd: updateData.cost_usd,
          ai_tokens_used: updateData.ai_tokens_used,
        }
      );

      this.logger.log(`Call log actualizado: ${updatedCallLog.id}`);

      return {
        success: true,
        call_log_id: updatedCallLog.id,
        message: 'Actualización procesada exitosamente',
      };
    } catch (error) {
      this.logger.error('Error actualizando call log:', error);
      throw error;
    }
  }

  private mapTwilioStatus(twilioStatus: string): CallStatus {
    const statusMap: Record<string, CallStatus> = {
      'ringing': CallStatus.ANSWERED,
      'in-progress': CallStatus.ANSWERED,
      'completed': CallStatus.COMPLETED,
      'busy': CallStatus.BUSY,
      'no-answer': CallStatus.MISSED,
      'failed': CallStatus.FAILED,
      'canceled': CallStatus.MISSED,
    };

    return statusMap[twilioStatus] || CallStatus.ANSWERED;
  }

  private mapVapiStatus(vapiStatus: string): CallStatus {
    const statusMap: Record<string, CallStatus> = {
      'queued': CallStatus.ANSWERED,
      'ringing': CallStatus.ANSWERED,
      'in-progress': CallStatus.ANSWERED,
      'completed': CallStatus.COMPLETED,
      'busy': CallStatus.BUSY,
      'no-answer': CallStatus.MISSED,
      'failed': CallStatus.FAILED,
      'canceled': CallStatus.MISSED,
    };

    return statusMap[vapiStatus] || CallStatus.ANSWERED;
  }

  @Post('elevenlabs/appointment/:businessId')
  @HttpCode(HttpStatus.OK)
  async handleElevenLabsAppointment(
    @Param('businessId') businessId: string,
    @Body() webhookData: any
  ) {
    this.logger.log('Webhook ElevenLabs recibido:', JSON.stringify(webhookData, null, 2));

    try {
      // Extraer datos del webhook de ElevenLabs
      const { 
        name, 
        email, 
        phone, 
        service, 
        date, 
        time,
        notes 
      } = webhookData;

      // Validar datos requeridos
      if (!name || !email || !phone || !date || !time) {
        this.logger.error('Datos incompletos en webhook');
        return {
          success: false,
          message: 'Datos incompletos'
        };
      }

      // Normalizar formato de fecha a YYYY-MM-DD si viene como DD-MM-YYYY o DD/MM/YYYY
      const normalizeDate = (val: string) => {
        if (!val) return val;
        
        // Si ya viene en formato YYYY-MM-DD, devolverlo tal cual
        const yyyyMmDd = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (yyyyMmDd) {
          return val; // Ya está en el formato correcto
        }
        
        // Si viene en formato DD-MM-YYYY o DD/MM/YYYY
        const ddMmYyyy = val.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
        if (ddMmYyyy) {
          let d = ddMmYyyy[1].padStart(2, '0');
          let mo = ddMmYyyy[2].padStart(2, '0');
          let y = ddMmYyyy[3].length === 2 ? `20${ddMmYyyy[3]}` : ddMmYyyy[3];
          // Validar que el día no sea > 31 (indica que podría ser YYYY-MM-DD mal parseado)
          if (parseInt(d) > 31) {
            // Probablemente era YYYY-MM-DD, devolver original
            return val;
          }
          return `${y}-${mo}-${d}`;
        }
        
        // Si no coincide con ningún formato conocido, devolver original
        return val;
      };

      const normalizedDate = normalizeDate(date);

      // Crear el appointment
      const appointment = await this.appointmentsService.create({
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        serviceType: service || 'consulta',
        appointmentDate: normalizedDate,
        appointmentTime: time,
        notes: notes || `Creado desde ElevenLabs AI para business ${businessId}`
      });

      this.logger.log(`Appointment creado: ${appointment.id}`);

      // Obtener el business directamente por ID
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });

      if (!business) {
        this.logger.error(`Business no encontrado: ${businessId}`);
        return {
          success: false,
          message: 'Business no encontrado'
        };
      }

      // Intentar crear evento en Google Calendar si está conectado
      let calendarEventHtmlLink: string | null = null;
      try {
        if (business?.google_calendar_config && (business.google_calendar_config as any).connected) {
          this.logger.log('Google Calendar conectado, creando evento...');
          const calendarEvent = await this.googleCalendarService.createEvent(businessId, {
            date: normalizedDate,
            time,
            clientName: name,
            clientEmail: email,
            clientPhone: phone,
            service: service || 'consulta',
            notes: notes || '',
          });
          calendarEventHtmlLink = calendarEvent.htmlLink;
          this.logger.log('Evento creado en Google Calendar');
        }
      } catch (error) {
        this.logger.error('Error creando evento en Google Calendar (no crítico):', error);
        // No fallar el webhook si Google Calendar falla
      }

      // Enviar email de confirmación al cliente
      try {
        // Normalizar la fecha a YYYY-MM-DD si viene en DD-MM-YYYY
        const normalizedDateForParsing = normalizeDate(date);
        const appointmentDateTime = new Date(`${normalizedDateForParsing}T${time}:00`);
        
        // Formatear fecha legible (ej: "lunes, 3 de noviembre de 2025")
        const formattedDateReadable = appointmentDateTime.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        
        // Formatear fecha en DD-MM-YYYY para mostrar
        const [year, month, day] = normalizedDateForParsing.split('-');
        const formattedDateDDMMYYYY = `${day}-${month}-${year}`;
        
        const formattedTime = appointmentDateTime.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-row { margin: 15px 0; padding: 10px; background-color: white; border-radius: 4px; }
              .label { font-weight: bold; color: #4F46E5; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${business.name}</h1>
                <h2>Confirmación de Cita</h2>
              </div>
              <div class="content">
                <p>Hola <strong>${name}</strong>,</p>
                <p>Tu cita ha sido confirmada exitosamente:</p>
                
                <div class="info-row">
                  <span class="label">📅 Fecha:</span> ${formattedDateDDMMYYYY} (${formattedDateReadable})
                </div>
                <div class="info-row">
                  <span class="label">⏰ Hora:</span> ${formattedTime}
                </div>
                <div class="info-row">
                  <span class="label">🏥 Servicio:</span> ${service || 'consulta'}
                </div>
                ${notes ? `<div class="info-row"><span class="label">📝 Notas:</span> ${notes}</div>` : ''}
                ${calendarEventHtmlLink ? `<div class="info-row"><a href="${calendarEventHtmlLink}" style="color: #4F46E5;">📆 Ver en Google Calendar</a></div>` : ''}
                
                <p style="margin-top: 20px;">Si tienes alguna pregunta o necesitas modificar tu cita, por favor contáctanos.</p>
                
                <div class="footer">
                  <p>Este es un mensaje automático. Por favor no respondas a este email.</p>
                  <p>${business.name} - ${business.phone_number || ''}</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await this.mailingService.sendViaSMTP({
          from: business.email || `noreply@${business.name.toLowerCase().replace(/\s+/g, '')}.com`,
          to: [email],
          subject: `Confirmación de Cita - ${business.name}`,
          html: emailHtml,
          text: `Hola ${name},\n\nTu cita ha sido confirmada:\nFecha: ${formattedDateDDMMYYYY} (${formattedDateReadable})\nHora: ${formattedTime}\nServicio: ${service || 'consulta'}\n\n${business.name}`,
        });

        this.logger.log(`Email de confirmación enviado a ${email}`);
      } catch (error) {
        this.logger.error('Error enviando email de confirmación (no crítico):', error);
        // No fallar el webhook si el email falla
      }

      return {
        success: true,
        appointment_id: appointment.id,
        message: 'Appointment creado y calendar invite enviado'
      };
    } catch (error) {
      this.logger.error('Error procesando webhook ElevenLabs:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}
