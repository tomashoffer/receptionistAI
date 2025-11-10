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
    // No logear todo el payload porque puede ser muy grande
    this.logger.log('📞 Webhook de VAPI recibido');

    try {
      // Vapi puede enviar el evento en diferentes formatos
      const messageType = webhookData.message?.type || webhookData.type || webhookData.event;
      
      this.logger.log(`📞 Tipo de mensaje: ${messageType}`);

      switch (messageType) {
        case 'call-start':
          this.logger.log(`📞 Llamada iniciada: ${webhookData.call?.id}`);
          break;

        case 'end-of-call-report':
          this.logger.log(`📞 Reporte final de llamada: ${webhookData.call?.id}`);
          // Aquí podrías guardar estadísticas, grabaciones, etc.
          break;

        case 'function-call':
          // function-call (singular) tiene una sola llamada
          return await this.handleFunctionCall(webhookData.message?.functionCall || webhookData.functionCall);

        case 'tool-calls':
          // 🚨 CORRECCIÓN CRÍTICA: tool-calls (plural) tiene un array
          const toolCalls = webhookData.message?.toolCalls || webhookData.toolCalls;
          
          if (!Array.isArray(toolCalls)) {
            this.logger.warn('⚠️ tool-calls no es un array, procesando como singular.');
            return await this.handleFunctionCall(toolCalls || webhookData.message?.toolCall || webhookData.toolCall);
          }
          
          // Iterar sobre múltiples llamadas (aunque normalmente solo hay una)
          this.logger.log(`🔧 Procesando ${toolCalls.length} tool calls`);
          const results = [];
          for (const toolCall of toolCalls) {
            results.push(await this.handleFunctionCall(toolCall));
          }
          // Vapi espera un objeto de retorno con los resultados
          return { results };

        case 'transcript':
          this.logger.log(`💬 Transcripción disponible`);
          break;

        case 'speech-update':
          // Estos eventos son muy frecuentes, no logear
          break;

        case 'conversation-update':
          // Estos eventos son muy frecuentes, no logear
          break;

        default:
          this.logger.log(`📞 Evento no manejado: ${messageType}`);
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

  /**
   * Maneja las llamadas a funciones de Vapi
   */
  private async handleFunctionCall(functionCall: any) {
    if (!functionCall) {
      return { success: false, error: 'No function call provided' };
    }

    // 🚨 CORRECCIÓN CRÍTICA: La data está anidada en functionCall.function
    // Vapi envía: { id: '...', type: 'function', function: { name: '...', arguments: {...} } }
    const functionData = functionCall.function;

    if (!functionData) {
      this.logger.error('❌ functionCall no contiene functionData:', JSON.stringify(functionCall));
      return { success: false, error: 'Function data missing in Vapi payload' };
    }
    
    // Los parámetros están en 'arguments', no 'parameters'
    const { name, arguments: parameters } = functionData;

    this.logger.log(`🔧 Función llamada: ${name}`, parameters);

    try {
      // Extraer el nombre base de la función (sin el sufijo del business)
      // Ej: "create_appointment_Sabrina" -> "create_appointment"
      let baseName = name;
      
      // Lista de nombres base conocidos
      const knownFunctions = ['create_appointment', 'check_availability', 'cancel_appointment', 'get_current_datetime', 'resolve_date'];
      
      // Buscar si el nombre contiene alguna función conocida
      for (const knownFunc of knownFunctions) {
        if (name.startsWith(knownFunc)) {
          baseName = knownFunc;
          break;
        }
      }
      
      this.logger.log(`🔧 Función base: ${baseName} (original: ${name})`);

      switch (baseName) {
        case 'get_current_datetime':
          return await this.getCurrentDateTimeHandler();

        case 'resolve_date':
          return await this.resolveDateHandler(parameters);

        case 'check_availability':
          return await this.checkAvailabilityHandler(parameters);

        case 'create_appointment':
          return await this.createAppointmentHandler(parameters);

        case 'cancel_appointment':
          return await this.cancelAppointmentHandler(parameters);

        default:
          this.logger.warn(`⚠️ Función desconocida: ${name} (base: ${baseName})`);
          return {
            success: false,
            error: `Función ${name} no implementada`,
          };
      }
    } catch (error) {
      this.logger.error(`❌ Error ejecutando función ${name}:`, error);
      return {
        success: false,
        error: error.message || 'Error desconocido',
      };
    }
  }

  /**
   * Helper para convertir año a texto en español (soluciona pronunciación TTS)
   */
  private convertYearToSpanish(year: number): string {
    if (year === 2025) return 'dos mil veinticinco';
    if (year === 2026) return 'dos mil veintiséis';
    if (year === 2027) return 'dos mil veintisiete';
    if (year === 2028) return 'dos mil veintiocho';
    if (year === 2029) return 'dos mil veintinueve';
    if (year === 2030) return 'dos mil treinta';
    return year.toString();
  }

  /**
   * Handler: Obtener fecha/hora actual
   */
  private async getCurrentDateTimeHandler() {
    this.logger.log('🕐 Obteniendo fecha y hora actual');

    try {
      const now = new Date();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const two = (n: number) => n.toString().padStart(2, '0');
      
      const currentYear = now.getFullYear();
      const yearInSpanish = this.convertYearToSpanish(currentYear);
      
      // Generar fecha sin el año
      const dateTextWithoutYear = new Intl.DateTimeFormat('es-AR', { 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
      }).format(now);
      
      // Reconstruir con el año escrito en español
      const fullDateTextWritten = `${dateTextWithoutYear} de ${yearInSpanish}`;

      const result = {
        nowIso: now.toISOString(),
        date: `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`,
        time: `${two(now.getHours())}:${two(now.getMinutes())}`,
        full_date_text: fullDateTextWritten,
        timezone: tz,
        // 🚨 CRÍTICO: Mensaje con año escrito en español para TTS correcto
        message: `La fecha de hoy es ${fullDateTextWritten}. ¿En qué más puedo ayudarte?`
      };

      this.logger.log('✅ Fecha/hora actual:', result);

      return result;
    } catch (error) {
      this.logger.error('❌ Error obteniendo fecha/hora:', error);
      return {
        error: error.message,
      };
    }
  }

  /**
   * Handler: Resolver fecha textual
   */
  private async resolveDateHandler(parameters: any) {
    this.logger.log('📅 Resolviendo fecha textual:', parameters);
    this.logger.warn('⚠️ Este handler NO debería ejecutarse - resolve_date es ApiRequestTool');

    try {
      const { text = '', tz = 'UTC', lang = 'es' } = parameters;
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const two = (n: number) => n.toString().padStart(2, '0');
      const yearInSpanish = this.convertYearToSpanish(currentYear);

      // Lógica simplificada para fechas comunes
      const textLower = text.trim().toLowerCase();

      if (textLower === 'hoy' || textLower === 'today') {
        const result = {
          date: `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`,
          weekday: new Intl.DateTimeFormat(lang === 'es' ? 'es-AR' : 'en-US', { weekday: 'long' }).format(now),
          timezone: tz,
          message: `Esa fecha es hoy.`,
        };
        this.logger.log('✅ Fecha resuelta (hoy):', result);
        return result;
      }

      if (textLower === 'mañana' || textLower === 'tomorrow') {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowYear = this.convertYearToSpanish(tomorrow.getFullYear());
        const result = {
          date: `${tomorrow.getFullYear()}-${two(tomorrow.getMonth() + 1)}-${two(tomorrow.getDate())}`,
          weekday: new Intl.DateTimeFormat(lang === 'es' ? 'es-AR' : 'en-US', { weekday: 'long' }).format(tomorrow),
          timezone: tz,
          message: `Esa fecha es mañana, ${new Intl.DateTimeFormat(lang === 'es' ? 'es-AR' : 'en-US', { weekday: 'long' }).format(tomorrow)}.`,
        };
        this.logger.log('✅ Fecha resuelta (mañana):', result);
        return result;
      }

      // Para otras fechas, retornar la fecha actual como fallback
      const fallback = {
        date: `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`,
        weekday: new Intl.DateTimeFormat(lang === 'es' ? 'es-AR' : 'en-US', { weekday: 'long' }).format(now),
        timezone: tz,
        message: `Esa fecha es hoy.`,
      };
      this.logger.log('⚠️ Fecha no reconocida, usando hoy como fallback:', fallback);
      return fallback;
    } catch (error) {
      this.logger.error('❌ Error resolviendo fecha:', error);
      return {
        error: error.message,
        message: 'No pude interpretar esa fecha. ¿Podrías repetirla?',
      };
    }
  }

  /**
   * Handler: Crear cita
   */
  private async createAppointmentHandler(parameters: any) {
    this.logger.log('📅 Creando cita desde VAPI:', parameters);

    try {
      const appointment = await this.appointmentsService.create(parameters);
      this.logger.log('✅ Cita creada exitosamente:', appointment.id);

      return {
        success: true,
        appointmentId: appointment.id,
        appointment: {
          id: appointment.id,
          clientName: appointment.clientName,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          serviceType: appointment.serviceType,
        },
        // 🚨 CRÍTICO: Mensaje conversacional en nivel superior
        message: `¡Perfecto! Tu cita ha sido agendada para el ${parameters.appointmentDate} a las ${parameters.appointmentTime}. Te enviaremos un recordatorio por email.`,
      };
    } catch (error) {
      this.logger.error('❌ Error creando cita:', error);
      
      return {
        success: false,
        error: error.message,
        // 🚨 CRÍTICO: Mensaje en nivel superior
        message: `Lo siento, no pude agendar la cita. ${error.message.includes('disponible') ? 'Ese horario no está disponible. ¿Te gustaría otro horario?' : 'Por favor intenta de nuevo.'}`,
      };
    }
  }

  /**
   * Handler: Verificar disponibilidad
   * 🚨 CRÍTICO: Este handler DEBE retornar un objeto válido SIEMPRE, incluso en errores
   */
  private async checkAvailabilityHandler(parameters: any) {
    this.logger.log('🔍 Verificando disponibilidad:', parameters);

    try {
      const { date, time } = parameters;

      // Validar parámetros requeridos
      if (!date) {
        this.logger.warn('⚠️ Parámetro "date" no proporcionado');
        return {
          success: false,
          available: false,
          availableSlots: [],
          message: 'Necesito que me digas la fecha para verificar disponibilidad.',
        };
      }

      if (!time) {
        this.logger.warn('⚠️ Parámetro "time" no proporcionado');
        return {
          success: false,
          available: false,
          availableSlots: [],
          message: 'Necesito que me digas la hora para verificar disponibilidad.',
        };
      }

      // Intentar obtener slots disponibles con manejo robusto de errores
      let availableSlots: string[] = [];
      
      try {
        this.logger.log(`📞 Llamando a appointmentsService.getAvailableSlots(${date})...`);
        availableSlots = await this.appointmentsService.getAvailableSlots(date);
        this.logger.log(`✅ Slots disponibles recibidos:`, availableSlots);
      } catch (slotsError: any) {
        // Error obteniendo slots - probablemente credenciales de Google no configuradas
        this.logger.error('❌ Error obteniendo slots de Google Calendar:', slotsError);
        this.logger.error(`   Mensaje: ${slotsError.message}`);
        this.logger.error(`   Stack: ${slotsError.stack}`);
        
        // Retornar respuesta clara para Vapi
        return {
          success: false,
          available: false,
          availableSlots: [],
          error: `Error de configuración: ${slotsError.message}`,
          message: 'Lo siento, tengo un problema técnico para consultar el calendario. Por favor, contacta al administrador para verificar la configuración de Google Calendar.',
        };
      }

      // Si no hay slots disponibles para ese día
      if (!availableSlots || availableSlots.length === 0) {
        this.logger.log(`⚠️ No hay slots disponibles para ${date}`);
        return {
          success: true,
          available: false,
          availableSlots: [],
          message: `Lo siento, no tenemos horarios disponibles para el ${date}. ¿Te gustaría probar con otra fecha?`,
        };
      }

      // Verificar si la hora específica está disponible
      const requestedTime = time.substring(0, 5); // Asegurar formato HH:MM
      const isTimeAvailable = availableSlots.includes(requestedTime);

      this.logger.log(`🕐 Hora solicitada: ${requestedTime}, Disponible: ${isTimeAvailable}`);

      if (isTimeAvailable) {
        return {
          success: true,
          available: true,
          availableSlots: [requestedTime],
          message: `¡Perfecto! Tenemos disponibilidad el ${date} a las ${time}. ¿Procedemos a agendar la cita?`,
        };
      } else {
        // Ofrecer horarios alternativos
        const topAlternatives = availableSlots.slice(0, 5);
        const alternativesText = topAlternatives.length > 0 
          ? topAlternatives.join(' o a las ') 
          : 'No hay otros horarios disponibles.';
        
        this.logger.log(`🔄 Ofreciendo alternativas:`, topAlternatives);
        
        return {
          success: true,
          available: false,
          availableSlots: availableSlots,
          message: `Lo siento, a las ${time} no tenemos disponibilidad el ${date}. Los horarios disponibles son a las ${alternativesText}. ¿Te sirve alguno de estos?`,
        };
      }
    } catch (error: any) {
      // Catch-all final: CUALQUIER error no capturado arriba
      this.logger.error('❌ Error INESPERADO en checkAvailabilityHandler:', error);
      this.logger.error(`   Tipo: ${error.constructor.name}`);
      this.logger.error(`   Mensaje: ${error.message}`);
      this.logger.error(`   Stack: ${error.stack}`);
      
      // SIEMPRE retornar un objeto válido a Vapi
      return {
        success: false,
        available: false,
        availableSlots: [],
        error: `Error inesperado: ${error.message || 'Error desconocido'}`,
        message: 'Lo siento, tuve un problema verificando la disponibilidad. ¿Podemos intentar de nuevo?',
      };
    }
  }

  /**
   * Handler: Cancelar cita
   */
  private async cancelAppointmentHandler(parameters: any) {
    this.logger.log('🗑️ Cancelando cita:', parameters);

    try {
      const { clientPhone, appointmentDate } = parameters;

      // Buscar cita por teléfono y fecha
      const appointments = await this.appointmentsService.findByPhoneAndDate(
        clientPhone,
        appointmentDate,
      );

      if (appointments.length === 0) {
        return {
          success: false,
          // 🚨 CRÍTICO: Mensaje en nivel superior
          message: `No encontré ninguna cita para el teléfono ${clientPhone} el día ${appointmentDate}. ¿Podrías verificar los datos?`,
        };
      }

      // Cancelar la primera cita encontrada
      const appointment = appointments[0];
      await this.appointmentsService.remove(appointment.id);

      this.logger.log('✅ Cita cancelada exitosamente:', appointment.id);

      return {
        success: true,
        cancelledAppointment: {
          id: appointment.id,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
        },
        // 🚨 CRÍTICO: Mensaje conversacional en nivel superior
        message: `Tu cita del ${appointmentDate} a las ${appointment.appointmentTime} ha sido cancelada exitosamente.`,
      };
    } catch (error) {
      this.logger.error('❌ Error cancelando cita:', error);
      
      return {
        success: false,
        error: error.message,
        // 🚨 CRÍTICO: Mensaje en nivel superior
        message: 'Lo siento, hubo un problema cancelando tu cita. Por favor intenta de nuevo.',
      };
    }
  }
}


