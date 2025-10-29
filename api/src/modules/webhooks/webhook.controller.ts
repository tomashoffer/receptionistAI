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
  forwardRef
} from '@nestjs/common';
import { WebhookGuard } from '../business/guards/webhook.guard';
import { CallLogService } from '../business/services/call-log.service';
import { BusinessService } from '../business/services/business.service';
import { CallDirection, CallStatus } from '../business/entities/call-log.entity';
import { AppointmentsService } from '../appointments/appointments.service';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private callLogService: CallLogService,
    private businessService: BusinessService,
    @Inject(forwardRef(() => AppointmentsService))
    private appointmentsService: AppointmentsService,
    private googleCalendarService: GoogleCalendarService,
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

      // Crear el appointment
      const appointment = await this.appointmentsService.create({
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        serviceType: service || 'consulta',
        appointmentDate: date,
        appointmentTime: time,
        notes: notes || `Creado desde ElevenLabs AI para business ${businessId}`
      });

      this.logger.log(`Appointment creado: ${appointment.id}`);

      // Intentar crear evento en Google Calendar si está conectado
      try {
        const business = await this.businessService.findByPhoneNumber(webhookData.phone || businessId);
        if (business?.google_calendar_config && (business.google_calendar_config as any).connected) {
          this.logger.log('Google Calendar conectado, creando evento...');
          await this.googleCalendarService.createEvent(businessId, {
            date,
            time,
            clientName: name,
            clientEmail: email,
            clientPhone: phone,
            service: service || 'consulta',
            notes: notes || '',
          });
          this.logger.log('Evento creado en Google Calendar');
        }
      } catch (error) {
        this.logger.error('Error creando evento en Google Calendar (no crítico):', error);
        // No fallar el webhook si Google Calendar falla
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
