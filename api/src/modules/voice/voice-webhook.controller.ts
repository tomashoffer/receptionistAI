import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VoiceService } from './voice.service';
import { AppointmentsService } from '../appointments/appointments.service';

@ApiTags('voice-webhooks')
@Controller('voice/webhooks')
export class VoiceWebhookController {
  private readonly logger = new Logger(VoiceWebhookController.name);

  constructor(
    private readonly voiceService: VoiceService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  @Post('vapi')
  @ApiOperation({ summary: 'Webhook de VAPI para eventos de llamada' })
  @ApiResponse({ status: 200, description: 'Webhook procesado exitosamente' })
  async handleVapiWebhook(@Body() webhookData: any) {
    this.logger.log('📞 Webhook de VAPI recibido:', JSON.stringify(webhookData, null, 2));

    try {
      const { event, call } = webhookData;

      switch (event) {
        case 'call-start':
          this.logger.log(`📞 Llamada iniciada: ${call.id}`);
          break;

        case 'call-end':
          this.logger.log(`📞 Llamada terminada: ${call.id}`);
          break;

        case 'function-call':
          // Cuando el AI quiere crear una cita
          if (webhookData.functionCall?.name === 'create_appointment') {
            const appointmentData = webhookData.functionCall.parameters;
            this.logger.log('📅 Creando cita desde VAPI:', appointmentData);
            
            const appointment = await this.appointmentsService.create(appointmentData);
            this.logger.log('✅ Cita creada:', appointment.id);
            
            return {
              result: {
                success: true,
                appointmentId: appointment.id,
                message: `Cita agendada para ${appointmentData.appointmentDate} a las ${appointmentData.appointmentTime}`
              }
            };
          }
          break;

        case 'transcript':
          this.logger.log(`💬 Transcripción: ${webhookData.transcript}`);
          break;

        default:
          this.logger.log(`📞 Evento desconocido: ${event}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('❌ Error procesando webhook de VAPI:', error);
      return { success: false, error: error.message };
    }
  }

  @Post('twilio')
  @ApiOperation({ summary: 'Webhook de Twilio para eventos de llamada' })
  @ApiResponse({ status: 200, description: 'Webhook procesado exitosamente' })
  async handleTwilioWebhook(@Body() webhookData: any) {
    this.logger.log('📞 Webhook de Twilio recibido:', JSON.stringify(webhookData, null, 2));
    
    // Twilio envía datos como form-data, no JSON
    const { CallSid, CallStatus, From, To } = webhookData;
    
    this.logger.log(`📞 Llamada ${CallSid}: ${CallStatus} de ${From} a ${To}`);
    
    return { success: true };
  }
}


